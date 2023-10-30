import ScalableGui from "../../classes/ScalableGui"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { WorldState } from "../../shared/World"
import { getExtraAttribute, getSkyblockId, mathTrunc } from "../../utils/Utils"

// Constant variables
const editGui = new ScalableGui("fatalTempo").setCommand("fatalTempoDisplay")
const feature = new Feature("ftDisplay", "Kuudra", "")
const requiredWorld = "Kuudra"

// Changeable variables
let hitsAmount = 0
let lastHit = null
let ftLvl = 0
let stringToDraw = null

// Default display
editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(`&cFatal Tempo&f: &63s &7(Hits: 0 0%)`, 0, 0)
    Renderer.finishDraw()
})

// Logic
const registerWhen = () => WorldState.getCurrentWorld() === requiredWorld && config.ftDisplay
const getFtPercent = () => (hitsAmount * ftLvl) * 10

const soundHandler = () => {
    const heldItem = Player.getHeldItem()
    if (!heldItem || getSkyblockId(heldItem) !== "TERMINATOR" || !getExtraAttribute(heldItem, "ultimate_fatal_tempo")) return

    ftLvl = getExtraAttribute(heldItem, "ultimate_fatal_tempo")
    hitsAmount++
    lastHit = Date.now()
}

const makeStringToDraw = () => {
    if (!hitsAmount || !lastHit) return stringToDraw = null
    if (Date.now()-lastHit >= 3000) return hitsAmount = 0, ftLvl = 0, lastHit = null

    const ftTime = ((3000-(Date.now()-lastHit))/1000).toFixed(2)
    const ftPercent = getFtPercent() >= 200 ? 200 : getFtPercent()

    stringToDraw = `&cFatal Tempo&f: &6${ftTime}s &7(Hits: ${mathTrunc(hitsAmount)} ${ftPercent}%)`
}

const renderFatalTempo = () => {
    if (!stringToDraw) return

    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(stringToDraw, 0, 0)
    Renderer.finishDraw()
}

// Events
new Event(feature, "soundPlay", soundHandler, registerWhen, "random.successful_hit")
new Event(feature, "soundPlay", soundHandler, registerWhen, "tile.piston.out")
new Event(feature, "tick", makeStringToDraw, registerWhen)
new Event(feature, "renderOverlay", renderFatalTempo, () => WorldState.getCurrentWorld() === requiredWorld && config.ftDisplay && stringToDraw)

new Event(feature, "worldUnload", () => {
    hitsAmount = 0
    ftLvl = 0
    lastHit = null
})

// Starting events
feature.start()