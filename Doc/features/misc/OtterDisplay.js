import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import ScalableGui from "../../shared/Scalable"

// Constant variables
const feature = new Feature("OtterDisplay", "Misc", "")
const editGui = new ScalableGui("otterDisplay").setCommand("editotterdisplay")
const defaultImage = Image.fromAsset("otter0.jpg")

// Changeable variables
let currentImage = null
let changedAt = null

// Defaults
editGui.onRender(() => {
    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    defaultImage.draw(0, 0)
    Renderer.retainTransforms(false)
    Renderer.finishDraw()
})

// Logic
const changeImage = () => {
    if (!config().otterDisplay) return
    if (changedAt && (Date.now() - changedAt) < 10000) return

    if (currentImage) currentImage.destroy()

    const random = Math.floor(Math.random() * 42)

    currentImage = Image.fromAsset(`otter${random}.jpg`)
    changedAt = Date.now()
}

const renderOverlay = () => {
    if (!currentImage || editGui.isOpen()) return

    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    currentImage.draw(0, 0)
    Renderer.retainTransforms(false)
    Renderer.finishDraw()
}

// Events
new Event(feature, "step", changeImage, () => World.isLoaded() && config().otterDisplay, 1)
new Event(feature, "renderOverlay", renderOverlay, () => World.isLoaded() && currentImage && config().otterDisplay)

// Starting events
feature.start()