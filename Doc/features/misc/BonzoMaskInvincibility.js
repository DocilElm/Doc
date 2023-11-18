import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import ScalableGui from "../../shared/Scalable"

// Constant variables
const feature = new Feature("bonzoMaskInvincibilityTimer", "Misc", "")
const editGui = new ScalableGui("bonzoMaskInvincibilityTimer").setCommand("bonzoMaskInvisDisplay")

// Changeable variables
let bonzoProc = null

// Logic
const registerWhen = () => config.bonzoMaskInvincibilityTimer

const addMaskCd = () => bonzoProc = Date.now()

const renderString = () => {
    if (!registerWhen() || !bonzoProc || editGui.isOpen()) return
    if ((Date.now() - bonzoProc) >= 3000) return bonzoProc = null

    const timeRemaining = 3000 - (Date.now() - bonzoProc)

    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(
        `&9Bonzo's Mask&f: &a${timeRemaining/1000}s`,
        0,
        0
        )
    Renderer.finishDraw()
}

// Default display
editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&9Bonzo's Mask&f: &cOver!", 0, 0)
    Renderer.finishDraw()
})

// Events
new Event(feature, "onChatPacket", addMaskCd, registerWhen, /^Your( ⚚)? Bonzo\'s Mask saved your life\!$/)
new Event(feature, "renderOverlay", renderString, () => registerWhen() && bonzoProc)

// Starting events
feature.start()