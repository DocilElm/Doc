import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { RenderHelper } from "../../shared/Render"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/CakeNumbers.js

const slotsClicked = new Map()

let inCroesus = false
let cachedItems = null
let currentPage = null

const feat = new Feature("showCroesusClicks", "dungeon hub")
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.WINDOWOPEN, (name) => {
            inCroesus = name === "Croesus"
            cachedItems = null
            currentPage = null
            feat.update()
        })
    )
    .addEvent(
        new Event(EventEnums.PACKET.CUSTOM.WINDOWCLOSE, () => {
            inCroesus = false
            currentPage = null
            feat.update()
        })
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.WINDOWITEMS, (mcItems) => {
            cachedItems = mcItems.map(it => it && new Item(it))
            const page = cachedItems?.[53]?.getID() === 160 ? "Page1" : cachedItems?.[53]?.getLore()?.[1]?.removeFormatting()?.replace(/ /g, "")

            if (!slotsClicked.has(page)) slotsClicked.set(page, new Map())

            currentPage = slotsClicked.get(page)
            feat.update()
        }),
        () => inCroesus
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.CLIENT.WINDOWCLICK, (_, slot) => {
            if (slot <= 0 || slot >= 44 || currentPage.has(slot)) return
            if (!cachedItems[slot] || cachedItems[slot]?.getID() === 160 || cachedItems[slot]?.getID() === 262) return

            currentPage.set(slot, RenderHelper.getSlotRenderPosition(slot))
        }),
        () => inCroesus && currentPage
    )
    .addSubEvent(
        new Event("renderOverlay", () => {
            if (!currentPage) return

            for (let v of currentPage.values()) {
                let [ x, y ] = v

                Renderer.retainTransforms(true)
                Renderer.translate(x + .5, y, 100)
                Renderer.scale(0.9)
                Renderer.drawRect(Renderer.color(0, 255, 0, 150), 0, 0, 16, 16)
                Renderer.retainTransforms(false)
            }
        }),
        () => inCroesus && currentPage
    )
    .onUnregister(() => {
        slotsClicked.clear()
        inCroesus = false
        cachedItems = null
        currentPage = null
    })