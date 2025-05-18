import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { onPuzzleRotationExit, onPuzzleScheduledRotation } from "../../shared/PuzzleRoomScanner"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/TextHelper"
import Vec3 from "../../shared/Vec3"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/features/TeleportMazeSolver.js
// pretty much just an entire copy paste since it works well enough

const relativeCoords = {
    endPortal: [0, 69, 3],
    ironBar: [0, 71, 2]
}

let enteredRoom = null
let renderBlocks = []
let cells = null
let minX = null
let minZ = null

class Cell {
    constructor(xidx, zidx) {
        this.xidx = xidx
        this.zidx = zidx

        this.pads = []
    }

    addPad(pad) {
        this.pads.push(pad)
        return this
    }
}

const reset = () => {
    renderBlocks = []
    enteredRoom = null
    cells = null
    minX = null
    minZ = null
}

const manhattanDistance = (x, z, x1, z1) => Math.abs(x - x1) + Math.abs(z - z1)

const getCellAt = (x, z) => {
    if (!cells) return
    if (x < minX || x > minX + 23 || z < minZ || z > minZ + 23) return

    const cx = Math.floor((x - minX) / 8)
    const cz = Math.floor((z - minZ) / 8)

    return cells.find(a => a.xidx == cx && a.zidx == cz)
}

const getPadNear = (x, z) => {
    const cell = getCellAt(x, z)
    if (!cell) return

    for (let pad of cell.pads) {
        let dist = manhattanDistance(x, z, pad.x, pad.z)
        if (dist <= 3) return pad
    }

    return
}

const isPadInStartOrEndCell = (tpPad) => {
    if (cells?.[4]?.pads?.find(it => it === tpPad)) return true

    for (let cell of cells) {
        if (cell.pads.size !== 1 || cell == cells?.[4] || !cell.pads.find(it => it === tpPad)) continue
        return true
    }

    return false
}

const calculateAnglePads = (x0, z0, yaw, feat) => {
    const eyeVector = Vec3.fromPitchYaw(0, yaw)

    renderBlocks = []

    for (let cell of cells) {
        for (let pad of cell.pads) {
            if (isPadInStartOrEndCell(pad) || pad.blacklisted) continue

            let padVec = new Vec3(pad.x + 0.5 - x0, 0, pad.z + 0.5 - z0)
            let angle = eyeVector.getAngleDeg(padVec)
            pad.angle += angle
            renderBlocks.push(pad)
        }
    }

    renderBlocks.sort((a, b) => a.angle - b.angle)
    feat.update()
}

const feat = new Feature("teleportMazeSolver", "catacombs")
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.PLAYERPOSLOOK, ([x, y, z], yaw) => {
            if (x % 0.5 !== 0 || y !== 69.5 || z % 0.5 !== 0) return

            const newPad = getPadNear(x, z)
            const oldPad = getPadNear(Player.getX(), Player.getZ())
            if (!newPad || !oldPad) return

            if (isPadInStartOrEndCell(newPad)) {
                if (renderBlocks.length > 1)
                    TextHelper.sendPuzzleMsg("Teleport Maze", enteredRoom)

                for (let cell of cells) {
                    for (let pad of cell.pads) {
                        pad.blacklisted = false
                        pad.totalAngle = 0
                    }
                }

                reset()
                feat.update()
                return
            }
            newPad.blacklisted = true
            oldPad.blacklisted = true
            newPad.twin = oldPad
            oldPad.twin = newPad

            calculateAnglePads(x, z, yaw, feat)
            feat.update()
        })
    )
    .addSubEvent(
        new Event("renderWorld", () => {
            if (!renderBlocks?.[0] || !cells) return
            RenderHelper.outlineFilledBlock(renderBlocks?.[0]?.block, 0, 255, 0, 100, false)

            for (let cell of cells) {
                for (let pad of cell.pads) {
                    if (!pad.blacklisted) continue
                    RenderHelper.outlineFilledBlock(pad.block, 255, 0, 0, 100, false)
                }
            }
        }),
        () => renderBlocks.length && cells
    )
    .onUnregister(() => reset())

onPuzzleScheduledRotation((rotation) => {
    const endPortalBlock = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.endPortal, rotation))
    const ironBarBlock = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.ironBar, rotation))

    if (
        ironBarBlock.type.mcBlock !== net.minecraft.init.Blocks./* iron_bars */field_150411_aY ||
        endPortalBlock.type.mcBlock !== net.minecraft.init.Blocks./* end_portal_frame */field_150378_br
        ) return

    ChatLib.chat(`${TextHelper.PREFIX} &aTeleport Maze detected`)

    const xidx = Math.floor((Player.getX() + 200) / 32)
    const zidx = Math.floor((Player.getZ() + 200) / 32)
    const cx = xidx * 32 - 200 - 1
    const cz = zidx * 32 - 200 - 1

    let pads = []
    for (let dx = 0; dx <= 31; dx++) {
        for (let dz = 0; dz <= 31; dz++) {
            let x = cx + dx
            let z = cz + dz
            let block = World.getBlockAt(x, 69, z)
            if (!block) continue
            if (block.type.getID() !== 120) continue

            pads.push({
                x: x,
                z: z,
                cx: 0,
                cz: 0,
                angle: 0,
                blacklisted: false,
                block
            })
        }
    }

    const xCoords = pads.map(a => a.x)
    const zCoords = pads.map(a => a.z)

    minX = Math.min(...xCoords)
    minZ = Math.min(...zCoords)

    cells = new Array(9).fill().map((_, i) => new Cell(Math.floor(i / 3), i % 3))

    for (let pad of pads) {
        pad.cx = Math.floor((pad.x - minX) / 8)
        pad.cz = Math.floor((pad.z - minZ) / 8)

        let hash = pad.cx * 3 + pad.cz
        cells[hash].addPad(pad)
    }

    enteredRoom = Date.now()

    feat.update()
})

onPuzzleRotationExit(() => {
    reset()
    feat.update()
})