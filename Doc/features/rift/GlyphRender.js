import { WorldState } from "../../../Atomx/skyblock/World"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"

// Constant variables
const feature = new Feature("GlyphRender", "Rift", "")
const GlyphLocations = Persistence.getDataFromFile("GlyphLocations.json")
const glyphKeys = Object.keys(GlyphLocations)

// Logic
const renderWorld = () => {
    if (!config.glyphRender) return

    glyphKeys.forEach(key => {
        const [ x, y, z ] = GlyphLocations[key]

        Tessellator.drawString(key, x + 0.5, y, z + 0.5, Renderer.AQUA, false, .05, false)
    })
}

// Events
new Event(feature, "renderWorld", renderWorld, () => WorldState.getCurrentWorld() === "The Rift" && (WorldState.getCurrentArea() === "Dreadfarm" || WorldState.getCurrentArea() === "West Village") && config.glyphRender)

// Starting events
feature.start()