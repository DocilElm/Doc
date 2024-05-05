import { WorldState } from "../../../Atomx/skyblock/World"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"
import { RenderHelper } from "../../shared/Render"

// Constant variables
const feature = new Feature("Tubulator", "Rift", "")
const TubulatorData = Persistence.getDataFromFileOrLink("Tubulator.json", "https://raw.githubusercontent.com/DocilElm/Rift/main/Rift/data/Tubulator.json")

// Logic
const renderWorld = () => {
    if (WorldState.getCurrentArea() !== "Mirrorverse") return
    
    TubulatorData.forEach(coord => {
        const block = World.getBlockAt(coord[0], coord[1], coord[2])

        RenderHelper.filledBlock(block, 0, 1, 1, 150 / 255, false)
    })
}

// Events
new Event(feature, "renderWorld", renderWorld, () => WorldState.getCurrentWorld() === "The Rift" && WorldState.getCurrentArea() === "Mirrorverse" && config.tubulatorRender)

// Starting events
feature.start()