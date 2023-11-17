import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import ScalableGui from "../../shared/Scalable"
import TabHelper from "../../shared/Tab"
import { WorldState } from "../../shared/World"

// Constant variables
const feature = new Feature("gardenDisplay", "Garden", "")
const editGui = new ScalableGui("gardenDisplay").setCommand("gardenDisplayLocation")
const requiredWorld = "Garden"

// Logic
const registerWhen = () => config.gardenDisplay && WorldState.getCurrentWorld() === requiredWorld

const renderString = () => {
    if (!registerWhen() || editGui.isOpen()) return

    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(
        `&a&lGarden Display\n&aVisitor in&f: &b${TabHelper.getNextVisitor()}\n&aJacob's contest in&f: &6${TabHelper.getJacobContest()}\n&eOrganic matter&f: &6${TabHelper.getOrganicMatter()}\n&9Fuel&f: &6${TabHelper.getFuel()}\n&aTime Left&f: &b${TabHelper.getTimeLeft()}\n&aStored Compost&f: &6${TabHelper.getStoredCompost()}`,
        0,
        0
        )
    Renderer.finishDraw()
}

// Default display
editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(
        `&a&lGarden Display\n&aVisitor in&f: &b1m 10s\n&aJacob's contest in&f: &69m\n&eOrganic matter&f: &6100k\n&9Fuel&f: &6100k\n&aTime Left&f: &b1m 10s\n&aStored Compost&f: &6100`,
        0,
        0
        )
    Renderer.finishDraw()
})

// Events
new Event(feature, "renderOverlay", renderString, registerWhen)

// Starting events
feature.start()