import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"

const editGui = new DraggableGui("comissionsDisplay").setCommandName("editcomissionsDisplay")
const comissionsRegex = /^ ([\w' ]+): (?:[\d,.]+%|DONE)$/
const mapList = new Set()

editGui.onDraw(() => {
    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&bCliffside Veins Titanium&f: &c10%\n&bGoblin Raid Slayer&f: &aDONE", 0, 0)
    Renderer.retainTransforms(false)
    Renderer.finishDraw()
})

const feat = new Feature("comissionDisplay", ["Dwarven Mines", "Crystal Hollows"])
    .addEvent(
        new Event(EventEnums.STEP, () => {
            mapList.clear()

            TabList.getNames().forEach(name => {
                if (!comissionsRegex.test(name.removeFormatting())) return

                mapList.add(name)
            })

            feat.update()
        }, 1)
    )
    .addSubEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen()) return

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
        }),
        () => mapList.size
    )