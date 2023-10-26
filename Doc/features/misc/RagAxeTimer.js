import ScalableGui from "../../classes/ScalableGui"
import { Feature } from "../../core/Feature"
import { Event } from "../../core/Events"
import DungeonsState from "../../shared/DungeonsState"
import { WorldState } from "../../shared/World"

// Constant variables
const editGui = new ScalableGui("ragaxecd").setCommand("ragnarokAxeDisplay")
const feature = new Feature("ragnarokAxeTimer", "Misc", "")

// Changeable variables
let lastCast = null
let cdTime = 20000

// World checks
const checkWorld = () => World.isLoaded()

// Default display
editGui.onRender(() => editGui.renderString("&aAxe Cooldown: Ready!"))

// Events
new Event(feature, "onActionBarPacket", () => {
    lastCast = Date.now()

    if(!WorldState.inDungeons()) return

    cdTime = DungeonsState.getMageReduction(20000)
}, checkWorld, /^.+CASTING IN 3s(.+)?$/)

new Event(feature, "renderOverlay", () => {
    if(!lastCast) return
    
    const timePast = cdTime-(Date.now()-lastCast)
    const stringToRender = timePast <= 0 ? "&aAxe Cooldown: Ready!" : `&cAxe Cooldown: ${timePast/1000}`

    editGui.renderString(stringToRender)
}, checkWorld)

new Event(feature, "worldUnload", () => {
    lastCast = null
    cdTime = 20000
}, null)

// Starting events
feature.start()