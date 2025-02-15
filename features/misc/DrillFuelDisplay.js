import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"
import { TextHelper } from "../../shared/TextHelper"

const editGui = new DraggableGui("drillFuelDisplay").setCommandName("editdrillfueldisplay")

let currentFuel = null

editGui.onDraw(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&bDrill Fuel&f: &a1,000", 0, 0)
    Renderer.finishDraw()
})

const feat = new Feature("drillFuelDisplay")
    .addEvent(
        new Event(EventEnums.STEP, () => {
            const heldItem = Player.getHeldItem()
            const extraattributes = TextHelper.getExtraAttribute(Player.getHeldItem())

            if (!heldItem || !extraattributes || !extraattributes?.drill_fuel) {
                currentFuel = null
                feat.update()

                return
            }

            currentFuel = extraattributes.drill_fuel
            feat.update()
        }, 1)
    )
    .addSubEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen()) return

            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())
            Renderer.drawStringWithShadow(`&bDrill Fuel&f: &a${TextHelper.addCommasTrunc(currentFuel)}`, 0, 0)
            Renderer.finishDraw()
        }),
        () => currentFuel
    )
    .onUnregister(() => {
        currentFuel = null
    })