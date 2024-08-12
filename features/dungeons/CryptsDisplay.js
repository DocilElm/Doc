import Dungeons from "../../../Atomx/skyblock/Dungeons"
import { Event } from "../../core/Event"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"

const editGui = new DraggableGui("cryptsDisplay").setCommandName("editcryptsDisplay")

editGui.onDraw(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&aCrypts&f: &65", 0, 0)
    Renderer.finishDraw()
})

new Feature("cryptsDisplay", "catacombs")
    .addEvent(
        new Event("renderOverlay", () => {
            const crypts = Dungeons.getCryptsAmount()

            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())
            Renderer.drawStringWithShadow(`&aCrypts&f: ${crypts >= 5 ? "&6" : "&c"}${crypts}`, 0, 0)
            Renderer.finishDraw()
        })
    )