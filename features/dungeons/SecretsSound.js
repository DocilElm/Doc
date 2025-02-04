import config from "../../config"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"

const secretItems = new Set(["Healing VIII Splash Potion", "Healing Potion 8 Splash Potion", "Decoy", "Inflatable Jerry", "Spirit Leap", "Trap", "Training Weights", "Defuse Kit", "Dungeon Chest Key", "Treasure Talisman", "Revive Stone", "Architect's First Draft"])
const allowedIDs = new Set(["e0f3e929-869e-3dca-9504-54c666ee6f23", "fed95410-aba1-39df-9b95-1d4f361eb66e"])
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

let currentBlockClicked = null

const playSound = () => {
    World.playSound(
        soundsList[config().secretsSoundType][0], // Sound
        1,
        soundsList[config().secretsSoundType][1] // Pitch
    )
}

const checkSkullTexture = (blockPos) => {
    const textureID = World.getWorld().func_175625_s(blockPos)?.func_152108_a()?.id?.toString()

    if (!textureID) return

    return allowedIDs.has(textureID)
}

const feat = new Feature("secretsSound", "catacombs")
    .addEvent(
        new Event(EventEnums.FORGE.ENTITYJOIN, (entity, entityID) => {
            itemEntities.set(entityID, entity)

            feat.update()
        }, net.minecraft.entity.item.EntityItem)
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.COLLECTITEM, (entityID) => {
            if (!itemEntities.has(entityID)) return

            const entity = itemEntities.get(entityID)
            const name = entity.func_92059_d()?.func_82833_r()
            if (!name || !secretItems.has(name.removeFormatting())) return

            playSound()
            itemEntities.delete(entityID)
        }),
        () => itemEntities.size
    )
    .addEvent(
        new Event(EventEnums.PACKET.CLIENT.BLOCKPLACEMENT, (ctBlock, _, blockPos) => {
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
        }, false)
    )
    .addEvent(
        new Event(EventEnums.SOUNDPLAY, (_, __, vol) => vol === 0.10000000149011612 && playSound(), "mob.bat.hurt")
    )
    .addEvent(
        new Event(EventEnums.SOUNDPLAY, (_, __, vol) => vol === 0.10000000149011612 && playSound(), "mob.bat.death")
    )
    .onUnregister(() => {
        currentBlockClicked = null
        itemEntities.clear()
    })