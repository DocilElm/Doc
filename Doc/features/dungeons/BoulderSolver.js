import Dungeons from "../../../Atomx/skyblock/Dungeons"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/Text"

// Credits: https://github.com/Skytils/SkytilsMod/blob/1.x/src/main/kotlin/gg/skytils/skytilsmod/features/impl/dungeons/solvers/BoulderSolver.kt

// Constant variables
const BoxState = {
    true: "Empty",
    false: "Filled"
}
const feature = new Feature("BoulderSolver", "Dungeons", "")
const variants = Persistence.getDataFromFile("BoulderData.json")?.variants
const solutions = Persistence.getDataFromFile("BoulderData.json")?.solutions
const colorList = [
    [ 0, 255, 0 ],
    [ 0, 0, 255 ],
    [ 255, 0, 0 ],
    [ 255, 255, 255 ],
    [ 0, 0, 0 ]
]

// Changeable variables
let renderBlocks = []
let currentGrid = {}
let enteredRoomAt = null

// Functions required by the feature
const rotateY = (bp) => bp.func_176746_e()
const opposite = (bp) => bp.func_176734_d()
const offsetInt = (bp, facing, int) => bp.func_177967_a(facing, int)

const reset = () => {
    currentGrid = {}
    renderBlocks = []
}

const getBlockFromDirection = (bp, downRow, rightColumn, direction) => {
    switch (direction) {
        // Right
        case 0:
            return World.getBlockAt(new BlockPos(offsetInt(bp, rightColumn, 1)).down(1))

        // Left
        case 1:
            return World.getBlockAt(new BlockPos(offsetInt(bp, opposite(rightColumn), 1)).down(1))

        // Forward
        case 2:
            return World.getBlockAt(new BlockPos(offsetInt(bp, downRow, 1)).down(1))

        // Backward
        case 3:
            return World.getBlockAt(new BlockPos(offsetInt(bp, opposite(downRow), 1)).down(1))
    }
}

// Logic
const scanBoulder = () => {
    const [ x, z ] = TextHelper.getRoomCenter()

    let rotation = null
    let barPos = null

    net.minecraft.util.EnumFacing.field_176754_o.forEach(horizontal => {
        const offsetBP = offsetInt(new BlockPos(x, 70, z).toMCBlock(), horizontal, 12)
        const hBlock = World.getBlockAt(new BlockPos(offsetBP))

        if (hBlock.type.mcBlock !== net.minecraft.init.Blocks.field_150411_aY) return

        rotation = horizontal
        barPos = offsetBP
    })

    if (!rotation || !barPos) return
    
    const chestBP = new BlockPos(offsetInt(barPos, rotation, 2)).down(4)
    const downRow = opposite(rotation)
    const rightColumn = rotateY(rotation)
    const leftColumn = offsetInt(offsetInt(chestBP.toMCBlock(), downRow, 5), opposite(rightColumn), 9)

    let roomVariant = null

    // Create a grid with the corresponding values for each column/row
    let row = 0

    while (row < 6) {
        let column = 0
        while (column < 7) {
            let current = offsetInt(offsetInt(leftColumn, rightColumn, 3 * column), downRow, 3 * row)
            let currentBlock = World.getBlockAt(new BlockPos(current))

            if (!(column in currentGrid)) currentGrid[column] = {}
            if (!(row in currentGrid)) currentGrid[column][row] = {}

            currentGrid[column][row] = { state: BoxState[currentBlock.type.mcBlock === net.minecraft.init.Blocks.field_150350_a], pos: current }

            column++
        }

        row++
    }

    // Get the current variant basing it off of variants variable
    let i = 0

    while (i < 8) {
        let value = variants[i]
        let valueLength = Object.keys(value).length - 1
        let isRight = true
        let j = 0

        while (j < valueLength) {
            let column = j % 7
            let currRow = Math.floor(j / 7)
            let state = value[j]

            if (currentGrid[column][currRow].state !== state) {
                isRight = false

                break
            }

            j++
        }

        if (isRight) {
            roomVariant = i
            ChatLib.chat(`${TextHelper.PREFIX} &aBoulder room variant detected&f: &6${roomVariant + 1}`)

            break
        }

        i++
    }

    if (roomVariant === null) return ChatLib.chat(`${TextHelper.PREFIX} &cCouldn't detect the current boulder room variant`)

    solutions[roomVariant].forEach(solution => {
        const column = solution[0]
        const row = solution[1]
        const direction = solution[2]
        const blockpos = currentGrid[column][row].pos

        renderBlocks.push(getBlockFromDirection(blockpos, downRow, rightColumn, direction))
    })

    enteredRoomAt = Date.now()
}

const renderSolutions = () => {
    if (!World.isLoaded() || !renderBlocks.length) return

    renderBlocks?.forEach((block, idx) => {
        const [ r, g, b ] = colorList[idx]

        // phase enabled cuz you can literally see all the blocks from above
        RenderHelper.outlineBlock(
            block,
            r,
            g,
            b,
            255,
            true
        )
    })
}

const onBlockPlacement = (block) => {
    if (!World.isLoaded() || !Dungeons.inPuzzle() || Dungeons.getCurrentRoomName() !== "Boulder") return

    if (block.type.mcBlock === net.minecraft.init.Blocks.field_150486_ae) {
        if (enteredRoomAt) ChatLib.chat(`${TextHelper.PREFIX} &aBoulder took&f: &6${((Date.now() - enteredRoomAt) / 1000).toFixed(2)}s`)

        reset()

        return
    }

    if (block.type.mcBlock === net.minecraft.init.Blocks.field_150444_as || block.type.mcBlock === net.minecraft.init.Blocks.field_150430_aB)
        return renderBlocks.splice(0, 1)
}

// Events
Dungeons.onRoomIDEvent((name) => {
    if (!World.isLoaded() || !config.boulderSolver) return
    if (name === "Boulder") return scanBoulder()

    reset()
})
new Event(feature, "renderWorld", renderSolutions, () => World.isLoaded() && Dungeons.inPuzzle() && Dungeons.getCurrentRoomName() === "Boulder" && config.boulderSolver)
new Event(feature, "worldUnload", reset)
new Event(feature, "onPlayerBlockPlacement", onBlockPlacement)

// Starting events
feature.start()