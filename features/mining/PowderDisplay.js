import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"

const editGui = new DraggableGui("powderDisplay").setCommandName("editpowderDisplay")
const powderRegex = /^ (Mithril|Gemstone|Glacite): (?:[\d,.]+)$/
const powderColors = {
    "Mithril": "&a",
    "Gemstone": "&5",
    "Glacite": "&3"
}

let powderList = {}

editGui.onDraw(() => {
    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&aMithril&f: &210,000\n&5Gemstone&f: &d10,000\n&3Glacite&f: &b10,000", 0, 0)
    Renderer.retainTransforms(false)
    Renderer.finishDraw()
})

const feat = new Feature("powderDisplay", ["Dwarven Mines", "Crystal Hollows"])
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.TABADD, (type, _, formatted) => {
            powderList[type] = formatted.replace("§r ", powderColors[type])
            feat.update()
        }, powderRegex)
    )
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.TABUPDATE, (type, _, formatted) => {
            powderList[type] = formatted.replace("§r ", powderColors[type])
            feat.update()
        }, powderRegex)
    )
    .addSubEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen()) return

            Renderer.retainTransforms(true)
            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())
            Renderer.drawStringWithShadow(Object.values(powderList).join("\n"), 0, 0)
            Renderer.retainTransforms(false)
            Renderer.finishDraw()
        }),
        () => powderList.Mithril
    )
    .onUnregister(() => powderList = {})