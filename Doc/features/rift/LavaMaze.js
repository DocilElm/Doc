import { WorldState } from "../../../Atomx/skyblock/World"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"
import { RenderHelper } from "../../shared/Render"

// Constant variables
const feature = new Feature("LavaMaze", "Rift", "")
const LavaMazeData = Persistence.getDataFromFileOrLink("LavaMaze.json", "https://raw.githubusercontent.com/DocilElm/Rift/main/Rift/data/LavaMaze.json")

// Logic
const renderWorld = () => {
    if (WorldState.getCurrentArea() !== "Mirrorverse") return
    
    LavaMazeData.forEach(coord => {
        const block = World.getBlockAt(coord[0], 51, coord[1])

        RenderHelper.filledBlock(block, 0, 1, 1, 150 / 255, false)
    })
}

// Events
new Event(feature, "renderWorld", renderWorld, () => WorldState.getCurrentWorld() === "The Rift" && WorldState.getCurrentArea() === "Mirrorverse" && config.lavaMazeRender)

// Starting events
feature.start()