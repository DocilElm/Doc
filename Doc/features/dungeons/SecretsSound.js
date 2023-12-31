import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { WorldState } from "../../shared/World"

// Constant variables
const feature = new Feature("secretsSound", "Dungeons", "")
const item = new Item("minecraft:skull")
const secretItems = new Set(["Health Potion VIII Splash Potion","Healing Potion 8 Splash Potion","Healing Potion VIII Splash Potion","Decoy","Inflatable Jerry","Spirit Leap","Trap","Training Weights","Defuse Kit","Dungeon Chest Key","Treasure Talisman","Revive Stone"])
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

// Changeable variables
let entityScanned = null
let currentBlockClicked = null

// Logic
const registerWhen = () => WorldState.inDungeons() && config.secretsSound

const playeSound = () => {
    if (!registerWhen()) return

    World.playSound(
        soundsList[config.secretsSoundType][0], // Sound
        1,
        soundsList[config.secretsSoundType][1] // Pitch
        )
}

const checkEntities = () => {
    if (!registerWhen()) return

    World.getAllEntitiesOfType(net.minecraft.entity.item.EntityItem).forEach(entity => {
        // Add the current item stack to the Item object
        item.setItemStack(entity.entity.func_92059_d())

        // Remove all the formatting in the item's name
        const itemName = item.getName()?.removeFormatting()

        // Check if the item name is in the list
        // or if the item distance is out of range
        if (!secretItems.has(itemName) || entity.distanceTo(Player.asPlayerMP()) >= 6) return

        // Set the [entityScanned] variable to [entity] if the item fits the criteria
        entityScanned = entity
    })

    // If entity is null or entity is still alive we return
    if (!entityScanned || !entityScanned.isDead()) return

    // Play sound and reset variables to default
    playeSound()
    entityScanned = null
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

    playeSound()
    currentBlockClicked = ctBlock.toString()

    // Reset the last block clicked after 20 ticks
    Client.scheduleTask(20, () => currentBlockClicked = null)
}

// Events
new Event(feature, "step", checkEntities, registerWhen, 5)
new Event(feature, "onPlayerBlockPlacement", checkClicked, registerWhen)
new Event(feature, "soundPlay", playeSound, registerWhen, "mob.bat.hurt")
new Event(feature, "soundPlay", playeSound, registerWhen, "mob.bat.death")
new Event(feature, "worldUnload", () => {
    entityScanned = null
    currentBlockClicked = null
})

// Starting events
feature.start()