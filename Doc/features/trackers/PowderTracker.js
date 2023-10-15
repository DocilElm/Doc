import { addEvent } from "../../FeatureBase"
import { onChatPacket } from "../../classes/Events"
import ScalableGui from "../../classes/ScalableGui"
import { getPerHrItems, getTime, isDoublePowderEvent, mathTrunc } from "../../utils/Utils"

const editGui = new ScalableGui("powderTracker").setCommand("powderDisplayLocation")

let currentSession = {
    "Gemstone": 0,
    "Mithril": 0,
    "chestAmount": 0,
    "time": null
}
// fix: issue with x2 powder function staying true whenever it's over
addEvent("powderMiningTracker", "Tracker", onChatPacket((amount, powderType) => {
    const powder = isDoublePowderEvent() ? parseFloat(amount.replace(/,/g, "")*2) : parseFloat(amount.replace(/,/g, ""))
    currentSession[powderType] += powder
}).setCriteria(/^You received \+([\d,]+) ([\w]+) Powder.$/), null, [
    onChatPacket(() => {
        if(currentSession.chestAmount <= 0) currentSession.time = Date.now()
    
        currentSession.chestAmount++
    }).setCriteria(/^You uncovered a treasure chest\!$/),
    
    register("renderOverlay", () => {
        if(!World.isLoaded() || !currentSession.chestAmount) return
    
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
    })
], "Crystal Hollows")

editGui.onRender(() => editGui.renderString([
    `&dGemstone Powder&f: &61 &7(1/hr)`,
    `&2Mithril Powder&f: &61 &7(1/hr)`,
    `&bChest Amount&f: &61 &7(1/hr)`,
    `&bSession Time&f: &60:0:1`
].join("\n")))

register("command", () => currentSession = {
    "Gemstone": 0,
    "Mithril": 0,
    "chestAmount": 0,
    "time": null
}).setName("rspowder")