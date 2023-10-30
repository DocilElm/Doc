import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { TextHelper } from "../../shared/Text"
import { createDungeonsMeter, createSlayersMeter, setDungeonsMeter, setSlayersMeter } from "../../utils/Utils"

// Consistant variables
const validTitles = new Set(["Slayer", "Revenant Horror", "Tarantula Broodfather", "Sven Packmaster", "Voidgloom Seraph", "Inferno Demonlord", "Riftstalker Bloodfiend"])
const feature = new Feature("RngMeterScanner", "Misc", "")

// Regex
const resetDungeonsMeterRegex =  /^You reset your selected drop for your Catacombs \(([\w\d]{1,2})\) RNG Meter\!$/
const resetSlayerMeterRegex =    /^You reset your selected drop for your ([\w ]+) RNG Meter!$/

// Changeable variables
let shouldCheck = false

// Logic
const registerWhen = () => config.RngMeter

// Make sure we add the items to the correct json file
const addItems = (currentScore = null, selectedDrop = null, currentName) => {
    if (!currentName) return
    // If the name [currentName] is above length 2 it means it's a slayer
    // Dungeons is only length 2 texts since it saves as "F1" or "M1"
    const isSlayer = currentName.length > 2

    // If it's slayer we create the slayer json data for the name [currentName]
    if(isSlayer) return createSlayersMeter(currentName, currentScore, selectedDrop)

    // Else we create the dungeons json data for the name [currentName]
    createDungeonsMeter(currentName, currentScore, selectedDrop)
}

const checkWindowName = windowTitle => shouldCheck = (validTitles.has(windowTitle) || /RNG Meter$/.test(windowTitle))

const handleItemsPacket = (itemStacks) => {
    if(!shouldCheck) return

    itemStacks.forEach(itemStack => {
        if(!itemStack) return

        const item = new Item(itemStack)
        if(item.getID() === 160 || item.getID() === 166 || item.getName()?.removeFormatting() !== "RNG Meter") return

        const itemLore = item.getLore()
        const currentName = itemLore?.[1]?.removeFormatting()?.match(/^Catacombs \(([\w\d]+)\)$/)?.[1] ?? itemLore?.[1]?.removeFormatting()

        // If no item selected create new dungeons data with null values
        if(!/Selected Drop/gm.test(itemLore)) return addItems(currentName)

        // Lore index 20 = dungeons, index 17 = slayers
        const scoreIndex = /[\d]+/.test(itemLore[20]?.removeFormatting()) ? 20 : 17
        // Lore index 17 = dungeons, index 14 = slayers
        const dropIndex = itemLore[17]?.removeFormatting()?.includes("/") ? 14 : 17

        const currentScore = parseFloat(itemLore[scoreIndex]?.removeFormatting()?.match(/^ +([\d,]+)\/([\d,]+)/)?.[1]?.replace(/,/g, ""))
        const selectedDrop = TextHelper.dropToRoman(itemLore[dropIndex]?.removeFormatting(), itemLore[dropIndex])

        addItems(currentScore, selectedDrop, currentName)

    })

    shouldCheck = false
}

new Event(feature, "onOpenWindowPacket", checkWindowName, registerWhen)
new Event(feature, "onWindowItemsPacket", handleItemsPacket, registerWhen)

new Event(feature, "onChatPacket", (floorName) => {
    setDungeonsMeter(floorName, null)
}, registerWhen, resetDungeonsMeterRegex)

new Event(feature, "onChatPacket", (slayerName) => {
    setSlayersMeter(slayerName, null)
}, registerWhen, resetSlayerMeterRegex)

// Start the feature
feature.start()