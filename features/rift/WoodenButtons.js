import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { addCommand } from "../../shared/Command"
import { Persistence } from "../../shared/Persistence"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/TextHelper"

const WoodenButtonsData = Persistence.getDataFromFileOrLink("WoodenButtons.json", "https://raw.githubusercontent.com/DocilElm/Rift/main/Rift/data/WoodenButtons.json")
const waypoints = [[-67, 71, -122], [-86, 71, -129], [-115, 72, -103], [-90, 71, -111], [-83, 70, -85], [-106, 78, -95], [-46, 77, -91], [-42, 74, -85], [-33, 72, -85], [-89, 75, -75]]

new Feature("woodenButtons", "the rift", ["dreadfarm", "west village"])
    .addEvent(
        new Event("renderWorld", () => {
            for (let coord of waypoints) {
                RenderHelper.renderBeaconBeam(coord[0], coord[1], coord[2], 0, 255, 255, 255, true)
            }

            for (let idx = 0; idx < WoodenButtonsData.length; idx++) {
                let coord = WoodenButtonsData[idx]
                if (Persistence.data.clickedWoodenButtons.some(it => it === coord.toString())) continue
                
                Tessellator.drawString(idx + 1, coord[0] + 0.5, coord[1], coord[2] + 0.5, Renderer.GREEN, false, .05, false)
            }
        })
    )
    .addEvent(
        new Event(EventEnums.PACKET.CLIENT.BLOCKPLACEMENT, (_, coords) => {
            const idx = WoodenButtonsData.findIndex((it) => it.toString() === coords.toString())
            if (idx === -1) return

            Persistence.data.clickedWoodenButtons.push(coords.toString())
        })
    )

addCommand("rsbtn", "Resets the buttons from WoodenButtons feature", () => {
    Persistence.data.clickedWoodenButtons = []
    ChatLib.chat(`${TextHelper.PREFIX} &aRemoved all saved wooden buttons`)
})