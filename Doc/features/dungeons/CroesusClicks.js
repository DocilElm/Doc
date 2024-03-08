import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/CakeNumbers.js

// Constant variables
const feature = new Feature("croesusClicks", "Dungeons", "")

// Changeable variables
const clickedSlots = new Map()

// Logic
const registerWhen = () => World.isLoaded() && config.showCroesusClicks

// from BloomCore
const getSlotCenter = (slot) => {
    let x = slot % 9
    let y = Math.floor(slot / 9)
    let renderX = (Renderer.screen.getWidth() / 2) + ((x - 4) * 18)
    let renderY = (Renderer.screen.getHeight() / 2) + ((y - Player.getContainer().getSize() / 18) * 18)

    return [renderX, renderY]
}

// Gets the current arrow item name and if it's a glass pane just default to page 1
const getCurrentPage = () => Player.getContainer()?.getItems()?.[53]?.getID() === 160 ? "Page1" : Player.getContainer()?.getItems()?.[53]?.getLore()?.[1]?.removeFormatting()?.replace(/ /g, "")

const getClickedSlots = (containerName, slotClicked) => {
    if (containerName !== "Croesus" || slotClicked >= 44) return

    const currentPage = getCurrentPage()

    // If the map dosent have the current page name create it and assign an empty array to it
    if (!clickedSlots.has(currentPage)) clickedSlots.set(currentPage, [])
    
    // If the current page's slot clicked is already in the list we return
    if (clickedSlots.get(currentPage).some(listSlot => listSlot === slotClicked)) return

    // Push slot clicked if it dosent exist in the current list
    clickedSlots.get(currentPage).push(slotClicked)
}

const renderOverlay = () => {
    const currentPage = getCurrentPage()

    if (Player.getContainer().getName() !== "Croesus" || !clickedSlots.has(currentPage)) return

    clickedSlots.get(currentPage).forEach(slotClicked => {
        const [ x, y ] = getSlotCenter(slotClicked)
    
        Renderer.retainTransforms(true)
        Renderer.translate(x-6, y-1, 300)
        Renderer.scale(0.9)
        Renderer.drawRect(Renderer.GREEN, -1, -1, 16, 16)
        Renderer.retainTransforms(false)
    })
}

const guiRender = () => {
    const currentPage = getCurrentPage()

    if (Player.getContainer().getName() !== "Croesus" || !clickedSlots.has(currentPage)) return

    clickedSlots.get(currentPage).forEach(slotClicked => {
        const [ x, y ] = getSlotCenter(slotClicked)
    
        Renderer.retainTransforms(true)
        Renderer.translate(x-6, y-1, 100)
        Renderer.scale(0.9)
        Renderer.drawRect(Renderer.color(0, 255, 0, 40), -1, -1, 16, 16)
        Renderer.retainTransforms(false)
    })
}

// Events
new Event(feature, "onClickWindowPacket", getClickedSlots, registerWhen)
new Event(feature, "renderOverlay", renderOverlay, () => World.isLoaded() && Player.getContainer().getName() === "Croesus" && clickedSlots.has(getCurrentPage()) && config.croesusClicksMode === 1)
new Event(feature, "guiRender", guiRender, () => World.isLoaded() && Player.getContainer().getName() === "Croesus" && clickedSlots.has(getCurrentPage()) && config.croesusClicksMode === 0)
new Event(feature, "worldUnload", () => clickedSlots.clear())

// Starting events
feature.start()