import { addEvent } from "../../FeatureBase"
import ScalableGui from "../../classes/ScalableGui"
import { getExtraAttribute, getSkyblockId, mathTrunc } from "../../utils/Utils"

const editGui = new ScalableGui("fatalTempo").setCommand("fatalTempoDisplay")

let hitsAmount = 0
let lastHit = null
let ftLvl = 0

const getFtPercent = () => (hitsAmount * ftLvl) * 10

addEvent("ftDisplay", "Kuudra", register("soundPlay", (pos, name, vol, pitch, category, event) => {
    const heldItem = Player.getHeldItem()
    if(!heldItem || getSkyblockId(heldItem) !== "TERMINATOR" || !getExtraAttribute(heldItem, "ultimate_fatal_tempo")) return

    ftLvl = getExtraAttribute(heldItem, "ultimate_fatal_tempo")
    hitsAmount++
    lastHit = Date.now()
}).setCriteria("random.successful_hit"), null, [
    register("renderOverlay", () => {
        if(!World.isLoaded() || !hitsAmount || !lastHit) return
        if(Date.now()-lastHit >= 3000) return hitsAmount = 0, ftLvl = 0, lastHit = null
    
        const ftTime = ((3000-(Date.now()-lastHit))/1000).toFixed(2)
        const ftPercent = getFtPercent() >= 200 ? 200 : getFtPercent()
    
        editGui.renderString(`&cFatal Tempo&f: &6${ftTime}s &7(Hits: ${mathTrunc(hitsAmount)} ${ftPercent}%)`)
    }),

    register("soundPlay", (pos, name, vol, pitch, category, event) => {
        const heldItem = Player.getHeldItem()
        if(!heldItem || getSkyblockId(heldItem) !== "TERMINATOR" || !getExtraAttribute(heldItem, "ultimate_fatal_tempo")) return

        ftLvl = getExtraAttribute(heldItem, "ultimate_fatal_tempo")
        hitsAmount++
        lastHit = Date.now()
    }).setCriteria("tile.piston.out")
], "Kuudra")

editGui.onRender(() => {
    editGui.renderString(`&cFatal Tempo&f: &63s &7(Hits: 0 0%)`)
})

register("worldUnload", () => {
    hitsAmount = 0
    ftLvl = 0
    lastHit = null
})