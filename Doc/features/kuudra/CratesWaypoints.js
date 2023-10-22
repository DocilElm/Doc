import renderBeaconBeam from "../../../BeaconBeam"
import { addEvent } from "../../FeatureBase"
import { onChatPacket } from "../../classes/Events"
import { EntityGiantZombie } from "../../utils/Utils"

let crates = []
let toggle = true

addEvent("cratesWaypoints", "Kuudra", register("step", () => {
    if(!World.isLoaded() || !toggle) return

    crates = World.getAllEntitiesOfType(EntityGiantZombie).filter(a => a.getY() < 67).map(entity => {
        const entityYaw = entity.getYaw()
        const x = entity.getX() + 5 * Math.cos((entityYaw + 130) * (Math.PI / 180))
        const z = entity.getZ() + 5 * Math.sin((entityYaw + 130) * (Math.PI / 180))

        return [x, z]
    })
}).setFps(5), null, [
    onChatPacket(() => {
        toggle = false
    }).setCriteria(/^\[NPC\] Elle\: OMG\! Great work collecting my supplies\!$/),

    register("renderWorld", () => {
        if(!World.isLoaded() || !crates || !toggle) return
    
        crates.forEach(entity => {
            renderBeaconBeam(entity[0], 75, entity[1], 255/255, 0/255, 255/255, 1, true)
        })
    })
], "Kuudra")

register("worldUnload", () => {
    crates = []
    toggle = true
})