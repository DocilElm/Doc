import FeatureHandler from "../../../Atomx/events/FeatureHandler"
import Dungeons from "../../../Atomx/skyblock/Dungeons"
import config from "../../config"
import ScalableGui from "../../shared/Scalable"
import { WorldState } from "../../shared/World"

const defaultString = `&8&lDeaths&f: &43`
const editGui = new ScalableGui("deathsDisplay", defaultString).setCommand("changedeathsDisplay")

editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(defaultString, 0, 0)
    Renderer.finishDraw()
})

const renderMilestone = () => {
    const amount = Dungeons.getTeamDeaths()

    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(`&8&lDeaths&f: ${amount >= 3 ? "&4" : "&c"}${amount}`, 0, 0)
    Renderer.finishDraw()
}

new FeatureHandler("DeathsDisplay")
    .AddEvent("renderOverlay", renderMilestone, {
        registerWhen() {
            return World.isLoaded() && WorldState.inDungeons() && config.deathsDisplay && !editGui.isOpen()
        }
    })