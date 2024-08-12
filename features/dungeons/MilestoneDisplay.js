import Dungeons from "../../../Atomx/skyblock/Dungeons"
import { Event } from "../../core/Event"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"

const editGui = new DraggableGui("milestoneDisplay").setCommandName("editmilestoneDisplay")

editGui.onDraw(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&bMilestone&f: &69", 0, 0)
    Renderer.finishDraw()
})

new Feature("milestoneDisplay", "catacombs")
    .addEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen()) return

            const amount = Dungeons.getCurrentMilestoneNum()

            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())
            Renderer.drawStringWithShadow(`&bMilestone&f: ${amount >= 3 ? "&6" : "&c"}${amount}`, 0, 0)
            Renderer.finishDraw()
        })
    )