import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { RenderHelper } from "../../shared/Render"
import { WorldState } from "../../shared/World"

// Constant variables
const feature = new Feature("mobESP", "Dungeons", "")
const requiredWorld = "Catacombs"

// Changeable variables
let mobsArray = []

// Logic
const registerWhen = () => WorldState.getCurrentWorld() === requiredWorld && config.mobESP

// Events
new Event(feature, "step", () => {
    mobsArray = World.getAllEntitiesOfType(net.minecraft.entity.item.EntityArmorStand).filter(entity => entity.getName().includes("✯ "))
}, registerWhen, 3)

new Event(feature, "renderWorld", () => {
    mobsArray.forEach(entity => {
        // Only render the head of fel
        if (entity.getName().includes("Fels")) {
            RenderHelper.drawEntityBox(entity.getRenderX(), entity.getRenderY() - 3, entity.getRenderZ(), 0.7, 0.9, 1, 51 / 255, 1, 1, 2)

            return
        }

        RenderHelper.drawEntityBox(entity.getRenderX(), entity.getRenderY() - 2, entity.getRenderZ(), 0.6, 2, 0, 35, 243, 1, 2)
    })
}, registerWhen)

// Starting events
feature.start()