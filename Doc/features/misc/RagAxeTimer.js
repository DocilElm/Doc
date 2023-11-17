import { Feature } from "../../core/Feature"
import { Event } from "../../core/Events"
import DungeonsState from "../../shared/Dungeons"
import { WorldState } from "../../shared/World"
import config from "../../config"
import ScalableGui from "../../shared/Scalable"

// Constant variables
const editGui = new ScalableGui("ragaxecd").setCommand("ragnarokAxeDisplay")
const feature = new Feature("ragnarokAxeTimer", "Misc", "")

// Changeable variables
let lastCast = null
let cooldownTime = 20_000
let stringToDraw = null

// Default display
editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&aAxe Cooldown: Ready!", 0, 0)
    Renderer.finishDraw()
})

// Logic
const registerWhen = () => World.isLoaded() && config.ragnarokAxeTimer

const updateCooldownAndCastTime = () => {
    lastCast = Date.now()

    if (!WorldState.inDungeons()) return

    cooldownTime = DungeonsState.getMageReduction(20_000)
}

const makeStringToDraw = () => {
    if (!lastCast) return stringToDraw = null

    const timePast = cooldownTime - (Date.now() - lastCast)
    stringToDraw = timePast <= 0 ? "§aAxe Cooldown: Ready!" : `§cAxe Cooldown: ${timePast / 1000}`
}

const renderCooldownStatus = () => {
    if (!stringToDraw || editGui.isOpen()) return
    
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(stringToDraw, 0, 0)
    Renderer.finishDraw()
}

// Events
new Event(feature, "tick", makeStringToDraw, registerWhen)
new Event(feature, "onActionBarPacket", updateCooldownAndCastTime, registerWhen, /^.+CASTING IN 3s(.+)?$/)
new Event(feature, "renderOverlay", renderCooldownStatus, () => World.isLoaded() && config.ragnarokAxeTimer && stringToDraw)
new Event(feature, "worldUnload", () => {
    lastCast = null
    cooldownTime = 20_000
})

// Starting events
feature.start()