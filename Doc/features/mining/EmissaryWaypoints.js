import { addEvent } from "../../FeatureBase"
import renderBeaconBeam from "../../../BeaconBeam"

const cords = {
    "Emissary Ceanna": [42, 134, 22],
    "Emissary Wilson": [171, 150, 31],
    "Emissary Lilith": [58, 198, -8],
    "Emissary Fraiser": [-132, 174, -50],
    "Emissary Eliza": [-37, 200, -131],
    "Emissary Braum": [89, 198, -92],
    "Emissary Carlton": [-73, 153, -11]
}

addEvent("emissaryWaypoints", "", register("renderWorld", () => {
    if(!World.isLoaded()) return
    Object.keys(cords).forEach(name => {
        const [ x, y, z ] = cords[name]
        Tessellator.drawString(name, x, y, z, Renderer.WHITE, false, .05, false)
        renderBeaconBeam(x, y, z, 1, 1, 1, 1, true)
    })
}), null, [], "Dwarven Mines", null)