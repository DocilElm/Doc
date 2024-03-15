import FeatureHandler from "../../../Atomx/events/FeatureHandler"
import Dungeons from "../../../Atomx/skyblock/Dungeons"
import config from "../../config"
import ScalableGui from "../../shared/Scalable"
import { WorldState } from "../../shared/World"

const defaultString = `&aCrypts&f: &65`
const editGui = new ScalableGui("cryptsDisplay", defaultString).setCommand("changecryptsdisplay")

editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(defaultString, 0, 0)
    Renderer.finishDraw()
})

const renderCrypts = () => {
    const amount = Dungeons.getCryptsAmount()

    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(`&aCrypts&f: ${amount >= 5 ? "&6" : "&c"}${amount}`, 0, 0)
    Renderer.finishDraw()
}

new FeatureHandler("CryptsDisplay")
    .AddEvent("renderOverlay", renderCrypts, {
        registerWhen() {
            return World.isLoaded() && WorldState.inDungeons() && config.cryptsDisplay && !editGui.isOpen()
        }
    })