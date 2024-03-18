import Dungeons from "../../../Atomx/skyblock/Dungeons"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"
import { onPuzzleRotation } from "../../shared/PuzzleHandler"
import { RenderHelper, getBlockBoundingBox } from "../../shared/Render"
import { TextHelper } from "../../shared/Text"
import { WorldState } from "../../shared/World"

// Constant variables
const feature = new Feature("CreeperBeamsSolver", "Dungeons", "")
const lanterPairs = Persistence.getDataFromFileOrLink("CreeperBeamsSolutions.json", "https://raw.githubusercontent.com/DocilElm/Doc/main/JsonData/CreeperBeamsSolutions.json")
const relativeCoords = {
    lantern: [0, 74, 0],
    stone: [1, 73, 0]
}
const pairColors = [
    [0, 1, 0],
    [0, 0, 1],
    [1, 0, 0],
    [1, 0, 1]
]

// Changeable variables
let lastDungIndex = null
let renderBlocks = {}
let enteredRoom = null
let ticksWithoutCreeper = 0

// Functiones required by the feature
const reset = (resetIndex = true) => {
    if (resetIndex) lastDungIndex = null
    enteredRoom = null
    renderBlocks = {}
}

// Checks to see whether any blocks from the solution have changed
// this is to remove the rendering blocks and lines in case the user
// has already clicked the desired blocks (solution)
const checkBlocks = () => {
    if (!enteredRoom) return

    const posIndex = TextHelper.getDungeonsPosIndex()

    const isCreeperAlive = World.getAllEntitiesOfType(net.minecraft.entity.monster.EntityCreeper).filter(a => a.distanceTo(Player.getPlayer()) < 35 && !a.isInvisible())?.[0]

    // Add a check to see if the creeper is still alive so that
    // we can reset everything since this means the puzzle has been completed
    // if (!isCreeperAlive) return reset(false)
    if (!isCreeperAlive) return ticksWithoutCreeper++
    // Reset after 20 ticks since the creeper takes a while to spawn
    if (!isCreeperAlive && ticksWithoutCreeper > 20 || posIndex !== lastDungIndex) return reset(false)

    if (Object.keys(renderBlocks).length === 0) {
        ticksWithoutCreeper = 0
        ChatLib.chat(`${TextHelper.PREFIX} &aCreeper Beams took&f: &6${((Date.now() - enteredRoom) / 1000).toFixed(2)}s`)
        reset(false)

        return
    }

    Object.keys(renderBlocks)?.forEach(idx => {
        const obj = renderBlocks[idx]
        const [ x, y, z ] = obj.coords[0]
        const [ x1, y1, z1 ] = obj.coords[1]

        const block = World.getBlockAt(x, y, z)
        const block1 = World.getBlockAt(x1, y1, z1)

        if (block.type.mcBlock !== net.minecraft.init.Blocks.field_180397_cI && block1.type.mcBlock !== net.minecraft.init.Blocks.field_180397_cI) return

        delete renderBlocks[idx]
    })

    ticksWithoutCreeper = 0
}

// Logic
onPuzzleRotation((rotation, posIdx) => {
    if (enteredRoom || !WorldState.inDungeons() || !config.creeperBeamsSolver) return

    lastDungIndex = posIdx
    renderBlocks = []
    
    const stoneBlock = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.stone, rotation))
    const lanternBlock = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.lantern, rotation))

    if (stoneBlock.type.mcBlock !== net.minecraft.init.Blocks.field_150348_b || lanternBlock.type.mcBlock !== net.minecraft.init.Blocks.field_180398_cJ) return

    ChatLib.chat(`${TextHelper.PREFIX} &aCreeper Beams detected`)

    let solutions = []

    Object.keys(lanterPairs).forEach(key => {
        // we lock the array at 3 elements
        // since this is enough for the player to complete the puzzle
        if (solutions.length >= 4) return

        const value = lanterPairs[key]

        const block = World.getBlockAt(...TextHelper.getRealCoord(value[0], rotation))
        const block1 = World.getBlockAt(...TextHelper.getRealCoord(value[1], rotation))

        if (block.type.mcBlock !== net.minecraft.init.Blocks.field_180398_cJ || block1.type.mcBlock !== net.minecraft.init.Blocks.field_180398_cJ) return

        solutions.push([block, block1])
    })

    solutions.forEach((block, idx) => {
        const [ r, g, b ] = pairColors[idx]

        const [ _, __, ___, x, y, z ] = getBlockBoundingBox(block[0])
        const [ x1, y1, z1 ] = getBlockBoundingBox(block[1])

        renderBlocks[idx] = {
            blocks: [block[0], block[1]],
            coords: [[x, y, z], [x1, y1, z1]],
            rgb: [r, g, b]
        }
    })

    enteredRoom = Date.now()
})

const renderSolutions = () => {
    Object.keys(renderBlocks)?.forEach(idx => {
        const obj = renderBlocks[idx]
        if (!obj) return
        
        const [ block, block1 ] = obj.blocks
        const [ r, g, b ] = obj.rgb

        RenderHelper.filledBlock(block, r, g, b, 80 / 255, false)
        RenderHelper.filledBlock(block1, r, g, b, 80 / 255, false)

        if (!config.creeperBeamsSolverLine) return

        RenderHelper.drawLineThroughPoints(obj.coords, r, g, b, 1, false)
    })
}

// Events
new Event(feature, "tick", checkBlocks, () => WorldState.inDungeons() && config.creeperBeamsSolver)
new Event(feature, "renderWorld", renderSolutions, () => WorldState.inDungeons() && config.creeperBeamsSolver)
new Event(feature, "worldUnload", reset)
Dungeons.onRoomIDEvent((name) => {
    if (!WorldState.inDungeons() || !config.creeperBeamsSolver) return
    if (name === "Creeper Beams") return

    reset()
})

// Starting events
feature.start()