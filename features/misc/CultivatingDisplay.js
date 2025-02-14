import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"
import { TextHelper } from "../../shared/TextHelper"

const editGui = new DraggableGui("cultivatingDisplay").setCommandName("editcultivatingdisplay")
const cultivatingLevel = [0, 1000, 5000, 25000, 100000, 300000, 1500000, 5000000, 20000000, 100000000]
const cachedLevel = new Map()

let totalXp = null

const getLevel = (amount) => {
    if (!amount) return 0
    if (cachedLevel.has(amount)) return cachedLevel.get(amount)

    for (let idx = 0; idx < cultivatingLevel.length; idx++) {
        let min = cultivatingLevel[idx]
        if (idx + 1 >= cultivatingLevel.length) return idx + 1
        let max = cultivatingLevel[idx + 1]

        if (amount >= min && amount <= max) {
            cachedLevel.set(amount, idx + 1)
            return idx + 1
        }
    }
}

editGui.onDraw(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&bCultivating &610&f: &6100,000,000", 0, 0)
    Renderer.finishDraw()
})

const feat = new Feature("cultivatingDisplay")
    .addEvent(
        new Event(EventEnums.STEP, () => {
            const heldItem = Player.getHeldItem()
            const extraattributes = TextHelper.getExtraAttribute(Player.getHeldItem())

            if (!heldItem || !extraattributes || !extraattributes?.farmed_cultivating) {
                totalXp = null
                feat.update()

                return
            }

            totalXp = extraattributes.farmed_cultivating
            feat.update()
        }, 1)
    )
    .addSubEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen()) return

            const str = `&bCultivating &6${getLevel(totalXp)}&f: &6${TextHelper.addCommasTrunc(totalXp ?? 0)}`

            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())
            Renderer.drawStringWithShadow(str, 0, 0)
            Renderer.finishDraw()
        }),
        () => totalXp !== null
    )
    .onUnregister(() => {
        totalXp = null
    })