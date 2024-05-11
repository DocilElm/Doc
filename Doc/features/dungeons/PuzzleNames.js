import Dungeons from "../../../Atomx/skyblock/Dungeons"
import { WorldState } from "../../../Atomx/skyblock/World"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import ScalableGui from "../../shared/Scalable"

const feature = new Feature("PuzzleNames", "Misc", "")
const defaultString = `&d&lBoulder &6✦\n&d&lThree Weirdos &a✔`
const editGui = new ScalableGui("puzzleNameDisplay", defaultString).setCommand("editpuzzleNameDisplay")
const PuzzleEnums = {
    0: "&6✦",
    1: "&a✔",
    2: "&c✖"
}

// Changeable variables
const puzzles = new Map()

// Default render
editGui.onRender(() => {
    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(defaultString, 0, 0)
    Renderer.retainTransforms(false)
    Renderer.finishDraw()
})

// Logic
const renderOverlay = () => {
    if (editGui.isOpen()) return

    let i = 0

    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())

    puzzles.forEach(it => {
        Renderer.drawStringWithShadow(it.displayText, 0, i === 0 ? 0 : (10 * i))
        i++
    })

    Renderer.retainTransforms(false)
    Renderer.finishDraw()
}

// Events
new Event(feature, "renderOverlay", renderOverlay, () => World.isLoaded() && WorldState.inDungeons() && config.puzzleNamesDisplay)
new Event(feature, "worldUnload", () => puzzles.clear())
Dungeons.onPuzzleEvent((puzzleName, event, failedBy) => {
    if (!config.puzzleNamesDisplay) return

    puzzles.set(puzzleName, {
        displayText: `&d&l${puzzleName} ${PuzzleEnums[event]} ${failedBy ?? ""}`
    })
})

// Starting events
feature.start()