import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { RenderHelper } from "../../shared/Render"
import { WorldState } from "../../shared/World"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/ShowSecretClicks.js

// Constant variables
// Wither skull / Redstone skull
const allowedIDs = new Set(["26bb1a8d-7c66-31c6-82d5-a9c04c94fb02", "edb0155f-379c-395a-9c7d-1b6005987ac8"])
const secretBlocks = new Set(["minecraft:chest", "minecraft:lever", "minecraft:skull", "minecraft:trapped_chest"])
const feature = new Feature("secretsClicked", "Dungeons", "")
const blocksToHighlight = new Map()

// Changeable variables
let locked = false

// Logic
const registerWhen = () => WorldState.inDungeons() && config().showSecretsClicked

const checkSkullTexture = (blockPos) => {
    const textureID = World.getWorld().func_175625_s(blockPos.toMCBlock())?.func_152108_a()?.id?.toString()
    if (!textureID) return

    return allowedIDs.has(textureID)
}

const checkCtBlock = (ctBlock, _, blockPos) => {
    const blockName = ctBlock.type.getRegistryName()

    if (!secretBlocks.has(blockName) || blockName === "minecraft:skull" && !checkSkullTexture(blockPos)) return

    const blockString = ctBlock.toString()
    if (blocksToHighlight.has(blockString)) return

    blocksToHighlight.set(blockString, {
        block: ctBlock
    })

    Client.scheduleTask(20, () => {
        blocksToHighlight.delete(blockString)
        locked = false
    })
}

const renderHighlight = () => {
    if (!blocksToHighlight.size) return

    blocksToHighlight.forEach(obj => {
        const block = obj.block
        const r = locked && block.type.getRegistryName() === "minecraft:chest" ? 1 : config().showSecretsClickedColor[0] / 255
        const g = locked && block.type.getRegistryName() === "minecraft:chest" ? 0 : config().showSecretsClickedColor[1] / 255
        const b = locked && block.type.getRegistryName() === "minecraft:chest" ? 0 : config().showSecretsClickedColor[2] / 255

        RenderHelper.outlineBlock(block, r, g, b, 1, true, 2, false)
        RenderHelper.filledBlock(block, r, g, b, 0.2, true)
    })
}

// Events
new Event(feature, "onPlayerBlockPlacement", checkCtBlock, registerWhen)
new Event(feature, "renderWorld", renderHighlight, registerWhen)
new Event(feature, "onChatPacket", () => locked = true, registerWhen, /^That chest is locked!$/)

// Starting events
feature.start()