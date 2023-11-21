import { Event } from "../core/Events"
import { TextHelper } from "./Text"

// Regex
const profileNameRegex =        /^Profile\: ([\w ]+)$/
const bankRegex =               /^ Bank\: ([\w\,.\/]+)/
const skillsRegex =             /^Skills\: ([\w\d ]+)\: ([\w\d,. ]+)\%/
const statsRegex =              /^ ([\w ]+)\: (❁|☣|☠|⚔|✦|☘)([\d,]+)$/
// Garden regex
const cropMilestoneRegex =      /^ Milestone\: ([\w\d ]+)\: ([\d,.]+)%$/
const jacobContestRegex =       /^ Starts In\: ([\w\d ]+)$/
const nextVisitorRegex =        /^Visitors\: \((.+)\)$/
const organicMatterRegex =      /^ Organic Matter\: ([\w\d,.]+)$/
const fuelRegex =               /^ Fuel\: ([\w\d,.]+)$/
const timeLeftRegex =           /^ Time Left\: ([\w\d ]+)$/
const storedCompostRegex =      /^ Stored Compost\: ([\w\d,. ]+)$/

export default new class TabListStats {
    constructor(){
        this.reset()

        new Event(null, "onTabUpdatePacket", (tabName, _, formatted) => {
            this.profileName = TextHelper.getRegexMatch(profileNameRegex, tabName)?.[1] ?? this.profileName
            this.bank = TextHelper.getRegexMatch(bankRegex, tabName)?.[1] ?? this.bank
            this.skills = TextHelper.getRegexMatch(skillsRegex, tabName)?.[1] ?? this.skills
            this.skillsPercent = TextHelper.getRegexMatch(skillsRegex, tabName)?.[2] ?? this.skillsPercent

            // If it's part of a player stat we assign it's values in an object
            if (statsRegex.test(tabName)) {
                const statMatch = TextHelper.getRegexMatch(statsRegex, tabName)
                const statAmount = statMatch[3]

                // Saving the formatted text in case we need to make a feature that displays this
                // to make it easier to just call it from here instead of formatting manually
                this.stats[statMatch[1]] = {
                    formattedText: formatted,
                    statAmount: statAmount
                }
            }

            // Garden
            this.cropMilestone = TextHelper.getRegexMatch(cropMilestoneRegex, tabName)?.[1] ?? this.cropMilestone
            this.cropMilestonePercent = TextHelper.getRegexMatch(cropMilestoneRegex, tabName)?.[2] ?? this.cropMilestonePercent
            this.jacobContest = TextHelper.getRegexMatch(jacobContestRegex, tabName)?.[1] ?? this.jacobContest
            this.nextVisitor = TextHelper.getRegexMatch(nextVisitorRegex, tabName)?.[1] ?? this.nextVisitor
            this.organicMatter = TextHelper.getRegexMatch(organicMatterRegex, tabName)?.[1] ?? this.organicMatter
            this.fuel = TextHelper.getRegexMatch(fuelRegex, tabName)?.[1] ?? this.fuel
            this.timeLeft = TextHelper.getRegexMatch(timeLeftRegex, tabName)?.[1] ?? this.timeLeft
            this.storedCompost = TextHelper.getRegexMatch(storedCompostRegex, tabName)?.[1] ?? this.storedCompost

        }).start()

        new Event(null, "worldUnload", this.reset).start()
    }

    reset() {
        // Account info
        this.profileName = null
        this.bank = null
        this.skills = null
        this.skillsPercent = null
        this.stats = {}
        
        // Account info - Garden
        this.cropMilestone = null
        this.cropMilestonePercent = null
        this.jacobContest = null
        this.nextVisitor = null
        this.organicMatter = null
        this.fuel = null
        this.timeLeft = null
        this.storedCompost = null
    }

    /**
     * - Gets the current profile's name (e.g "Cucumber")
     * @returns {String}
     */
    getProfileName() {
        return this.profileName
    }

    /**
     * - Gets the current player's bank stats (e.g "1.5B/100" coop/personal)
     * @returns {String}
     */
    getBank() {
        return this.bank
    }

    /**
     * - Gets the current skill in account info (e.g "Foraging")
     * @returns {String}
     */
    getSkill() {
        return this.skills
    }

    /**
     * - Gets the current skill percent in account info (e.g 78.8)
     * @returns {Number}
     */
    getSkillPercent(){
        return parseFloat(this.skillsPercent)
    }

    /**
     * - Gets the current player's stats (e.g Strength: { formattedText: "The formatted text", statAmount: 2000 })
     * @returns {Object}
     */
    getStats(){
        return this.stats
    }

    // Garden

    /**
     * - Gets the current crop milestone (e.g "Wheat 27")
     * @returns {String}
     */
    getCropMilestone(){
        return this.cropMilestone
    }

    /**
     * - Gets the current crop milestone percent (e.g 89.2)
     * @returns {Number}
     */
    getCropMilestonePercent(){
        return parseFloat(this.cropMilestonePercent)
    }

    /**
     * - Gets the current jacob contest time (e.g "20m")
     * @returns {String}
     */
    getJacobContest(){
        return this.jacobContest
    }

    /**
     * - Gets the next visitor (e.g "8m 59s")
     * @returns {String}
     */
    getNextVisitor(){
        return this.nextVisitor
    }

    /**
     * - Gets the current organic matter in the composter (e.g "348k")
     * @returns {String}
     */
    getOrganicMatter(){
        return this.organicMatter
    }

    /**
     * - Gets the current fuel in the composter (e.g "578k")
     * @returns {String}
     */
    getFuel(){
        return this.fuel
    }

    /**
     * - Gets the current time left for the composter to create a new compost (e.g "1m 10s")
     * @returns {String}
     */
    getTimeLeft(){
        return this.timeLeft
    }

    /**
     * - Gets the current amount of stored compost (e.g "3.3k")
     * @returns {String}
     */
    getStoredCompost(){
        return this.storedCompost
    }
}