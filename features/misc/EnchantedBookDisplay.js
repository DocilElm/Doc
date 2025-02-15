import config from "../../config"
import { Event } from "../../core/Event"
import Feature from "../../core/Feature"
import { TextHelper } from "../../shared/TextHelper"

const cache = new Map()
const cacheNumber = new Map()
const formattedRegex = /^(§\w(?:§\w)*?)([\w\- ]+) ([IVXLCDM\d]+)$/

config().getConfig().registerListener("enchantedBookAbbreviationColor", () => {
    cache.clear()
})

const getName = (format, name) => {
    name = name.replace(/\-/g, " ")
    if (cache.has(`${format}${name}`)) return cache.get(`${format}${name}`)

    const spaces = name.split(" ")
    const ultimate = format.endsWith("§d§l")

    let str = spaces.length > 1
        ? `${spaces[0][0]}${spaces[1][0]}`.toUpperCase().removeFormatting()?.replace(/§z/g, "")
        : `${name.slice(0, 3)}`.toUpperCase().removeFormatting()?.replace(/§z/g, "")

    const result = ultimate || config().enchantedBookAbbreviationColor
        ? `${format}${str}`
        : str

    cache.set(`${format}${name}`, result)

    return result
}

const getLevel = (roman) => {
    if (cacheNumber.has(roman)) return cacheNumber.get(roman)

    const result = TextHelper.decodeNumeral(roman)
    cacheNumber.set(roman, result)

    return result
}

new Feature("enchantedBookLevel")
    .addEvent(
        new Event("renderSlot", (/** @type {Slot} */slot) => {
            const item = slot.getItem()
            if (!item || item.getID() !== 403) return

            const lore = item.getLore()
            if (!lore || lore?.[0]?.removeFormatting() !== "Enchanted Book") return

            const enchantName = lore[1]
            const match = enchantName.match(formattedRegex)
            if (!match) return

            const level = getLevel(match[3])
            if (level == null) return

            Tessellator.pushMatrix()
            Tessellator.disableLighting()
        
            if (config().enchantedBookAbbreviation) {
                Renderer.translate(slot.getDisplayX(), slot.getDisplayY(), 280)
                Renderer.scale(0.9)
                Renderer.drawStringWithShadow(getName(match[1], match[2]), 0, 0)
            }
        
            Renderer.translate(slot.getDisplayX() + (16 - Renderer.getStringWidth(level)), slot.getDisplayY() + 8, 280)
            Renderer.drawStringWithShadow(level, 0, 0)
        
            Tessellator.enableLighting()
            Tessellator.popMatrix()
        })
    )