import config from "../../config"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"

let msgSent = false

new Feature("sendMimicDead", "catacombs")
    .addEvent(
        new Event(EventEnums.ENTITYDEATH, (entity) => {
            if (msgSent || !entity.entity.func_70631_g_() || entity.entity.func_82169_q(0)) return
            ChatLib.command(`pc ${config().mimicDeadMessage}`)
            msgSent = true
        }, net.minecraft.entity.monster.EntityZombie)
    )
    .onUnregister(() => msgSent = false)