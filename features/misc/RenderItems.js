import config from "../../config"
import { scheduleTask } from "../../core/CustomRegisters"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { Render3D } from "../../../tska/rendering/Render3D"
import Location from "../../../tska/skyblock/Location"

const entities = new HashMap()
const itemRegex = /^(?:§f§f)?(?:§\w(?:§\w)?(?:(?:✿|BUY|SELL|\[Lvl \d+\]) ))?(?:§\w\[.+\] )?(?:§\w+ (§\w)Rift Necklace$)?(§\w)?/
const colors = {
    "§f": [255, 255, 255],
    "§a": [77, 231, 77],
    "§9": [85, 85, 255],
    "§5": [151, 0, 151],
    "§6": [255, 170, 0],
    "§d": [255, 85, 255],
    "§b": [85, 255, 255],
    "§c": [255, 85, 85],
    "§4": [170, 0, 0]
}

const feat = new Feature("renderItems")
    .addEvent(
        new Event(EventEnums.FORGE.ENTITYJOIN, (mcEntity) => {
            scheduleTask(() => {
                const mcItem = mcEntity./* getEntityItem */func_92059_d()
                const name = mcItem./* getDisplayName */func_82833_r()
                if (!name.startsWith("§")) return

                const m = name.match(itemRegex)
                let rarity = m?.[1] ?? m?.[2]
                if (!rarity in colors) rarity = "§f"

                entities.put(mcEntity, {
                    color: (colors[rarity] || [255, 255, 255]),
                    displayStr: `&ax${mcItem./* stackSize */field_77994_a} &f${config().renderItemsName === 1 ? name.removeFormatting() : name}`
                })
                feat.update()
            })
        }, net.minecraft.entity.item.EntityItem)
    )
    .addSubEvent(
        new Event(EventEnums.POSTRENDERENTITY, (/** @type {Entity} */entity, /** @type {Vec3i}*/pos) => {
            const obj = entities.get(entity.entity)
            if (!obj) return
            if (entity.isDead()) return entities.remove(entity.entity)

            const [ x, y, z, width, height ]  = [
                pos.x, pos.y + (entity.getHeight() / 2), pos.z,
                entity.getWidth(), entity.getHeight()
            ]

            if (config().renderItemsMode === 1 || config().renderItemsMode === 2 && Location.inWorld("catacombs")) {
                const distance = entity.distanceTo(Player.getPlayer())
                obj.color = distance < 3.5 ? [ 0, 255, 0 ] : [ 255, 0, 0 ]
            }

            const [ r, g, b ] = obj.color
            const displayText = obj.displayStr

            Render3D.renderEntityBox(x, y, z, width, height, r, g, b, 255, 2, true, false)
            Render3D.renderEntityBoxFilled(x, y, z, width, height, r, g, b, 150, true, false)

            if (config().renderItemsName !== 0) {
                const [ rx, ry, rz ] = Render3D.lerpViewEntity()
                Render3D.renderString(displayText, x + rx, y + 0.8 + ry, z + rz, [], false, 0.05, false)
            }
        }, net.minecraft.entity.item.EntityItem),
        () => entities.size()
    )
    .onUnregister(() => {
        entities.clear()
    })