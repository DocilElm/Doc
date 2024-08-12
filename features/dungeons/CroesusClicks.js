import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/CakeNumbers.js

const slotsClicked = new Set()

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
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.WINDOWITEMS, (mcItems) => {
            cachedItems = mcItems.map(it => it && new Item(it))
            currentPage = cachedItems?.[53]?.getID() === 160 ? "Page1" : cachedItems?.[53]?.getName()?.getLore()?.[1]?.removeFormatting()?.replace(/ /g, "")
        }),
        () => inCroesus
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.CLIENT.WINDOWCLICK, (_, slot) => {
            if (slot <= 0 || slot >= 44) return

            slotsClicked.add(`${currentPage}${slot}`)
        }),
        () => inCroesus
    )
    .addSubEvent(
        new Event("renderSlot", (slot) => {
            if (!slotsClicked.has(`${currentPage}${slot.getIndex()}`)) return

            Renderer.retainTransforms(true)
            Renderer.translate(slot.getDisplayX() + .5, slot.getDisplayY(), 100)
            Renderer.scale(0.9)
            Renderer.drawRect(Renderer.color(0, 255, 0, 150), 0, 0, 16, 16)
            Renderer.retainTransforms(false)
        }),
        () => inCroesus && slotsClicked.size
    )
    .onUnregister(() => {
        slotsClicked.clear()
        inCroesus = false
        cachedItems = null
        currentPage = null
    })