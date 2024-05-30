import { WorldState } from "../../../Atomx/skyblock/World"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import ScalableGui from "../../shared/Scalable"
import { TextHelper } from "../../shared/Text"

// Credits: https://github.com/nwjn/NwjnAddons despite me not taking any code from here
// but is what suggestors told me they wanted ("similar to nwjnaddons").

// Constant variables
const feature = new Feature("KuudraSplits", "Kuudra", "")
const defaultString = "&bSupplies&f: &c0s\n&bBuild&f: &c0s\n&bFuel/Stun&f: &c0s\n&bClear&f: &c0s"
const editGui = new ScalableGui("kuudrSplitsDisplay", defaultString).setCommand("editKuudraSplitsDisplay")
const msgSent = new Set()

// Changeable variables
let phasesMsg = [
    {
        criteria: "[NPC] Elle: Okay adventurers, I will go and fish up Kuudra!",
        time: null,
        displayText: `&bSupplies&f:`
    },
    {
        criteria: "[NPC] Elle: OMG! Great work collecting my supplies!",
        time: null,
        displayText: `&bBuild&f:`
    },
    {
        criteria: "[NPC] Elle: Phew! The Ballista is finally ready! It should be strong enough to tank Kuudra's blows now!",
        time: null,
        displayText: `&bFuel/Stun&f:`
    },
    {
        criteria: "[NPC] Elle: POW! SURELY THAT'S IT! I don't think he has any more in him!",
        time: null,
        displayText: `&bClear&f:`
    },
    {
        criteria: /^ *Tokens Earned\: [\d,.]+$/,
        time: null,
        displayText: null
    }
]
let messagesArray = phasesMsg.map(it => it.criteria)

// Default
editGui.onRender(() => {
    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(defaultString, 0, 0)
    Renderer.retainTransforms(false)
    Renderer.finishDraw()
})

// Logic
const renderOverlay = () => {
    if (!config.kuudraSplits || WorldState.getCurrentWorld() !== "Kuudra" || editGui.isOpen()) return

    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    phasesMsg.forEach((obj, idx) => {
        const nextObj = phasesMsg[idx + 1]
        if (!obj.displayText) return

        if (!obj.time) return Renderer.drawStringWithShadow(`${obj.displayText} &c0s`, 0, 0 + (idx === 0 ? 0 : 10 * idx))
        if (nextObj.time) {
            Renderer.drawStringWithShadow(`${obj.displayText} &a${TextHelper.getSecondsSince(nextObj.time, obj.time)}`, 0, 0 + (idx === 0 ? 0 : 10 * idx))
            if (!msgSent.has(idx)) {
                ChatLib.chat(`${TextHelper.PREFIX} ${obj.displayText} &a${TextHelper.getSecondsSince(nextObj.time, obj.time)}`)
                msgSent.add(idx)
            }

            return
        }

        Renderer.drawStringWithShadow(`${obj.displayText} &a${TextHelper.getSecondsSince(Date.now(), obj.time)}`, 0, 0 + (idx === 0 ? 0 : 10 * idx))
    })
    Renderer.retainTransforms(false)
    Renderer.finishDraw()
}

// Events
messagesArray.forEach((msg, idx) => {
    new Event(feature, "onChatPacket", () => {
        phasesMsg[idx].time = Date.now()
    }, () => WorldState.getCurrentWorld() === "Kuudra" && config.kuudraSplits, msg)
})
new Event(feature, "renderOverlay", renderOverlay, () => WorldState.getCurrentWorld() === "Kuudra" && config.kuudraSplits)
new Event(feature, "worldUnload", () => {
    // Reset to default values
    phasesMsg = [
        {
            criteria: "[NPC] Elle: Okay adventurers, I will go and fish up Kuudra!",
            time: null,
            displayText: `&bSupplies&f:`
        },
        {
            criteria: "[NPC] Elle: OMG! Great work collecting my supplies!",
            time: null,
            displayText: `&bBuild&f:`
        },
        {
            criteria: "[NPC] Elle: Phew! The Ballista is finally ready! It should be strong enough to tank Kuudra's blows now!",
            time: null,
            displayText: `&bFuel/Stun&f:`
        },
        {
            criteria: "[NPC] Elle: POW! SURELY THAT'S IT! I don't think he has any more in him!",
            time: null,
            displayText: `&bClear&f:`
        },
        {
            criteria: /^ *Tokens Earned\: [\d,.]+$/,
            time: null,
            displayText: null
        }
    ]
    msgSent.clear()
})

// Starting events
feature.start()