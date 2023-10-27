import ScalableGui from "../../classes/ScalableGui"
import { Command, Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { WorldState } from "../../shared/World"
import { getJsonDataFromFile, getTime, mathTrunc } from "../../utils/Utils"

// Constant variables
const editGui = new ScalableGui("miningProfit").setCommand("miningProfitDisplay")
const feature = new Feature("gemstonesProfit", "Mining", "")
const requiredWorld = "Crystal Hollows"

// Changeable variables
// make a prices handler class so we dont have to deal with
// stuff like this in the feature's code
let bazaarApi = getJsonDataFromFile("data/Bazaar.json")
let profitMade = 0
let gemstonesMined = {}
let startedMining = null

// World check
const checkWorld = () => World.isLoaded() && WorldState.getCurrentWorld() === requiredWorld

// Default display
editGui.onRender(() => editGui.renderString(`&aSession Profit&r: &6some random number\n&aSession Time&r: &6some random time`))

// Logic
const addGemstoneAmount = (gemstone, amount) => {
    if(!startedMining) startedMining = Date.now()

    profitMade += bazaarApi?.products?.[`FLAWED_${gemstone.toUpperCase()}_GEM`]?.quick_status?.sellPrice*parseInt(amount)
    if(!gemstonesMined[gemstone]) gemstonesMined[gemstone] = 0

    gemstonesMined[gemstone] += parseInt(amount)
}

const renderGemstones = () => {
    if(!startedMining) return

    let stringToDraw = ""

    stringToDraw += `&aSession Profit&r: &6${mathTrunc(profitMade)}\n&aSession Time&r: &6${getTime(startedMining)}\n`

    Object.keys(gemstonesMined).forEach((gems, index) => {
        stringToDraw += `&b${gems}&r: &6${gemstonesMined[gems]}\n`
    })

    editGui.renderString(stringToDraw)
}

// Events
new Event(feature, "onChatPacket", addGemstoneAmount, checkWorld, /^PRISTINE! You found .{1,2} Flawed ([\w]+) Gemstone x([\d]+)!$/)
new Event(feature, "renderOverlay", renderGemstones, checkWorld)
new Command(feature, "rsmsession", () => {
    profitMade = 0
    gemstonesMined = {}
    startedMining = null
})

// Starting events
feature.start()