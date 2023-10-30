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

// Regex
const powderRecievedRegex =  /^You received \+([\d,]+) ([\w]+) Powder.$/
const essenceRecievedRegex = /^You received \+([\d,]+) ([\w]+) Essence$/
const uncoveredChestRegex =  /^You uncovered a treasure chest\!$/

// Changeable variables
let currentSession = {
    "Gemstone": 0,
    "Mithril": 0,
    "Gold": 0,
    "Diamond": 0,
    "chestAmount": 0,
    "time": null
}
let stringToDraw = null

// Default display
editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow([
        `&dGemstone Powder&f: &61 &7(1/hr)`,
        `&2Mithril Powder&f: &61 &7(1/hr)`,
        `&bChest Amount&f: &61 &7(1/hr)`,
        `&bSession Time&f: &60:0:1`
    ].join("\n"), 0, 0)
    Renderer.finishDraw()

})

// Logic
const registerWhen = () => WorldState.getCurrentWorld() === requiredWorld && config.powderMiningTracker

const makeStringToDraw = () => {
    if(!currentSession.chestAmount) return stringToDraw = null
    
    const gemstonePowder = currentSession.Gemstone
    const mithrilPowder = currentSession.Mithril
    const goldEssence = currentSession.Gold
    const diamondEssence = currentSession.Diamond
    const chestAmount = currentSession.chestAmount
    const sessionSeconds = Math.round((Date.now()-currentSession.time)/1000)

    stringToDraw = [
        `&dGemstone Powder&f: &6${mathTrunc(gemstonePowder)} &7(${getPerHrItems(gemstonePowder, sessionSeconds)}/hr)`,
        `&2Mithril Powder&f: &6${mathTrunc(mithrilPowder)} &7(${getPerHrItems(mithrilPowder, sessionSeconds)}/hr)`,
        `&eGold Essence&f: &6${mathTrunc(goldEssence)} &7(${getPerHrItems(goldEssence, sessionSeconds)}/hr)`,
        `&bDiamond Essence&f: &6${mathTrunc(diamondEssence)} &7(${getPerHrItems(diamondEssence, sessionSeconds)}/hr)`,
        `&bChest Amount&f: &6${mathTrunc(chestAmount)} &7(${getPerHrItems(chestAmount, sessionSeconds)}/hr)`,
        `&bSession Time&f: &6${getTime(currentSession.time)}`
    ].join("\n")
}

const addPowder = (amount, powderType) => {
    const powder = isDoublePowderEvent() ? parseFloat(amount.replace(/,/g, "")*2) : parseFloat(amount.replace(/,/g, ""))
    currentSession[powderType] += powder
}

const addEssence = (amount, essenceType) => {
    currentSession[essenceType] += parseFloat(amount)
}

const addChest = (_, __) => {
    if(currentSession.chestAmount <= 0) currentSession.time = Date.now()
    
    currentSession.chestAmount++
}

const renderPowder = () => {
    if (!stringToDraw) return
    
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(stringToDraw, 0, 0)
    Renderer.finishDraw()
}

// Events
new Event(feature, "onChatPacket", addPowder, registerWhen, powderRecievedRegex)
new Event(feature, "onChatPacket", addEssence, registerWhen, essenceRecievedRegex)
new Event(feature, "onChatPacket", addChest, registerWhen, uncoveredChestRegex)
new Event(feature, "tick", makeStringToDraw, registerWhen)
new Event(feature, "renderOverlay", renderPowder, () => WorldState.getCurrentWorld() === requiredWorld && config.powderMiningTracker && stringToDraw)

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