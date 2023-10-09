import { addEvent } from "../../FeatureBase"
import ScalableGui from "../../classes/ScalableGui"
import config from "../../config"
import { getCroesusProfit, getJsonDataFromFile, mathTrunc } from "../../utils/Utils"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/dungeonChestProfit/DungeonChestProfit.js

const editGui = new ScalableGui("croesusProfit").setCommand("croesusProfitDisplay")
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
        if(!World.isLoaded() || Object.keys(chestItems).length <= 0) return

        let strToDraw = ""
    
        Object.keys(chestItems).forEach(chestName => {
            const chestProfit = chestItems[chestName].profit <= 0 ? `&c${mathTrunc(chestItems[chestName].profit)}` : `&a${mathTrunc(chestItems[chestName].profit)}`
            const items = chestItems[chestName].items
            
            if(config.croesusProfitMode === 1) return strToDraw += `\n&b- ${chestName}\n&b - Profit&f: ${chestProfit}\n`

            strToDraw += `\n&b- ${chestName}\n${items.join("\n")}\n&b - Profit&f: ${chestProfit}\n`
        })

        editGui.renderString(strToDraw)
    })
])

editGui.onRender(() => {
    let defStr = ""

    Object.keys(defaultData).forEach(chestName => {
        const chestProfit = defaultData[chestName].profit <= 0 ? `&c${mathTrunc(defaultData[chestName].profit)}` : `&a${mathTrunc(defaultData[chestName].profit)}`
        const items = defaultData[chestName].items
        
        defStr += `\n&b- ${chestName}\n${items.join("\n")}\n&b - Profit&f: ${chestProfit}\n`
    })

    editGui.renderString(defStr)
})

register("worldUnload", () => chestItems = {})