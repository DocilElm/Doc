import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { onPuzzleRotation, onPuzzleRotationExit } from "../../shared/PuzzleHandler"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/Text"
import { WorldState } from "../../shared/World"
import { getBestMove } from "./TicTacToeAlgorithm"

const feature = new Feature("TicTacToeSolver", "Dungeons", "")
const relativeCoords = {
    boards: [
        // Top
        [7, 72, -2],
        [7, 72, -1],
        [7, 72, 0],
        // Middle
        [7, 71, -2],
        [7, 71, -1],
        [7, 71, 0],
        // Bottom
        [7, 70, -2],
        [7, 70, -1],
        [7, 70, 0]
    ],
    boardCorners: [
        // These corners are pushed 1 further and 1 backwards than they should
        // so that the AABB scanner can actually take all the entities within it
        // Top left
        [8, 73, -3],
        // Bottom right
        [6, 69, 1]
    ],
    hopper: [4, 71, -3],
    hopper2: [4, 71, 1],
    bedrock: [4, 70, -4],
    chest: [13, 70, -1]
}
const successCriteria = /^PUZZLE SOLVED\! (.{1,16}) tied Tic Tac Toe! Good job\!$/
const failedCriteria = /^PUZZLE FAIL! (.{1,16}) lost Tic Tac Toe! Yikes\!$/

let orBoard = [
    null, null, null,
    null, null, null,
    null, null, null
]
let renderBlocks = []
let enteredRoom = null
let currentRotation = null
let puzzleDone = false

// From BloomCore
// Gets an array of 16,000 map colors from a map item
const getMapColors = (map) => map?.getItem()?.func_77873_a(map.getItemStack(), World.getWorld())?.field_76198_e

const getEntitiesWithin = ([x, y, z], [x1, y1, z1]) => {
    // getEntitiesWithinAABB - Returns all entities of the specified class type which intersect with the AABB. Args: entityClass, aabb
    return World.getWorld().func_72872_a(
        net.minecraft.entity.item.EntityItemFrame,
        new net.minecraft.util.AxisAlignedBB(
            x,
            y,
            z,
            x1,
            y1,
            z1
            )
        )
}

const reset = () => {
    orBoard = [
        null, null, null,
        null, null, null,
        null, null, null
    ]
    renderBlocks = []
    enteredRoom = null
    currentRotation = null
    puzzleDone = false
}

// We try to avoid as much as possible accidentally running this function
// because whenever the board doesn't exist it computes ALOT (crashes game)
const onAiMove = (board) => {
    if (!config().tictactoeSolver || !board || !enteredRoom || currentRotation == null) return

    renderBlocks = []

    const bestMove = getBestMove(board)
    const realCorods = TextHelper.getRealCoord(relativeCoords.boards[bestMove], currentRotation)

    renderBlocks.push(World.getBlockAt(...realCorods))
}

const scanItemFrames = () => {
    if (!config().tictactoeSolver || currentRotation == null || !enteredRoom || !WorldState.inDungeons() || puzzleDone) return

    const [ x, y, z ] = TextHelper.getRealCoord(relativeCoords.boardCorners[0], currentRotation)
    const [ x1, y1, z1 ] = TextHelper.getRealCoord(relativeCoords.boardCorners[1], currentRotation)

    let currentBoard = [
        null, null, null,
        null, null, null,
        null, null, null
    ]

    // Gets the entities within the block1 and block2 AABB
    // then map those to their respective index so the board gets filled correctly
    getEntitiesWithin([x, y, z], [x1, y1, z1]).forEach(entity => {
        const item = entity.func_82335_i()

        if (!item) return

        const itemFrame = new Item(item)
        const colors = getMapColors(itemFrame)

        if (!colors || colors.indexOf(114) === -1) return

        const status = colors.indexOf(114) === 2700 ? "X" : "O"
        const [ entityX, entityY, entityZ ] = [ entity.field_70165_t - 0.5, entity.field_70163_u, entity.field_70161_v - 0.5 ]

        const rotatedCoords = TextHelper.rotateCoords(TextHelper.getRelativeCoord([Math.trunc(entityX), Math.trunc(entityY), Math.trunc(entityZ)]), currentRotation)
        let rotatedIdx = relativeCoords.boards.findIndex(f => f.toString() === rotatedCoords.toString())

        // For some reason the coords are sometimes -1 x
        if (rotatedIdx === -1) rotatedIdx = relativeCoords.boards.findIndex(f => f.toString() === [rotatedCoords[0] - 1, rotatedCoords[1], rotatedCoords[2]].toString())

        currentBoard[rotatedIdx] = status
    })

    // Check all of the board to see if it even exists
    // the user might go inside of tictactoe while it has already been done so we return
    if (!currentBoard.filter(a => a).length) {
        enteredRoom = null
        puzzleDone = true
        ChatLib.chat(`${TextHelper.PREFIX} &cTic Tac Toe already done detected!`)

        return
    }

    // If board isn't null
    if (orBoard) {
        let shouldRun = false

        // Start scanning the differences between old and new board
        for (let cIdx = 0; cIdx < currentBoard.length; cIdx++) {
            let val = currentBoard[cIdx]
            let originalBoardVal = orBoard[cIdx]
            
            if (val === originalBoardVal) continue
    
            // If X has been added to the new one we run the ai move function
            if (val === "X" && originalBoardVal !== "X") {
                shouldRun = true

                break
            }
        }

        if (shouldRun) onAiMove(currentBoard)
        orBoard = currentBoard

        return
    }

    orBoard = currentBoard
    onAiMove(orBoard)
}

onPuzzleRotation((rotation, posIndex) => {
    if (!WorldState.inDungeons() || !config().tictactoeSolver || enteredRoom || puzzleDone) return

    renderBlocks = []

    const bedrockBlock = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.bedrock, rotation))
    const hopperBlock = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.hopper, rotation))
    const hopperBlock2 = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.hopper2, rotation))

    if (
        bedrockBlock.type.mcBlock !== net.minecraft.init.Blocks.field_150357_h ||
        hopperBlock.type.mcBlock !== net.minecraft.init.Blocks.field_150438_bZ ||
        hopperBlock2.type.mcBlock !== net.minecraft.init.Blocks.field_150438_bZ
        ) return

    ChatLib.chat(`${TextHelper.PREFIX} &aTic Tac Toe detected`)
    currentRotation = rotation
    enteredRoom = Date.now()
})

const renderSolution = () => {
    renderBlocks?.forEach(block => RenderHelper.filledBlock(
        block,
        1,
        215 / 255,
        0,
        100 / 255,
        false
    ))
}

const onChatMessage = (name, _, success = false) => {
    if (name !== Player.getName()) return

    if (success) ChatLib.chat(`${TextHelper.PREFIX} &aTic Tac Toe took&f: &6${((Date.now() - enteredRoom) / 1000).toFixed(2)}s`)
    renderBlocks = []
    enteredRoom = null
    puzzleDone = true
}

const onBlockPlacement = (block, [ x, y, z ]) => {
    if (!enteredRoom || !config().tictactoeSolver || currentRotation == null || block.type.getName() !== "Chest") return

    const rotatedCoord = TextHelper.rotateCoords(TextHelper.getRelativeCoord([Math.trunc(x), Math.trunc(y), Math.trunc(z)]), currentRotation)

    if (rotatedCoord.toString() !== relativeCoords.chest.toString()) return

    ChatLib.chat(`${TextHelper.PREFIX} &aTic Tac Toe took&f: &6${((Date.now() - enteredRoom) / 1000).toFixed(2)}s`)
    renderBlocks = []
    enteredRoom = null
}

new Event(feature, "step", scanItemFrames, () => WorldState.inDungeons() && enteredRoom && config().tictactoeSolver, 1)
new Event(feature, "renderWorld", renderSolution, () => WorldState.inDungeons() && config().tictactoeSolver)
new Event(feature, "onChatPacket", (name) => onChatMessage(name, null, true), () => WorldState.inDungeons() && enteredRoom && config().tictactoeSolver, successCriteria)
new Event(feature, "onChatPacket", onChatMessage, () => WorldState.inDungeons() && enteredRoom && config().tictactoeSolver, failedCriteria)
new Event(feature, "onPlayerBlockPlacement", onBlockPlacement)
new Event(feature, "worldUnload", () => {
    reset()
    puzzleDone = false
})
onPuzzleRotationExit(() => {
    if (currentRotation == null) return

    reset()
})

feature.start()