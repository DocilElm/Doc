import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"
import { TextHelper } from "../../shared/TextHelper"

const editGui = new DraggableGui("kuudrSplitsDisplay").setCommandName("editkuudrSplitsDisplay")

let phasesMsg = [
    {
        criteria: "[NPC] Elle: Okay adventurers, I will go and fish up Kuudra!",
        time: null,
        displayText: `&bSupplies&f:`,
        sent: false
    },
    {
        criteria: "[NPC] Elle: OMG! Great work collecting my supplies!",
        time: null,
        displayText: `&bBuild&f:`,
        sent: false
    },
    {
        criteria: "[NPC] Elle: Phew! The Ballista is finally ready! It should be strong enough to tank Kuudra's blows now!",
        time: null,
        displayText: `&bFuel/Stun&f:`,
        sent: false
    },
    {
        criteria: "[NPC] Elle: POW! SURELY THAT'S IT! I don't think he has any more in him!",
        time: null,
        displayText: `&bClear&f:`,
        sent: false
    },
    {
        criteria: /^ *Tokens Earned\: [\d,.]+$/,
        time: null,
        displayText: null,
        sent: false
    }
]

editGui.onDraw(() => {
    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&bSupplies&f: &c0s\n&bBuild&f: &c0s\n&bFuel/Stun&f: &c0s\n&bClear&f: &c0s", 0, 0)
    Renderer.retainTransforms(false)
    Renderer.finishDraw()
})

const feat = new Feature("kuudraSplits", "kuudra")
    .addEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen()) return

            Renderer.retainTransforms(true)
            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())

            for (let idx = 0; idx < phasesMsg.length; idx++) {
                let v = phasesMsg[idx]
                let v2 = phasesMsg[idx + 1]
                if (!v.displayText) continue
                let y = 0 + (10 * idx)

                if (!v.time) {
                    Renderer.drawStringWithShadow(`${v.displayText} &c0s`, 0, y)
                    continue
                }

                if (v2?.time) {
                    Renderer.drawStringWithShadow(`${v.displayText} &a${TextHelper.getSecondsSince(v2.time, v.time)}`, 0, y)
                    if (!v.sent) {
                        ChatLib.chat(`${TextHelper.PREFIX} ${v.displayText} &a${TextHelper.getSecondsSince(v2.time, v.time)}`)
                        v.sent = true
                    }
                    continue
                }

                Renderer.drawStringWithShadow(`${v.displayText} &a${TextHelper.getSecondsSince(Date.now(), v.time)}`, 0, y)
            }

            Renderer.retainTransforms(false)
            Renderer.finishDraw()
        })
    )
    .onUnregister(() => {
        phasesMsg.forEach(it => {
            it.time = null
            it.sent = false
        })
    })

phasesMsg.forEach(it => feat.addEvent(
    new Event(EventEnums.PACKET.SERVER.CHAT, () => {
        if (it.time) return
        it.time = Date.now()
    }, it.criteria)
))