import PogObject from "../../PogData"

export class Persistence {
    static data = new PogObject("Doc", {
        inventoryButtons: {},
        commandAliases: {},
        keyShortcuts: {},
        showMessageTitle: {},
        cancelMessage: {},
        auctionsClicked: [],
        auctionsStrings: [],
        bazaarClicked: [],
        bazaarStrings: [],
        chatWaypointNames: [],
        lockedSlots: {},
        equipments: [],
        clickedWoodenButtons: [],
        partyCommandList: [],
        toggleSprint: false,
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
        const json = JSON.parse(thefile)

        if (!thefile || !json.savedAt || (Date.now() - json.savedAt) >= 1800000) {
            const obj = this.getDataFromURL(url, defaultValue)
            this.saveDataToFile(filePath, {
                obj,
                savedAt: Date.now()
            })

            return obj
        }

        return json.obj
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

register("gameUnload", () => {
    Persistence.data.save()
})