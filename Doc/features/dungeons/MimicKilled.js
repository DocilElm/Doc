import { WorldState } from "../../../Atomx/skyblock/World"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"

// Credits: https://github.com/BetterMap/BetterMap/blob/main/Components/DungeonMap.js#L172

// Constant variables
const feature = new Feature("MimicKilled", "Dungeons", "")

// Changeable variables
let sentMessage = false

// Logic
const onEntityDeath = (ctEntity) => {
    if (sentMessage) return

    const entity = ctEntity.entity
    if (!(entity instanceof net.minecraft.entity.monster.EntityZombie)) return ChatLib.chat("return")
    if (!entity.func_70631_g_() || entity.func_82169_q(0)) return

    ChatLib.command(`pc ${config.mimicDeadMessage}`)
    sentMessage = true
}

// Events
new Event(feature, "entityDeath", onEntityDeath, () => WorldState.inDungeons() && config.sendMimicDead)
new Event(feature, "worldUnload", () => sentMessage = false)

// Starting events
feature.start()