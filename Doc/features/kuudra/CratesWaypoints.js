import renderBeaconBeam from "../../../BeaconBeam"
import { addEvent } from "../../FeatureBase"
import { EntityGiantZombie } from "../../utils/Utils"

let crates = []

addEvent("cratesWaypoints", "Kuudra", register("step", () => {
    crates = World.getAllEntitiesOfType(EntityGiantZombie).filter(a => a.getY() < 67).map(entity => {
        const entityYaw = entity.getYaw()
        const x = entity.getX() + 5 * Math.cos((entityYaw + 130) * (Math.PI / 180))
        const z = entity.getZ() + 5 * Math.sin((entityYaw + 130) * (Math.PI / 180))

        return [x, z]
    })
}).setFps(5), null, [
    register("renderWorld", () => {
        if(!World.isLoaded() || !crates) return
    
        crates.forEach(entity => {
            renderBeaconBeam(entity[0], 75, entity[1], 50, 205, 50, 1, true)
        })
    })
], "Kuudra")

register("worldUnload", () => crates = [])