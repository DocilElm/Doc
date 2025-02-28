import AtomxApi from "../../../Atomx/AtomxApi"
import Dungeons from "../../../Atomx/skyblock/Dungeons"
import config from "../../config"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"

const editGui = new DraggableGui("puzzlesDisplay").setCommandName("editpuzzlesDisplay")
const PuzzleEnums = {
    0: "&6✦",
    1: "&a✔",
    2: "&c✖"
}
const puzzleRegex = AtomxApi.getRegexData()?.Dungeons?.PuzzlesAmount

let puzzles = {}
let puzzleCount = 0

editGui.onDraw(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&d&lPuzzles&f: &65\n&d&lBoulder &6✦\n&d&lThree Weirdos &a✔", 0, 0)
    Renderer.finishDraw()
})

const feat = new Feature("puzzlesDisplay", "catacombs")
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.TABADD, (amount) => {
            puzzleCount = +amount
            feat.update()
        }, puzzleRegex)
    )
    .addSubEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen()) return

            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())
            Renderer.drawStringWithShadow(`&d&lPuzzles&f: ${puzzleCount >= 4 ? "&6" : "&a"}${puzzleCount}\n${Object.values(puzzles).join("\n")}`, 0, 0)
            Renderer.finishDraw()
        }),
        () => puzzleCount !== null
    )
    .onUnregister(() => {
        puzzles = {}
        puzzleCount = 0
    })

Dungeons.onPuzzleEvent((puzzleName, event, failedBy) => {
    if (!config().puzzlesDisplay) return
    
    puzzles[puzzleName] = `&d&l${puzzleName} ${PuzzleEnums[event]} ${failedBy ?? ""}`
})