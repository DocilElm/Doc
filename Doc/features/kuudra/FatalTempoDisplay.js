import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import ScalableGui from "../../shared/Scalable"
import { TextHelper } from "../../shared/Text"
import { WorldState } from "../../shared/World"

// Constant variables
const defaultString = `&cFatal Tempo&f: &63s &7(Hits: 0 0%)`
const editGui = new ScalableGui("fatalTempo", defaultString).setCommand("fatalTempoDisplay")
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
    Renderer.drawStringWithShadow(defaultString, 0, 0)
    Renderer.finishDraw()
})

// Logic
const registerWhen = () => WorldState.getCurrentWorld() === requiredWorld && config.ftDisplay
const getFtPercent = () => (hitsAmount * ftLvl) * 10

const soundHandler = () => {
    const heldItem = Player.getHeldItem()
    const skyblockID = TextHelper.getExtraAttribute(heldItem).id

    if (!heldItem || skyblockID !== "TERMINATOR" || !TextHelper.getExtraAttribute(heldItem)?.enchantments?.ultimate_fatal_tempo) return

    ftLvl = TextHelper.getExtraAttribute(heldItem)?.enchantments?.ultimate_fatal_tempo
    hitsAmount++
    lastHit = Date.now()
}

const makeStringToDraw = () => {
    if (!hitsAmount || !lastHit) return stringToDraw = null
    if (Date.now()-lastHit >= 3000) return hitsAmount = 0, ftLvl = 0, lastHit = null

    const ftTime = ((3000-(Date.now()-lastHit))/1000).toFixed(2)
    const ftPercent = getFtPercent() >= 200 ? 200 : getFtPercent()

    stringToDraw = `&cFatal Tempo&f: &6${ftTime}s &7(Hits: ${TextHelper.addCommasTrunc(hitsAmount)} ${ftPercent}%)`
}

const renderFatalTempo = () => {
    if (!stringToDraw || editGui.isOpen()) return

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