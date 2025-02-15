import { Event } from "../../core/Event"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"

const editGui = new DraggableGui("inventoryhudDisplay").setCommandName("editinventoryhuddisplay")
const slotColor = Renderer.color(100, 100, 100, 150)
const slotBorderColor = Renderer.color(50, 50, 50, 150)
/** @type {Item[]} */
const defaultInventory = []
const defaultArmor = [
    new Item("minecraft:skull"),
    new Item("minecraft:leather_chestplate"),
    new Item("minecraft:leather_leggings"),
    new Item("minecraft:leather_boots")
]
// Build default inventory
new Array(36).fill(new Item("minecraft:barrier")).forEach((it, idx) => {
    if (idx > 35) return

    if (idx < 9) {
        defaultInventory[idx + 28] = it
        return
    }

    defaultInventory[idx - 8] = it
})
// Set last stack size to show how it looks
defaultInventory[defaultInventory.length - 1] = new Item("minecraft:barrier").setStackSize(32)

/** @type {Item[]} */
let inventory = []
/** @type {Item[]} */
let armor = []

const drawSlotBg = (x, y) => {
    Renderer.retainTransforms(true)

    // Background
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

editGui.onDraw(() => {
    const scale = editGui.getScale()

    // Draw armor
    for (let idx = 0; idx < defaultArmor.length; idx++) {
        let it = defaultArmor[idx]
        let [ x, y ] = [ 0, (18 * (idx + 1)) ]
        Renderer.translate(editGui.getX(), editGui.getY())
        Renderer.scale(scale)
        drawSlotBg(x, y)
        if (it) it.draw(x, y, scale)
        Renderer.retainTransforms(false)
    }

    // Draw Inventory
    let bx = 5
    let by = 18

    for (let idx = 0; idx < defaultInventory.length; idx++) {
        if (idx === 0) continue
        let item = defaultInventory[idx]
        let offset = idx % 9
        let [ x, y ] = [ bx + (18 * offset), by ]
        // Hardcode last item of each row because i cba to math rn
        if (offset === 0) x = bx + (18 * 9)
        if (idx % 9 === 0) by += 18

        Renderer.translate(editGui.getX(), editGui.getY())
        Renderer.scale(scale)
        drawSlotBg(x, y)

        if (!item) continue

        item.draw(x, y, scale)
        Renderer.retainTransforms(false)

        let itemCount = item.getStackSize()
        if (itemCount <= 1) continue

        Renderer.translate(editGui.getX(), editGui.getY(), 1000)
        Renderer.scale(scale)
        Renderer.drawStringWithShadow(
            itemCount,
            (x + 16) - Renderer.getStringWidth(`${itemCount}`),
            y + 8
        )
    }
})

const feat = new Feature("inventoryHudDisplay")
    .addEvent(
        new Event("tick", () => {
            armor = []
            inventory = []
            Player.getInventory().getItems().forEach((it, idx) => {
                if (idx > 35) {
                    armor.push(it)
                    return
                }
                if (idx < 9) {
                    inventory[idx + 28] = it
                    return
                }

                inventory[idx - 8] = it
            })
            armor.reverse()
            feat.update()
        })
    )
    .addSubEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen()) return

            const scale = editGui.getScale()

            // Draw armor
            for (let idx = 0; idx < armor.length; idx++) {
                let it = armor[idx]
                let [ x, y ] = [ 0, (18 * (idx + 1)) ]
                Renderer.translate(editGui.getX(), editGui.getY())
                Renderer.scale(scale)
                drawSlotBg(x, y)
                if (it) it.draw(x, y, scale)
                Renderer.retainTransforms(false)
            }

            // Draw Inventory
            let bx = 5
            let by = 18

            for (let idx = 0; idx < inventory.length; idx++) {
                if (idx === 0) continue
                let item = inventory[idx]
                let offset = idx % 9
                let [ x, y ] = [ bx + (18 * offset), by ]
                // Hardcode last item of each row because i cba to math rn
                if (offset === 0) x = bx + (18 * 9)
                if (idx % 9 === 0) by += 18

                Renderer.translate(editGui.getX(), editGui.getY())
                Renderer.scale(scale)
                drawSlotBg(x, y)

                if (!item) {
                    Renderer.retainTransforms(false)
                    continue
                }

                item.draw(x, y, scale)
                Renderer.retainTransforms(false)

                let itemCount = item.getStackSize()
                if (itemCount <= 1) continue

                Renderer.translate(editGui.getX(), editGui.getY(), 1000)
                Renderer.scale(scale)
                Renderer.drawStringWithShadow(
                    itemCount,
                    (x + 16) - Renderer.getStringWidth(`${itemCount}`),
                    y + 8
                )
            }
        }),
        () => inventory.length
    )
    .onUnregister(() => {
        inventory = []
        armor = []
    })