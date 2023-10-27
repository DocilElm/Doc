import renderBeaconBeam from "../../../BeaconBeam"
import { Feature } from "../../core/Feature"
import { WorldState } from "../../shared/World"
import { Event } from "../../core/Events"

// Constant variables
const emissaryCoords = {
    "Emissary Ceanna": [42, 134, 22],
    "Emissary Wilson": [171, 150, 31],
    "Emissary Lilith": [58, 198, -8],
    "Emissary Fraiser": [-132, 174, -50],
    "Emissary Eliza": [-37, 200, -131],
    "Emissary Braum": [89, 198, -92],
    "Emissary Carlton": [-73, 153, -11]
}
const feature = new Feature("emissaryWaypoints", "Mining", "")
const requiredWorld = "Dwarven Mines"

// World check
const checkWorld = () => World.isLoaded() && WorldState.getCurrentWorld() === requiredWorld

// Logic
const renderWaypoints = () => {
    Object.keys(emissaryCoords).forEach(name => {
        const [ x, y, z ] = emissaryCoords[name]
        Tessellator.drawString(name, x, y, z, Renderer.WHITE, false, .05, false)
        renderBeaconBeam(x, y, z, 1, 1, 1, 1, true)
    })
}

// Events
new Event(feature, "renderWorld", renderWaypoints, checkWorld)

// Starting events
feature.start()