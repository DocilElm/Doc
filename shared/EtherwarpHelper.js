// Full credits to BloomCore
// pretty much the entire logic of this was taken from it

import Vec3 from "./Vec3"

// If one of these blocks is above the targeted etherwarp block, it is a valid teleport.
// However if the block itself is being targetted, then it is not a valid block to etherwarp to.
const validEtherwarpFeetBlocks = new Set([
    "minecraft:air",
    "minecraft:fire",
    "minecraft:carpet",
    "minecraft:skull",
    "minecraft:lever",
    "minecraft:stone_button",
    "minecraft:wooden_button",
    "minecraft:torch",
    "minecraft:string",
    "minecraft:tripwire_hook",
    "minecraft:tripwire",
    "minecraft:rail",
    "minecraft:activator_rail",
    "minecraft:snow_layer",
    "minecraft:carrots",
    "minecraft:wheat",
    "minecraft:potatoes",
    "minecraft:nether_wart",
    "minecraft:pumpkin_stem",
    "minecraft:melon_stem",
    "minecraft:redstone_torch",
    "minecraft:redstone_wire",
    "minecraft:red_flower",
    "minecraft:yellow_flower",
    "minecraft:sapling",
    "minecraft:flower_pot",
    "minecraft:deadbush",
    "minecraft:tallgrass",
    "minecraft:ladder",
    "minecraft:double_plant",
    "minecraft:unpowered_repeater",
    "minecraft:powered_repeater",
    "minecraft:unpowered_comparator",
    "minecraft:powered_comparator",
    "minecraft:web",
    "minecraft:waterlily",
    "minecraft:water",
    "minecraft:lava",
    "minecraft:torch",
    "minecraft:vine",
    "minecraft:brown_mushroom",
    "minecraft:red_mushroom",
    "minecraft:piston_extension",
])

export default class EtherwarpHelper {
    /**
     * - Checks whether the given block is a valid block to etherwarp onto
     * @param {Block} block 
     * @returns {boolean}
     */
    static isValidEtherwarpBlock(block) {
        if (!block) return false
        if (!(block instanceof Block)) block = World.getBlockAt(...block)
        if (block.type.getID() == 0) return false

        // Checking the actual block to etherwarp ontop of
        // Can be at foot level, but not etherwarped onto directly.
        if (validEtherwarpFeetBlocks.has(block.type.getRegistryName())) return false

        // The block at foot level
        const blockAbove = World.getBlockAt(block.getX(), block.getY() + 1, block.getZ())
        if (!validEtherwarpFeetBlocks.has(blockAbove.type.getRegistryName())) return false

        // The block at head height
        const blockAboveAbove = World.getBlockAt(block.getX(), block.getY() + 2, block.getZ())
        
        return validEtherwarpFeetBlocks.has(blockAboveAbove.type.getRegistryName())
    }

    /**
     * @param {number[]} start
     * @param {number[]} end
     * @param {number} distance
     * @returns {Block?}
     */
    static traverseVoxels(start, end, distance = 60) {
        const direction = end.map((v, i) => v - start[i])
        const step = direction.map(a => Math.sign(a))
        const thing = direction.map(a => 1/a)
        const tDelta = thing.map((v, i) => Math.min(v * step[i], 1))
        const tMax = thing.map((v, i) => Math.abs((Math.floor(start[i]) + Math.max(step[i], 0) - start[i]) * v))
        const limit = distance + 20

        let startPos = start.map(it => Math.floor(it))
        let endPos = end.map(it => Math.floor(it))

        for (let idx = 0; idx < limit; idx++) {
            let block = World.getBlockAt(...startPos)
            if (block.type.getID() !== 0) return block

            if (startPos.every((v, i) => v == endPos[i])) break

            // Find the next direction to step in
            let minIdx = tMax.indexOf(Math.min(...tMax))
            tMax[minIdx] += tDelta[minIdx]
            startPos[minIdx] += step[minIdx]
        }

        return null
    }

    static getEtherwarpBlockSuccess(distance = 60) {
        let lookVec = Vec3.fromPitchYaw(Player.getPitch(), Player.getYaw()).multiply(distance)
        let startPos = [Player.getRenderX(), Player.getRenderY() + 1.54, Player.getRenderZ()]
        let endPos = lookVec.getComponents().map((v, i) => v + startPos[i])

        const ether = this.traverseVoxels(startPos, endPos, distance)

        return [this.isValidEtherwarpBlock(ether), ether]
    }
}