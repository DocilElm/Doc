import Dungeons from "../../../Atomx/skyblock/Dungeons"
import { WorldState } from "../../../Atomx/skyblock/World"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"

// Constant variables
const feature = new Feature("HideNoneStarredTags", "Dungeons", "")
const blazeHealthRegex = /^\[Lv15\] Blaze [\d,]+\/([\d,]+)❤$/
const noStarTagRegex = /^(?:\[Lv\d+\] )?[\w ]+ [\d,.]+\w(?:\/[\d,.]+\w)?❤$/

// Logic
const onTick = () => {
    if (!WorldState.inDungeons() || !config().hideNoneStarredTags || Dungeons.inBossRoom()) return
    
    const entityList = World.getAllEntitiesOfType(net.minecraft.entity.item.EntityArmorStand)

    for (let idx = 0; idx < entityList.length; idx++) {
        let entity = entityList[idx]
        if (
            entity.isDead() ||
            blazeHealthRegex.test(entity.getName().removeFormatting()) ||
            !noStarTagRegex.test(entity.getName().removeFormatting())
            ) continue

        entity.entity.func_70106_y()
    }
}

// Events
new Event(feature, "tick", onTick, () => WorldState.inDungeons() && config().hideNoneStarredTags && !Dungeons.inBossRoom())

// Starting events
feature.start()