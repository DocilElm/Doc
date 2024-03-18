import { WorldState } from "../../Atomx/skyblock/World"
import { TextHelper } from "./Text"

const listeners = []
const offsetsToCheck = [
    [0, 16],
    [-16, 0],
    [0, -16],
    [16, 0]
]

let lastDungIndex = null
let idxTicks = 0

export const onPuzzleRotation = (fn) => listeners.push(fn)

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

        if (bottomBlock.type.getID() !== 7 || topBlock.type.getID() !== 0) continue
        if (block.type.getID() === 0) continue
    
        // If the rotation has already been set, there is more than one door
        if (rotation !== null) return
    
        rotation = i*90
    }

    return rotation
}

register("tick", () => {
    if (!WorldState.inDungeons()) return

    const posIndex = TextHelper.getDungeonsPosIndex()

    if (posIndex === lastDungIndex && idxTicks >= 20) return
    if (posIndex === lastDungIndex) idxTicks++

    lastDungIndex = posIndex
    idxTicks = 0

    const rotation = getPuzzleRotation()
    if (rotation == null) return

    listeners.forEach(fn => fn(rotation, posIndex))
})

register("worldUnload", () => {
    lastDungIndex = null
    idxTicks = 0
})