import RenderLib from "../../../RenderLib"
import { addEvent } from "../../FeatureBase"
import { EntityArmorStand } from "../../utils/Utils"

let mobsArray = []

addEvent("mobESP", "dungeons", register("step", () => {
    if(!World.isLoaded()) return

    mobsArray = World.getAllEntitiesOfType(EntityArmorStand).filter(entity => entity.getName().includes("✯ ") && !entity.getName().includes("Fels"))
}).setFps(3), null, [
    register("renderWorld", () => {
        if(!World.isLoaded()) return

        mobsArray.forEach(entity => {
            const [ x, y, z ] = [entity.getRenderX(), entity.getRenderY(), entity.getRenderZ()]

            RenderLib.drawEspBox(x, y-2, z, 0.6, 2, 0, 35, 243, 255, false)
        })
    })
], "Catacombs", null)