import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"
import { TextHelper } from "../../shared/Text"

// Consistant variables
const validTitles = new Set(["Slayer", "Revenant Horror", "Tarantula Broodfather", "Sven Packmaster", "Voidgloom Seraph", "Inferno Demonlord", "Riftstalker Bloodfiend"])
const feature = new Feature("RngMeterScanner", "Misc", "")

// Regex
const resetDungeonsMeterRegex =  /^You reset your selected drop for your Catacombs \(([\w\d]{1,2})\) RNG Meter\!$/
const resetSlayerMeterRegex =    /^You reset your selected drop for your ([\w ]+) RNG Meter!$/

// Changeable variables
let shouldCheck = false

// Logic
const registerWhen = () => config().RngMeter

const checkWindowName = windowTitle => shouldCheck = (validTitles.has(windowTitle) || /RNG Meter$/.test(windowTitle))

const handleItemsPacket = (itemStacks) => {
    if (!shouldCheck) return

    itemStacks.forEach(valueStack => {
        if (!valueStack) return

        const ctItem = new Item(valueStack)
        if (ctItem.getID() === 160 || ctItem.getID() === 166 || ctItem.getName()?.removeFormatting() !== "RNG Meter") return

        const itemLore = ctItem.getLore()
        const currentName = itemLore?.[1]?.removeFormatting()?.match(/^Catacombs \(([\w\d]+)\)$/)?.[1] ?? itemLore?.[1]?.removeFormatting()

        // If no item selected create new dungeons data with null values
        if (!/Selected Drop/gm.test(itemLore)) return Persistence.createDataForMeter(currentName)

        // Lore index 18 = dungeons, index 16 = slayers
        const scoreIndex = itemLore[20]?.removeFormatting() ? 18 : 16
        // Lore index 15 = dungeons, index 13 = slayers
        const dropIndex = itemLore[18]?.removeFormatting()?.includes("/") ? 15 : 13

        const currentScore = parseFloat(itemLore[scoreIndex]?.removeFormatting()?.match(/^ +([\d,]+)\/([\d,]+)/)?.[1]?.replace(/,/g, ""))
        const selectedDrop = TextHelper.dropToRoman(itemLore[dropIndex]?.removeFormatting(), itemLore[dropIndex])

        Persistence.createDataForMeter(currentName, currentScore, selectedDrop)

    })

    shouldCheck = false
}

new Event(feature, "onOpenWindowPacket", checkWindowName, registerWhen)
new Event(feature, "onWindowItemsPacket", handleItemsPacket, registerWhen)

new Event(feature, "onChatPacket", (floorName) => {
    Persistence.createDataForMeter(floorName)
}, registerWhen, resetDungeonsMeterRegex)

new Event(feature, "onChatPacket", (slayerName) => {
    Persistence.createDataForMeter(slayerName)
}, registerWhen, resetSlayerMeterRegex)

// Start the feature
feature.start()