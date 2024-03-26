import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/CakeNumbers.js

// Constant variables
const feature = new Feature("croesusClicks", "Dungeons", "")

// Changeable variables
const clickedSlots = new Set()

// Logic
const registerWhen = () => World.isLoaded() && config.showCroesusClicks

// Gets the current arrow item name and if it's a glass pane just default to page 1
const getCurrentPage = () => Player.getContainer()?.getItems()?.[53]?.getID() === 160 ? "Page1" : Player.getContainer()?.getItems()?.[53]?.getLore()?.[1]?.removeFormatting()?.replace(/ /g, "")

const getClickedSlots = (containerName, slotClicked) => {
    if (containerName !== "Croesus" || slotClicked >= 44) return

    const currentPage = getCurrentPage()

    clickedSlots.add(`${currentPage}${slotClicked}`)
}

const renderSlots = (slot) => {
    if (!registerWhen()) return

    const currentPage = getCurrentPage()

    if (Player.getContainer().getName() !== "Croesus" || !clickedSlots.has(`${currentPage}${slot.getIndex()}`)) return

    Renderer.retainTransforms(true)
    Renderer.translate(slot.getDisplayX() + .5, slot.getDisplayY(), 100)
    Renderer.scale(0.9)
    Renderer.drawRect(Renderer.color(0, 255, 0, 150), 0, 0, 16, 16)
    Renderer.retainTransforms(false)
}

// Events
new Event(feature, "onClickWindowPacket", getClickedSlots, registerWhen)
new Event(feature, "renderSlot", renderSlots, () => World.isLoaded() && Player.getContainer()?.getName() === "Croesus")
new Event(feature, "worldUnload", () => clickedSlots.clear())

// Starting events
feature.start()