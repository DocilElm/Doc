import TabListData from "../../../Atomx/skyblock/TabListData"
import { WorldState } from "../../../Atomx/skyblock/World"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import ScalableGui from "../../shared/Scalable"

const feature = new Feature("PestsDisplay", "Garden", "")
const defaultString = `&4&lPests Display\n&cAlive&f: &c&l${Player.getName()}\n&cInfested Plots&f: &c&lnull\n&eSpray&f: &bnull\n&aBonus&f: &6null`
const editGui = new ScalableGui("pestsDisplay", defaultString).setCommand("changepestsdisplay")

// Logic
const registerWhen = () => config.gardenDisplay && WorldState.getCurrentWorld() === "Garden"

const renderString = () => {
    if (!registerWhen() || editGui.isOpen()) return

    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(
        `&4&lPests Display\n&cAlive&f: &c&l${TabListData.getPestsAlive()}\n&cInfested Plots&f: &c&l${TabListData.getInfestedPlots()}\n&eSpray&f: &b${TabListData.getCurrentSpray()}\n&aBonus&f: &6${TabListData.getBonusFortune()}`,
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
        defaultString,
        0,
        0
        )
    Renderer.finishDraw()
})

// Events
new Event(feature, "renderOverlay", renderString, registerWhen)

// Starting events
feature.start()