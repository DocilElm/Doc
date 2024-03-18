import TabListData from "../../../Atomx/skyblock/TabListData"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import ScalableGui from "../../shared/Scalable"

// Constant feature
const feature = new Feature("statsDisplay", "Misc", "")
const defaultString = `&r&r&r Strength: &r&c❁1000&r\n&r Crit Damage: &r&9☠1000&r\n&r &eAttack Speed: &r&e⚔100&r&r&7`
const editGui = new ScalableGui("statsDisplay", defaultString).setCommand("statsDisplayLocation")

// Changeable variables
let stringToDraw = null

// Logic
const registerWhen = () => config.statsDisplay

const makeStringToDraw = () => {
    const stats = TabListData.getStats()

    let tempArray = []

    Object.keys(stats).forEach(value => {
        tempArray.push(stats[value].formattedText)
    })

    stringToDraw = tempArray.join("\n")
    tempArray = null

}

const renderString = () => {
    if (!registerWhen() || !stringToDraw || editGui.isOpen()) return

    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(
        stringToDraw,
        0,
        0
        )
    Renderer.finishDraw()
}

// Defualt display
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
new Event(feature, "tick", makeStringToDraw, registerWhen)
new Event(feature, "renderOverlay", renderString, registerWhen)

// Starting events
feature.start()