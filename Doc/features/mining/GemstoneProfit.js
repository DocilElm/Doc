import { addEvent } from "../../FeatureBase"
import ScalableGui from "../../classes/ScalableGui"
import { getJsonDataFromFile, getTime, mathTrunc } from "../../utils/Utils"

const editGui = new ScalableGui("miningProfit").setCommand("miningProfitDisplay")

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
        if(!World.isLoaded() || !startedMining) return

        let strToDraw = ""
    
        strToDraw += `&aSession Profit&r: &6${mathTrunc(profitMade)}\n&aSession Time&r: &6${getTime(startedMining)}\n`
    
        Object.keys(gemstonesMined).forEach((gems, index) => {
            strToDraw += `&b${gems}&r: &6${gemstonesMined[gems]}\n`
        })

        editGui.renderString(strToDraw)
    })
], "Crystal Hollows")

editGui.onRender(() => {
    editGui.renderString(`&aSession Profit&r: &6some random number\n&aSession Time&r: &6some random time`)
})

register("command", () => {
    profitMade = 0
    gemstonesMined = {}
    startedMining = null
}).setName("rsmsession")