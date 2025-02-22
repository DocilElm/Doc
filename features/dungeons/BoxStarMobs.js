import { scheduleTask } from "../../core/CustomRegisters"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { RenderHelper } from "../../shared/Render"

const mobs = new HashMap()

let useSeverTicks = false

const scanEntityName = (mcEntity, entityId, feat) => {
    const name = mcEntity./* getName */func_70005_c_()
    if (!name.includes("✯ ")) return

    const entityBelowId = entityId - (name.includes("Withermancer") ? 3 : 1)
    const entityBelow = World.getWorld()./* getEntityByID */func_73045_a(entityBelowId)
    if (!entityBelow) return
    if (entityBelow instanceof net.minecraft.entity.monster.EntityEnderman) {
        mobs.put(entityBelowId, [
            /* width */0.6,
            /* height */0.7,
            /* red */255,
            /* green */51,
            /* blue */255,
            /* alpha */255
        ])
        feat.update()
        return
    }

    mobs.put(entityBelowId, [
        /* width */entityBelow./* width */field_70130_N,
        /* height */entityBelow./* height */field_70131_O + 0.2, // "magic number" - an attempt to try to make the hitbox go over the armor the entity is wearing
        /* red */0,
        /* green */255,
        /* blue */255,
        /* alpha */255
    ])
    feat.update()
}

const feat = new Feature("boxStarMobs", "catacombs")
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.SCOREBOARD, () => {
            useSeverTicks = true
        }, /^Time Elapsed\: 03s$/)
    )
    .addEvent(
        new Event(EventEnums.FORGE.ENTITYJOIN, (mcEntity, entityId) => {
            // Scan with client ticks if the server packets aren't able to arrive yet
            if (!useSeverTicks) {
                Client.scheduleTask(3, () => scanEntityName(mcEntity, entityId, feat))
                return
            }

            scheduleTask(() => scanEntityName(mcEntity, entityId, feat))
        })
    )
    .addSubEvent(
        new Event("renderEntity", (entity, _, pticks) => {
            const entityId = entity.entity./* getEntityId */func_145782_y()
            const data = mobs.get(entityId)
            if (!data) return
            if (entity.isDead()) return mobs.remove(entityId)

            const [ width, height, r, g, b, a ] = data

            RenderHelper.drawEntityBox(
                entity.getX(),
                entity.getY(),
                entity.getZ(),
                width,
                height,
                r, g, b, a, 2, false, true, pticks
            )
        }),
        () => mobs.size()
    )
    .onUnregister(() => {
        mobs.clear()
        useSeverTicks = false
    })