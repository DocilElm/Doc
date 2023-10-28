import ScalableGui from "../../classes/ScalableGui"
import { Feature } from "../../core/Feature"
import { Event } from "../../core/Events"
import DungeonsState from "../../shared/Dungeons"
import { WorldState } from "../../shared/World"
import config from "../../config"

// Constant variables
const editGui = new ScalableGui("ragaxecd").setCommand("ragnarokAxeDisplay")
const feature = new Feature("ragnarokAxeTimer", "Misc", "")

// Changeable variables
let lastCast = null
let cooldownTime = 20_000

// Default display
editGui.onRender(() => editGui.renderString("&aAxe Cooldown: Ready!"))

// Logic
const registerWhen = () => World.isLoaded() && config.ragnarokAxeTimer

function updateCooldownAndCastTime() {
    lastCast = Date.now()

    if(!WorldState.inDungeons()) return

    cooldownTime = DungeonsState.getMageReduction(20_000)
}

function renderCooldownStatus() {
    if (!lastCast) return

    const timePast = cooldownTime - (Date.now() - lastCast)
    editGui.renderString(timePast <= 0 ? "§aAxe Cooldown: Ready!" : `§cAxe Cooldown: ${timePast / 1000}`)
}

// Reset variables to default so it can be used in different worlds
function resetLastCast() {
    lastCast = null
    cooldownTime = 20_000
}

// Events
new Event(feature, "onActionBarPacket", updateCooldownAndCastTime, registerWhen, /^.+CASTING IN 3s(.+)?$/)
new Event(feature, "renderOverlay", renderCooldownStatus, registerWhen)
new Event(feature, "worldUnload", resetLastCast)

// Starting events
feature.start()