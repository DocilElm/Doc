import ScalableGui from "../../classes/ScalableGui"
import { Feature } from "../../core/Feature"
import { WorldState } from "../../shared/World"
import config from "../../config"
import { Event } from "../../core/Events"
import PriceHelper from "../../shared/Price"
import ItemHandler from "../../shared/Items"
import { TextHelper } from "../../shared/Text"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/dungeonChestProfit/DungeonChestProfit.js

// Constant variables
const editGui = new ScalableGui("dungeonProfit").setCommand("dungeonProfitDisplay")
const feature = new Feature("chestProfit", "Dungeons", "")
const chestNames = new Set(["Wood Chest", "Gold Chest", "Diamond Chest", "Emerald Chest", "Obsidian Chest", "Bedrock Chest"])
const chestData = new Map()

// Changeable variables
let stringToDraw = null
let shouldScan = false
let currentChest = null

// Logic
const registerWhen = () => WorldState.inDungeons() && config.dungeonProfitDisplay
const checkWindowTitle = windowTitle => {
    shouldScan = chestNames.has(windowTitle)
    currentChest = windowTitle
}

const scanItems = (itemStacks) => {
    if (!shouldScan) return

    // If the map data has this chest return so it dosent add more of the same values
    if (chestData.has(currentChest)) return

    // Create chest data if it dosent exist
    if (!chestData.has(currentChest)) chestData.set(currentChest, {
        items: [],
        chestPrice: 0,
        profit: 0
    })

    // Get the chest data so we can add values to it
    const currentData = chestData.get(currentChest)

    itemStacks.forEach((valueStack, index) => {
        if (!valueStack || index >= 32) return

        const ctItem = new Item(valueStack)
        if (ctItem.getID() === 160) return

        // Check for chest price name
        if (ctItem.getName().removeFormatting() === "Open Reward Chest" && index === 31) {
            currentData.chestPrice = parseInt(ctItem.getLore()?.[7]?.removeFormatting()?.match(/^([\d,]+) Coins$/)?.[1]?.replace(/,/g, ""))

            // Add dungeon chest key price to the chest price in case this is required
            const chestkey = ctItem.getLore()?.[8]?.removeFormatting() === "Dungeon Chest Key" ? PriceHelper.getSellPrice("DUNGEON_CHEST_KEY") : 0
            currentData.chestPrice += chestkey

            return
        }

        // Check if the list is still checking for chest loot and not overall items
        if (index >= 19) return

        const itemName = ctItem.getName().removeFormatting() === "Enchanted Book" ? ctItem.getLore()[1] : ctItem.getName()

        // Push item name with format to the array
        currentData.items.push(`\n${itemName}`)
        // Push item price as profit for later calculation
        currentData.profit += new ItemHandler(ctItem).getValue()
    })
    // Calculate profit by subtracting chest price from profit
    currentData.profit = currentData.profit - currentData.chestPrice

    shouldScan = false
}

const makeStringToDraw = () => {
    if (!chestData.size) return stringToDraw = null

    let tempString = ""

    chestData.forEach((value, key) => {
        const items = value.items.toString()
        const profit = value.profit
        const profitFormat = profit <= 0 ? "&c" : "&a"

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
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(`\n&aFree Chest\n&aExample Item &8x25\n&aTotal Profit&f: &a1,000`, 0, 0)
    Renderer.finishDraw()
})

// Events
new Event(feature, "onOpenWindowPacket", checkWindowTitle, registerWhen)
new Event(feature, "onWindowItemsPacket", scanItems, registerWhen)
new Event(feature, "tick", makeStringToDraw, registerWhen)
new Event(feature, "renderOverlay", renderChestData, () => WorldState.inDungeons() && config.dungeonProfitDisplay && stringToDraw)
new Event(feature, "worldUnload", () => chestData.clear(), currentChest = null)

// Starting events
feature.start()