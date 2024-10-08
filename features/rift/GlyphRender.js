import { Event } from "../../core/Event"
import Feature from "../../core/Feature"

const glyphLocation = [
    ["by the pond below", [-57.5, 70, -95.5]],
    ["in the windmill", [-77.5, 71, -148.5]],
    ["by the water tower", [-27.5, 72, -135.5]],
    ["in the barn", [-51.5, 71.5, -168.5]],
    ["next to a glutton", [-108.5, 70.5, -99.5]],
    ["at the top of the infested house's chimney", [-33.5, 86, -93.5]],
    ["in a lot of cake", [-94.5, 75.5, -85.5]],
    ["in a server room", [-57.5, 78.5, -14.5]]
]

new Feature("glyphRender", "the rift", ["dreadfarm", "west village"])
    .addEvent(
        new Event("renderWorld", () => {
            for (let it of glyphLocation) {
                let [ name, coord ] = it
                Tessellator.drawString(name, coord[0] + 0.5, coord[1], coord[2] + 0.5, Renderer.AQUA, false, .05, false)
            }
        })
    )