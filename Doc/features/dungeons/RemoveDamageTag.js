import { WorldState } from "../../../Atomx/skyblock/World"
import config from "../../config"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/HideGrayNumbers.js

const handleEntity = (entityID) => {
    const entity = World.getWorld().func_73045_a(entityID)
    if (!entity || !(entity instanceof net.minecraft.entity.item.EntityArmorStand)) return
    const name = entity.func_95999_t()
    if (!name || !/^.?\d[\d,.]+.*?$/.test(name?.removeFormatting())) return

    entity.func_70106_y()
}

register("packetReceived", (packet) => {
    if (!WorldState.inDungeons() || !config.removeDamageTag) return

    Client.scheduleTask(() => handleEntity(packet.func_149024_d()))
}).setFilteredClass(net.minecraft.network.play.server.S0FPacketSpawnMob)