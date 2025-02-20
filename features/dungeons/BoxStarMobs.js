import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { RenderHelper } from "../../shared/Render"

let mobsArray = []

const render = new Event("renderWorld", () => {
    mobsArray.forEach(entity => {
        if (entity.getName().includes("Fels")) {
            RenderHelper.drawEntityBox(
                entity.getX(),
                entity.getY() - 3,
                entity.getZ(),
                0.6,
                0.7,
                255, 51, 255, 255,
                2
            )

            return
        }

        RenderHelper.drawEntityBox(
            entity.getX(),
            entity.getY() - 2,
            entity.getZ(),
            0.6,
            2,
            0, 255, 255, 255,
            2
        )
    })
})

const feat = new Feature("boxStarMobs", "catacombs")
    .addEvent(
        new Event(EventEnums.STEP, () => {
            mobsArray = World.getAllEntitiesOfType(net.minecraft.entity.item.EntityArmorStand)
                .filter(entity =>
                    entity.getName().includes("✯ ") &&
                    !World.getWorld()./* getEntityByID */func_73045_a(entity.entity./* getEntityId */func_145782_y() - 1)?./* isDead */field_70128_L
                    )

            feat.update()
        }, 3)
    )
    .addSubEvent(render, () => mobsArray.length)
    .onUnregister(() => render.unregister())