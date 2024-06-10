import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import ScalableGui from "../../shared/Scalable"

// Constant variables
const feature = new Feature("WorldAgeDisplay", "Misc", "")
const editGui = new ScalableGui("worldAgeDisplay", "&bDay&f: &61.05").setCommand("editworldAgeDisplay")

// Default render
editGui.onRender(() => {
    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&bDay&f: &61.05", 0, 0)
    Renderer.retainTransforms(false)
    Renderer.finishDraw()
})

// Logic
const renderOverlay = () => {
    if (!config().worldAgeDisplay || editGui.isOpen()) return
    
    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(`&bDay&f: &6${(World.getTime() / 24000).toFixed(2)}`, 0, 0)
    Renderer.retainTransforms(false)
    Renderer.finishDraw()
}

// Events
new Event(feature, "renderOverlay", renderOverlay, () => World.isLoaded() && config().worldAgeDisplay)

// Starting events
feature.start()