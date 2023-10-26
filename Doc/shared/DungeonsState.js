import { Event } from "../core/Events"
import { Feature } from "../core/Feature"
// might do something to host our own version of this
import { decodeNumeral } from "../../BloomCore/utils/Utils"
import { WorldState } from "./World"

const feature = new Feature("DungeonState", "", "")

export default new class DungeonState {
    constructor(){
        // Player stuff
        this.currentFloor = null
        this.currentMilestone = null

        // Room stuff
        this.currentRoomID = null
        this.currentRoomName = null

        // Classes stuff
        this.currentClass = null
        this.currentClassLevel = null
        this.lastClass = null
        this.lastClassLevel = null

        // Dungeons stuff
        this.secretsFound = null
        this.completedRooms = 0
        this.teamDeaths = 0
        this.puzzles = 0
        this.crypts = 0
        this.blessings = []
        this.partyMembers = {}

        new Event(feature, "onScoreboardPacket", (msg, event) => {
            if(/^ +⏣ The Catacombs \(([\w\d].{1,2})\)$/.test(msg) && !this.currentFloor) return this.currentFloor = msg.match(/^ +⏣ The Catacombs \(([\w\d].{1,2})\)$/)[1]
            if(/^\d[\d\/]+ [\w\d]+ ([-\d,]+)$/.test(msg)) return this.currentRoomID = msg.match(/^\d[\d\/]+ [\w\d]+ ([-\d,]+)$/)?.[1]
        }, () => World.isLoaded(), null)

        new Event(feature, "onTabUpdatePacket", (msg, event) => {
            if(/^\[[\d]+\] ([\w]+)(.+)? \(([\w]+) ([IVXLCDM]+)\)$/.test(msg)){
                const [ ar, playerName, emblem, className, classLevel ] = msg.match(/^\[[\d]+\] ([\w]+)(.+)? \(([\w]+) ([IVXLCDM]+)\)$/)
                
                if(playerName !== Player.getName()) {
                    this.partyMembers[playerName] = {
                        class: className,
                        classLevel: decodeNumeral(classLevel)
                    }
                    return
                }

                this.currentClass = className
                this.currentClassLevel = decodeNumeral(classLevel)

                // Saving the last class for specific features that might need
                // these variables will and should not be reset after world change
                this.lastClass = this.currentClass
                this.lastClassLevel = this.currentClassLevel
                return
            }
            
            if(/^ Secrets Found: ([\d,.]+)\%$/.test(msg)) return this.secretsFound = parseFloat(msg.match(/^ Secrets Found: ([\d,.]+)\%$/)?.[1])
            if(/^ Your Milestone: ☠(.+)$/.test(msg)) return this.currentMilestone = msg.match(/^ Your Milestone: ☠(.+)$/)?.[1]
            if(/^ Completed Rooms: ([\d]+)$/.test(msg)) return this.completedRooms = msg.match(/^ Completed Rooms: ([\d]+)$/)?.[1]
            if(/^ Team Deaths: ([\d]+)$/.test(msg)) return this.teamDeaths = parseInt(msg.match(/^ Team Deaths: ([\d]+)$/)?.[1])
            if(/^Puzzles: \(([\d]+)\)$/.test(msg)) return this.puzzles = parseInt(msg.match(/^Puzzles: \(([\d]+)\)$/)?.[1])
            if(/^ Crypts: ([\d]+)$/.test(msg)) return this.crypts = parseInt(msg.match(/^ Crypts: ([\d]+)$/)?.[1])
        }, () => World.isLoaded(), null)

        new Event(feature, "onBlessingsChange", (blessingsArray) => this.blessings = blessingsArray, () => WorldState.inDungeons(), true)

        new Event(feature, "worldUnload", () => this.reset(), null)

        feature.start()
    }

    reset(){
        this.currentFloor = null
        this.currentMilestone = null

        this.currentRoomID = null
        this.currentRoomName = null

        this.currentClass = null
        this.currentClassLevel = null

        this.secretsFound = null
        this.completedRooms = 0
        this.teamDeaths = 0
        this.puzzles = 0
        this.crypts = 0
        this.blessings = []
        this.partyMembers = {}
    }

    getCurrentFloor(){
        return this.currentFloor
    }

    getCurrentClass(){
        return this.currentClass ?? this.lastClass
    }

    getCurrentClassLevel(){
        return this.currentClassLevel ?? this.lastClassLevel
    }

    getRoomID(){
        return this.currentRoomID
    }

    getRoomName(){
        return this.currentRoomName
    }

    getPuzzles(){
        return this.puzzles
    }

    getCrypts(){
        return this.crypts
    }

    getBlessings(){
        return this.blessings
    }

    getPartyMembers(){
        return this.partyMembers
    }

    isDupeClass(){
        return Object.values(this.partyMembers)?.reduce((a, b) => a + (b.class === "Mage" ? 1 : 0), 0) >= 1
    }

    getMageReduction(num = 0){
        if(this.getCurrentClass() !== "Mage") return num

        const mult = this.isDupeClass() ? 1 : 2
        const mageReduction = .75-(Math.floor(this.getCurrentClassLevel() / 2) / 100) * mult
        return num * mageReduction
    }
}