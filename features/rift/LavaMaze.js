import { Event } from "../../core/Event"
import Feature from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"
import { RenderHelper } from "../../shared/Render"

const LavaMazeData = Persistence.getDataFromFileOrLink("LavaMaze.json", "https://raw.githubusercontent.com/DocilElm/Rift/main/Rift/data/LavaMaze.json")

new Feature("lavaMazeRender", "the rift", "mirrorverse")
    .addEvent(
        new Event("renderWorld", () => {
            for (let coord of LavaMazeData) {
                RenderHelper.outlineFilledBlock(
                    World.getBlockAt(coord[0], 51, coord[1]),
                    0, 255, 255, 255
                )
            }
        })
    )