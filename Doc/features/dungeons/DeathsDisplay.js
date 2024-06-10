import Dungeons from "../../../Atomx/skyblock/Dungeons"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import ScalableGui from "../../shared/Scalable"
import { WorldState } from "../../shared/World"

const defaultString = `&8&lDeaths&f: &43`
const editGui = new ScalableGui("deathsDisplay", defaultString).setCommand("changedeathsDisplay")
const feature = new Feature("DeathsDisplay", "Dungeons", "")

editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(defaultString, 0, 0)
    Renderer.finishDraw()
})

const renderDeaths = () => {
    const amount = Dungeons.getTeamDeaths()

    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(`&8&lDeaths&f: ${amount >= 3 ? "&4" : "&c"}${amount}`, 0, 0)
    Renderer.finishDraw()
}

// Events
new Event(feature, "renderOverlay", renderDeaths, () => World.isLoaded() && WorldState.inDungeons() && config().deathsDisplay && !editGui.isOpen())

// Starting events
feature.start()