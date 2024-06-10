import { WorldState } from "../../../Atomx/skyblock/World"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import ScalableGui from "../../shared/Scalable"

// Constant variables
const feature = new Feature("ComissionDisplay", "Mining", "")
const defaultString = `&bCliffside Veins Titanium&f: &c10%\n&bGoblin Raid Slayer&f: &aDONE`
const editGui = new ScalableGui("comissionsDisplay", defaultString).setCommand("editcomissionsDisplay")
const comissionsRegex = /^ ([\w ]+): (?:[\d,.]+%|DONE)$/
const mapList = new Set()

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
const onStep = () => {
    if (!config().comissionDisplay) return

    mapList.clear()

    TabList.getNames().forEach(name => {
        if (!comissionsRegex.test(name.removeFormatting())) return

        mapList.add(name)
    })
}

const renderOverlay = () => {
    if (!mapList.size || !(WorldState.getCurrentWorld() === "Dwarven Mines" || WorldState.getCurrentWorld() === "Crystal Hollows") || !config().comissionDisplay) return

    let y = 0
    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())

    mapList.forEach(format => {
        Renderer.drawStringWithShadow(`&b${format.replace("§r §r§f", "")}`, 0, 10 * y)
        y++
    })

    Renderer.retainTransforms(false)
    Renderer.finishDraw()
}

// Events
new Event(feature, "renderOverlay", renderOverlay, () => (WorldState.getCurrentWorld() === "Dwarven Mines" || WorldState.getCurrentWorld() === "Crystal Hollows") && mapList.size && config.comissionDisplay)
new Event(feature, "step", onStep, () => (WorldState.getCurrentWorld() === "Dwarven Mines" || WorldState.getCurrentWorld() === "Crystal Hollows") && config.comissionDisplay, 1)
new Event(feature, "worldUnload", () => mapList.clear())

// Starting events
feature.start()