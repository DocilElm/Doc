import Price from "../../../Atomx/skyblock/Price"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"
import { TextHelper } from "../../shared/TextHelper"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/features/dungeonChestProfit/DungeonChestProfit.js

const editGui = new DraggableGui("dungeonProfit").setCommandName("editdungeonProfit")
const essenceRegex = /^(Undead|Wither) Essence x(\d+)$/
const chestNames = ["Wood Chest", "Gold Chest", "Diamond Chest", "Emerald Chest", "Obsidian Chest", "Bedrock Chest"]
const formattedChest = {
    "Wood Chest": "&fWood Chest",
    "Gold Chest": "&6Gold Chest",
    "Diamond Chest": "&bDiamond Chest",
    "Emerald Chest": "&2Emerald Chest",
    "Obsidian Chest": "&5Obsidian Chest",
    "Bedrock Chest": "&8Bedrock Chest",
}

let inChest = false
let currentChest = null
let chestData = []

const getValue = (item) => {
    if (!item) return 0
    const itemName = item.getName().removeFormatting()

    if (essenceRegex.test(itemName)) {
        let [ _, type, amount ] = itemName.match(essenceRegex)

        return Math.floor(Price.getSellPrice(`ESSENCE_${type}`.toUpperCase()) * Math.floor(amount))
    }

    return Math.floor(Price.getSellPrice(TextHelper.getSkyblockItemID(item))) || 0
}

editGui.onDraw(() => {
    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(`\n&aFree Chest\n&aExample Item &8x25\n&aTotal Profit&f: &a1,000`, 0, 0)
    Renderer.retainTransforms(false)
    Renderer.finishDraw()
})

const feat = new Feature("dungeonProfitDisplay", "catacombs")
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.WINDOWOPEN, (title) => {
            inChest = chestNames.includes(title)
            if (inChest) currentChest = title
            feat.update()
        })
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.WINDOWITEMS, (items) => {
            const fidx = chestData.findIndex(it => it.name.removeFormatting() === currentChest)
            if (fidx !== -1) chestData.splice(fidx, 1)

            if (!items[31]) return
            const chestItem = new Item(items[31])
            const chestLore = chestItem.getLore()

            let chestPrice = Math.floor(chestLore[7]?.removeFormatting()?.replace(/([,]+| Coins)/g, "")) || 0
            chestPrice += (Price.getSellPrice(chestLore[8]?.removeFormatting()?.replace(/ /g, "_")?.toUpperCase()) || 0)

            let data = {
                name: formattedChest[currentChest],
                items: [],
                profit: 0,
                display: ""
            }

            for (let idx = 9; idx < 18; idx++) {
                if (!items[idx]) continue
                let item = new Item(items[idx])
                if (item.getID() === 160) continue

                let itemName = item.getName().removeFormatting() === "Enchanted Book" ? item.getLore()[1] : item.getName()

                data.items.push(`\n${itemName}`)
                data.profit += getValue(item)
            }

            data.profit = data.profit - chestPrice
            let profitColor = data.profit < 0 ? "&c" : "&a"

            data.display = `${data.name}${data.items.join("")}\n&bTotal Profit&f: ${profitColor}${TextHelper.addCommasTrunc(data.profit)}\n\n`

            chestData.push(data)

            inChest = false
            feat.update()
        }),
        () => inChest && currentChest
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.CUSTOM.WINDOWCLOSE, () => {
            const fidx = chestData.findIndex(it => it.name.removeFormatting() === currentChest)
            if (fidx === -1) return

            chestData.splice(fidx, 1)
        }),
        () => inChest
    )
    .addSubEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen()) return

            Renderer.retainTransforms(true)
            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())

            let str = ""

            for (let idx = 0; idx < chestData.length; idx++) {
                str += chestData[idx].display
            }

            Renderer.drawStringWithShadow(str, 0, 0)
            
            Renderer.retainTransforms(false)
            Renderer.finishDraw()
        }),
        () => chestData.length
    )
    .onUnregister(() => {
        chestData = []
        inChest = false
        currentChest = null
    })