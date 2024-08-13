import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"

const editGui = new DraggableGui("bonzoMaskInvincibilityTimer").setCommandName("editbonzoMaskInvincibilityTimer")
const procRegex = /^Your( ⚚)? Bonzo\'s Mask saved your life\!$/

let proc = null

editGui.onDraw(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&9Bonzo's Mask&f: &a0.00s", 0, 0)
    Renderer.finishDraw()
})

const feat = new Feature("bonzoMaskInvincibilityTimer")
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, () => {
            proc = 60

            feat.update()
        }, procRegex)
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.CUSTOM.TICK, () => {
            if (proc === 0) {
                proc = null
                feat.update()

                return
            }

            proc--
        }),
        () => proc
    )
    .addSubEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen()) return

            const timeRemaining = (proc * 0.05).toFixed(2)

            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())
            Renderer.drawStringWithShadow(`&9Bonzo's Mask&f: &a${timeRemaining}s`, 0, 0)
            Renderer.finishDraw()
        }),
        () => proc
    )
    .onUnregister(() => proc = null)