import ScalableGui from "../../classes/ScalableGui"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import ItemHandler from "../../shared/Items"
import { Persistence } from "../../shared/Persistence"
import { TextHelper } from "../../shared/Text"
import { WorldState } from "../../shared/World"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/dungeonChestProfit/DungeonChestProfit.js

// Constant variables
const editGui = new ScalableGui("croesusProfit").setCommand("croesusProfitDisplay")
const defaultData = Persistence.getDataFromURL("https://raw.githubusercontent.com/DocilElm/Doc/main/JsonData/DefaultCroesusData.json")
const feature = new Feature("croesusProfit", "Dungeons", "")
const chestData = new Map()

// Changeable variables
let stringToDraw = null
let shouldScan = false

// Logic
const registerWhen = () => WorldState.getCurrentWorld() === "Dungeon Hub" && config.croesusProfitDisplay
const checkWindowTitle = windowTitle => shouldScan = /^[\w ]+ Catacombs - Floor [IVXLCDM]+$/.test(windowTitle)

const scanItems = (itemStacks) => {
    if (!shouldScan) return chestData.clear()

    itemStacks.forEach((valueStack, index) => {
        if (!valueStack || index >= 17) return

        const ctItem = new Item(valueStack)
        if (ctItem.getID() === 160) return

        const name = ctItem.getName()
        const lore = ctItem.getLore()

        chestData.set(name, ItemHandler.getCroesusProfit(lore))
    })

    shouldScan = false
}

const makeStringToDraw = () => {
    if (!chestData.size) return stringToDraw = null

    let tempString = ""

    chestData.forEach((value, key) => {
        const items = value.items.toString()
        const profit = value.profit
        const profitFormat = profit <= 0 ? "&c" : "&a"

        if (config.croesusProfitMode === 1) return tempString += `\n&a${key}\n&aTotal Profit&f: ${profitFormat}${TextHelper.addCommasTrunc(profit)}\n`

        tempString += `\n&a${key}${items}\n&aTotal Profit&f: ${profitFormat}${TextHelper.addCommasTrunc(profit)}\n`
    })

    stringToDraw = tempString
}

const renderChestData = () => {
    if (!stringToDraw) return

    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(stringToDraw, 0, 0)
    Renderer.finishDraw()
}

// Default display
editGui.onRender(() => {
    // im too lazy to change the defaults to new ones
    let defStr = ""

    Object.keys(defaultData).forEach(chestName => {
        const chestProfit = defaultData[chestName].profit <= 0 ? `&c${TextHelper.addCommasTrunc(defaultData[chestName].profit)}` : `&a${TextHelper.addCommasTrunc(defaultData[chestName].profit)}`
        const items = defaultData[chestName].items

        if (config.croesusProfitMode === 1) return defStr += `\n&b- ${chestName}\n&b - Profit&f: ${chestProfit}\n`
        
        defStr += `\n&b- ${chestName}\n${items.join("\n")}\n&b - Profit&f: ${chestProfit}\n`
    })

    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(defStr, 0, 0)
    Renderer.finishDraw()
})

// Events
new Event(feature, "onOpenWindowPacket", checkWindowTitle, registerWhen)
new Event(feature, "onWindowItemsPacket", scanItems, registerWhen)
new Event(feature, "tick", makeStringToDraw, registerWhen)
new Event(feature, "renderOverlay", renderChestData, () => WorldState.getCurrentWorld() === "Dungeon Hub" && config.croesusProfitDisplay && stringToDraw)
new Event(feature, "worldUnload", () => chestData.clear())

// Starting events
feature.start()