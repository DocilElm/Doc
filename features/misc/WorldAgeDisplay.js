import { Event } from "../../core/Event"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"

const editGui = new DraggableGui("worldAgeDisplay").setCommandName("editworldAgeDisplay")

editGui.onDraw(() => {
    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&bDay&f: &61.05", 0, 0)
    Renderer.retainTransforms(false)
    Renderer.finishDraw()
})

new Feature("worldAgeDisplay")
    .addEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen()) return

            Renderer.retainTransforms(true)
            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())
            Renderer.drawStringWithShadow(`&bDay&f: &6${(World.getTime() / 24000).toFixed(2)}`, 0, 0)
            Renderer.retainTransforms(false)
            Renderer.finishDraw()
        })
    )