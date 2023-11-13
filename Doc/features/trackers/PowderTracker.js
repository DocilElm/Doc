import config from "../../config"
import { Command, Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import ScalableGui from "../../shared/Scalable"
import { TextHelper } from "../../shared/Text"
import { WorldState } from "../../shared/World"

// Constant variables
const editGui = new ScalableGui("powderTracker").setCommand("powderDisplayLocation")
const feature = new Feature("powderMiningTracker", "Trackers", "")
const BossStatus = net.minecraft.entity.boss.BossStatus
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

const isDoublePowderEvent = () => /^PASSIVE EVENT ([§\w\d]+)?2X POWDER RUNNING FOR [\d]+:([\d]+)$/.test(BossStatus?.field_82827_c?.removeFormatting()) && BossStatus?.field_82827_c?.removeFormatting()?.match(/^PASSIVE EVENT ([§\w\d]+)?2X POWDER RUNNING FOR [\d]+:([\d]+)$/)?.[2] >= 1

const makeStringToDraw = () => {
    if(!currentSession.chestAmount) return stringToDraw = null
    
    const gemstonePowder = currentSession.Gemstone
    const mithrilPowder = currentSession.Mithril
    const goldEssence = currentSession.Gold
    const diamondEssence = currentSession.Diamond
    const chestAmount = currentSession.chestAmount
    const sessionSeconds = Math.round((Date.now()-currentSession.time)/1000)

    stringToDraw = [
        `&dGemstone Powder&f: &6${TextHelper.addCommasTrunc(gemstonePowder)} &7(${TextHelper.getHourPerItems(gemstonePowder, sessionSeconds)}/hr)`,
        `&2Mithril Powder&f: &6${TextHelper.addCommasTrunc(mithrilPowder)} &7(${TextHelper.getHourPerItems(mithrilPowder, sessionSeconds)}/hr)`,
        `&eGold Essence&f: &6${TextHelper.addCommasTrunc(goldEssence)} &7(${TextHelper.getHourPerItems(goldEssence, sessionSeconds)}/hr)`,
        `&bDiamond Essence&f: &6${TextHelper.addCommasTrunc(diamondEssence)} &7(${TextHelper.getHourPerItems(diamondEssence, sessionSeconds)}/hr)`,
        `&bChest Amount&f: &6${TextHelper.addCommasTrunc(chestAmount)} &7(${TextHelper.getHourPerItems(chestAmount, sessionSeconds)}/hr)`,
        `&bSession Time&f: &6${TextHelper.getTime(currentSession.time)}`
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
    if (!stringToDraw || editGui.isOpen()) return
    
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