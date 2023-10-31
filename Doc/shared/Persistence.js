export class Persistence {
    static rareGardenItemsList = new Map([
        ["Flowering Bouquet", "FLOWERING_BOUQUET"],
        ["Overgrown Grass", "OVERGROWN_GRASS"],
        ["Green Bandana", "GREEN_BANDANA"],
        ["Dedication IV", "ENCHANTMENT_DEDICATION_4"],
        ["Dedication 4", "ENCHANTMENT_DEDICATION_4"],
        ["Music Rune", "MUSIC_RUNE;1"],
        ["Space Helmet", "DCTR_SPACE_HELM"],
        ["Cultivating I", "ENCHANTMENT_CULTIVATING_1"],
        ["Cultivating 1", "ENCHANTMENT_CULTIVATING_1"],
        ["Replenish I", "ENCHANTMENT_REPLENISH_1"],
        ["Replenish 1", "ENCHANTMENT_REPLENISH_1"]
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
        "COMPOST": "COMPOST"
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
     * Save data to a local file
     * @param {string} filePath The relative path of where it is located in Doc/data
     * @param {*} data The data to save to the file, defaults to an empty object
     * @param {boolean} createFolderTree Recursively create the needed folder tree
     */
    static saveDataToFile(filePath, data = {}, createFolderTree = true) {
        FileLib.write("Doc", `data/${filePath}`, JSON.stringify(data), createFolderTree)
    }
}