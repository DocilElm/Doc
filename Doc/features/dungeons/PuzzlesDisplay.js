import FeatureHandler from "../../../Atomx/events/FeatureHandler"
import Dungeons from "../../../Atomx/skyblock/Dungeons"
import config from "../../config"
import ScalableGui from "../../shared/Scalable"
import { WorldState } from "../../shared/World"

const defaultString = `&dPuzzles&f: &65`
const editGui = new ScalableGui("puzzlesDisplay", defaultString).setCommand("changepuzzleDisplay")

editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(defaultString, 0, 0)
    Renderer.finishDraw()
})

const renderMilestone = () => {
    const amount = Dungeons.getPuzzlesAmount()

    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(`&dPuzzles&f: ${amount >= 4 ? "&6" : "&a"}${amount}`, 0, 0)
    Renderer.finishDraw()
}

new FeatureHandler("PuzzleDisplay")
    .AddEvent("renderOverlay", renderMilestone, {
        registerWhen() {
            return World.isLoaded() && WorldState.inDungeons() && config.puzzlesDisplay && !editGui.isOpen()
        }
    })