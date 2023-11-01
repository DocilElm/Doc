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

// Changeable variables
let ctBlockToHighlight = null
let isLocked = false

// Logic
const registerWhen = () => WorldState.inDungeons() && config.showSecretsClicked

const checkSkullTexture = (blockPos) => {
    const textureID = World.getWorld().func_175625_s(blockPos.toMCBlock())?.func_152108_a().id?.toString()
    if (!textureID) return

    return allowedIDs.has(textureID)
}

const checkCtBlock = (ctBlock, _, blockPos) => {
    const blockName = ctBlock.type.getRegistryName()

    if (!secretBlocks.has(blockName) || blockName === "minecraft:skull" && !checkSkullTexture(blockPos)) return

    ctBlockToHighlight = ctBlock

    Client.scheduleTask(20, () => {
        ctBlockToHighlight = null
        isLocked = false
    })
}

const renderHighlight = () => {
    if (!ctBlockToHighlight) return

    const r = isLocked ? 1 : config.showSecretsClickedColor.getRed() / 255
    const g = isLocked ? 0 : config.showSecretsClickedColor.getGreen() / 255
    const b = isLocked ? 0 : config.showSecretsClickedColor.getBlue() / 255

    RenderHelper.outlineBlock(ctBlockToHighlight, r, g, b, 1, true, 2, false)
    RenderHelper.filledBlock(ctBlockToHighlight, r, g, b, 0.2, true)
}

// Events
new Event(feature, "onPlayerBlockPlacement", checkCtBlock, registerWhen)
new Event(feature, "renderWorld", renderHighlight, registerWhen)
new Event(feature, "onChatPacket", () => isLocked = true, registerWhen, /^That chest is locked!$/)

// Starting events
feature.start()