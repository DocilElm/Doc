import Dungeons from "../../../Atomx/skyblock/Dungeons"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import ScalableGui from "../../shared/Scalable"
import { WorldState } from "../../shared/World"

const defaultString = `&bMilestone&f: &69`
const editGui = new ScalableGui("milestoneDisplay", defaultString).setCommand("changemilestoneDisplay")
const feature = new Feature("MilestoneDisplay", "Dungeons", "")

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

// Events
new Event(feature, "renderOverlay", renderMilestone, () => World.isLoaded() && WorldState.inDungeons() && config.milestoneDisplay && !editGui.isOpen())

// Starting events
feature.start()