import { WorldState } from "../../../Atomx/skyblock/World"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { RenderHelper } from "../../shared/Render"

// Constant variables
const feature = new Feature("BoxSplatterHearts", "Rift", "")
const entityMap = new Map()

// Logic
const onSpawnParticle = (particle, type) => {
    if (!config.boxSplatterHearts || type.func_179346_b() !== "heart" || particle.distanceTo(Player.getPlayer()) >= 15) return

    const { x, y, z } = particle.getPos()
    const blockBelow = World.getBlockAt(x, y - 1, z)
    if (blockBelow.type.mcBlock === net.minecraft.init.Blocks.field_150350_a || entityMap.has(particle.toString())) return

    const block = World.getBlockAt(x, y, z)

    entityMap.set(block.toString(), {
        entity: particle,
        block: block
    })
}

const renderWorld = () => {
    if (!config.boxSplatterHearts || WorldState.getCurrentArea() !== "Stillgore Chteau") return

    entityMap.forEach(obj => {
        if (obj.entity.isDead()) return entityMap.delete(obj.block.toString())

        RenderHelper.filledBlock(obj.block, 0, 1, 1, 150 / 255, false)
    })
}

// Events
new Event(feature, "spawnParticle", onSpawnParticle, () => WorldState.getCurrentWorld() === "The Rift" && WorldState.getCurrentArea() === "Stillgore Chteau" && config.boxSplatterHearts)
new Event(feature, "renderWorld", renderWorld, () => WorldState.getCurrentWorld() === "The Rift" && WorldState.getCurrentArea() === "Stillgore Chteau" && entityMap.size && config.boxSplatterHearts)
new Event(feature, "worldUnload", () => entityMap.clear())

// Starting events
feature.start()