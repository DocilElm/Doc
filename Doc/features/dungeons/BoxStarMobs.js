import { Event } from "../../core/Event"
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

const feature = new Feature("BoxStarMobs", "boxStarMobs")
    .addEvent(
        new Event("step", () => {
            mobsArray = World.getAllEntitiesOfType(net.minecraft.entity.item.EntityArmorStand).filter(entity => entity.getName().includes("✯ "))
        }, 3)
    )
    .setWorld("catacombs")
    .onRegister(() => render.register())
    .onUnregister(() => render.unregister())