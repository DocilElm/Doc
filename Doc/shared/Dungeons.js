import { Event } from "../core/Events"
// might do something to host our own version of this
import { decodeNumeral } from "../../BloomCore/utils/Utils"
import { WorldState } from "./World"

// Temporary function, to be moved to a Text manipulation class along wiht
// decodeNumeral
function getRegexMatch(regex, string) {
    return (regex.test(string)) ? string.match(match) : null
}

const currentFloorRegex =      /^ +⏣ The Catacombs \(([\w\d].{1,2})\)$/
const currentRommIDRegex =     /^\d[\d\/]+ [\w\d]+ ([-\d,]+)$/
const playerInformationRegex = /^\[[\d]+\] ([\w]+).+? \(([\w]+) ([IVXLCDM]+)\)$/
const secretsFoundRegex =      /^ Secrets Found: ([\d,.]+)\%$/
const milestoneRegex =         /^ Your Milestone: ☠(.+)$/
const completedRoomsRegex =    /^ Completed Rooms: ([\d]+)$/
const teamDeathRegex =         /^ Team Deaths: ([\d]+)$/
const puzzlesRegex =           /^Puzzles: \(([\d]+)\)$/
const cryptsRegex =            /^ Crypts: ([\d]+)$/

const checkDungeons = () => WorldState.inDungeons()

export default new class DungeonState {
    constructor() {
         // These variables will and should not be reset after world change
         // TEMP: When persistence is a possiblity, these should be persistent
        this.lastClass = null
        this.lastClassLevel = null

        // Load in all the resetable variables
        this.reset()

        new Event(null, "onScoreboardPacket", (score, _) => {
            if (currentFloorRegex.test(score) && !this.currentFloor) return this.currentFloor = score.match(currentFloorRegex)[1]
            if (currentRommIDRegex.test(score)) return this.currentRoomID = score.match(currentRommIDRegex)?.[1]
        }, checkDungeons).start()

        new Event(null, "onTabUpdatePacket", (tabName, _) => {
            if (playerInformationRegex.test(tabName)) {
                const [ _, playerName, className, classLevel ] = tabName.match(playerInformationRegex)
                
                // If it isn't the player, it'll be their teammates
                if (playerName !== Player.getName()) {
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

            this.secretsFound = getRegexMatch(secretsFoundRegex)?.[1] ?? this.secretsFound
            this.currentMilestone = getRegexMatch(milestoneRegex)?.[1] ?? this.currentMilestone
            this.completedRooms = getRegexMatch(completedRoomsRegex)?.[1] ?? this.completedRooms
            this.teamDeaths = getRegexMatch(teamDeathRegex)?.[1] ?? this.teamDeaths
            this.puzzles = getRegexMatch(puzzlesRegex)?.[1] ?? this.puzzles
            this.crypts = getRegexMatch(cryptsRegex)?.[1] ?? this.crypts
            
            // if (secretsFoundRegex.test(tabName)) return this.secretsFound = parseFloat(tabName.match(secretsFoundRegex)?.[1])
            // if (milestoneRegex.test(tabName)) return this.currentMilestone = tabName.match(milestoneRegex)?.[1]
            // if (completedRoomsRegex.test(tabName)) return this.completedRooms = tabName.match(completedRoomsRegex)?.[1]
            // if (teamDeathRegex.test(tabName)) return this.teamDeaths = parseInt(tabName.match(teamDeathRegex)?.[1])
            // if (/^Puzzles: \(([\d]+)\)$/.test(tabName)) return this.puzzles = parseInt(tabName.match(/^Puzzles: \(([\d]+)\)$/)?.[1])
            // if (/^ Crypts: ([\d]+)$/.test(tabName)) return this.crypts = parseInt(tabName.match(/^ Crypts: ([\d]+)$/)?.[1])
        }, checkDungeons, null).start()

        new Event(null, "onBlessingsChange", (blessingsArray) => this.blessings = blessingsArray, checkDungeons, true).start()

        // Bind this to ensure it can still access internal class properties
        new Event(null, "worldUnload", this.reset.bind(this)).start()

    }

    reset() {
        // Player stuff
        this.currentFloor = null
        this.currentMilestone = null

        // Room stuff
        this.currentRoomID = null
        this.currentRoomName = null

        // Classes stuff
        this.currentClass = null
        this.currentClassLevel = null


        // Dungeons stuff
        this.secretsFound = null
        this.completedRooms = 0
        this.teamDeaths = 0
        this.puzzles = 0
        this.crypts = 0
        this.blessings = []
        this.partyMembers = {}
    }

    getCurrentFloor() {
        return this.currentFloor
    }

    getCurrentClass() {
        return this.currentClass ?? this.lastClass
    }

    getCurrentClassLevel() {
        return this.currentClassLevel ?? this.lastClassLevel
    }

    getRoomID() {
        return this.currentRoomID
    }

    getRoomName() {
        return this.currentRoomName
    }

    getPuzzles() {
        return this.puzzles
    }

    getCrypts() {
        return this.crypts
    }

    getBlessings() {
        return this.blessings
    }

    getPartyMembers() {
        return this.partyMembers
    }

    isDupeClass(className) {
        return Object.values(this.partyMembers)?.reduce((classOccurance, player) => classOccurance + (player.class === className ? 1 : 0), 0) >= 1
    }

    // Gets the reduction that mage provides to item cooldowns
    getMageReduction(cooldown = 0){
        if (this.getCurrentClass() !== "Mage") return cooldown

        const multiplier = this.isDupeClass("Mage") ? 1 : 2
        const mageReduction = 0.75 - (Math.floor(this.getCurrentClassLevel() / 2) / 100) * multiplier
        return cooldown * mageReduction
    }
}