import RenderLib from "../../../RenderLib"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import DungeonsState from "../../shared/Dungeons"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/Text"
import { WorldState } from "../../shared/World"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/BlazeSolver.js

// Constant variables
const feature = new Feature("blazeSolver", "Dungeons", "")
const healthValues = new Map()
const blazeHealthRegex = /^\[Lv15\] Blaze [\d,]+\/([\d,]+)❤$/
const requiredRoomID = new Set(["-60,-204", "-96,-204"])

// Changeable variables
let correctBlazes = []
let coords = []

// Logic
const registerWhen = () => (WorldState.inDungeons() && requiredRoomID.has(DungeonsState.getCurrentRoomID())) && (config.blazeSolverLine || config.blazeSolver)

const scanEntities = () => {
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

        if (!config.blazeSolver) return
        // Render an inner box at the entity
        RenderLib.drawInnerEspBox(x, y, z, 0.6, 1.8, r, g, b, 1, false)
    })

    // Check if coord index 1 exists if not return
    if (!coords[1] || !config.blazeSolverLine) return

    // Render a line towards the next blaze to kill
    RenderHelper.drawLineThroughPoints(
        coords,
        0,
        1,
        0,
        1
    )
}

// Reset variables to their default state
const reset = () => {
    correctBlazes = []
    coords = []
    healthValues.clear()
}

// Events
new Event(feature, "step", scanEntities, registerWhen, 5)
new Event(feature, "renderWorld", renderEntities, () => registerWhen() && correctBlazes)
new Event(feature, "worldUnload", reset)

// Starting events
feature.start()