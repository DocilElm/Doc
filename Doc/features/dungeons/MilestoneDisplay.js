import FeatureHandler from "../../../Atomx/events/FeatureHandler"
import Dungeons from "../../../Atomx/skyblock/Dungeons"
import config from "../../config"
import ScalableGui from "../../shared/Scalable"
import { WorldState } from "../../shared/World"

const defaultString = `&bMilestone&f: &69`
const editGui = new ScalableGui("milestoneDisplay", defaultString).setCommand("changemilestoneDisplay")

editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(defaultString, 0, 0)
    Renderer.finishDraw()
})

const renderMilestone = () => {
    const amount = Dungeons.getCurrentMilestoneNum()

    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(`&bMilestone&f: ${amount >= 3 ? "&6" : "&c"}${amount}`, 0, 0)
    Renderer.finishDraw()
}

new FeatureHandler("MilestoneDisplay")
    .AddEvent("renderOverlay", renderMilestone, {
        registerWhen() {
            return World.isLoaded() && WorldState.inDungeons() && config.milestoneDisplay && !editGui.isOpen()
        }
    })