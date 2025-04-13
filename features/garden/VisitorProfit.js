import AtomxApi from "../../../Atomx/AtomxApi"
import Price from "../../../Atomx/skyblock/Price"
import config from "../../config"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"
import { TextHelper } from "../../shared/TextHelper"
import { onVisitor } from "./GardenEvents"

const editGui = new DraggableGui("visitorProfit").setCommandName("editvisitorProfit")
const visitorsList = new Map()
// Fun regex
const requiredItemsRegex = /^ ([A-z ]+)([\d,]+)?$/
const copperRegex = /^ \+([\d,]+) Copper$/
const rareItemregex = /^ (?:◆)?([\w ]+)$/
const visitorDialogRegex = /^\[NPC\] ([\w\. ]+): (.+)$/

editGui.onDraw(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(`&b${Player.getName()}\n &aEnchanted Life &8x1\n&aProfit&f: &c0 &7(&c0&7)`, 0, 0)
    Renderer.finishDraw()
})

const feat = new Feature("visitorProfitDisplay", "garden")
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
    })

onVisitor((visitorName, acceptButton) => {
    if (!config().visitorProfitDisplay) return

    const currentData = {
        name: visitorName,
        requiredItems: [],
        copperAmount: 0,
        totalPrice: 0,
        profit: 0,
        rareItem: null
    }
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
            ChatLib.chat(`${TextHelper.PREFIX} &aVisitor &b${visitorName.removeFormatting()}&a has &b${rareItemName}`)

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

    visitorsList.set(visitorName.removeFormatting(), currentData)
    feat.update()
})