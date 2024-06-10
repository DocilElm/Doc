import { WorldState } from "../../../Atomx/skyblock/World"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { TextHelper } from "../../shared/Text"

// Constant variables
const feature = new Feature("MushroomTimer", "Rift", "")
const mushroomTime = 4000

// Changeable variables
let startedAt = null
let lookingAtCoords = null

// Logic
const onTick = () => {
    if (!World.isLoaded() || !config().mushroomTimer) return
    if (WorldState.getCurrentArea() !== "Dreadfarm" || TextHelper.getSkyblockItemID(Player.getHeldItem()) !== "FARMING_WAND") {
        startedAt = null
        lookingAtCoords = null

        return
    }

    const lookingAt = Player.lookingAt()
    if (!lookingAt.type || lookingAt.type.mcBlock !== net.minecraft.init.Blocks.field_150338_P) {
        startedAt = null
        lookingAtCoords = null
        
        return
    }
    if (startedAt) return

    startedAt = Date.now()
    lookingAtCoords = [lookingAt.getX(), lookingAt.getY(), lookingAt.getZ()]
}

const renderWorld = () => {
    if (!lookingAtCoords) return

    const remainingTime = Math.max(0, (mushroomTime - (Date.now() - startedAt)) / 1000)
    const color = remainingTime > 1 ? Renderer.RED : Renderer.GREEN

    Tessellator.drawString(`${remainingTime.toFixed(2)}s`, lookingAtCoords[0] + 0.5, lookingAtCoords[1] + 0.5, lookingAtCoords[2] + 0.5, color, false, .05, false)
}

// Events
new Event(feature, "tick", onTick, () => WorldState.getCurrentWorld() === "The Rift" && config().mushroomTimer)
new Event(feature, "renderWorld", renderWorld, () => WorldState.getCurrentWorld() === "The Rift" && startedAt && config().mushroomTimer)
new Event(feature, "worldUnload", () => {
    startedAt = null
    lookingAtCoords = null
})

// Starting events
feature.start()