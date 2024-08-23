import config from "../../config"
import { Event } from "../../core/Event"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"

const editGui = new DraggableGui("armorDisplay").setCommandName("editarmorDisplay")
const slotColor = Renderer.color(100, 100, 100, 150)
const slotBorderColor = Renderer.color(50, 50, 50, 150)
const barrier = new Item("minecraft:barrier")

const drawSlotBackground = (/** @type {Item} */item, x, y, internal = false) => {
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

editGui.onDraw(() => {
    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())

    drawSlotBackground(null, 0, 0, true)
    drawSlotBackground(null, 0, 18, true)
    drawSlotBackground(null, 0, 18, true)
    drawSlotBackground(null, 0, 18, true)

    Renderer.retainTransforms(false)
    Renderer.finishDraw()
})

new Feature("armorDisplay")
    .addEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen()) return

            Renderer.retainTransforms(true)
            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())

            drawSlotBackground(Player.armor.getHelmet(), 0, 0)
            drawSlotBackground(Player.armor.getChestplate(), 0, 18)
            drawSlotBackground(Player.armor.getLeggings(), 0, 18)
            drawSlotBackground(Player.armor.getBoots(), 0, 18)

            Renderer.retainTransforms(false)
            Renderer.finishDraw()
        })
    )