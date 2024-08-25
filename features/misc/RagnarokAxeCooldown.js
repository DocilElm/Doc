import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"

const editGui = new DraggableGui("ragaxecd").setCommandName("editragaxecd")
const ragaxeRegex = /^[\d,]+\/[\d,]+❤     [\d,]+❈ Defense     CASTING IN 3s/
const ragaxeCancelRegex = /^Ragnarock was cancelled due to taking damage!$/

let castcancel = null
let ticks = null

editGui.onDraw(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&aAxe Cooldown&f: &a0.00s", 0, 0)
    Renderer.finishDraw()
})

const feat = new Feature("ragnarokAxeTimer")
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.ACTIONBAR, () => {
            if (castcancel && Date.now() - castcancel < 5000) return
            // TODO: add the check for mage and change the timer to their ability cd
            ticks = 400
            feat.update()
        }, ragaxeRegex)
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, () => {
            ticks = null
            castcancel = Date.now()
            feat.update()
        }, ragaxeCancelRegex),
        () => ticks
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.CUSTOM.TICK, () => {
            if (ticks === 0) {
                ticks = null
                feat.update()

                return
            }

            ticks--
        }),
        () => ticks
    )
    .addSubEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen()) return

            const timeRemaining = (ticks * 0.05).toFixed(2)
            const format = ticks > 50 ? "&c" : "&a"

            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())
            Renderer.drawStringWithShadow(`&aAxe Cooldown&f: ${format}${timeRemaining}`, 0, 0)
            Renderer.finishDraw()
        }),
        () => ticks
    )
    .onUnregister(() => {
        ticks = null
        castcancel = null
    })