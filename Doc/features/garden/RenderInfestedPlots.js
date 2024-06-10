import TabListData from "../../../Atomx/skyblock/TabListData"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"
import { RenderHelper } from "../../shared/Render"
import { WorldState } from "../../shared/World"

// Constant variables
const feature = new Feature("RenderInfestedPlots", "Misc", "")
const PlotsData = Persistence.getDataFromFileOrLink("PlotsData.json", "https://raw.githubusercontent.com/DocilElm/Doc/main/JsonData/PlotsData.json")

// Logic
const drawTopLine = (coord) => {
    RenderHelper.drawLineThroughPoints([
        [Math.floor(coord[0]), 66, Math.floor(coord[1])],
        [Math.floor(coord[0]), 100, Math.floor(coord[1])]
    ], 1, 0, 0, 1, false)
}

const renderWorld = () => {
    if (WorldState.getCurrentWorld() !== "Garden" || !TabListData.getPestsAlive() || !config().renderInfestedPlots) return

    TabListData.getInfestedPlots()?.split(", ")?.forEach(plot => {
        const coord = PlotsData[parseInt(plot)]
        const [ [x, y], [x1, y1], [x2, y2], [x3, y3] ] = [ coord[0], coord[1], coord[2], coord[3] ]

        RenderHelper.drawLineThroughPoints([
            [Math.floor(x), 66, Math.floor(y)],
            [Math.floor(x1), 66, Math.floor(y1)]
        ], 1, 0, 0, 1, false)

        RenderHelper.drawLineThroughPoints([
            [Math.floor(x2), 66, Math.floor(y2)],
            [Math.floor(x3), 66, Math.floor(y3)]
        ], 1, 0, 0, 1, false)

        RenderHelper.drawLineThroughPoints([
            [Math.floor(x1), 66, Math.floor(y1)],
            [Math.floor(x3), 66, Math.floor(y3)]
        ], 1, 0, 0, 1, false)

        RenderHelper.drawLineThroughPoints([
            [Math.floor(x), 66, Math.floor(y)],
            [Math.floor(x2), 66, Math.floor(y2)]
        ], 1, 0, 0, 1, false)

        drawTopLine(coord[0])
        drawTopLine(coord[1])
        drawTopLine(coord[2])
        drawTopLine(coord[3])

        RenderHelper.drawLineThroughPoints([
            [Math.floor(x), 100, Math.floor(y)],
            [Math.floor(x1), 100, Math.floor(y1)]
        ], 1, 0, 0, 1, false)        

        RenderHelper.drawLineThroughPoints([
            [Math.floor(x2), 100, Math.floor(y2)],
            [Math.floor(x3), 100, Math.floor(y3)]
        ], 1, 0, 0, 1, false)

        RenderHelper.drawLineThroughPoints([
            [Math.floor(x1), 100, Math.floor(y1)],
            [Math.floor(x3), 100, Math.floor(y3)]
        ], 1, 0, 0, 1, false)

        RenderHelper.drawLineThroughPoints([
            [Math.floor(x), 100, Math.floor(y)],
            [Math.floor(x2), 100, Math.floor(y2)]
        ], 1, 0, 0, 1, false)
    })
}

// Events
new Event(feature, "renderWorld", renderWorld, () => World.isLoaded() && WorldState.getCurrentWorld() === "Garden" && config().renderInfestedPlots)

// Starting events
feature.start()