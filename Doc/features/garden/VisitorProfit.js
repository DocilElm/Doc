import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"
import Price from "../../../Atomx/skyblock/Price"
import ScalableGui from "../../shared/Scalable"
import { TextHelper } from "../../shared/Text"
import { WorldState } from "../../shared/World"
import AtomxApi from "../../../Atomx/AtomxApi"

// Constant variables
const defaultString = `&aNPC&f: &b${Player.getName()}\n&aItems Required&f: \n &aEnchanted Life &8x1\n&cCopper&f: &60\n&9Special Item&f: &6None\n&aTotal Profit&f: &60`
const editGui = new ScalableGui("visitorProfit", defaultString).setCommand("visitorProfitDisplay")
const feature = new Feature("visitorProfitDisplay", "Garden", "")
const GardenVisitors = Persistence.getDataFromURL("https://raw.githubusercontent.com/DocilElm/Atomx/main/api/GardenVisitors.json")
const requiredWorld = "Garden"
const visitorsData = new Map()

// Regex
const requiredItemsRegex = /^ ([a-zA-z ]+)(?: x)?([\d,]+)?/
const currentCopperRegex = /^ \+([\d,]+) Copper$/
const rareItemRegex =      /^ (?:◆)?([a-zA-z\d ]+)/
const visitorDialogRegex = /^\[NPC\] ([\w\. ]+): (.+)$/

// Changeable variables
let shouldScan = false
let stringToDraw = null

// Logic
const registerWhen = () => WorldState.getCurrentWorld() === requiredWorld && config.visitorProfitDisplay

const checkWindowName = windowTitle => shouldScan = Object.keys(GardenVisitors).some(name => name === windowTitle)

const scanItems = (itemStacks) => {
    if (!shouldScan) return

    let hasVisitorHead = false
    let currentVisitor = null

    itemStacks.forEach((valueStack, index) => {
        if (!valueStack || (index > 13 && !hasVisitorHead)) return

        const ctItem = new Item(valueStack)
        // Check if it's an actual visitor gui
        // since other npc's have the same gui names
        const visitorOffers = index === 13 ? ctItem.getLore()?.[4] : null
        const hasOffers = visitorOffers ? /^Offers Accepted: [\d]+$/.test(visitorOffers.removeFormatting()) : null

        // If it's an actual visitor re-assign these variables for saving data
        if (hasOffers) {
            currentVisitor = ctItem.getName()?.removeFormatting()
            hasVisitorHead = hasOffers
        }

        // Checking for accept visitor button
        if (index !== 29) return

        // Create object to save
        visitorsData.set(currentVisitor, {
            requiredItems: [],
            copperAmount: 0,
            totalPrice: 0,
            profit: 0,
            rareItem: null
        })

        // Get the map data to assign data into it
        const currentData = visitorsData.get(currentVisitor)

        // If [ctItem] item is the accept button we check for lore stuff
        ctItem.getLore()?.forEach((itemLore, loreIndex) => {
            const lore = itemLore.removeFormatting()

            // Get required items and amount even if the amount is equals to 0
            // Check lore index in case it finds a rare item so we dont add it to the required items
            if (loreIndex <= 5 && requiredItemsRegex.test(lore)) {
                const [ _, requiredItem, requiredAmount ] = lore.match(requiredItemsRegex)
                const actualName = requiredItem.toUpperCase().replace(/ X/, "").replace(/ /g, "_")

                const requiredItemPrice = Price.getSellPrice(AtomxApi.getGardenItemID()[actualName])
                const totalPrice = requiredItemPrice * (requiredAmount?.replace(/,/g, "") ?? 1)

                // Add values to the map
                currentData.requiredItems.push(`\n${itemLore}`)
                currentData.totalPrice += totalPrice
                
                return
            }

            // Get total copper
            if (currentCopperRegex.test(lore)) {
                const [ _, copperAmount ] = lore.match(currentCopperRegex)

                // Add copper to the map
                currentData.copperAmount += parseInt(copperAmount)

                return
            }

            // Get rare items in case they exist
            if (rareItemRegex.test(lore) && loreIndex >= 5) {
                let [ _, rareItem ] = lore.match(rareItemRegex)
                rareItem = rareItem.replace(/^ /, "")

                if (!(rareItem in AtomxApi.getGardenRareItems())) return

                currentData.rareItem = AtomxApi.getGardenRareItems()[rareItem]

                return
            }
        })

        // Check if the visitor was created or not
        if (!visitorsData.has(currentVisitor)) return ChatLib.chat(`${TextHelper.PREFIX} &cFailed to create visitor's profit display`)

        // Calculate profit
        const totalItemPrice = currentData.totalPrice
        const totalCopperPrice = (Price.getSellPrice("ENCHANTMENT_GREEN_THUMB_1") / 1500) * currentData.copperAmount

        currentData.profit = (totalCopperPrice - totalItemPrice)

        // If no rare item detected return
        if (!currentData.rareItem) return

        const rareItemPrice = Price.getSellPrice(currentData.rareItem)

        // Calculate rare item profit with current profit
        const currentProfit = currentData.profit <= 0 ? -currentData.profit : +currentData.profit

        currentData.profit = (rareItemPrice - currentProfit)

    })

    shouldScan = false
}

const removeVisitor = (visitorName, _) => {
    if (!visitorsData.has(visitorName)) return

    visitorsData.delete(visitorName)
}

const makeStringToDraw = () => {
    if (!visitorsData.size) return stringToDraw = null
  
    let tempArray = []
  
    visitorsData.forEach((value, key) => {
      const name = GardenVisitors[key].formattedName
      const items = value.requiredItems.toString()
      const copper = value.copperAmount
      const profit = value.profit
      const profitFormat = profit <= 0 ? "&c" : "&a"
      const rareItem = value.rareItem
  
      tempArray.push(`\n&aNPC&f: ${name}\n&aRequired Items&f: ${items}\n&cTotal Copper&f: &6${copper}\n&9Rare Item&f: &b${rareItem ?? "&cNone"}\n&aTotal Profit&f: ${profitFormat}${TextHelper.addCommasTrunc(profit)}\n`)
    })
  
    stringToDraw = tempArray.join("")
    tempArray = null
}

const renderVisitors = () => {
    if (!stringToDraw || editGui.isOpen()) return

    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(stringToDraw, 0, 0)
    Renderer.finishDraw()
}

// Default display
editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(defaultString, 0, 0)
    Renderer.finishDraw()
})

// Events
new Event(feature, "onOpenWindowPacket", checkWindowName, registerWhen)
new Event(feature, "onWindowItemsPacket", scanItems, registerWhen)
new Event(feature, "tick", makeStringToDraw, registerWhen)
new Event(feature, "renderOverlay", renderVisitors, () => WorldState.getCurrentWorld() === requiredWorld && config.visitorProfitDisplay && stringToDraw)
new Event(feature, "onChatPacket", removeVisitor, registerWhen, visitorDialogRegex)
new Event(feature, "worldUnload", () => visitorsData.clear())

// Starting events
feature.start()