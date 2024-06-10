import { WorldState } from "../../../Atomx/skyblock/World"
import { Command, Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"
import renderBeaconBeam from "../../../BeaconBeam"
import { TextHelper } from "../../shared/Text"
import config from "../../config"

// Constant variables
const feature = new Feature("WoodenButtons", "Rift", "")
const WoodenButtonsData = Persistence.getDataFromFileOrLink("WoodenButtons.json", "https://raw.githubusercontent.com/DocilElm/Rift/main/Rift/data/WoodenButtons.json")
const mainButtonsCoords = [ [-67, 71, -122],[-86, 71, -129],[-115, 72, -103],[-90, 71, -111],[-83, 70, -85],[-106, 78, -95],[-46, 77, -91],[-42, 74, -85],[-33, 72, -85],[-89, 75, -75] ]

// Logic
const renderWorld = () => {
    if (!World.isLoaded() || !config().woodenButtons) return

    WoodenButtonsData.forEach((block, index) => {
        if (Persistence.data.clickedWoodenButtons.some(it => it === block.toString())) return

        Tessellator.drawString(index + 1, block[0] + 0.5, block[1], block[2] + 0.5, Renderer.GREEN, false, .05, false)
    })

    mainButtonsCoords.forEach(btnCoord => {
        renderBeaconBeam(btnCoord[0], btnCoord[1], btnCoord[2], 0, 1, 0, 1, true)
    })
}

const onClick = (block, [x, y, z]) => {
    const coords = [ x, y, z ].toString()
    const idx = WoodenButtonsData.findIndex(it => it.toString() === coords)
    if (idx === -1) return

    ChatLib.chat(`${idx} ${coords}`)

    Persistence.data.clickedWoodenButtons.push(coords)
    Persistence.data.save()
}

// Events
new Event(feature, "renderWorld", renderWorld, () => WorldState.getCurrentWorld() === "The Rift" && (WorldState.getCurrentArea() === "Dreadfarm" || WorldState.getCurrentArea() === "West Village") && config().woodenButtons)
new Event(feature, "onPlayerBlockPlacement", onClick, () => WorldState.getCurrentWorld() === "The Rift" && (WorldState.getCurrentArea() === "Dreadfarm" || WorldState.getCurrentArea() === "West Village") && config().woodenButtons)
new Command(feature, "resetbuttons", () => {
    Persistence.data.clickedWoodenButtons = []
    Persistence.data.save()

    ChatLib.chat(`${TextHelper.PREFIX} &aRemoved all saved buttons`)
})

// Starting events
feature.start()