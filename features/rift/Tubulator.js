import { Event } from "../../core/Event"
import Feature from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"
import { RenderHelper } from "../../shared/Render"

const TubulatorData = Persistence.getDataFromFileOrLink("Tubulator.json", "https://raw.githubusercontent.com/DocilElm/Rift/main/Rift/data/Tubulator.json")

new Feature("tubulatorRender", "the rift", "mirrorverse")
    .addEvent(
        new Event("renderWorld", () => {
            for (let coord of TubulatorData) {
                RenderHelper.outlineFilledBlock(
                    World.getBlockAt(coord[0], coord[1], coord[2]),
                    0, 255, 255, 255
                )
            }
        })
    )