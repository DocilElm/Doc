import Dungeons from "../../../Atomx/skyblock/Dungeons"
import config from "../../config"
import { Event } from "../../core/Event"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"

const editGui = new DraggableGui("puzzlesDisplay").setCommandName("editpuzzlesDisplay")
const PuzzleEnums = {
    0: "&6✦",
    1: "&a✔",
    2: "&c✖"
}

let puzzles = {}

editGui.onDraw(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&d&lPuzzles&f: &65\n&d&lBoulder &6✦\n&d&lThree Weirdos &a✔", 0, 0)
    Renderer.finishDraw()
})

new Feature("puzzlesDisplay", "catacombs")
    .addEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen()) return

            const amount = Dungeons.getPuzzlesAmount()

            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())
            Renderer.drawStringWithShadow(`&d&lPuzzles&f: ${amount >= 4 ? "&6" : "&a"}${amount}\n${Object.values(puzzles).join("\n")}`, 0, 0)
            Renderer.finishDraw()
        })
    )
    .onUnregister(() => puzzles = {})

Dungeons.onPuzzleEvent((puzzleName, event, failedBy) => {
    if (!config().puzzlesDisplay) return
    
    puzzles[puzzleName] = `&d&l${puzzleName} ${PuzzleEnums[event]} ${failedBy ?? ""}`
})