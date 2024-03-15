import PogObject from "../../PogData"

export class Persistence {
    static rareGardenItemsList = new Map([
        ["Flowering Bouquet", "FLOWERING_BOUQUET"],
        ["Overgrown Grass", "OVERGROWN_GRASS"],
        ["Green Bandana", "GREEN_BANDANA"],
        ["Dedication IV", "ENCHANTMENT_DEDICATION_4"],
        ["Dedication 4", "ENCHANTMENT_DEDICATION_4"],
        ["Music Rune 1", "MUSIC_RUNE;1"],
        ["Music Rune I", "MUSIC_RUNE;1"],
        ["Space Helmet", "DCTR_SPACE_HELM"],
        ["Cultivating I", "ENCHANTMENT_CULTIVATING_1"],
        ["Cultivating 1", "ENCHANTMENT_CULTIVATING_1"],
        ["Replenish I", "ENCHANTMENT_REPLENISH_1"],
        ["Replenish 1", "ENCHANTMENT_REPLENISH_1"],
        ["Jungle Key", "JUNGLE_KEY"]
    ])

    static sbNameToGardenID = {
        "MUTANT_NETHER_WART": "MUTANT_NETHER_STALK",
        "ENCHANTED_HAY_BALE": "ENCHANTED_HAY_BLOCK",
        "ENCHANTED_RED_MUSHROOM_BLOCK": "ENCHANTED_HUGE_MUSHROOM_2",
        "ENCHANTED_CARROT": "ENCHANTED_CARROT",
        "ENCHANTED_GOLDEN_CARROT": "ENCHANTED_GOLDEN_CARROT",
        "ENCHANTED_POTATO": "ENCHANTED_POTATO",
        "ENCHANTED_BAKED_POTATO": "ENCHANTED_BAKED_POTATO",
        "ENCHANTED_PUMPKIN": "ENCHANTED_PUMPKIN",
        "POLISHED_PUMPKIN": "POLISHED_PUMPKIN",
        "ENCHANTED_MELON": "ENCHANTED_MELON",
        "ENCHANTED_MELON_BLOCK": "ENCHANTED_MELON_BLOCK",
        "ENCHANTED_RED_MUSHROOM": "ENCHANTED_RED_MUSHROOM",
        "ENCHANTED_BROWN_MUSHROOM": "ENCHANTED_BROWN_MUSHROOM",
        "ENCHANTED_BROWN_MUSHROOM_BLOCK": "ENCHANTED_HUGE_MUSHROOM_1",
        "ENCHANTED_COCOA_BEAN": "ENCHANTED_COCOA",
        "ENCHANTED_COOKIE": "ENCHANTED_COOKIE",
        "ENCHANTED_CACTUS_GREEN": "ENCHANTED_CACTUS_GREEN",
        "ENCHANTED_CACTUS": "ENCHANTED_CACTUS",
        "ENCHANTED_SUGAR": "ENCHANTED_SUGAR",
        "ENCHANTED_SUGAR_CANE": "ENCHANTED_SUGAR_CANE",
        "ENCHANTED_RAW_BEEF": "ENCHANTED_RAW_BEEF",
        "ENCHANTED_PORK": "ENCHANTED_PORK",
        "ENCHANTED_GRILLED_PORK": "ENCHANTED_GRILLED_PORK",
        "ENCHANTED_RAW_CHICKEN": "ENCHANTED_RAW_CHICKEN",
        "ENCHANTED_MUTTON": "ENCHANTED_MUTTON",
        "ENCHANTED_COOKED_MUTTON": "ENCHANTED_COOKED_MUTTON",
        "ENCHANTED_NETHER_WART": "ENCHANTED_NETHER_STALK",
        "COMPOST": "COMPOST",
        "ENCHANTED_RAW_RABBIT": "ENCHANTED_RABBIT"
    }

    static data = new PogObject("Doc", {
        settings: {keybinds: {}},
        ragaxecd: {x: 10, y: 10, scale: 1},
        miningProfit: {x: 10, y: 10, scale: 1},
        visitorProfit: {x: 10, y: 10, scale: 1},
        runSplits: {x: 10, y: 10, scale: 1},
        dungeonProfit: {x: 10, y: 10, scale: 1},
        croesusProfit: {x: 10, y: 10, scale: 1},
        bossSplits: {x: 10, y: 10, scale: 1},
        ghostTracker: {x: 10, y: 10, scale: 1},
        trophyFishingTracker: {x: 10, y: 10, scale: 1},
        powderTracker: {x: 10, y: 10, scale: 1},
        rngMeter: {x: 10, y: 10, scale: 1, dungeonsData: {}, slayersData: {}},
        fatalTempo: {x: 10, y: 10, scale: 1},
        bonzoMaskInvincibilityTimer: {x: 10, y: 10, scale: 1},
        phoenixInvincibilityTimer: {x: 10, y: 10, scale: 1},
        gardenDisplay: {x: 10, y: 10, scale: 1},
        blessingDisplay: {x: 10, y: 10, scale: 1},
        statsDisplay: {x: 10, y: 10, scale: 1},
        searchBar: {x: 10, y: 10, scale: 1},
        waterBoardDisplay: {x: 10, y: 10, scale: 1},
        championDisplay: {x: 10, y: 10, scale: 1},
        petDisplay: {x: 10, y: 10, scale: 1},
        sblevelDisplay: {x: 10, y: 10, scale: 1},
        apiCheckTime: null,
        firstTime: true
    }, "data/.data.json")

    static dungeonBossEntryMessage = new Set([
        "[BOSS] Bonzo: Gratz for making it this far, but I'm basically unbeatable.",
        "[BOSS] Scarf: This is where the journey ends for you, Adventurers.",
        "[BOSS] The Professor: I was burdened with terrible news recently...",
        "[BOSS] Thorn: Welcome Adventurers! I am Thorn, the Spirit! And host of the Vegan Trials!",
        "[BOSS] Livid: Welcome, you've arrived right on time. I am Livid, the Master of Shadows.",
        "[BOSS] Sadan: So you made it all the way here... Now you wish to defy me? Sadan?!",
        "[BOSS] Maxor: WELL! WELL! WELL! LOOK WHO'S HERE!"
    ])

    static trophyFishColors = {
        "Sulphur Skitter": "&f",
        "Obfuscated 1": "&f",
        "Steaming-Hot Flounder": "&f",
        "Gusher": "&f",
        "Blobfish": "&f",
        "Obfuscated 2": "&a",
        "Slugfish": "&a",
        "Flyfish": "&a",
        "Obfuscated 3": "&9",
        "Lavahorse": "&9",
        "Mana Ray": "&9",
        "Volcanic Stonefish": "&9",
        "Vanille": "&9",
        "Skeleton Fish": "&5",
        "Moldfin": "&5",
        "Soul Fish": "&5",
        "Karate Fish": "&5",
        "Golden Fish": "&6"
    }

    /**
     * A function to get data from an url instead of a local file
     * @param {string} url The url where the data is located
     * @param {*} defaultValue The default value to return if the data is not found (e.g [] or {})
     * @returns {*} 
     */
    static getDataFromURL(url, defaultValue = {}) {
        return JSON.parse(FileLib.getUrlContent(url) ?? defaultValue)   
    }

    /**
     * A function to get data from a local file
     * @param {string} filePath The relative path of where it is located in Doc/data
     * @param {*} defaultValue The default value to return if the data is not found (e.g [] or {})
     * @returns {*} 
     */
    static getDataFromFile(filePath, defaultValue = {}) {
        return JSON.parse(FileLib.read("Doc", `data/${filePath}`)) ?? defaultValue
    }

    /**
     * - Gets the data from a saved file, if the file does not exist it'll get the data from the url and create the file with said data
     * @param {string} filePath The relative path of where it is located in Doc/data
     * @param {string} url The url to fallback where the data is located
     * @param {*} defaultValue The default value to return if the data is not found (e.g [] or {})
     * @returns {*}
     */
    static getDataFromFileOrLink(filePath, url, defaultValue = {}) {
        const thefile = FileLib.read("Doc", `data/${filePath}`)

        if (!thefile) {
            const obj = this.getDataFromURL(url, defaultValue)
            this.saveDataToFile(filePath, obj)

            return obj
        }

        return JSON.parse(thefile)
    }

    /**
     * Save data to a local file
     * @param {string} filePath The relative path of where it is located in Doc/data
     * @param {*} data The data to save to the file, defaults to an empty object
     * @param {boolean} createFolderTree Recursively create the needed folder tree
     */
    static saveDataToFile(filePath, data = {}, createFolderTree = true) {
        FileLib.write("Doc", `data/${filePath}`, JSON.stringify(data, null, 4), createFolderTree)
    }

    /**
     * - Creates an object to store as a data in the meter data
     * @param {String} currentName The floor name or slayer name
     * @param {Number | Null} score
     * @param {String | Null} selectedDrop 
     * @returns 
     */
    static createDataForMeter(currentName, score = null, selectedDrop = null) {
        if (!currentName) return

        // Check wheather the data to save is for Dungeons or for Slayers
        const dataType = currentName.length > 2 ? "slayersData" : "dungeonsData"

        // Check if score and selected drop are null
        // if so we create the json data to save as an object
        if (!score && !selectedDrop || score && selectedDrop) {
            this.data.rngMeter[dataType][currentName] = {
                selectedDrop: selectedDrop,
                score: score ?? 0
            }
            this.data.save()
            return
        }

        // Check if the score value exists and selectedDrop is null
        // if so we add score to the data
        if (score && !selectedDrop) {
            this.data.rngMeter[dataType][currentName].score = score
            this.data.save()
            return
        }

        // At last we check if score
        if (score) return

        this.data.rngMeter[dataType][currentName].selectedDrop = selectedDrop
        this.data.save()
    }
}