import { decodeNumeral } from "../../BloomCore/utils/Utils"
import { onScoreboardPacket, onTabUpdatePacket } from "./Events"

export default new class Dungeons {
    constructor(){
        // Dungeons stuff
        this.currentFloor = null
        this.currentMilestone = null

        // Room stuff
        this.currentRoomID = null
        this.currentRoomName = null

        // Classes stuff
        this.currentClass = null
        this.currentClassLevel = null

        this.secretsFound = null
        this.completedRooms = 0
        this.teamDeaths = 0
        this.puzzles = 0
        this.crypts = 0

        onScoreboardPacket((msg, event) => {
            if(/^ +⏣ The Catacombs \(([\w\d].{1,2})\)$/.test(msg) && !this.currentFloor) return this.currentFloor = msg.match(/^ +⏣ The Catacombs \(([\w\d].{1,2})\)$/)[1]
            if(/^\d[\d\/]+ [\w\d]+ ([-\d,]+)$/.test(msg)) return this.currentRoomID = msg.match(/^\d[\d\/]+ [\w\d]+ ([-\d,]+)$/)?.[1]
        })

        onTabUpdatePacket((msg, event) => {
            if(/^\[[\d]+\] ([\w]+) .+ \(([\w]+) ([IVXLCDM]+)\)$/.test(msg)){
                const [ ar, playerName, className, classLevel ] = msg.match(/^\[[\d]+\] ([\w]+) .+ \(([\w]+) ([IVXLCDM]+)\)$/)
                
                if(playerName !== Player.getName()) return

                this.currentClass = className
                this.currentClassLevel = decodeNumeral(classLevel)
                return
            }
            
            if(/^ Secrets Found: ([\d,.]+)\%$/.test(msg)) return this.secretsFound = parseFloat(msg.match(/^ Secrets Found: ([\d,.]+)\%$/)?.[1])
            if(/^ Your Milestone: ☠(.+)$/.test(msg)) return this.currentMilestone = msg.match(/^ Your Milestone: ☠(.+)$/)?.[1]
            if(/^ Completed Rooms: ([\d]+)$/.test(msg)) return this.completedRooms = msg.match(/^ Completed Rooms: ([\d]+)$/)?.[1]
            if(/^ Team Deaths: ([\d]+)$/.test(msg)) return this.teamDeaths = parseInt(msg.match(/^ Team Deaths: ([\d]+)$/)?.[1])
            if(/^Puzzles: \(([\d]+)\)$/.test(msg)) return this.puzzles = parseInt(msg.match(/^Puzzles: \(([\d]+)\)$/)?.[1])
            if(/^ Crypts: ([\d]+)$/.test(msg)) return this.crypts = parseInt(msg.match(/^ Crypts: ([\d]+)$/)?.[1])
        })

        register("renderOverlay", () => {
            Renderer.drawStringWithShadow([
                this.currentFloor,
                this.currentMilestone,
                this.currentRoomID,
                this.currentRoomName,
                this.currentClass,
                this.currentClassLevel,
                this.secretsFound,
                this.completedRooms,
                this.teamDeaths,
                this.puzzles,
                this.crypts,
            ].join("\n"), 10, 10)
        })

        register("worldUnload", () => this.reset())
    }

    reset(){
        // Dungeons stuff
        this.currentFloor = null
        this.currentMilestone = null

        // Room stuff
        this.currentRoomID = null
        this.currentRoomName = null

        // Classes stuff
        this.currentClass = null
        this.currentClassLevel = null

        this.secretsFound = null
        this.completedRooms = 0
        this.teamDeaths = 0
        this.puzzles = 0
        this.crypts = 0
    }
}