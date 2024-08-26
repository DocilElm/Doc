import { Event } from "../../core/Event"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"
import TabListData from "../../../Atomx/skyblock/TabListData"

const defaultString = `&a&lGarden Display\n&aVisitor in&f: &b1m 10s\n&aJacob's contest in&f: &69m\n&eOrganic matter&f: &6100k\n&9Fuel&f: &6100k\n&aTime Left&f: &b1m 10s\n&aStored Compost&f: &6100`
const editGui = new DraggableGui("gardenDisplay").setCommandName("editgardenDisplay")

editGui.onDraw(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(defaultString, 0, 0)
    Renderer.finishDraw()
})

new Feature("gardenDisplay", "garden")
    .addEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen()) return

            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())
            Renderer.drawStringWithShadow(
                `&a&lGarden Display\n&aVisitor in&f: &b${TabListData.getNextVisitor()} &f(&b${TabListData.getTotalVisitors()}&f)\n&aJacob's contest in&f: &6${TabListData.getJacobContest()}\n&eOrganic matter&f: &6${TabListData.getOrganicMatter()}\n&9Fuel&f: &6${TabListData.getFuel()}\n&aTime Left&f: &b${TabListData.getTimeLeft()}\n&aStored Compost&f: &6${TabListData.getStoredCompost()}`,
                0,
                0
                )
            Renderer.finishDraw()
        })
    )