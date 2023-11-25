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
    mobsArray = World.getAllEntitiesOfType(net.minecraft.entity.item.EntityArmorStand).filter(entity => entity.getName().includes("✯ ") && !entity.getName().includes("Fels"))
}, registerWhen, 3)

new Event(feature, "renderWorld", () => {
    mobsArray.forEach(entity => {
        RenderHelper.drawEntityBox(entity.getRenderX(), entity.getRenderY() - 2, entity.getRenderZ(), 0.6, 2, 0, 35, 243, 255, 1.3)
    })
}, registerWhen)

// Starting events
feature.start()