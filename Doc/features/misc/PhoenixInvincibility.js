import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import ScalableGui from "../../shared/Scalable"

// Constant variables
const feature = new Feature("phoenixInvincibilityTimer", "Misc", "")
const editGui = new ScalableGui("phoenixInvincibilityTimer").setCommand("phoenixInvisDisplay")

// Changeable variables
let phoenixProc = null

// Logic
const registerWhen = () => config.phoenixInvincibilityTimer

const addMaskCd = () => phoenixProc = Date.now()

const renderString = () => {
    if (!registerWhen() || !phoenixProc || editGui.isOpen()) return
    if ((Date.now() - phoenixProc) >= 4000) return phoenixProc = null

    const timeRemaining = 4000 - (Date.now() - phoenixProc)

    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(
        `&cPhoenix Pet&f: &a${timeRemaining/1000}s`,
        0,
        0
        )
    Renderer.finishDraw()
}

// Default display
editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&cPhoenix Pet&f: &cOver!", 0, 0)
    Renderer.finishDraw()
})

// Events
new Event(feature, "onChatPacket", addMaskCd, registerWhen, /^Your Phoenix Pet saved you from certain death\!$/)
new Event(feature, "renderOverlay", renderString, () => registerWhen() && phoenixProc)

// Starting events
feature.start()