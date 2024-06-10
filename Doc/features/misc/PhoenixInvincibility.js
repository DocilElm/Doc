import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import ScalableGui from "../../shared/Scalable"

// if i ever need it here's the sound and pitch of phoenix proc
// random.fizz, 1.4920635223388672

// Constant variables
const feature = new Feature("phoenixInvincibilityTimer", "Misc", "")
const defaultString = "&cPhoenix Pet&f: &cOver!"
const editGui = new ScalableGui("phoenixInvincibilityTimer", defaultString).setCommand("phoenixInvisDisplay")

// Changeable variables
let phoenixProc = null

// Logic
const registerWhen = () => config().phoenixInvincibilityTimer

const addCD = () => phoenixProc = Date.now()

const renderString = () => {
    if (!registerWhen() || !phoenixProc || editGui.isOpen()) return
    if ((Date.now() - phoenixProc) >= (config().phoenixPetTime === 1 ? 3000 : 4000)) return phoenixProc = null

    const timeRemaining = (config().phoenixPetTime === 1 ? 3000 : 4000) - (Date.now() - phoenixProc)

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
    Renderer.drawStringWithShadow(defaultString, 0, 0)
    Renderer.finishDraw()
})

// Events
new Event(feature, "chat", addCD, registerWhen, /^Your Phoenix Pet saved you from certain death\!$/)
new Event(feature, "renderOverlay", renderString, () => registerWhen() && phoenixProc)

// Starting events
feature.start()