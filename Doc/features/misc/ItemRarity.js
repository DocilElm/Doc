import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { TextHelper } from "../../shared/Text"

// Constant variables
const colors = {
    "§f": [255, 255, 255],
    "§a": [77, 231, 77],
    "§9": [85, 85, 255],
    "§5": [151, 0, 151],
    "§6": [255, 170, 0],
    "§d": [255, 85, 255],
    "§b": [85, 255, 255],
    "§c": [255, 85, 85],
    "§4": [170, 0, 0]
}
const feature = new Feature("ItemRarity", "Misc", "")

// Logic
const renderSlot = (slot) => {
    const item = slot.getItem()
    if (!item) return

    const itemName = item.getName()
    const match = itemName.match(/^(?:§f§f)?(?:§\w(?:§\w)?(?:(?:✿|BUY|SELL|\[Lvl \d+\]) ))?(?:§\w\[.+\] )?(?:§\w+ (§\w)Rift Necklace$)?(§\w)?/)
    const format = match?.[1] ?? match?.[2]

    if (!match || !(format in colors) || !TextHelper.getSkyblockItemID(item)) return

    const [ r, g, b ] = colors[format]
    const color = Renderer.color(r, g, b, Math.floor(config.renderItemRarityOpacity * 255))
    const [ x1, y1, x2, y2 ] = [
        slot.getDisplayX(),
        slot.getDisplayY(),
        slot.getDisplayX() + 16,
        slot.getDisplayY() + 16,
    ]

    Tessellator.disableLighting()
    Tessellator.disableDepth()
    Tessellator.pushMatrix()
    Tessellator.enableBlend()
    Tessellator.enableAlpha()

    if (config.renderItemRarityShape === 0) {
        // Top line
        Renderer.drawLine(color, x1, y1, x2, y1, 1.5)
        // Left line
        Renderer.drawLine(color, x1, y1, x1, y2, 1.5)
        // Right line
        Renderer.drawLine(color, x2, y1, x2, y2, 1.5)
        // Bottom line
        Renderer.drawLine(color, x1, y2, x2, y2, 1.5)
    }

    // Ternary just for pain
    if (config.renderItemRarityShape >= 1)
        Renderer.drawCircle(color, x1 + 8, y1 + 8, 9, config.renderItemRarityShape === 1 ? 6 : 10)

    Tessellator.popMatrix()
    Tessellator.blendFunc(770, 771)
    Tessellator.enableLighting()
    Tessellator.enableDepth()
    Tessellator.disableAlpha()
}

// Events
new Event(feature, "renderSlot", renderSlot, () => World.isLoaded() && config.renderItemRarity)

// Starting events
feature.start()