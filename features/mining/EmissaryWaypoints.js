import { Event } from "../../core/Event"
import Feature from "../../core/Feature"
import renderBeaconBeam from "../../../BeaconBeam"

const emissaryCoords = {
    "Emissary Ceanna": [42, 134, 22],
    "Emissary Wilson": [171, 150, 31],
    "Emissary Lilith": [58, 198, -8],
    "Emissary Fraiser": [-132, 174, -50],
    "Emissary Eliza": [-37, 200, -131],
    "Emissary Braum": [89, 198, -92],
    "Emissary Carlton": [-73, 153, -11]
}

new Feature("emissaryWaypoints", "dwarven mines")
    .addEvent(
        new Event("renderWorld", () => {
            Object.keys(emissaryCoords).forEach(it => {
                const [ x, y, z ] = emissaryCoords[it]

                Tessellator.drawString(it, x, y + 3, z, Renderer.AQUA, false, .05, false)
                renderBeaconBeam(x, y, z, 0, 1, 1, 1, true)
            })
        })
    )