import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/Text"

// Constant variables
const feature = new Feature("RabbitHelper", "Misc", "")
const rabbitSlots = [ 28, 29, 30, 31, 32, 33, 34 ]
const chocolateCostRegex = /Cost ([\d,.]+) Chocolate/
const employedRabbitRegex = /^Rabbit \w+ - \[\d+\] \w+$/
const rabbitUpgradeRegex = /^Rabbit \w+ has been promoted to \[\d+\] \w+\!$/
const notEnoughChocoRegex = /^You don\'t have enough Chocolate\!$/

// Changeable variables
let shouldScan = false
let renderIdx = null

// Logic
const onWindowOpen = (title) => Client.scheduleTask(2, () => shouldScan = title === "Chocolate Factory")

const onTick = () => {
    if (!World.isLoaded() || !shouldScan || !config.rabbitHelper) return

    const container = Player.getContainer()
    if (container.getName() !== "Chocolate Factory") return
    const items = container.getItems()

    renderIdx = null

    const chocolatePurse = parseFloat(items?.[13]?.getName()?.removeFormatting()?.replace(/[,.]/g, ""))
    if (!chocolatePurse) return ChatLib.chat(`${TextHelper.PREFIX} &cWoah looks like we couldn't find the chocolates you currently have.`)

    const rabbitData = rabbitSlots.map((it, idx) => {
        const item = items[it]
        if (!item || item.getID() !== 397 || !employedRabbitRegex.test(item.getName().removeFormatting())) return

        const chocoCost = parseFloat(item.getLore().map(lore => lore.removeFormatting()).join(" ").match(chocolateCostRegex)?.[1]?.replace(/[,.]/g, ""))
        const costPerCPS = chocoCost / (idx + 1)

        return {
            idx: it,
            costPerCPS,
            canBuy: chocoCost < chocolatePurse
        }
    })

    const mostEfficient = rabbitData.reduce((a, b) => {
        if (!("idx" in a) && b?.canBuy) return a = b
        if (!("idx" in a)) return a // if we still cannot buy it we keep returning

        if (b?.costPerCPS > a?.costPerCPS || !b?.canBuy) return a

        a = b

        return a
    }, {})

    renderIdx = mostEfficient?.idx
    shouldScan = false
}

const onGuiRender = () => {
    if (!World.isLoaded() || !config.rabbitHelper || !renderIdx || Player.getContainer().getName() !== "Chocolate Factory") return

    const [ x, y ] = RenderHelper.getSlotRenderPosition(renderIdx)
    
    Renderer.translate(0, 0, 100)
    Renderer.drawRect(
        Renderer.GREEN,
        x,
        y,
        16,
        16
    )
}

// Events
new Event(feature, "onOpenWindowPacket", onWindowOpen, () => World.isLoaded() && config.rabbitHelper)
new Event(feature, "tick", onTick, () => World.isLoaded() && config.rabbitHelper)
// Recalculate whenever the player buys a upgrade
// doing it this way since the gui doesnt get updated via packet to not be constantly scanning
new Event(feature, "onChatPacket", () => {
    if (!config.rabbitHelper) return
    
    shouldScan = true
    renderIdx = null
}, () => World.isLoaded(), rabbitUpgradeRegex)
new Event(feature, "onChatPacket", () => {
    if (!config.rabbitHelper) return
    
    shouldScan = true
    renderIdx = null
}, () => World.isLoaded(), notEnoughChocoRegex)
new Event(feature, "guiRender", onGuiRender, () => World.isLoaded() && renderIdx && config,rabbitSlots)

// Starting events
feature.start()