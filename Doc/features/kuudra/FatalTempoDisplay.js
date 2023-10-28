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

// Default display
editGui.onRender(() => editGui.renderString(`&cFatal Tempo&f: &63s &7(Hits: 0 0%)`))

// Logic
const registerWhen = () => WorldState.getCurrentWorld() === requiredWorld && config.ftDisplay

const getFtPercent = () => (hitsAmount * ftLvl) * 10
const soundHandler = () => {
    const heldItem = Player.getHeldItem()
    if(!heldItem || getSkyblockId(heldItem) !== "TERMINATOR" || !getExtraAttribute(heldItem, "ultimate_fatal_tempo")) return

    ftLvl = getExtraAttribute(heldItem, "ultimate_fatal_tempo")
    hitsAmount++
    lastHit = Date.now()
}

// Events
new Event(feature, "soundPlay", soundHandler, registerWhen, "random.successful_hit")
new Event(feature, "soundPlay", soundHandler, registerWhen, "tile.piston.out")

new Event(feature, "renderOverlay", () => {
    if(!hitsAmount || !lastHit) return
    if(Date.now()-lastHit >= 3000) return hitsAmount = 0, ftLvl = 0, lastHit = null

    const ftTime = ((3000-(Date.now()-lastHit))/1000).toFixed(2)
    const ftPercent = getFtPercent() >= 200 ? 200 : getFtPercent()

    editGui.renderString(`&cFatal Tempo&f: &6${ftTime}s &7(Hits: ${mathTrunc(hitsAmount)} ${ftPercent}%)`)
}, registerWhen)

new Event(feature, "worldUnload", () => {
    hitsAmount = 0
    ftLvl = 0
    lastHit = null
}, null)

// Starting events
feature.start()