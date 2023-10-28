import ScalableGui from "../../classes/ScalableGui"
import config from "../../config"
import { Command, Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { WorldState } from "../../shared/World"
import { getPerHrItems, getTime, isDoublePowderEvent, mathTrunc } from "../../utils/Utils"

// Constant variables
const editGui = new ScalableGui("powderTracker").setCommand("powderDisplayLocation")
const feature = new Feature("powderMiningTracker", "Trackers", "")
const requiredWorld = "Crystal Hollows"

// Changeable variables
let currentSession = {
    "Gemstone": 0,
    "Mithril": 0,
    "Gold": 0,
    "Diamond": 0,
    "chestAmount": 0,
    "time": null
}

// Default display
editGui.onRender(() => editGui.renderString([
    `&dGemstone Powder&f: &61 &7(1/hr)`,
    `&2Mithril Powder&f: &61 &7(1/hr)`,
    `&bChest Amount&f: &61 &7(1/hr)`,
    `&bSession Time&f: &60:0:1`
].join("\n")))

// Logic
const registerWhen = () => WorldState.getCurrentWorld() === requiredWorld && config.powderMiningTracker

// Events
new Event(feature, "onChatPacket", (amount, powderType) => {
    const powder = isDoublePowderEvent() ? parseFloat(amount.replace(/,/g, "")*2) : parseFloat(amount.replace(/,/g, ""))
    currentSession[powderType] += powder
}, registerWhen, /^You received \+([\d,]+) ([\w]+) Powder.$/)

new Event(feature, "onChatPacket", (amount, essenceType) => {
    currentSession[essenceType] += parseFloat(amount)
}, registerWhen, /^You received \+([\d,]+) ([\w]+) Essence$/)

new Event(feature, "onChatPacket", (amount, powderType) => {
    if(currentSession.chestAmount <= 0) currentSession.time = Date.now()
    
    currentSession.chestAmount++
}, registerWhen, /^You uncovered a treasure chest\!$/)

new Event(feature, "renderOverlay", () => {
    if(!currentSession.chestAmount) return
    
    const gemstonePowder = currentSession.Gemstone
    const mithrilPowder = currentSession.Mithril
    const goldEssence = currentSession.Gold
    const diamondEssence = currentSession.Diamond
    const chestAmount = currentSession.chestAmount
    const sessionSeconds = Math.round((Date.now()-currentSession.time)/1000)

    editGui.renderString([
        `&dGemstone Powder&f: &6${mathTrunc(gemstonePowder)} &7(${getPerHrItems(gemstonePowder, sessionSeconds)}/hr)`,
        `&2Mithril Powder&f: &6${mathTrunc(mithrilPowder)} &7(${getPerHrItems(mithrilPowder, sessionSeconds)}/hr)`,
        `&eGold Essence&f: &6${mathTrunc(goldEssence)} &7(${getPerHrItems(goldEssence, sessionSeconds)}/hr)`,
        `&bDiamond Essence&f: &6${mathTrunc(diamondEssence)} &7(${getPerHrItems(diamondEssence, sessionSeconds)}/hr)`,
        `&bChest Amount&f: &6${mathTrunc(chestAmount)} &7(${getPerHrItems(chestAmount, sessionSeconds)}/hr)`,
        `&bSession Time&f: &6${getTime(currentSession.time)}`
    ].join("\n"))
}, registerWhen)

new Command(feature, "rspowder", () => {
    currentSession = {
        "Gemstone": 0,
        "Mithril": 0,
        "Gold": 0,
        "Diamond": 0,
        "chestAmount": 0,
        "time": null
    }
})

// Starting events
feature.start()