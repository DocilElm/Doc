import Dungeons from "../../../Atomx/skyblock/Dungeons"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/Text"
import { WorldState } from "../../shared/World"

// Credits: Bloom (@unclaimedbloom6)

// Constant variables
const relativeCoords = {
    ironbar: [ 0, 70, -12 ],
    chest: [ 0, 66, -14 ],
    firstbox: [ -9, 66, -9 ]
}
const feature = new Feature("BoulderSolver", "Dungeons", "")
const solutions = Persistence.getDataFromFileOrLink("BoulderData.json", "https://raw.githubusercontent.com/DocilElm/Doc/main/JsonData/BoulderData.json")?.solutions
const gridBlocks = new Set()

// Changeable variables
let renderBlocks = []
let lastDungIndex = null
let hasSolution = false
let enteredRoomAt = null

// Functions required by the feature
const getBoulderGrid = (rotation) => {
    const [ rx, ry, rz ] = relativeCoords.firstbox
    let str = ""

    for (let z = 0; z <= 15; z += 3) {
        for (let x = 0; x <= 18; x += 3) {
            let block = World.getBlockAt(...TextHelper.getRealCoord([rx + x, ry, rz + z], rotation))

            if (block.type.getID() === 0) str += "0"
            else str += "1"
        }
    }

    return str
}

const reset = () => {
    lastDungIndex = null
    renderBlocks = []
    scanAgain = false
    gridBlocks.clear()
}

// Logic
// big thank unclaimedbloom6 for rotation scanner
const scanBoulder = () => {
    const xIndex = Math.floor((Player.getX() + 200) / 32)
    const zIndex = Math.floor((Player.getZ() + 200) / 32)

    // Save the position as a single number instead of [1, 3] for example
    const posIndex = xIndex * 6 + zIndex

    // Room hasn't changed
    if (posIndex === lastDungIndex || hasSolution) return

    lastDungIndex = posIndex
    renderBlocks = []

    // Entered new room
    const rotation = TextHelper.getPuzzleRotation()

    // Air on all sides, shouldn't happen
    // double "=" because js wants to be funny
    if (rotation == null) return

    // Room detection from here
    const ironbarCoords = TextHelper.getRealCoord(relativeCoords.ironbar, rotation)
    const block = World.getBlockAt(...ironbarCoords)

    if (block.type.mcBlock !== net.minecraft.init.Blocks.field_150411_aY) return

    const theGrid = getBoulderGrid(rotation)
    const currentSolution = solutions[theGrid]

    if (!currentSolution) return ChatLib.chat(`${TextHelper.PREFIX} &cBoulder room variant not found in the data`)

    ChatLib.chat(`${TextHelper.PREFIX} &aBoulder room detected`)
    hasSolution = true

    currentSolution?.forEach(coord => {
        const solutionBlock = World.getBlockAt(...TextHelper.getRealCoord(coord, rotation))

        renderBlocks.push(solutionBlock)
        gridBlocks.add(solutionBlock)
    })

    enteredRoomAt = Date.now()
}

const renderSolutions = () => {
    if (!World.isLoaded() || !renderBlocks.length) return

    // phase enabled cuz you can literally see all the blocks from above
    renderBlocks?.forEach(block => RenderHelper.outlineBlock(
            block,
            0,
            255,
            0,
            255,
            true
            ))
}

const onBlockPlacement = (block) => {
    if (!World.isLoaded() || !WorldState.inDungeons() || !enteredRoomAt) return

    if (block.type.mcBlock === net.minecraft.init.Blocks.field_150486_ae) {
        if (enteredRoomAt) ChatLib.chat(`${TextHelper.PREFIX} &aBoulder took&f: &6${((Date.now() - enteredRoomAt) / 1000).toFixed(2)}s`)

        reset()

        enteredRoomAt = null
        return
    }

    if (block.type.mcBlock === net.minecraft.init.Blocks.field_150444_as || block.type.mcBlock === net.minecraft.init.Blocks.field_150430_aB) {
        let blocksScanned = 0

        gridBlocks.forEach(gBlock => {
            const distance = gBlock.pos.compareTo(block.pos)

            if (distance < 1 && distance > 2) return

            blocksScanned++
        })

        if (blocksScanned < 1) return

        renderBlocks.splice(0, 1)
        
        return
    }
}

// Events
Dungeons.onRoomIDEvent((name) => {
    if (!World.isLoaded() || !config.boulderSolver) return
    if (name === "Boulder" && hasSolution) return

    reset()
})
new Event(feature, "tick", scanBoulder, () => World.isLoaded() && WorldState.inDungeons() && config.boulderSolver && !enteredRoomAt)
new Event(feature, "renderWorld", renderSolutions, () => World.isLoaded() && WorldState.inDungeons() && config.boulderSolver)
new Event(feature, "worldUnload", () => {
    reset()
    hasSolution = false
})
new Event(feature, "onPlayerBlockPlacement", onBlockPlacement)

// Starting events
feature.start()