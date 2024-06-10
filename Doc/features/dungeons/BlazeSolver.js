import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { onPuzzleRotation } from "../../shared/PuzzleHandler"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/Text"
import { WorldState } from "../../shared/World"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/BlazeSolver.js

// Constant variables
const feature = new Feature("blazeSolver", "Dungeons", "")
const healthValues = new Map()
const blazeHealthRegex = /^\[Lv15\] Blaze [\d,]+\/([\d,]+)❤$/
const Blocks = net.minecraft.init.Blocks
const BlockBedrock = Blocks.field_150357_h
const BlockBanner = Blocks.field_180393_cK
const relativeCoords = {
    bannerTop: [-4, 59, -5],
    bedrockTop: [5, 68, -8],
    bannerBottom1: [-3, 69, 10],
    bannerBottom2: [3, 69, 10]
}

// Changeable variables
let inBlaze = false
let correctBlazes = []
let coords = []
let enteredRoom = null
let blazeDone = null
let previousCount = 0

// Logic
onPuzzleRotation((rotation) => {
    if (!(WorldState.inDungeons() && (config().blazeSolverLine || config().blazeSolver))) return

    // Top
    const bannerTop = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.bannerTop, rotation)).type.mcBlock
    const bedrockTop = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.bedrockTop, rotation)).type.mcBlock
    // Bottom
    const bannerBottom1 = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.bannerBottom1, rotation)).type.mcBlock
    const bannerBottom2 = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.bannerBottom2, rotation)).type.mcBlock

    inBlaze = (bannerTop === BlockBanner && bedrockTop === BlockBedrock) || (bannerBottom1 === BlockBanner && bannerBottom2 === BlockBanner)
})

const registerWhen = () => (WorldState.inDungeons() && inBlaze) && (config().blazeSolverLine || config().blazeSolver)

const scanEntities = () => {
    if (blazeDone) return

    // Reset the [correctBlazes] array
    correctBlazes = []
    // Also reset the [coords] array
    coords = []

    // Scan for armor stands in the world
    World.getAllEntitiesOfType(net.minecraft.entity.item.EntityArmorStand).forEach(entity => {
        const name = entity.getName()?.removeFormatting()

        // Check whether the entity matches the regex
        if (!blazeHealthRegex.test(name)) return

        // Get the regex's matches
        const [ _, health ] = name.match(blazeHealthRegex)

        // Set the entity in the map and assign its value as the max health
        healthValues.set(entity, parseInt(health.replace(/,/g, "")))
        // Push the entity to the correct blazes array
        correctBlazes.push(entity)
    })

    // If [correctBlazes] array is empty we return
    if (!correctBlazes) return

    // Sort the array of blazes by their health
    correctBlazes.sort((a, b) => healthValues.get(a) - healthValues.get(b))

    // Clearing the [healthValues] map so we can use it again next tick
    healthValues.clear()

    // Checking whether the chest spawned below or not
    const [ x, z ] = TextHelper.getRoomCenter()

    if (World.getBlockAt(x+1, 118, z).type.getID() !== 4) {
        correctBlazes.reverse()
    }
}

const renderEntities = () => {
    correctBlazes.forEach((entity, index) => {
        const [ x, y, z ] = [entity.getRenderX(), entity.getRenderY()-2, entity.getRenderZ()]
        let [ r, g, b ] = index == 0 ? [0, 1, 0] : index == 1 ? [250 / 255, 250 / 255, 51 / 255] : [1, 1, 1]
        
        // Save coords for the line drawing
        if (index <= 1) coords[index] = [x, y, z]

        if (!config().blazeSolver) return

        // Render a box at the entity
        RenderHelper.drawEntityBoxFilled(x, y, z, 0.6, 1.8, r, g, b, 1)
    })

    // Check if coord index 1 exists if not return
    if (!coords[1] || !config().blazeSolverLine) return

    // Render a line towards the next blaze to kill
    RenderHelper.drawLineThroughPoints(
        coords,
        0,
        1,
        0,
        1,
        false
    )
}

const cancelEntity = (_, __, ___, event) => {
    if (!config().blazeSolver) return

    cancel(event)
}

// Reset variables to their default state
const reset = () => {
    correctBlazes = []
    coords = []
    blazeDone = false
    healthValues.clear()
    enteredRoom = null
}

const scanBlazes = () => {
    if (!registerWhen()) return

    const currentBlazes = World.getAllEntitiesOfType(net.minecraft.entity.item.EntityArmorStand).filter(entity => blazeHealthRegex.test(entity?.getName()?.removeFormatting())).length

    if (currentBlazes === 9) return enteredRoom = Date.now()

    if (currentBlazes <= 0 && enteredRoom && !blazeDone) {
        if (previousCount !== 1) return

        ChatLib.chat(`${TextHelper.PREFIX} &aBlaze took&f: &6${((Date.now() - enteredRoom) / 1000).toFixed(2)}s`)
        if (config().blazeSolverDone) ChatLib.command("pc Blaze Done")

        enteredRoom = null
        blazeDone = true
        correctBlazes = []
        coords = []
        healthValues.clear()

        return
    }

    previousCount = currentBlazes
}

// Events
new Event(feature, "step", scanEntities, registerWhen, 5)
new Event(feature, "tick", scanBlazes, registerWhen)
new Event(feature, "renderWorld", renderEntities, () => registerWhen() && correctBlazes)
new Event(feature, "renderSpecificEntity", cancelEntity, registerWhen, net.minecraft.entity.monster.EntityBlaze)
new Event(feature, "worldUnload", reset)

// Starting events
feature.start()