import AtomxApi from "../../../Atomx/AtomxApi"
import Price from "../../../Atomx/skyblock/Price"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"
import { GardenApi } from "../../shared/Persistence"
import { TextHelper } from "../../shared/TextHelper"

const editGui = new DraggableGui("visitorProfit").setCommandName("editvisitorProfit")
const visitorSet = new Set(Object.keys(GardenApi.Visitors))
const visitorsList = new Map()
// Fun regex
const requiredItemsRegex = /^ ([A-z ]+)([\d,]+)?$/
const copperRegex = /^ \+([\d,]+) Copper$/
const rareItemregex = /^ (?:◆)?([\w ]+)$/
const visitorDialogRegex = /^\[NPC\] ([\w\. ]+): (.+)$/

let inVisitor = false

editGui.onDraw(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(`&b${Player.getName()}\n &aEnchanted Life &8x1\n&aProfit&f: &c0 &7(&c0&7)`, 0, 0)
    Renderer.finishDraw()
})

const feat = new Feature("visitorProfitDisplay", "garden")
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.WINDOWOPEN, (title) => {
            inVisitor = visitorSet.has(title)
            feat.update()
        })
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.CUSTOM.WINDOWCLOSE, () => {
            inVisitor = false
            feat.update()
        }),
        () => inVisitor
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.WINDOWITEMS, (items) => {
            // Just in case this happens some day
            if (!items[13] || !items[29]) return

            const visitorSkull = new Item(items[13])
            const isVisitor = /^Offers Accepted: [\d]+$/.test(visitorSkull.getLore()?.[4]?.removeFormatting())
            if (!isVisitor) {
                inVisitor = false
                feat.update()

                return
            }

            const visitorName = visitorSkull.getName().removeFormatting()
            const currentData = {
                name: visitorSkull.getName(),
                requiredItems: [],
                copperAmount: 0,
                totalPrice: 0,
                profit: 0,
                rareItem: null
            }

            const acceptButton = new Item(items[29])
            const acceptLore = acceptButton.getLore()

            for (let idx = 2; idx < acceptLore.length; idx++) {
                let lore = acceptLore[idx].removeFormatting()

                let requiredItemsMatch = lore.match(requiredItemsRegex)
                if (idx < 5 && requiredItemsMatch) {
                    let requiredName = requiredItemsMatch[1].replace(/ x/, "").replace(/ /g, "_").toUpperCase()
                    let amount = Math.floor(requiredItemsMatch[2]) || 1

                    let price = Price.getSellPrice(AtomxApi.getGardenItemID()[requiredName])
                    let totalPrice = price * amount

                    currentData.requiredItems.push(acceptLore[idx])
                    currentData.totalPrice += (totalPrice || 0)

                    continue
                }

                let copperMatch = lore.match(copperRegex)
                if (copperMatch) {
                    currentData.copperAmount = Math.floor(copperMatch[1])

                    continue
                }

                let rareItemMatch = lore.match(rareItemregex)
                if (rareItemMatch && idx > 5) {
                    let rareItemName = rareItemMatch[1].replace(/^ /, "")
                    let rareName = AtomxApi.getGardenRareItems()[rareItemName]

                    if (!rareName) continue

                    currentData.rareItem = rareName
                    ChatLib.chat(`${TextHelper.PREFIX} &aVisitor &b${visitorName}&a had &b${rareItemName}`)

                    continue
                }
            }

            const totalItemPrice = currentData.totalPrice
            const totalCopperPrice = (Price.getSellPrice("ENCHANTMENT_GREEN_THUMB_1") / 1500) * currentData.copperAmount
            currentData.profit = (totalCopperPrice - totalItemPrice)

            if (currentData.rareItem) {
                const rareItemPrice = Price.getSellPrice(currentData.rareItem)
                const currentProfit = currentData.profit <= 0 ? -currentData.profit : +currentData.profit

                currentData.profit = (rareItemPrice - currentProfit)
            }

            visitorsList.set(visitorName, currentData)
            inVisitor = false
            feat.update()
        }),
        () => inVisitor
    )
    .addSubEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen()) return

            let str = ""

            visitorsList.forEach(v => {
                const name = v.name
                const items = v.requiredItems.join("\n")
                const copper = v.copperAmount
                const profit = v.profit
                const profitFormat = profit <= 0 ? "&c" : "&a"
                const rareItem = v.rareItem ? `\n  &e${v.rareItem}` : ""

                str += `\n${name}\n ${items}${rareItem}\n&bProfit&f: ${profitFormat}${TextHelper.addCommasTrunc(profit)} &7(&c${copper}&7)\n`
            })

            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())
            Renderer.drawStringWithShadow(str, 0, 0)
            Renderer.finishDraw()
        }),
        () => visitorsList.size
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, (name) => {
            if (!visitorsList.has(name)) return

            visitorsList.delete(name)
            feat.update()
        }, visitorDialogRegex),
        () => visitorsList.size
    )
    .addSubEvent(
        new Event(EventEnums.STEP, () => {
            if (Player.getX() === Player.getLastX() && Player.getZ() === Player.getLastZ()) return

            World.getAllEntitiesOfType(net.minecraft.entity.item.EntityArmorStand)
                .forEach(it => {
                    if (it.getName().startsWith("§f")) return
                    const name = it.getName()?.removeFormatting()
                    if (!name || !visitorsList.has(name) || it.distanceTo(Player.getPlayer()) < 15) return

                    visitorsList.delete(name)
                    feat.update()
                })
        }, 1),
        () => visitorsList.size
    )
    .onUnregister(() => {
        visitorsList.clear()
        inVisitor = false
    })