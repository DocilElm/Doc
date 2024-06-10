import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import ScalableGui from "../../shared/Scalable"

// Constant variables
const feature = new Feature("ArmorDisplay", "Misc", "")
const editGui = new ScalableGui("armorDisplay").setCommand("editarmorDisplay")
const slotColor = Renderer.color(100, 100, 100, 150)
const slotBorderColor = Renderer.color(50, 50, 50, 150)
const barrier = new Item("minecraft:barrier")

// Logic
const drawSlotBg = (item, x, y, internal = false) => {
    if (!item && !config().armorDisplayBarrier && !internal) return

    if (config().armorDisplayBackground) {
        Renderer.drawRect(slotColor, x, y, 16, 16)

        // Top line
        Renderer.drawLine(slotBorderColor, x, y, x + 16, y, 1)

        // Left line
        Renderer.drawLine(slotBorderColor, x, y, x, y + 16, 1)
        
        // Right line
        Renderer.drawLine(slotBorderColor, x + 16, y, x + 16, y + 16, 1)
        
        // Bottom line
        Renderer.drawLine(slotBorderColor, x, y + 16, x + 16, y + 16, 1)
    }

    if (!item) return barrier.draw(x, y)

    item.draw(x, y)
}

editGui.onRender(() => {
    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    drawSlotBg(null, 0, 0, true)
    drawSlotBg(null, 0, 18, true)
    drawSlotBg(null, 0, 18, true)
    drawSlotBg(null, 0, 18, true)
    Renderer.retainTransforms(false)
    Renderer.finishDraw()

    editGui.setSize(
        16 * editGui.getScale(),
        (16 * editGui.getScale()) * 4
    )
})

const renderOverlay = () => {
    if (!config().armorDisplay || editGui.isOpen()) return

    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    drawSlotBg(Player.armor.getHelmet(), 0, 0)
    drawSlotBg(Player.armor.getChestplate(), 0, 18)
    drawSlotBg(Player.armor.getLeggings(), 0, 18)
    drawSlotBg(Player.armor.getBoots(), 0, 18)
    Renderer.retainTransforms(false)
    Renderer.finishDraw()
}

// Events
new Event(feature, "renderOverlay", renderOverlay, () => World.isLoaded() && config().armorDisplay)

// Starting events
feature.start()