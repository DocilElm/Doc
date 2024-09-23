import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { RenderHelper } from "../../shared/Render"

const criterias = [
    "[NPC] Elle: Okay adventurers, I will go and fish up Kuudra!",
    "[NPC] Elle: Phew! The Ballista is finally ready! It should be strong enough to tank Kuudra's blows now!",
    "[NPC] Elle: OMG! Great work collecting my supplies!",
    /^(?:\[\w{1,3}\+*\] )?\w{1,16} recovered a Fuel Cell and charged the Ballista! \(100%\)$/,
    "[NPC] Elle: POW! SURELY THAT'S IT! I don't think he has any more in him!"
]
const EntityGiantZombie = net.minecraft.entity.monster.EntityGiantZombie
const entities = new Map()

let shouldRender = false
let crates = []

const feat = new Feature("cratesWaypoints", "kuudra")
    .addEvent(
        new Event(EventEnums.FORGE.ENTITYJOIN, (entity, entityID) => {
            if (entities.has(entityID) || entity.field_70163_u > 67) return

            entities.set(entityID, new Entity(entity))
            feat.update()
        }, EntityGiantZombie)
    )
    .addSubEvent(
        new Event(EventEnums.STEP, () => {
            crates = []

            entities.forEach((/** @type {Entity}*/v, k) => {
                if (v.isDead()) return entities.delete(k)
                
                const yaw = v.getYaw()
                const distance = v.distanceTo(Player.getPlayer())

                crates.push([
                    v.getX() + 5 * Math.cos((yaw + 130) * (Math.PI / 180)),
                    v.getZ() + 5 * Math.sin((yaw + 130) * (Math.PI / 180)),
                    distance.toFixed(2)
                ])
            })

            feat.update()
        }, 5),
        () => entities.size && shouldRender
    )
    .addSubEvent(
        new Event("renderWorld", () => {
            for (let arr of crates) {
                let [ x, z, distance ] = arr
                let yText = distance <= 15 ? 78 : 80

                RenderHelper.renderBeaconBeam(x, x, z, 10, 217, 204, 255, false)
                Tessellator.drawString(`§a${distance}m`, x + 0.5, yText, z + 0.5, Renderer.WHITE, true)
            }
        }),
        () => crates.length && shouldRender
    )
    .onUnregister(() => {
        crates = []
        shouldRender = false
        entities.clear()
    })

criterias.forEach((it, idx) => feat.addEvent(
    new Event(EventEnums.PACKET.SERVER.CHAT, () => {
        if (idx > 1) {
            shouldRender = false
            feat.update()
            return
        }

        shouldRender = true
        feat.update()
    }, it)
))