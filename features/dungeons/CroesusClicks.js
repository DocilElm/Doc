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
            feat.update()
        })
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.WINDOWITEMS, (mcItems) => {
            cachedItems = mcItems.map(it => it && new Item(it))
            currentPage = cachedItems?.[53]?.getID() === 160 ? "Page1" : cachedItems?.[53]?.getName()?.getLore()?.[1]?.removeFormatting()?.replace(/ /g, "")
        }),
        () => inCroesus
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.CLIENT.WINDOWCLICK, (_, slot) => {
            if (slot <= 0 || slot >= 44 || slotsClicked.has(slot)) return
            if (!cachedItems[slot] || cachedItems[slot]?.getID() === 160 || cachedItems[slot]?.getID() === 262) return

            slotsClicked.set(`${currentPage}${slot}`, RenderHelper.getSlotRenderPosition(slot))
        }),
        () => inCroesus
    )
    .addSubEvent(
        new Event("renderOverlay", () => {
            for (let v of slotsClicked.values()) {
                let [ x, y ] = v

                Renderer.retainTransforms(true)
                Renderer.translate(x + .5, y, 100)
                Renderer.scale(0.9)
                Renderer.drawRect(Renderer.color(0, 255, 0, 150), 0, 0, 16, 16)
                Renderer.retainTransforms(false)
            }
        }),
        () => inCroesus && slotsClicked.size
    )
    .onUnregister(() => {
        slotsClicked.clear()
        inCroesus = false
        cachedItems = null
        currentPage = null
    })