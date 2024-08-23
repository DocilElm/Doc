import config from "../../config"
import { Event } from "../../core/Event"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"

const editGui = new DraggableGui("systemDisplay").setCommandName("editsystemDisplay")
const colorList = ["&4", "&c", "&6", "&e", "&2", "&a", "&b", "&3", "&1", "&9", "&d", "&5", "&f", "&7", "&8", "&0"]

editGui.onDraw(() => {
    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(`${colorList[config().systemTimeDisplayColor]}04:24:11 PM`, 0, 0)
    Renderer.retainTransforms(false)
    Renderer.finishDraw()
})

const getTime = () => {
    const time = new Date(Date.now())
    let seconds = time.getSeconds()
    let mins = time.getMinutes()
    let hours = time.getHours()
    hours = hours % 12 || 12

    seconds = seconds < 10 ? `0${seconds}` : seconds
    mins = mins < 10 ? `0${mins}` : mins
    hours = hours < 10 ? `0${hours}` : hours

    return `${hours}:${mins}:${seconds} ${time.getHours() >= 12 ? "PM" : "AM"}`
}

new Feature("systemTimeDisplay")
    .addEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen()) return

            Renderer.retainTransforms(true)
            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())
            Renderer.drawStringWithShadow(`${colorList[config().systemTimeDisplayColor]}${getTime()}`, 0, 0)
            Renderer.retainTransforms(false)
            Renderer.finishDraw()
        })
    )