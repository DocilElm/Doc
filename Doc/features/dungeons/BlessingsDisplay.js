import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import DungeonsState from "../../shared/Dungeons"
import ScalableGui from "../../shared/Scalable"
import { WorldState } from "../../shared/World"

// Constant variables
const feature = new Feature("blessingsDisplay", "Dungeons", "")
const defaultString = `&bBlessing of Power 1\n&bBlessing of Life 1\n&bBlessing of Time 1`
const editGui = new ScalableGui("blessingDisplay", defaultString).setCommand("blessingsDisplayLocation")

// Logic
const registerWhen = () => WorldState.inDungeons() && config().blessingsDisplay

const renderString = () => {
    if (!registerWhen() || editGui.isOpen()) return

    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(
        `&b${DungeonsState.getBlessings().join("\n&b")}`,
        0,
        0
        )
    Renderer.finishDraw()
}

// Default display
editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(
        defaultString,
        0,
        0
        )
    Renderer.finishDraw()
})

// Events
new Event(feature, "renderOverlay", renderString, registerWhen)

// Starting events
feature.start()