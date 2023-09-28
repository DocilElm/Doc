import { renderBlockHitbox } from "../../../BloomCore/RenderUtils"
import { addEvent } from "../../FeatureBase"
import config from "../../config"
import { C08PacketPlayerBlockPlacement } from "../../utils/Utils"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/ShowSecretClicks.js

const allowedIDs = [
    "26bb1a8d-7c66-31c6-82d5-a9c04c94fb02", // wither essence
    "edb0155f-379c-395a-9c7d-1b6005987ac8" // redstone key
]
const secretBlocks = [
    "minecraft:chest",
    "minecraft:lever",
    "minecraft:skull",
    "minecraft:trapped_chest"
]

const blocksClicked = new Map()

const highlightHandler = (block) => {
    if(blocksClicked.has(block.toString())) return

    blocksClicked.set(block.toString(), block)

    Client.scheduleTask(20, () => blocksClicked.delete(block.toString()))
}

addEvent("showSecretsClicked", "", register("packetSent", (packet, event) => {
    if(!World.isLoaded()) return

    const pos = packet.func_179724_a()
    const bpos = new BlockPos(pos)

    const [ x, y, z ] = [bpos.x, bpos.y, bpos.z]
    const block = World.getBlockAt(x, y, z)
    const blockName = block.type.getRegistryName()

    if(!secretBlocks.some(arrBlocks => blockName === arrBlocks)) return
    if(blockName.includes("skull") && !allowedIDs.some(id => World.getWorld().func_175625_s(bpos.toMCBlock()).func_152108_a().id?.toString().includes(id))) return

    highlightHandler(block)

}).setFilteredClass(C08PacketPlayerBlockPlacement), null, [
    register("renderWorld", () => {
        const r = config.showSecretsClickedColor.getRed() / 255
        const g = config.showSecretsClickedColor.getGreen() / 255
        const b = config.showSecretsClickedColor.getBlue() / 255
    
        for (let ctBlock of blocksClicked.values()) {
            renderBlockHitbox(ctBlock, r, g, b, 1, true, 2, false)
            renderBlockHitbox(ctBlock, r, g, b, 0.2, true, 2, true)
        }
    })
], "Catacombs", null)

register("worldUnload", () => blocksClicked.clear())