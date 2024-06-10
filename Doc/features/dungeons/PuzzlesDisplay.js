import Dungeons from "../../../Atomx/skyblock/Dungeons"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import ScalableGui from "../../shared/Scalable"
import { WorldState } from "../../shared/World"

const defaultString = `&dPuzzles&f: &65`
const editGui = new ScalableGui("puzzlesDisplay", defaultString).setCommand("changepuzzleDisplay")
const feature = new Feature("PuzzlesDisplay", "Dungeons", "")

editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(defaultString, 0, 0)
    Renderer.finishDraw()
})

const renderPuzzles = () => {
    const amount = Dungeons.getPuzzlesAmount()

    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(`&dPuzzles&f: ${amount >= 4 ? "&6" : "&a"}${amount}`, 0, 0)
    Renderer.finishDraw()
}

// Events
new Event(feature, "renderOverlay", renderPuzzles, () => World.isLoaded() && WorldState.inDungeons() && config().puzzlesDisplay && !editGui.isOpen())

// Starting events
feature.start()