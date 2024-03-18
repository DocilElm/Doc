import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/Text"
import { WorldState } from "../../shared/World"
import Vector3 from "../../../BloomCore/utils/Vector3"
import config from "../../config"
import { onPuzzleRotation } from "../../shared/PuzzleHandler"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/TeleportMazeSolver.js

// Constant variables
const feature = new Feature("TeleportMazeSolver", "Dungeons", "")
const relativeCoords = {
    endPortal: [0, 69, 3],
    ironBar: [0, 71, 2],
    chest: [0, 70, -5]
}
const teleportpadBlocks = Persistence.getDataFromFileOrLink("TeleportMazeData.json", "https://raw.githubusercontent.com/DocilElm/Doc/main/JsonData/TeleportMazeData.json")?.blocks

// Changeable variables
let solution = {}
let renderBlocks = []
let enteredRoom = null
let chestBlock = null

// Functions required by the feature
const reset = () => {
    renderBlocks = []
    enteredRoom = null
    chestBlock = null
    solution = {}
}

const manhattanDistance = (x, z, x1, z1) => Math.abs(x - x1) + Math.abs(z - z1)

const getPadNear = (x0, z0) => {
    let result = null

    Object.keys(solution)?.forEach(key => {
        const obj = solution[key]

        const [ x, z ] = obj.coord
        const distance = manhattanDistance(x0, z0, x, z)

        if (distance <= 3) return result = obj.idx
    })

    return result
}

const calculateAnglePads = (x0, z0, yaw) => {
    const eyeVector = Vector3.fromPitchYaw(0, yaw)

    renderBlocks = []

    Object.keys(solution)?.forEach(key => {
        const obj = solution[key]

        const [ x, z ] = obj.coord
        const padVector = new Vector3(x + 0.5 - x0, 0, z + 0.5 - z0)
        const angle = eyeVector.getAngleDeg(padVector)

        obj.angle += angle
        renderBlocks.push(obj)
    })

    renderBlocks.sort((a, b) => a.angle - b.angle)
}

// Logic
onPuzzleRotation((rotation, posIdx) => {
    if (enteredRoom || !config.teleportPadSolver) return

    const endPortalBlock = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.endPortal, rotation))
    const ironBarBlock = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.ironBar, rotation))

    if (
        ironBarBlock.type.mcBlock !== net.minecraft.init.Blocks.field_150411_aY ||
        endPortalBlock.type.mcBlock !== net.minecraft.init.Blocks.field_150378_br
        ) return

    ChatLib.chat(`${TextHelper.PREFIX} &aTeleport Maze detected`)

    // Create the pads that are needed for the solver
    teleportpadBlocks.forEach((arr, idx) => {
        const [ x0, y0, z0 ] = arr
        const [ x, y, z ] = TextHelper.getRealCoord([x0, y0, z0], rotation)
        const block = World.getBlockAt(x, y, z)

        solution[idx] = {
            coord: [ x, z ],
            angle: 0,
            block: block,
            blacklisted: false,
            idx: idx
        }
    })

    chestBlock = TextHelper.getRealCoord(relativeCoords.chest, rotation).toString()
    enteredRoom = Date.now()
})

const onPlayerPos = ([x, y, z], yaw) => {
    if (x % 0.5 !== 0 || y !== 69.5 || z % 0.5 !== 0 || !config.teleportPadSolver) return

    const newPad = solution[getPadNear(x, z)]
    const oldPad = solution[getPadNear(Player.getX() - 1, Player.getZ() - 1)]
    
    if (!newPad || !oldPad) return

    newPad.blacklisted = true
    oldPad.blacklisted = true

    calculateAnglePads(x, z, yaw)
}

const onBlockPlacement = (block, arr) => {
    if (!enteredRoom || !config.teleportPadSolver) return

    // Check it like this because the chest block doesnt actually spawn
    // until the player is near it and the rotation is scanned before that
    if (arr?.toString() !== chestBlock) return

    ChatLib.chat(`${TextHelper.PREFIX} &aTeleport Maze took&f: &6${((Date.now() - enteredRoom) / 1000).toFixed(2)}s`)
    reset()
}

const renderSolutions = () => {
    if (!renderBlocks || !renderBlocks[0] || renderBlocks?.[0]?.angle === renderBlocks?.[1]?.angle) return

    renderBlocks?.forEach((obj, idx) => {
        if (idx === 0) return RenderHelper.filledBlock(obj.block, 0, 1, 0, 100 / 255, false)

        if (!obj.blacklisted) return

        RenderHelper.filledBlock(obj.block, 1, 0, 0, 100 / 255, false)
    })
}

// Events
new Event(feature, "onPacketPlayerPosLook", onPlayerPos, () => WorldState.inDungeons() && enteredRoom && config.teleportPadSolver)
new Event(feature, "renderWorld", renderSolutions, () => WorldState.inDungeons() && enteredRoom && config.teleportPadSolver)
new Event(feature, "onPlayerBlockPlacement", onBlockPlacement, () => WorldState.inDungeons() && enteredRoom && config.teleportPadSolver)
new Event(feature, "worldUnload", reset)

// Starting events
feature.start()