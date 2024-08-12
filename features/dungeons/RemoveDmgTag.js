import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/HideGrayNumbers.js

new Feature("removeDamageTag", "catacombs")
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.SPAWNMOB, (entityID) => {
            const entity = World.getWorld().func_73045_a(entityID)
            if (!entity || !(entity instanceof net.minecraft.entity.item.EntityArmorStand)) return
            const name = entity.func_95999_t()
            if (!name || !/^.?\d[\d,.]+.*?$/.test(name?.removeFormatting())) return

            entity.func_70106_y()
        })
    )