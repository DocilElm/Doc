import { addEvent } from "../../FeatureBase"
import { PREFIX, chat, data, getJsonDataFromFile, getTime, isInTab, mathTrunc } from "../../utils/Utils"

const editGui = new Gui()

let bazaarApi = getJsonDataFromFile("data/Bazaar.json")
let profitMade = 0
let gemstonesMined = {}
let startedMining = null

addEvent("gemstonesProfit", "Mining", register("chat", (gemstone, amount) => {
    if(!startedMining) startedMining = Date.now()

    profitMade += bazaarApi?.products?.[`FLAWED_${gemstone.toUpperCase()}_GEM`]?.quick_status?.sellPrice*parseInt(amount)
    if(!gemstonesMined[gemstone]) gemstonesMined[gemstone] = 0

    gemstonesMined[gemstone] += parseInt(amount)
}).setCriteria(/^PRISTINE! You found .{1,2} Flawed ([\w]+) Gemstone x([\d]+)!$/), null, [
    register("step", () => {
        bazaarApi = getJsonDataFromFile("data/Bazaar.json")
    }).setDelay(60*20),
    
    register("renderOverlay", () => {
        if(editGui.isOpen()) {
            Renderer.translate(data.miningProfit.x, data.miningProfit.y)
            Renderer.scale(data.miningProfit.scale ?? 1)
            Renderer.drawStringWithShadow(`&aSession Profit&r: &6some random number\n&aSession Time&r: &6some random time`, -10, -5)
            Renderer.finishDraw()
            return
        }
        if(!World.isLoaded() || !startedMining) return
    
        Renderer.translate(data.miningProfit.x, data.miningProfit.y)
        Renderer.scale(data.miningProfit.scale ?? 1)
        Renderer.drawStringWithShadow(`&aSession Profit&r: &6${mathTrunc(profitMade)}\n&aSession Time&r: &6${getTime(startedMining)}`, -10, -5)
        Renderer.finishDraw()
    
        Object.keys(gemstonesMined).forEach((gems, index) => {
            Renderer.translate(data.miningProfit.x, data.miningProfit.y)
            Renderer.scale(data.miningProfit.scale ?? 1)
            Renderer.drawStringWithShadow(`\n&b${gems}&r: &6${gemstonesMined[gems]}`, -10, -5+(10*(index+1)))
            Renderer.finishDraw()
        })
    })
], "Crystal Hollows", null)

register("command", () => {
    profitMade = 0
    gemstonesMined = {}
    startedMining = null
}).setName("rsmsession")

register("command", () => {
    if(!isInTab("Crystal Hollows")) return chat(`${PREFIX} &cYou're not in the Crystal Hollows`), Client.currentGui.close()

    editGui.open()
}).setName("miningProfitDisplay")

register("dragged", (dx, dy, x, y) => {
    if (!editGui.isOpen()) return

    data.miningProfit.x = x
    data.miningProfit.y = y
    data.save()
})

register("scrolled", (mx, mr, num) => {
    if (!editGui.isOpen()) return

    if(num === 1) data.miningProfit.scale += 0.1
    else data.miningProfit.scale -= 0.1

    data.save()
})