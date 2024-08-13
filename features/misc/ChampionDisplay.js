import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"
import { TextHelper } from "../../shared/TextHelper"

const editGui = new DraggableGui("championDisplay").setCommandName("editchampionDisplay")
const championLevel = [0, 50000, 100000, 250000, 500000, 1000000, 1500000, 2000000, 2500000, 3000000]
const cachedLevel = new Map()

let itemAttributes = null

const getLevel = (amount) => {
    if (!amount) return 0
    if (cachedLevel.has(amount)) return cachedLevel.get(amount)

    for (let idx = 0; idx < championLevel.length; idx++) {
        let min = championLevel[idx]
        if (idx + 1 >= championLevel.length) return idx + 1
        let max = championLevel[idx + 1]

        if (amount >= min && amount <= max) {
            cachedLevel.set(amount, idx + 1)
            return idx + 1
        }
    }
}

editGui.onDraw(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&bChampion &610&f: &63,000,000", 0, 0)
    Renderer.finishDraw()
})

const feat = new Feature("championxpDisplay")
    .addEvent(
        new Event(EventEnums.STEP, () => {
            const heldItem = Player.getHeldItem()
            const extraattributes = TextHelper.getExtraAttribute(Player.getHeldItem())

            if (!heldItem || !extraattributes || !extraattributes?.champion_combat_xp) {
                itemAttributes = null
                feat.update()

                return
            }

            itemAttributes = extraattributes
            feat.update()
        }, 1)
    )
    .addSubEvent(
        new Event("renderOverlay", () => {
            const str = `&bChampion &6${getLevel(itemAttributes.champion_combat_xp)}&f: &6${TextHelper.addCommasTrunc(itemAttributes?.champion_combat_xp ?? 0)}`

            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())
            Renderer.drawStringWithShadow(str, 0, 0)
            Renderer.finishDraw()
        }),
        () => itemAttributes
    )