import request from "../../requestV2"
import Promise from "../../PromiseV2"
import PriceUtils from "../../BloomCore/PriceUtils"
import PogObject from "PogData"

export const PREFIX = "&0[&4Doc&0]&r"

export const data = new PogObject("Doc", {
    settings: {
        keybinds: {}
    },
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
    apiCheckTime: null,
    firstTime: true
}, "data/.data.json")

// mc classes
export const EntityArmorStand = Java.type("net.minecraft.entity.item.EntityArmorStand")
export const BossStatus = Java.type("net.minecraft.entity.boss.BossStatus")

export const C08PacketPlayerBlockPlacement = Java.type("net.minecraft.network.play.client.C08PacketPlayerBlockPlacement")
export const C0EPacketClickWindow = Java.type("net.minecraft.network.play.client.C0EPacketClickWindow")
export const C0DPacketCloseWindow = Java.type("net.minecraft.network.play.client.C0DPacketCloseWindow")

export const S02PacketChat = Java.type("net.minecraft.network.play.server.S02PacketChat")
export const S2DPacketOpenWindow = Java.type("net.minecraft.network.play.server.S2DPacketOpenWindow")
export const S3EPacketTeams = Java.type("net.minecraft.network.play.server.S3EPacketTeams")
export const S38PacketPlayerListItem = Java.type("net.minecraft.network.play.server.S38PacketPlayerListItem")
export const S47PacketPlayerListHeaderFooter = Java.type("net.minecraft.network.play.server.S47PacketPlayerListHeaderFooter")


export const rareGardenItems = {
    "Flowering Bouquet": "FLOWERING_BOUQUET",
    "Overgrown Grass": "OVERGROWN_GRASS",
    "Green Bandana": "GREEN_BANDANA",
    "Dedication IV": "ENCHANTMENT_DEDICATION_4",
    "Dedication 4": "ENCHANTMENT_DEDICATION_4",
    "Music Rune": "MUSIC_RUNE;1",
    "Space Helmet": "DCTR_SPACE_HELM",
    "Cultivating I": "ENCHANTMENT_CULTIVATING_1",
    "Cultivating 1": "ENCHANTMENT_CULTIVATING_1",
    "Replenish I": "ENCHANTMENT_REPLENISH_1",
    "Replenish 1": "ENCHANTMENT_REPLENISH_1"
}
export const sbNameToIdGarden = {
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
export const copperToCoinsItem = "ENCHANTMENT_GREEN_THUMB_1"

// from bloomcore
export const entryMessages = new Set([
    "[BOSS] Bonzo: Gratz for making it this far, but I'm basically unbeatable.",
    "[BOSS] Scarf: This is where the journey ends for you, Adventurers.",
    "[BOSS] The Professor: I was burdened with terrible news recently...",
    "[BOSS] Thorn: Welcome Adventurers! I am Thorn, the Spirit! And host of the Vegan Trials!",
    "[BOSS] Livid: Welcome, you've arrived right on time. I am Livid, the Master of Shadows.",
    "[BOSS] Sadan: So you made it all the way here... Now you wish to defy me? Sadan?!",
    "[BOSS] Maxor: WELL! WELL! WELL! LOOK WHO'S HERE!"
])

export const chestNames = new Set(["Wood Chest", "Gold Chest", "Diamond Chest", "Emerald Chest", "Obsidian Chest", "Bedrock Chest"])

export const trophyTypeColors = {
    BRONZE: "&8",
    SILVER: "&7",
    GOLD: "&6",
    DIAMOND: "&b"
}

export const trophyFishColors = {
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

export const romanNumerals = {M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1}

export const slayerGuiNames = new Set(["Slayer", "Revenant Horror", "Tarantula Broodfather", "Sven Packmaster", "Voidgloom Seraph", "Inferno Demonlord", "Riftstalker Bloodfiend"])

export const chat = (msg) => ChatLib.chat(msg)
export const chatid = (msg, id) => new Message(msg).setChatLineId(id).chat()
export const hover = (msg, value) => new TextComponent(msg).setHoverValue(value).chat()
export const breakchat = () => ChatLib.chat(ChatLib.getChatBreak(" "))
export const addCommas = (num) => num?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ',') ?? num
export const mathTrunc = (num) => addCommas(Math.trunc((Math.round(num * 100) / 100)))
export const getPerHrItems = (item, time) => mathTrunc(Math.round(((item ?? 0)/(time ?? 1)) * 3600))

// bloom core probably has this so i'll just credit bloom for it ig
export const getScoreboard = (descending = false) => Scoreboard.getLines(descending)?.map(line => line?.getName()?.removeFormatting()?.replace(/[^\u0000-\u007F]/g, ""))

export const getSkyblockId = (item) => item?.getNBT()?.toObject()?.tag?.ExtraAttributes?.id
export const getChampion = (item) => item?.getNBT()?.toObject()?.tag?.ExtraAttributes?.champion_combat_xp
export const isInScoreboard = (str) => getScoreboard().some(a => a.includes(str))
export const isInTab = (str) => TabList.getNames()?.find(names => names.removeFormatting()?.match(/^Area|Dungeon: ([\w\d ]+)$/))?.includes(str)
export const getSubArea = (currentWorld) => currentWorld?.includes("The Rift") ? Scoreboard.getLines()?.find(f => f?.getName()?.removeFormatting()?.match(/ ф (.+)/))?.getName()?.removeFormatting()?.replace(/[^\u0000-\u007F]/g, "") : Scoreboard.getLines()?.find(f => f?.getName()?.removeFormatting()?.match(/ ⏣ (.+)/))?.getName()?.removeFormatting()?.replace(/[^\u0000-\u007F]/g, "")
export const checkConfig = (category, name) => data.settings[category][name]
export const getTime = (oldDate) => {
    const seconds = Math.round((Date.now() - oldDate) / 1000 % 60)
    const mins = Math.floor((Date.now() - oldDate) / 1000 / 60 % 60)
    const hours = Math.floor((Date.now() - oldDate) / 1000 / 60 / 60 % 24)

    return `${hours}:${mins}:${seconds}`
}
export const isBetween = (number, [min, max]) => (number-min) * (number-max) <= 0
export const getSeconds = (timeStamp, timeStamp2) => !timeStamp || !timeStamp2 ? "0s" : `${((timeStamp-timeStamp2)/1000).toFixed(2)}s`
// from BloomCore
export const getSlotCenter = (slot) => {
    let x = slot % 9
    let y = Math.floor(slot / 9)
    let renderX = (Renderer.screen.getWidth() / 2) + ((x - 4) * 18)
    let renderY = (Renderer.screen.getHeight() / 2) + ((y - Player.getContainer().getSize() / 18) * 18)

    return [renderX, renderY]
}

export const getCroesusProfit = (lore) => {
    if(!lore) return null

    let result = {
        chestPrice: 0,
        totalvalue: 0,
        profit: 0,
        items: []
    }

    let essenceGathered = 0

    lore.forEach(itemLore => {
        const unformattedLore = itemLore.removeFormatting()?.replace(/'s/g, "")

        if(/^([\d,]+) Coins$/.test(unformattedLore)){
            const [ ar, chestPriceR ] = unformattedLore.match(/^([\d,]+) Coins$/)
            result.chestPrice = parseInt(chestPriceR.replace(/,/g, ""))
        }

        if(essenceGathered >= 2 || unformattedLore.startsWith("Contents") || unformattedLore.includes("Chest")) return

        let itemID = null
        let amount = 0

        if(/^Enchanted Book \(([\wd ]+)\)$/.test(unformattedLore)){
            const [ ar, enchantName ] = unformattedLore.match(/^Enchanted Book \(([\wd ]+)\)$/)
            itemID = enchantName.toUpperCase().replace(/ /g, "_")
        }

        if(/(Undead|Wither) Essence x(\d+)/.test(unformattedLore)){
            const [ ar, type, amountR ] = unformattedLore.match(/(Undead|Wither) Essence x(\d+)/)
            itemID = `ESSENCE_${type}`.toUpperCase()
            amount = parseInt(amountR)

            essenceGathered++
        }

        if(!itemID) itemID = unformattedLore.toUpperCase().replace(/ /g, "_")

        result.items.push(`&b- ${itemLore}`)

        // calculate item prices
        result.totalvalue += Math.floor(PriceUtils.getSellPrice(itemID) * amount)
    })

    result.profit = result.totalvalue - result.chestPrice

    return result
}

export const bossRoomId = new Set([
    "30,30",
    "30,125",
    "30,225",
    "30,344",
    "livid",
    "sadan",
    "f7"
])
export const isInBoss = () => getScoreboard().some(line => bossRoomId.has(line.match(/^[\d\/]+ [\w\d]+ ([-\d\w,]+)$/)?.[1]))
export const isDoublePowderEvent = () => /^PASSIVE EVENT ([§\w\d]+)?2X POWDER RUNNING FOR [\d]+:([\d]+)$/.test(BossStatus?.field_82827_c?.removeFormatting()) && BossStatus?.field_82827_c?.removeFormatting()?.match(/^PASSIVE EVENT ([§\w\d]+)?2X POWDER RUNNING FOR [\d]+:([\d]+)$/)?.[2] >= 1
export const convertToRoman = (num) => {
    let result = ""
  
    for (let key in romanNumerals) {
      while (num >= romanNumerals[key]) {
        result += key;
        num -= romanNumerals[key];
      }
    }
  
    return result
}

export const createDungeonsMeter = (floorName, score, itemName) => {
    if(!floorName) return

    data.rngMeter.dungeonsData[floorName] = {
        selectedDrop: itemName,
        score: score ?? 0
    }
    data.save()
}

/**
 * 
 * @param {string} floorName The floor name which you want to save the data to
 * @param {string} itemName The item name that you want to save
 * @param {number} score The score that you want to save
 * @param {string} type The type of data to save. opts: "item", "score"
 * @returns 
 */
export const setDungeonsMeter = (floorName, itemName, score, type = "item") => {
    if(!data.rngMeter.dungeonsData[floorName]) return createDungeonsData(floorName, score, itemName)
    if(type === "item" && !itemName) return data.rngMeter.dungeonsData[floorName].selectedDrop = null, data.save()
    if(type === "score" && !score) return data.rngMeter.dungeonsData[floorName].score = null, data.save()

    if(type === "item") return data.rngMeter.dungeonsData[floorName].selectedDrop = itemName, data.save()

    data.rngMeter.dungeonsData[floorName].score = score
    data.save()
}

export const createSlayersMeter = (slayerName, score, itemName) => {
    if(!slayerName) return

    data.rngMeter.slayersData[slayerName] = {
        selectedDrop: itemName,
        score: score ?? 0
    }
    data.save()
}

/**
 * 
 * @param {string} slayerName The slayer name which you want to save the data to
 * @param {string} itemName The item name that you want to save
 * @param {number} score The score that you want to save
 * @param {string} type The type of data to save. opts: "item", "score"
 * @returns 
 */
export const setSlayersMeter = (slayerName, itemName, score, type = "item") => {
    if(!data.rngMeter.slayersData[slayerName]) return createSlayersMeter(slayerName, score, itemName)
    if(type === "item" && !itemName) return data.rngMeter.slayersData[slayerName].selectedDrop = null, data.save()
    if(type === "score" && !score) return data.rngMeter.slayersData[slayerName].score = null, data.save()

    if(type === "item") return data.rngMeter.slayersData[slayerName].selectedDrop = itemName, data.save()

    data.rngMeter.slayersData[slayerName].score = score
    data.save()
}

// api stuff

export const makeRequest = (url) => request({url: url, headers: { 'User-Agent': ' Mozilla/5.0', 'Content-Type': 'application/json' }, json: true})
export const printError = (error) => hover(`${PREFIX} &cError Getting Data`, JSON.stringify(error))

/**
 * 
 * @param {string} dir The directory where the file is going to be saved
 * @param {string} fileName The file name
 * @param {object} dataToSave The object to be saved as json format
 * @param {boolean} recursive Whether to create folders to the file location if they don't exist
 */
export const saveToFile = (fileName, dataToSave = {}, recursive = true) => {
    FileLib.write("Doc", fileName, JSON.stringify(dataToSave), recursive)
}

/**
 * 
 * @param {string} fileName The file name to fetch for
 * @param {*} type The type to return if the file is not found e.g [] or {}
 * @returns 
 */
export const getJsonDataFromFile = (fileName, type = {}) => JSON.parse(FileLib.read("Doc", fileName)) ?? type

/**
 * 
 * @param {string} url The url to fetch for
 * @param {*} type The type to return if the file is not found e.g [] or {}
 * @returns 
 */
export const getJsonDataFromUrl = (url, type = {}) => JSON.parse(FileLib.getUrlContent(url)) ?? type

const refreshLbApi = () => {
    if(!!data.apiCheckTime && Date.now()-data.apiCheckTime <= (1000*60)*20) return

    Promise.all([
        makeRequest("https://moulberry.codes/lowestbin.json"),
        makeRequest("https://api.hypixel.net/skyblock/bazaar")
    ]).then(apiData => {
        saveToFile("data/LowestBin.json", apiData[0])
        saveToFile("data/Bazaar.json", apiData[1])
        data.apiCheckTime = Date.now()
        data.save()
    }).catch(e => {
        print(e)
        print(JSON.stringify(e))
    })
    
}

register("step", () => refreshLbApi()).setDelay(60*20)
register("gameLoad", () => refreshLbApi())
