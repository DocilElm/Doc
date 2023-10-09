import { addEvent } from "../../FeatureBase"
import config from "../../config"
import { C0EPacketClickWindow, getSlotCenter } from "../../utils/Utils"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/CakeNumbers.js

const getCurrentPage = () => Player.getContainer()?.getItems()?.[53]?.getID() === 160 ? "Page_1" : Player.getContainer()?.getItems()?.[53]?.getLore()?.[1]?.removeFormatting()?.replace(/ /g, "_")

let clickedSlots = {}

addEvent("showCroesusClicks", "", register("packetSent", (packet, event) => {
    const container = Player.getContainer()
    if(container.getName() !== "Croesus") return

    if(!clickedSlots[getCurrentPage()]) clickedSlots[getCurrentPage()] = []

    const slot = packet.func_149544_d()
    if(container.getItems()?.[slot]?.getID() === 160 || container.getItems()?.[slot]?.getID() === 166 || container.getItems()?.[slot]?.getID() === 262) return

    if(clickedSlots[getCurrentPage()].some(a => a === slot)) return

    clickedSlots[getCurrentPage()].push(slot)
}).setFilteredClass(C0EPacketClickWindow), null, [
    register("renderOverlay", () => {
        if(!World.isLoaded() || Player.getContainer().getName() !== "Croesus" || !clickedSlots[getCurrentPage()] || config.croesusClicksMode !== 1) return
    
        clickedSlots[getCurrentPage()].forEach(itemSlot => {
            const [ x, y ] = getSlotCenter(itemSlot)
    
            Renderer.retainTransforms(true)
            Renderer.translate(x-6, y-1, 300)
            Renderer.scale(0.9)
            Renderer.drawRect(Renderer.GREEN, -1, -1, 16, 16)
            Renderer.retainTransforms(false)
        })
    }),

    register("guiRender", (mx, my, gui) => {
        if(!World.isLoaded() || Player.getContainer().getName() !== "Croesus" || !clickedSlots[getCurrentPage()] || config.croesusClicksMode !== 0) return

        clickedSlots[getCurrentPage()].forEach(itemSlot => {
            const [ x, y ] = getSlotCenter(itemSlot)
    
            Renderer.retainTransforms(true)
            Renderer.translate(x-6, y-1, 300)
            Renderer.scale(0.9)
            Renderer.drawRect(Renderer.color(0, 255, 0, 40), -1, -1, 16, 16)
            Renderer.retainTransforms(false)
        })
    })
])

register("worldUnload", () => clickedSlots = {})