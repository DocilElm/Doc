import { Event } from "../../core/Event"
import Feature from "../../core/Feature"
import CustomSplits from "../../shared/CustomSplits"
import DraggableGui from "../../shared/DraggableGui"
import Location from "../../shared/Location"
import { Persistence } from "../../shared/Persistence"

const editGui = new DraggableGui("runSplits").setCommandName("editrunSplits")
const RunSplits = Persistence.getDataFromFileOrLink("RunSplits.json", "https://raw.githubusercontent.com/DocilElm/Doc-Data/main/dungeons/RunSplits.json")
const split = new CustomSplits(RunSplits, () => Location.inWorld("catacombs"))
const exampleStr = split.buildExampleStr()

editGui.onDraw(() => {
    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&aRun Splits", 0, 0)
    Renderer.drawStringWithShadow(exampleStr, 0, 10)
    Renderer.retainTransforms(false)
    Renderer.finishDraw()
})

const feat = new Feature("dungeonRunSplits", "catacombs")
    .addEvent(
        new Event("renderOverlay", () => {
            Renderer.retainTransforms(true)
            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())
            Renderer.drawStringWithShadow("&aRun Splits", 0, 0)

            Renderer.drawStringWithShadow(split.buildStr(), 0, 10)

            Renderer.retainTransforms(false)
            Renderer.finishDraw()
        })
    )
    .onUnregister(() => split.reset())

split.getEvents().forEach(it => feat.addEvent(it))