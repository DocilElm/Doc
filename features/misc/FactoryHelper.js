import { scheduleTask } from "../../core/CustomRegisters"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/TextHelper"

const rabbitSlots = [ 28, 29, 30, 31, 32, 33, 34 ]
const chocolateCostRegex = /Cost ([\d,.]+) Chocolate/
const employedRabbitRegex = /^Rabbit \w+ - \[\d+\] \w+$/
const rabbitUpgradeRegex = /^Rabbit \w+ has been promoted to \[\d+\] \w+\!$/
const notEnoughChocoRegex = /^You don\'t have enough Chocolate\!$/

let renderIdx = null
let inFactory = false

const feat = new Feature("rabbitHelper")
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.WINDOWOPEN, (title) => {
            scheduleTask(() => {
                inFactory = title === "Chocolate Factory"
                feat.update()
            }, 2)
        })
    )
    .addEvent(
        new Event(EventEnums.PACKET.CUSTOM.WINDOWCLOSE, () => {
            inFactory = false
            renderIdx = null
            feat.update()
        })
    )
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, () => {
            renderIdx = null
            inFactory = true
            feat.update()
        }, rabbitUpgradeRegex)
    )
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, () => {
            renderIdx = null
            inFactory = true
            feat.update()
        }, notEnoughChocoRegex)
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.CUSTOM.TICK, () => {
            const container = Player.getContainer()
            const items = container.getItems()

            renderIdx = null

            const chocolatePurse = parseFloat(items?.[13]?.getName()?.removeFormatting()?.replace(/[,.]/g, ""))
            if (!chocolatePurse) return ChatLib.chat(`${TextHelper.PREFIX} &clooks like we couldn't find the chocolates you currently have.`)

            const rabbitData = rabbitSlots.map((it, idx) => {
                const item = items[it]
                if (!item || item.getID() !== 397 || !employedRabbitRegex.test(item.getName().removeFormatting())) return

                const chocoCost = parseFloat(item.getLore().map(lore => lore.removeFormatting()).join(" ").match(chocolateCostRegex)?.[1]?.replace(/[,.]/g, ""))
                const costPerCPS = chocoCost / (idx + 1)

                return {
                    idx: it,
                    costPerCPS,
                    canBuy: chocoCost < chocolatePurse
                }
            })

            const mostEfficient = rabbitData.reduce((a, b) => {
                if (!("idx" in a) && b?.canBuy) return a = b
                if (!("idx" in a)) return a // if we still cannot buy it we keep returning

                if (b?.costPerCPS > a?.costPerCPS || !b?.canBuy) return a

                a = b

                return a
            }, {})

            renderIdx = mostEfficient?.idx
            inFactory = false
            feat.update()
        }),
        () => inFactory && Player.getContainer().getName() === "Chocolate Factory"
    )
    .addSubEvent(
        new Event("renderOverlay", () => {
            if (!Client.isInGui()) return

            let pos = RenderHelper.getSlotRenderPosition(renderIdx)
            if (!pos || pos?.[0] == null) return

            const [ x, y ] = pos

            Renderer.translate(0, 0, 100)
            Renderer.drawRect(
                Renderer.GREEN,
                x,
                y,
                16,
                16
            )
        }),
        () => renderIdx
    )
    .onUnregister(() => {
        renderIdx = null
        inFactory = false
    })