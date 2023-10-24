import ScalableGui from "../../classes/ScalableGui"
import { Command, Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { getPerHrItems, getTime, isDoublePowderEvent, mathTrunc } from "../../utils/Utils"
import { WorldManager } from "../../utils/World"

// Constant variables
const editGui = new ScalableGui("powderTracker").setCommand("powderDisplayLocation")
const feature = new Feature("powderMiningTracker", "Trackers", "")
const requiredWorld = "Crystal Hollows"

// Changeable variables
let currentSession = {
    "Gemstone": 0,
    "Mithril": 0,
    "chestAmount": 0,
    "time": null
}

// World check
const checkWorld = () => WorldManager.getCurrentWorld() === requiredWorld && World.isLoaded()

// Default display
editGui.onRender(() => editGui.renderString([
    `&dGemstone Powder&f: &61 &7(1/hr)`,
    `&2Mithril Powder&f: &61 &7(1/hr)`,
    `&bChest Amount&f: &61 &7(1/hr)`,
    `&bSession Time&f: &60:0:1`
].join("\n")))

// Events
new Event(feature, "onChatPacket", (amount, powderType) => {
    const powder = isDoublePowderEvent() ? parseFloat(amount.replace(/,/g, "")*2) : parseFloat(amount.replace(/,/g, ""))
    currentSession[powderType] += powder
}, checkWorld, /^You received \+([\d,]+) ([\w]+) Powder.$/)

new Event(feature, "onChatPacket", (amount, powderType) => {
    if(currentSession.chestAmount <= 0) currentSession.time = Date.now()
    
    currentSession.chestAmount++
}, checkWorld, /^You uncovered a treasure chest\!$/)

new Event(feature, "renderOverlay", () => {
    if(!currentSession.chestAmount) return
    
    const gemstonePowder = currentSession.Gemstone
    const mithrilPowder = currentSession.Mithril
    const chestAmount = currentSession.chestAmount
    const sessionSeconds = Math.round((Date.now()-currentSession.time)/1000)

    editGui.renderString([
        `&dGemstone Powder&f: &6${mathTrunc(gemstonePowder)} &7(${getPerHrItems(gemstonePowder, sessionSeconds)}/hr)`,
        `&2Mithril Powder&f: &6${mathTrunc(mithrilPowder)} &7(${getPerHrItems(mithrilPowder, sessionSeconds)}/hr)`,
        `&bChest Amount&f: &6${mathTrunc(chestAmount)} &7(${getPerHrItems(chestAmount, sessionSeconds)}/hr)`,
        `&bSession Time&f: &6${getTime(currentSession.time)}`
    ].join("\n"))
}, checkWorld)

new Command(feature, "rspowder", () => {
    currentSession = {
        "Gemstone": 0,
        "Mithril": 0,
        "chestAmount": 0,
        "time": null
    }
})

// Starting events
feature.start()