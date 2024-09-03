import { scheduleTask } from "../core/CustomRegisters"
import { Event } from "../core/Event"
import Feature from "../core/Feature"
import { TextHelper } from "./TextHelper"

const listeners = []
const listenersExit = []
const listenersSch = []
const offsetsToCheck = [
    [0, 16],
    [-16, 0],
    [0, -16],
    [16, 0]
]
const cachedRotations = new Map()

let lastIdx = null

/**
 * - Runs the given function whenever the rotation
 * - is found for the current room
 * @param {(rotation: number, posIdx: number) => void} fn
 * @returns
 */
export const onPuzzleRotation = (fn) => listeners.push(fn)

/**
 * - Runs the given function whenever the rotation
 * - is found for the current room but schedules the task
 * - 2 server ticks after
 * @param {(rotation: number, posIdx: number) => void} fn
 * @returns
 */
export const onPuzzleScheduledRotation = (fn) => listenersSch.push(fn)

/**
 * - Runs the given function whenever the player leaves a room
 * @param {() => void} fn
 * @returns
 */
export const onPuzzleRotationExit = (fn) => listenersExit.push(fn)

// Big thank bloom
const getPuzzleRotation = () => {
    const xIndex = Math.floor((Player.getX() + 200) / 32)
    const zIndex = Math.floor((Player.getZ() + 200) / 32)
    const centerX = xIndex * 32 - 200 + 15
    const centerZ = zIndex * 32 - 200 + 15

    let rotation = null

    for (let i = 0; i < offsetsToCheck.length; i++) {
        let [ dx, dz ] = offsetsToCheck[i]
        let [ rx, ry, rz ] = [ centerX + dx, 68, centerZ + dz ]

        let block = World.getBlockAt(rx, ry, rz)
        let bottomBlock = World.getBlockAt(rx, ry - 1, rz)
        let topBlock = World.getBlockAt(rx, ry + 1, rz)

        // early enter blood with blood door closed
        if (
            bottomBlock.type.getID() === 7 &&
            topBlock.type.getID() === 159 &&
            block.type.getID() !== 0
        ) return i * 90

        if (bottomBlock.type.getID() !== 7 || topBlock.type.getID() !== 0) continue
        if (block.type.getID() === 0) continue
    
        // If the rotation has already been set, there is more than one door
        if (rotation !== null) return
    
        rotation = i*90
    }

    return rotation
}

new Feature("puzzleRoomScanner", "catacombs")
    .addEvent(
        new Event("tick", () => {
            const posIdx = TextHelper.getDungeonsPosIndex()

            if (lastIdx && lastIdx !== posIdx) {
                for (let idx = 0; idx < listenersExit.length; idx++) {
                    listenersExit[idx]()
                }
            }

            if (lastIdx === posIdx) return

            lastIdx = posIdx
            const rotation = cachedRotations.get(posIdx) ?? getPuzzleRotation()
            if (rotation == null) return

            if (!cachedRotations.has(posIdx)) cachedRotations.set(posIdx, rotation)

            for (let idx = 0; idx < listeners.length; idx++) {
                listeners[idx](rotation, posIdx)
            }

            scheduleTask(() => {
                for (let idx = 0; idx < listenersSch.length; idx++) {
                    listenersSch[idx](rotation, posIdx)
                }
            }, 2)
        })
    )
    .onUnregister(() => {
        lastIdx = null
        cachedRotations.clear()
    })