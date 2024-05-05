import { WorldState } from "../../../Atomx/skyblock/World"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { ParticleEnums } from "../../shared/Registers"
import { RenderHelper } from "../../shared/Render"

// Constant variables
const feature = new Feature("BoxBerberis", "Rift", "")

// Changeable variables
let block = null

// Logic
const manhattanDistance = (x, y, x1, y1) => Math.abs(x - x1) + Math.abs(y - y1)

const onSpawnParticle = (type, [x, y, z]) => {
    if (type !== ParticleEnums.FIREWORKS_SPARK || manhattanDistance(x, z, Player.getX(), Player.getZ()) > 20) return

    const sideBlock = World.getBlockAt(x - 1, y, z - 1)
    const blockBelow = World.getBlockAt(x - 1, y - 1, z - 1)

    if (
        sideBlock.type.mcBlock !== net.minecraft.init.Blocks.field_150330_I ||
        blockBelow.type.mcBlock !== net.minecraft.init.Blocks.field_150458_ak
        ) return

    block = sideBlock
}

const renderWorld = () => {
    if (!block) return

    RenderHelper.outlineBlock(block, 0, 1, 0, 1, false)
}

// Events
new Event(feature, "onSpawnParticle", onSpawnParticle, () => WorldState.getCurrentWorld() === "The Rift" && WorldState.getCurrentArea() === "Dreadfarm" && config.boxBerberis)
new Event(feature, "renderWorld", renderWorld, () => WorldState.getCurrentWorld() === "The Rift" && block && WorldState.getCurrentArea() === "Dreadfarm" && config.boxBerberis)
new Event(feature, "worldUnload", () => {
    block = null
})

// Starting events
feature.start()