import ItemHandler from "../../classes/Items"
import { getSkyblockItemID } from "../../../BloomCore/utils/Utils"
import { mathTrunc, chestNames, chat, PREFIX, isInTab, data } from "../../utils/Utils"
import { addEvent } from "../../FeatureBase"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/dungeonChestProfit/DungeonChestProfit.js

const editGui = new Gui()
const defaultProfit = [
    `&b- &aExample Item`,
    `&b- &aExample Item &8x25`,
    `&bProfit&f: &a250,000`,
].join("\n")

let openedChests = []
let drawText = null
let profit = 0

addEvent("dungeonProfitDisplay", "Dungeons", register("step", () => {
    if(!World.isLoaded()) return

    const container = Player.getContainer()
    const containerName = container.getName()

    if(!chestNames.has(container.getName()) || !container.getItems()?.[31]) return drawText = null

    const chestPrice = parseInt(container.getItems()?.[31]?.getLore()?.[7]?.removeFormatting()?.match(/^([\d,]+) Coins$/)?.[1]?.replace(/,/g, ""))
    const items = container.getItems().slice(9, 18).filter(a => a && a?.getID() !== 160)

    const value = items.reduce((a, b) => a + new ItemHandler(b).getValue(), 0)
    const eq = value-chestPrice

    profit = eq <= 0 ? `&c${mathTrunc(eq)}` : `&a${mathTrunc(eq)}`
    drawText = items.map(a => getSkyblockItemID(a).startsWith("ENCHANTMENT") ? `&b- ${a.getLore()?.[1]}` : `&b- ${a.getName()}`).join("\n")

    const existingInd = openedChests.findIndex(a => a === containerName)
    if (existingInd !== -1) openedChests.splice(existingInd, 1)

    openedChests.push(containerName)
}).setFps(5), null, [
    register("renderOverlay", () => {
        if(editGui.isOpen()){
            Renderer.translate(data.dungeonProfit.x, data.dungeonProfit.y)
            Renderer.scale(data.dungeonProfit.scale ?? 1)
            Renderer.drawStringWithShadow(defaultProfit, -10, -5)
            return
        }
        if(!World.isLoaded() || !drawText) return
    
        Renderer.translate(data.dungeonProfit.x, data.dungeonProfit.y)
        Renderer.scale(data.dungeonProfit.scale ?? 1)
        Renderer.drawStringWithShadow(`${drawText}\n&bProfit&f: ${profit}`, -10, -5)
    })
], "Catacombs")

register("worldUnload", () => {
    openedChests = []
    drawText = null
    profit = 0
})

register("command", () => {
    if(!isInTab("Catacombs")) return chat(`${PREFIX} &cYou're not in the Catacombs`), Client.currentGui.close()

    editGui.open()
}).setName("dungeonProfitDisplay")

register("dragged", (dx, dy, x, y) => {
    if(!editGui.isOpen()) return

    data.dungeonProfit.x = x
    data.dungeonProfit.y = y
    data.save()
})

register("scrolled", (mx, mr, num) => {
    if(!editGui.isOpen()) return

    if(num === 1) data.dungeonProfit.scale += 0.1
    else data.dungeonProfit.scale -= 0.1

    data.save()
})