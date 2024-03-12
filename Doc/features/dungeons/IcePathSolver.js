import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"
import { RenderHelper, getBlockBoundingBox } from "../../shared/Render"
import { TextHelper } from "../../shared/Text"
import { WorldState } from "../../shared/World"

const relativeCoords = {
    lanter: [0, 72, -1],
    hopper: [0, 69, -13],
    ice: [0, 69, -10]
}

const feature = new Feature("IcePathSolver", "Dungeons", "")

const solutions = Persistence.getDataFromFileOrLink("IcePathData.json", "https://raw.githubusercontent.com/DocilElm/Doc/main/JsonData/IcePathData.json")

let lastDungIndex = null
let renderLines = []
let currentRotation = null
let enteredRoom = null

const reset = (resetIndex = true) => {
    if (resetIndex) lastDungIndex = null
    renderLines = []
    currentRotation = null
    enteredRoom = null
}

const checkBlock = (posIndex) => {
    if (posIndex !== lastDungIndex) return

    const iceBlock = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.ice, currentRotation))

    // Ice path has not been done
    if (iceBlock.type.getID() !== 0) return

    ChatLib.chat(`${TextHelper.PREFIX} &aIce Path took&f: &6${((Date.now() - enteredRoom) / 1000).toFixed(2)}s`)
    reset(false)
}

const scanIcePath = () => {
    const xIndex = Math.floor((Player.getX() + 200) / 32)
    const zIndex = Math.floor((Player.getZ() + 200) / 32)
    const posIndex = xIndex * 6 + zIndex

    if (enteredRoom) checkBlock(posIndex)

    if (posIndex === lastDungIndex) return

    lastDungIndex = posIndex

    const rotation = TextHelper.getPuzzleRotation()
    if (rotation == null) return

    const lanternBlock = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.lanter, rotation))
    const hopperBlock = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.hopper, rotation))
    const iceBlock = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.ice, rotation))

    if (
        lanternBlock.type.mcBlock !== net.minecraft.init.Blocks.field_180398_cJ ||
        hopperBlock.type.mcBlock !== net.minecraft.init.Blocks.field_150438_bZ || 
        iceBlock.type.mcBlock !== net.minecraft.init.Blocks.field_150432_aD
        ) return

    ChatLib.chat(`${TextHelper.PREFIX} &aIce Path detected`)
    currentRotation = rotation

    Object.keys(solutions).forEach(key => {
        const value = solutions[key]
        const [ _, __, ___, x0, y0, z0 ] = getBlockBoundingBox(World.getBlockAt(...TextHelper.getRealCoord(value[0], rotation)))
        const [ ____, _____, ______, x2, y2, z2 ] = getBlockBoundingBox(World.getBlockAt(...TextHelper.getRealCoord(value[1], rotation)))

        renderLines.push([[x0, y0 + .2, z0], [x2, y2 + .2, z2]])
    })

    enteredRoom = Date.now()
}

const renderSolutions = () => {
    renderLines?.forEach(line => {
        RenderHelper.drawLineThroughPoints(line, 0, 1, 0, 1, false)
    })
}

new Event(feature, "tick", scanIcePath, () => WorldState.inDungeons() && config.icePathSolver)
new Event(feature, "renderWorld", renderSolutions, () => WorldState.inDungeons() && config.icePathSolver)

feature.start()