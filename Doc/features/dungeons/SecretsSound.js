import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { WorldState } from "../../shared/World"

// Constant variables
const feature = new Feature("secretsSound", "Dungeons", "")
const secretItems = new Set(["Healing VIII Splash Potion", "Healing Potion 8 Splash Potion", "Decoy", "Inflatable Jerry", "Spirit Leap", "Trap", "Training Weights", "Defuse Kit", "Dungeon Chest Key", "Treasure Talisman", "Revive Stone", "Architect's First Draft"])
const allowedIDs = new Set(["26bb1a8d-7c66-31c6-82d5-a9c04c94fb02", "edb0155f-379c-395a-9c7d-1b6005987ac8"])
const secretBlocks = new Set(["minecraft:chest", "minecraft:lever", "minecraft:skull", "minecraft:trapped_chest"])
// [SoundType, Pitch]
const soundsList = [
    ["mob.blaze.hit", 2],
    ["fire.ignite", 1],
    ["random.orb", 1],
    ["random.break", 2],
    ["mob.guardian.land.hit", 2]
]
const itemEntities = new Map()

// Changeable variables
let currentBlockClicked = null

// Logic
const registerWhen = () => WorldState.inDungeons() && config.secretsSound

const playSound = () => {
    if (!registerWhen()) return

    World.playSound(
        soundsList[config.secretsSoundType][0], // Sound
        1,
        soundsList[config.secretsSoundType][1] // Pitch
        )
}

const checkEntities = (entityID) => {
    if (!registerWhen()) return

    if (!itemEntities.has(entityID)) return

    const obj = itemEntities.get(entityID)
    const entity = obj.entity

    const name = entity.func_92059_d()?.func_82833_r()
    if (!name || !secretItems.has(name.removeFormatting())) return

    playSound()
    itemEntities.delete(entityID)
}

const checkSkullTexture = (blockPos) => {
    const textureID = World.getWorld().func_175625_s(blockPos.toMCBlock())?.func_152108_a()?.id?.toString()

    if (!textureID) return

    return allowedIDs.has(textureID)
}

const checkClicked = (ctBlock, _, blockPos) => {
    if (!registerWhen()) return

    const blockName = ctBlock.type.getRegistryName()

    if (
        !secretBlocks.has(blockName) ||
        blockName === "minecraft:skull" && !checkSkullTexture(blockPos) ||
        ctBlock.toString() === currentBlockClicked
        ) return

    playSound()
    currentBlockClicked = ctBlock.toString()

    // Reset the last block clicked after 20 ticks
    Client.scheduleTask(20, () => currentBlockClicked = null)
}

// Events
// Credits: https://github.com/BetterMap/BetterMap/blob/main/Extra/Events/SecretTracker.js
register(net.minecraftforge.event.entity.EntityJoinWorldEvent, (event) => {
    if (!WorldState.inDungeons() || !(event.entity instanceof net.minecraft.entity.item.EntityItem)) return

    itemEntities.set(event.entity.func_145782_y(), {
        entity: event.entity
    })
})
new Event(feature, "step", checkEntities, registerWhen, 5)
new Event(feature, "onCollectItem", checkEntities)
new Event(feature, "onPlayerBlockPlacement", checkClicked, registerWhen)
new Event(feature, "soundPlay", playSound, registerWhen, "mob.bat.hurt")
new Event(feature, "soundPlay", playSound, registerWhen, "mob.bat.death")
new Event(feature, "worldUnload", () => {
    itemEntities.clear()
    currentBlockClicked = null
})

// Starting events
feature.start()