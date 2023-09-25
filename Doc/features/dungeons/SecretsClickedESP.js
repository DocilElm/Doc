import { renderBlockHitbox } from "../../../BloomCore/RenderUtils"
import { addEvent } from "../../FeatureBase"
import { C08PacketPlayerBlockPlacement } from "../../utils/Utils"

// credits to bloom
// cuz i got lazy

const secretBlocks = [
    "minecraft:chest",
    "minecraft:lever",
    "minecraft:skull",
    "minecraft:trapped_chest"
]

const blocksClicked = new Map()

const highlightHandler = (block) => {
    ChatLib.chat(`${blocksClicked.has(block.toString())}`)

    if(blocksClicked.has(block.toString())) return

    blocksClicked.set(block.toString(), block)
}

addEvent("showSecretsClicked", "", register("packetSent", (packet, event) => {
    if(!World.isLoaded()) return

    const pos = packet.func_179724_a()
    const bpos = new BlockPos(pos)

    const [ x, y, z ] = [bpos.x, bpos.y, bpos.z]
    const block = World.getBlockAt(x, y, z)
    const blockName = block.type.getRegistryName()

    if(!secretBlocks.some(arrBlocks => blockName === arrBlocks)) return

    highlightHandler(block)

}).setFilteredClass(C08PacketPlayerBlockPlacement), null, [
    register("renderWorld", () => {
        //const r = Config.showSecretClicksColor.getRed() / 255
        //const g = Config.showSecretClicksColor.getGreen() / 255
        //const b = Config.showSecretClicksColor.getBlue() / 255
        const [ r, g, b ] = [ 0, 1, 0 ]
        
        for (let ctBlock of blocksClicked.values()) {
            renderBlockHitbox(ctBlock, r, g, b, 1, true, 2, false)
            renderBlockHitbox(ctBlock, r, g, b, 0.2, true, 2, true)
        }
    })
], "Catacombs", null)

register("worldUnload", () => blocksClicked.clear())