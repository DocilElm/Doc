import { WorldState } from "../../../Atomx/skyblock/World"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import ScalableGui from "../../shared/Scalable"

// Constant variables
const feature = new Feature("PowderDisplay", "Mining", "")
const defaultString = `&aMithril&f: &210,000\n&5Gemstone&f: &d10,000\n&3Glacite&f: &b10,000`
const editGui = new ScalableGui("powderDisplay").setCommand("editpowderDisplay")
const powderRegex = /^ (Mithril|Gemstone|Glacite): (?:[\d,.]+)$/
const powderColors = {
    "Mithril": "&a",
    "Gemstone": "&5",
    "Glacite": "&3"
}

// Changeable variables
let powderList = {}

// Defaults
editGui.onRender(() => {
    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(defaultString, 0, 0)
    Renderer.retainTransforms(false)
    Renderer.finishDraw()
})

// Logic
const onTabChange = (powderType, _, formatted) => {
    powderList[powderType] = formatted.replace("§r ", powderColors[powderType])
}

const renderOverlay = () => {
    if (!config.powderDisplay || WorldState.getCurrentWorld() !== "Dwarven Mines") return

    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(Object.values(powderList).join("\n"), 0, 0)
    Renderer.retainTransforms(false)
    Renderer.finishDraw()
}

// Events
new Event(feature, "onTabUpdatePacket", onTabChange, () => config.powderDisplay, powderRegex)
new Event(feature, "onTabAddPacket", onTabChange, () => config.powderDisplay, powderRegex)
new Event(feature, "renderOverlay", renderOverlay, () => config.powderDisplay && WorldState.getCurrentWorld() === "Dwarven Mines")
new Event(feature, "worldUnload", () => powderList = {})

// Starting events
feature.start()