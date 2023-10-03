import { addEvent } from "../../FeatureBase"
import { getCroesusProfit, getJsonDataFromFile, mathTrunc, data } from "../../utils/Utils"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/dungeonChestProfit/DungeonChestProfit.js

const editGui = new Gui()
const defaultData = getJsonDataFromFile("data/DefaultCroesusData.json")

let chestItems = {}

addEvent("croesusProfitDisplay", "", register("step", () => {
    if(!World.isLoaded() || !/^[\w ]+ Catacombs - Floor [IVXLCDM]+$/.test(Player.getContainer().getName())) return chestItems = {}

    const container = Player.getContainer()
    const croesusItems = container.getItems().slice(9, 17).filter(a => a && a?.getID() !== 160)

    croesusItems.forEach(item => {
        const itemName = item.getName()
        const itemLore = item.getLore()

        if(chestItems[itemName]) return

        chestItems[itemName] = getCroesusProfit(itemLore)
    })
}).setFps(5), null, [
    register("renderOverlay", () => {
        if(editGui.isOpen()){
            let defStr = ""

            Object.keys(defaultData).forEach(chestName => {
                const chestProfit = defaultData[chestName].profit <= 0 ? `&c${mathTrunc(defaultData[chestName].profit)}` : `&a${mathTrunc(defaultData[chestName].profit)}`
                const items = defaultData[chestName].items
                
                defStr += `\n&b- ${chestName}\n${items.join("\n")}\n&b - Profit&f: ${chestProfit}\n`
            })

            Renderer.translate(data.croesusProfit.x, data.croesusProfit.y)
            Renderer.scale(data.croesusProfit.scale ?? 1)
            Renderer.drawStringWithShadow(`${defStr}`, -10, -5)
            return
        }
        if(!World.isLoaded() || Object.keys(chestItems).length <= 0) return

        let strToDraw = ""
    
        Object.keys(chestItems).forEach(chestName => {
            const chestProfit = chestItems[chestName].profit <= 0 ? `&c${mathTrunc(chestItems[chestName].profit)}` : `&a${mathTrunc(chestItems[chestName].profit)}`
            const items = chestItems[chestName].items
            
            strToDraw += `\n&b- ${chestName}\n${items.join("\n")}\n&b - Profit&f: ${chestProfit}\n`
        })

        Renderer.translate(data.croesusProfit.x, data.croesusProfit.y)
        Renderer.scale(data.croesusProfit.scale ?? 1)
        Renderer.drawStringWithShadow(`${strToDraw}`, -10, -5)
    })
])

register("worldUnload", () => chestItems = {})

register("command", () => {
    editGui.open()
}).setName("croesusProfitDisplay")

register("dragged", (dx, dy, x, y) => {
    if(!editGui.isOpen()) return

    data.croesusProfit.x = x
    data.croesusProfit.y = y
    data.save()
})

register("scrolled", (mx, mr, num) => {
    if(!editGui.isOpen()) return

    if(num === 1) data.croesusProfit.scale += 0.1
    else data.croesusProfit.scale -= 0.1

    data.save()
})