import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"
import { TextHelper } from "../../shared/TextHelper"

const editGui = new DraggableGui("compactDisplay").setCommandName("editcompactdisplay")
const compactLevel = [0, 100, 500, 1500, 5000, 15000, 50000, 150000, 500000, 1000000]
const cachedLevel = new Map()

let totalXp = null

const getLevel = (amount) => {
    if (!amount) return 0
    if (cachedLevel.has(amount)) return cachedLevel.get(amount)

    for (let idx = 0; idx < compactLevel.length; idx++) {
        let min = compactLevel[idx]
        if (idx + 1 >= compactLevel.length) return idx + 1
        let max = compactLevel[idx + 1]

        if (amount >= min && amount <= max) {
            cachedLevel.set(amount, idx + 1)
            return idx + 1
        }
    }
}

editGui.onDraw(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&bCompact &610&f: &61,000,000", 0, 0)
    Renderer.finishDraw()
})

const feat = new Feature("compactDisplay")
    .addEvent(
        new Event(EventEnums.STEP, () => {
            const heldItem = Player.getHeldItem()
            const extraattributes = TextHelper.getExtraAttribute(Player.getHeldItem())

            if (!heldItem || !extraattributes || !extraattributes?.compact_blocks) {
                totalXp = null
                feat.update()

                return
            }

            totalXp = extraattributes.compact_blocks
            feat.update()
        }, 1)
    )
    .addSubEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen()) return

            const str = `&bCompact &6${getLevel(totalXp)}&f: &6${TextHelper.addCommasTrunc(totalXp ?? 0)}`

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