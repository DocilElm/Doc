import { scheduleTask } from "../../core/CustomRegisters"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"

const blazeHealthRegex = /^\[Lv15\] Blaze [\d,]+\/([\d,]+)❤$/
const noStarTagRegex = /^(?:\[Lv\d+\] )?[\w ]+ [\d,.]+\w(?:\/[\d,.]+\w)?❤$/

new Feature("hideNoneStarredTags", "catacombs")
    .addEvent(
        new Event(EventEnums.FORGE.ENTITYJOIN, (entity) => {
            scheduleTask(() => {
                const name = entity.func_95999_t()?.removeFormatting()
                if (!name || blazeHealthRegex.test(name) || !noStarTagRegex.test(name)) return

                entity.func_70106_y()
            })
        }, net.minecraft.entity.item.EntityArmorStand)
    )