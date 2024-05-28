import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { TextHelper } from "../../shared/Text"

// Constan variables
const feature = new Feature("AttributeShardDisplay", "Misc", "")
const formattedRegex = /^(§\w(§\w)*?)([\w ]+) [IVXLCDM\d]+( ✖)?$/

// Logic
const getName = (str) => {
    const strSplit = str.split(" ")

    if (strSplit.length > 1) return `${strSplit[0][0]}${strSplit[1][0]}`.toUpperCase().removeFormatting()?.replace(/§z/g, "")

    return `${str.slice(0, 3)}`.toUpperCase().removeFormatting()?.replace(/§z/g, "")
}

const getNameLore = (str) => {
    if (!formattedRegex.test(str)) return

    const [ _, format, format2, name ] = str.match(formattedRegex)

    if (!config.attributeShardAbbreviationColor) return getName(name)

    return `${format ?? ""}${format2 ?? ""}${getName(name)}`
}

const renderSlot = (slot) => {
    if (!World.isLoaded() || !config.attributeShardLevel) return

    const item = slot.getItem()
    if (!item || item.getID() !== 409) return

    const extraAttributes = TextHelper.getExtraAttribute(item)
    const itemID = extraAttributes?.id

    if (!extraAttributes || itemID !== "ATTRIBUTE_SHARD" || !extraAttributes.attributes) return

    const keys = Object.keys(extraAttributes.attributes)
    const values = extraAttributes.attributes[keys[0]]

    if (keys.length > 1 || !values) return

    Tessellator.pushMatrix()
    Tessellator.disableLighting()

    if (config.attributeShardAbbreviation) {
        Renderer.translate(slot.getDisplayX(), slot.getDisplayY(), 280)
        Renderer.scale(0.9)
        Renderer.drawStringWithShadow(getNameLore(item.getLore()[1]), 0, 0)
    }

    Renderer.translate(slot.getDisplayX() + (16 - Renderer.getStringWidth(values)), slot.getDisplayY() + 8, 280)
    Renderer.drawStringWithShadow(values, 0, 0)

    Tessellator.disableLighting()
    Tessellator.popMatrix()
}

// Events
new Event(feature, "renderSlot", renderSlot, () => World.isLoaded() && config.attributeShardLevel)

// Starting events
feature.start()