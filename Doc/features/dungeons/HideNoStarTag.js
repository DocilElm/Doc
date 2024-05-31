import Dungeons from "../../../Atomx/skyblock/Dungeons"
import { WorldState } from "../../../Atomx/skyblock/World"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"

// Constant variables
const feature = new Feature("HideNoneStarredTags", "Dungeons", "")
const noStarTagRegex = /^(?:\[Lv\d+\] )?[\w ]+ [\d,.]+\w(?:\/[\d,.]+\w)?❤$/

// Logic
const onTick = () => {
    if (!WorldState.inDungeons() || !config.hideNoneStarredTags || Dungeons.inBossRoom()) return
    
    World.getAllEntitiesOfType(net.minecraft.entity.item.EntityArmorStand).forEach(entity => {
        if (entity.isDead() || !noStarTagRegex.test(entity.getName().removeFormatting())) return

        entity.entity.func_70106_y()
    })
}

// Events
new Event(feature, "tick", onTick, () => WorldState.inDungeons() && config.hideNoneStarredTags && !Dungeons.inBossRoom())

// Starting events
feature.start()