import config from "../../config"
import { scheduleTask } from "../../core/CustomRegisters"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { onPuzzleRotationExit, onPuzzleScheduledRotation } from "../../shared/PuzzleRoomScanner"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/TextHelper"
import { findBestMove } from "./TicTacToeAlgorithm"

const MCItem = Java.type("net.minecraft.item.Item")
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
    hopper: [4, 71, -3],
    hopper2: [4, 71, 1],
    bedrock: [4, 70, -4],
    chest: [13, 70, -1]
}

let currentBoard = [
    null, null, null,
    null, null, null,
    null, null, null
]
let checkedCoords = []
let currentRotation = null
let mapEntities = []
let bestMove = null
let enteredAt = null
let done = false

const getBoardIdx = (entityX, entityY, entityZ) => {
    const rotatedCoords = TextHelper.rotateCoords(TextHelper.getRelativeCoord([Math.trunc(entityX), Math.trunc(entityY), Math.trunc(entityZ)]), currentRotation)
    let rotatedIdx = relativeCoords.boards.findIndex(f => f.toString() === rotatedCoords.toString())
    // For some reason the coords are sometimes -1 x
    if (rotatedIdx === -1)
        rotatedIdx = relativeCoords.boards.findIndex(f => f.toString() === [rotatedCoords[0] - 1, rotatedCoords[1], rotatedCoords[2]].toString())

    return rotatedIdx
}

const feat = new Feature("tictactoeSolver", "catacombs")
    .addEvent(
        new Event(EventEnums.FORGE.ENTITYJOIN, (mcEntity) => {
            if (done) return

            scheduleTask(() => {
                const itemStack = mcEntity./* getDisplayedItem */func_82335_i()
                if (!itemStack) return

                const item = itemStack./* getItem */func_77973_b()
                if (!item) return

                const id = MCItem./* getIdFromItem */func_150891_b(item)
                // If it's not a map avoid going forward
                if (id !== 358) return

                const mapColors = item./* getMapData */func_77873_a(itemStack, World.getWorld())?./* colors */field_76198_e
                if (!mapColors) return

                const idx = mapColors.indexOf(114)
                if (idx === -1) return

                const status = idx === 2700 ? "X" : "O"
                const [ entityX, entityY, entityZ ] = [
                    mcEntity./* posX */field_70165_t - 0.5,
                    mcEntity./* posY */field_70163_u,
                    mcEntity./* posZ */field_70161_v - 0.5
                ]

                if (checkedCoords.findIndex((it) => it.toString() === [entityX, entityY, entityZ].toString()) !== -1) return
                checkedCoords.push([entityX, entityY, entityZ])

                if (currentRotation !== null) {
                    currentBoard[getBoardIdx(entityX, entityY, entityZ)] = status

                    // Only compute if the AI has moved otherwise, the computing is useless
                    if (status === "X") {
                        const move = findBestMove(currentBoard)
                        const data = relativeCoords.boards[move]
                        if (!data) return
                        bestMove = World.getBlockAt(...TextHelper.getRealCoord(data, currentRotation))
                    }

                    return
                }

                mapEntities.push([entityX, entityY, entityZ, status])
            }, 2)
        }, net.minecraft.entity.item.EntityItemFrame)
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, () => {
            TextHelper.sendPuzzleMsg("Tic Tac Toe", enteredAt)
            done = true
            scheduleTask(() => {
                currentBoard = [
                    null, null, null,
                    null, null, null,
                    null, null, null
                ]
                mapEntities = []
                bestMove = null
                enteredAt = null
                checkedCoords = []
                feat.update()
            }, 2)
        }, /^PUZZLE SOLVED\! \w+ tied Tic Tac Toe\! Good job\!$/),
        () => currentRotation !== null
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, () => {
            scheduleTask(() => {
                currentBoard = [
                    null, null, null,
                    null, null, null,
                    null, null, null
                ]
                mapEntities = []
                bestMove = null
                enteredAt = null
                checkedCoords = []
                feat.update()
            }, 2)
        }, /^PUZZLE FAIL\! \w+ lost Tic Tac Toe\! Yikes\!$/),
        () => currentRotation !== null
    )
    .addSubEvent(
        new Event("renderWorld", () => {
            const color = config().tictactoeSolverBtnColor
            RenderHelper.outlineFilledBlock(bestMove, color[0], color[1], color[2], color[3], false)
        }),
        () => bestMove !== null
    )
    .onUnregister(() => {
        currentBoard = [
            null, null, null,
            null, null, null,
            null, null, null
        ]
        currentRotation = null
        mapEntities = []
        bestMove = null
        enteredAt = null
        done = false
        checkedCoords = []
    })

onPuzzleScheduledRotation((rotation) => {
    const bedrockBlock = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.bedrock, rotation))
    const hopperBlock = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.hopper, rotation))
    const hopperBlock2 = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.hopper2, rotation))

    if (
        bedrockBlock.type.mcBlock !== net.minecraft.init.Blocks./* bedrock */field_150357_h ||
        hopperBlock.type.mcBlock !== net.minecraft.init.Blocks./* hopper */field_150438_bZ ||
        hopperBlock2.type.mcBlock !== net.minecraft.init.Blocks./* hopper */field_150438_bZ
        ) return

    currentRotation = rotation
    enteredAt = Date.now()

    if (mapEntities) {
        for (let idx = mapEntities.length - 1; idx >= 0; idx--) {
            let [ x, y, z, status ] = mapEntities[idx]

            currentBoard[getBoardIdx(x, y, z)] = status
            mapEntities.splice(idx, 1)
        }
        const move = findBestMove(currentBoard)
        const data = relativeCoords.boards[move]
        if (!data) return
        bestMove = World.getBlockAt(...TextHelper.getRealCoord(data, currentRotation))
    }
    feat.update()
})

onPuzzleRotationExit(() => {
    currentRotation = null
    currentBoard = [
        null, null, null,
        null, null, null,
        null, null, null
    ]
    bestMove = null
    enteredAt = null

    feat.update()
})