import Dungeons from "../../../Atomx/skyblock/Dungeons"
import { Event } from "../../core/Event"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"

const editGui = new DraggableGui("deathsDisplay").setCommandName("editdeathsDisplay")

editGui.onDraw(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&8&lDeaths&f: &43", 0, 0)
    Renderer.finishDraw()
})

new Feature("deathsDisplay", "catacombs")
    .addEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen()) return

            const amount = Dungeons.getTeamDeaths()

            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())
            Renderer.drawStringWithShadow(`&8&lDeaths&f: ${amount >= 3 ? "&4" : "&c"}${amount}`, 0, 0)
            Renderer.finishDraw()
        })
    )