import { Event } from "../../core/Event"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"
import TabListData from "../../../Atomx/skyblock/TabListData"

const defaultString = `&4&lPests Display\n&cAlive&f: &c&l${Player.getName()}\n&cInfested Plots&f: &c&lnull\n&eSpray&f: &bnull\n&aBonus&f: &6null`
const editGui = new DraggableGui("pestsDisplay").setCommandName("editpestsDisplay")

editGui.onDraw(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(defaultString, 0, 0)
    Renderer.finishDraw()
})

new Feature("pestsDisplay", "garden")
    .addEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen()) return

            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())
            Renderer.drawStringWithShadow(
                `&4&lPests Display\n&cAlive&f: &c&l${TabListData.getPestsAlive()}\n&cInfested Plots&f: &c&l${TabListData.getInfestedPlots()}\n&eSpray&f: &b${TabListData.getCurrentSpray()}\n&aBonus&f: &6${TabListData.getBonusFortune()}`,
                0,
                0
                )
            Renderer.finishDraw()
        })
    )