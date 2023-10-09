import ItemHandler from "../../classes/Items"
import { getSkyblockItemID } from "../../../BloomCore/utils/Utils"
import { mathTrunc, chestNames } from "../../utils/Utils"
import { addEvent } from "../../FeatureBase"
import ScalableGui from "../../classes/ScalableGui"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/dungeonChestProfit/DungeonChestProfit.js

const editGui = new ScalableGui("dungeonProfit").setCommand("dungeonProfitDisplay")
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
        if(!World.isLoaded() || !drawText) return
    
        editGui.renderString(`${drawText}\n&bProfit&f: ${profit}`)
    })
], "Catacombs")

editGui.onRender(() => {
    editGui.renderString(defaultProfit)
})

register("worldUnload", () => {
    openedChests = []
    drawText = null
    profit = 0
})