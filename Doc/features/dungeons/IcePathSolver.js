import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/Text"
import { WorldState } from "../../shared/World"

const relativeCoords = {
    lanter: [0, 72, -1],
    hopper: [0, 69, -13],
    ice: [0, 69, -10]
}
const feature = new Feature("IcePathSolver", "Dungeons", "")
const solutions = Persistence.getDataFromFileOrLink("IcePathData.json", "https://raw.githubusercontent.com/DocilElm/Doc/main/JsonData/IcePathData.json")
const blacklistedSolutions = new Set()

let lastDungIndex = null
let renderLines = null
let currentRotation = null
let enteredRoom = null

const reset = (resetIndex = true) => {
    if (resetIndex) lastDungIndex = null
    renderLines = null
    currentRotation = null
    enteredRoom = null
    blacklistedSolutions.clear()
}

const getSolutions = (entity, rotation) => {
    let solution = null

    Object.keys(solutions).forEach((key, idx) => {
        if (blacklistedSolutions.has(key) || idx >= 1 && !blacklistedSolutions.has((idx - 1).toString())) return

        const value = solutions[key]
        const block = World.getBlockAt(...TextHelper.getRealCoord(value[0], rotation))
        
        if (block.pos.distance(entity.getPos()) >= 2) return

        solution = World.getBlockAt(...TextHelper.getRealCoord(value[1], rotation))
        ChatLib.chat(`Adding: ${key}`)
        blacklistedSolutions.add(key)
    })

    return solution
}

const checkBlock = (posIndex) => {
    if (posIndex !== lastDungIndex) return

    const iceBlock = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.ice, currentRotation))
    const silverFish = World.getAllEntitiesOfType(net.minecraft.entity.monster.EntitySilverfish)[0]

    if (silverFish) {
        const solution = getSolutions(silverFish, currentRotation)
        if (!solution) return

        const [ x, y, z, x1, y1, z1 ] = [
            silverFish.getRenderX(),
            silverFish.getRenderY(),
            silverFish.getRenderZ(),
            solution.getX(),
            solution.getY(),
            solution.getZ(),
        ]

        ChatLib.chat(`trying to render ${solution}, ${[x, y, z]}`)

        renderLines = [ [x, y + .5, z], [x1 + .5, y1 + 1.5, z1 + .5] ]
    }

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
    enteredRoom = Date.now()
}

const renderSolutions = () => {
    if (!renderLines) return

    RenderHelper.drawLineThroughPoints(renderLines, 0, 1, 0, 1, false)
}

new Event(feature, "tick", scanIcePath, () => WorldState.inDungeons() && config.icePathSolver)
new Event(feature, "renderWorld", renderSolutions, () => WorldState.inDungeons() && config.icePathSolver)

feature.start()