import ScalableGui from "../../classes/ScalableGui"
import { Feature } from "../../core/Feature"
import { Event } from "../../core/Events"
import DungeonsState from "../../shared/Dungeons"
import { WorldState } from "../../shared/World"

// Constant variables
const editGui = new ScalableGui("ragaxecd").setCommand("ragnarokAxeDisplay")
const feature = new Feature("ragnarokAxeTimer", "Misc", "")

// Changeable variables
let lastCast = null
let cooldownTime = 20_000

// World checks
function checkWorld() { World.isLoaded() }

// Default display
editGui.onRender(() => editGui.renderString("&aAxe Cooldown: Ready!"))

// Logic
function updateCooldownAndCastTime() {
    if (!WorldState.inDungeons()) return
    
    lastCast = Date.now()
    cooldownTime = DungeonsState.getMageReduction(20000)
}

function renderCooldownStatus() {
    if (!lastCast || !WorldState.inDungeons()) return

    const timePast = cooldownTime - (Date.now() - lastCast)
    editGui.renderString(timePast <= 0 ? "§aAxe Cooldown: Ready!" : `§cAxe Cooldown: ${timePast / 1000}`)
}

// This is used to make it only show after the Ragnorok Axe has been used
// in the current world
function resetLastCast() {
    lastCast = null
}

// Events
new Event(feature, "onActionBarPacket", updateCooldownAndCastTime, checkWorld, /^.+CASTING IN 3s(.+)?$/)
new Event(feature, "renderOverlay", renderCooldownStatus, checkWorld)
new Event(feature, "worldUnload", resetLastCast)

// Starting events
feature.start()