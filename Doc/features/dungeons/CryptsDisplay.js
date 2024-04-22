import Dungeons from "../../../Atomx/skyblock/Dungeons"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import ScalableGui from "../../shared/Scalable"
import { WorldState } from "../../shared/World"

const defaultString = `&aCrypts&f: &65`
const editGui = new ScalableGui("cryptsDisplay", defaultString).setCommand("changecryptsdisplay")
const feature = new Feature("CryptsDisplay", "Dungeons", "")

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

// Events
new Event(feature, "renderOverlay", renderCrypts, () => World.isLoaded() && WorldState.inDungeons() && config.cryptsDisplay && !editGui.isOpen())

// Starting events
feature.start()