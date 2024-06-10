import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"
import { onPuzzleRotation, onPuzzleRotationExit } from "../../shared/PuzzleHandler"
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
const solutions = Persistence.getDataFromFileOrLink("BoulderDataV2.json", "https://raw.githubusercontent.com/DocilElm/Doc/main/JsonData/BoulderDataV2.json")?.solutions

// Changeable variables
let renderBlocks = []
let clickBlocks = []
let hasSolution = false
let enteredRoomAt = null
let puzzleDone = false

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
    enteredRoomAt = null
    renderBlocks = []
    scanAgain = false
}

// Logic
// big thank unclaimedbloom6 for rotation scanner
onPuzzleRotation((rotation, posIndex) => {
    if (!WorldState.inDungeons() || !config().boulderSolver || enteredRoomAt || puzzleDone) return
    
    // Room detection from here
    const block = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.ironbar, rotation))

    if (block.type.mcBlock !== net.minecraft.init.Blocks.field_150411_aY) return

    const theGrid = getBoulderGrid(rotation)
    const currentSolution = solutions[theGrid]

    if (!currentSolution) return ChatLib.chat(`${TextHelper.PREFIX} &cBoulder room variant not found in the data`)

    ChatLib.chat(`${TextHelper.PREFIX} &aBoulder room detected`)
    hasSolution = true

    currentSolution?.render?.forEach((coord, idx) => {
        const click = currentSolution?.click?.[idx]
        const solutionBlock = World.getBlockAt(...TextHelper.getRealCoord(coord, rotation))

        renderBlocks.push(solutionBlock)
        clickBlocks.push(TextHelper.getRealCoord(click, rotation))
    })

    enteredRoomAt = Date.now()
})

const renderSolutions = () => {
    if (!World.isLoaded() || !renderBlocks.length) return

    renderBlocks?.forEach(block => {
        RenderHelper.filledBlock(
            block,
            0,
            1,
            1,
            80 / 255,
            false
        )

        RenderHelper.outlineBlock(
            block,
            0,
            1,
            1,
            1
        )
    })
}

const onBlockPlacement = (block) => {
    if (!World.isLoaded() || !WorldState.inDungeons() || !enteredRoomAt) return

    if (block.type.mcBlock === net.minecraft.init.Blocks.field_150486_ae) {
        if (enteredRoomAt) ChatLib.chat(`${TextHelper.PREFIX} &aBoulder took&f: &6${((Date.now() - enteredRoomAt) / 1000).toFixed(2)}s`)
        puzzleDone = true

        reset()

        return
    }

    if (!(block.type.mcBlock === net.minecraft.init.Blocks.field_150444_as || block.type.mcBlock === net.minecraft.init.Blocks.field_150430_aB)) return

    if (!clickBlocks.some(it => Math.floor(it[0]) === Math.floor(block.getX()) &&
    Math.floor(it[1]) === Math.floor(block.getY()) &&
    Math.floor(it[2]) === Math.floor(block.getZ()))) return

    renderBlocks.splice(0, 1)
}

// Events
onPuzzleRotationExit(() => {
    if (!enteredRoomAt || puzzleDone) return

    reset()
})
new Event(feature, "renderWorld", renderSolutions, () => World.isLoaded() && WorldState.inDungeons() && config().boulderSolver)
new Event(feature, "worldUnload", () => {
    reset()
    hasSolution = false
    puzzleDone = false
})
new Event(feature, "onPlayerBlockPlacement", onBlockPlacement)

// Starting events
feature.start()