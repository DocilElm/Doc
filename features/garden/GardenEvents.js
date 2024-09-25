import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { GardenApi } from "../../shared/Persistence"

const visitorSet = new Set(Object.keys(GardenApi.Visitors))

let inVisitor = false

// Events listeners
const _onVisior = []
const _onVisiorClose = []

/**
 * - Runs the given function whenever a visitor gui is detected
 * - Passing through the Visitor's name and the AcceptButton to
 * - Loop through the lore and get the data from
 * @param {(name: string, acceptButton: Item) => void} fn
 */
export const onVisitor = (fn) => _onVisior.push(fn)

/**
 * - Runs the given function whenever a visitor gui has been closed
 * - Checks whether the last gui was a visitor one and if it was not
 * - it will not run the function
 * @param {() => void} fn
 */
export const onVisitorClose = (fn) => _onVisiorClose.push(fn)

const feat = new Feature("gardenEvents", "garden")
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.WINDOWOPEN, (title) => {
            if (inVisitor && !visitorSet.has(title)) for (let fn of _onVisiorClose) fn()

            inVisitor = visitorSet.has(title)
            feat.update()
        })
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.CUSTOM.WINDOWCLOSE, () => {
            inVisitor = false
            for (let fn of _onVisiorClose) fn()

            feat.update()
        }),
        () => inVisitor
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.WINDOWITEMS, (items) => {
            if (!items[13] || !items[29]) {
                inVisitor = false
                feat.update()
                return
            }

            const visitorSkull = new Item(items[13])
            const isVisitor = /^Offers Accepted: [\d]+$/.test(visitorSkull.getLore()?.[4]?.removeFormatting())
            if (!isVisitor) {
                inVisitor = false
                feat.update()
                return
            }

            const visitorName = visitorSkull.getName()

            for (let fn of _onVisior)
                fn(visitorName, new Item(items[29]))
        }),
        () => inVisitor
    )
    .onUnregister(() => {
        inVisitor = false
    })