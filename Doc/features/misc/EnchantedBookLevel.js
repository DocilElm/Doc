import config from "../../config"
import { TextHelper } from "../../shared/Text"

// Logic
const renderSlot = (slot) => {
    if (!World.isLoaded() || !config.enchantedBookLevel) return

    const item = slot.getItem()
    if (!item || item.getID() !== 403) return

    const extraAttributes = TextHelper.getExtraAttribute(item)
    const itemID = extraAttributes?.id

    if (!extraAttributes || itemID !== "ENCHANTED_BOOK" || !extraAttributes.enchantments) return

    const values = Object.values(extraAttributes.enchantments)
    if (!values || values.length > 1) return

    Tessellator.pushMatrix()
    Tessellator.disableLighting()
    Tessellator.enableDepth()
    Tessellator.enableAlpha()

    Renderer.translate(slot.getDisplayX() + (16 - Renderer.getStringWidth(values[0])), slot.getDisplayY() + 8, 280)
    Renderer.drawStringWithShadow(values[0], 0, 0)

    Tessellator.enableLighting()
    Tessellator.disableDepth()
    Tessellator.disableAlpha()
    Tessellator.popMatrix()
}

// Events
// Using actual ct events cuz im too lazy to make something with priority system
// since this needs to run after [ItemRarity] is rendered
register("renderSlot", renderSlot).setPriority(Priority.LOWEST)