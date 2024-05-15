import config from "../../config"
import { TextHelper } from "../../shared/Text"

// Constan variables
const formattedRegex = /^(§\w(§\w)?)([\w ]+) \d$/

// Logic
const getName = (str) => {
    const strSplit = str.split(" ")

    if (strSplit.length > 1) return `${strSplit[0][0]}${strSplit[1][0]}`.toUpperCase().removeFormatting()?.replace(/§z/g, "")

    return `${str.slice(0, 3)}`.toUpperCase().removeFormatting()?.replace(/§z/g, "")
}

const getNameLore = (str, key) => {
    if (!formattedRegex.test(str)) return

    const [ _, format, format2, name ] = str.match(formattedRegex)

    if (!config.enchantedBookAbbreviationColor && !key.includes("ultimate_")) return getName(name)

    return `${format ?? ""}${format2 ?? ""}${getName(name)}`
}

const renderSlot = (slot) => {
    if (!World.isLoaded() || !config.enchantedBookLevel) return

    const item = slot.getItem()
    if (!item || item.getID() !== 403) return

    const extraAttributes = TextHelper.getExtraAttribute(item)
    const itemID = extraAttributes?.id

    if (!extraAttributes || itemID !== "ENCHANTED_BOOK" || !extraAttributes.enchantments) return

    const keys = Object.keys(extraAttributes.enchantments)
    const values = extraAttributes.enchantments[keys[0]]

    if (keys.length > 1 || !values) return

    Tessellator.pushMatrix()
    Tessellator.disableLighting()
    Tessellator.enableDepth()
    Tessellator.enableAlpha()

    if (config.enchantedBookAbbreviation) {
        Renderer.translate(slot.getDisplayX(), slot.getDisplayY(), 280)
        Renderer.scale(0.9)
        Renderer.drawStringWithShadow(getNameLore(item.getLore()[1], keys[0]), 0, 0)
    }

    Renderer.translate(slot.getDisplayX() + (16 - Renderer.getStringWidth(values)), slot.getDisplayY() + 8, 280)
    Renderer.drawStringWithShadow(values, 0, 0)

    Tessellator.enableLighting()
    Tessellator.disableDepth()
    Tessellator.disableAlpha()
    Tessellator.popMatrix()
}

// Events
// Using actual ct events cuz im too lazy to make something with priority system
// since this needs to run after [ItemRarity] is rendered
register("renderSlot", renderSlot).setPriority(Priority.LOWEST)