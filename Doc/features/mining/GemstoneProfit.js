import config from "../../config"
import { Command, Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import PriceHelper from "../../shared/Price"
import ScalableGui from "../../shared/Scalable"
import { TextHelper } from "../../shared/Text"
import { WorldState } from "../../shared/World"

// Constant variables
const editGui = new ScalableGui("miningProfit").setCommand("miningProfitDisplay")
const feature = new Feature("gemstonesProfit", "Mining", "")
const requiredWorld = "Crystal Hollows"

// Changeable variables
let profitMade = 0
let gemstonesMined = {}
let startedMining = null
let stringToDraw = null

// Default display
editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&aSession Profit&r: &6some random number\n&aSession Time&r: &6some random time", 0, 0)
    Renderer.finishDraw()
})

// Logic
const registerWhen = () => WorldState.getCurrentWorld() === requiredWorld && config.gemstonesProfit

const addGemstoneAmount = (gemstone, amount) => {
    if (!startedMining) startedMining = Date.now()

    profitMade += PriceHelper.getSellPrice(`FLAWED_${gemstone.toUpperCase()}_GEM`)*parseInt(amount)

    if (!gemstonesMined[gemstone]) gemstonesMined[gemstone] = 0

    gemstonesMined[gemstone] += parseInt(amount)
}

const makeStringToDraw = () => {
    let tempString = ""
    tempString += `&aSession Profit&r: &6${TextHelper.addCommasTrunc(profitMade)}\n&aSession Time&r: &6${TextHelper.getTime(startedMining)}\n`

    for (let key in gemstonesMined) {
        tempString += `&b${key}&r: &6${gemstonesMined[key]}\n`
    }

    stringToDraw = tempString
}

const renderGemstones = () => {
    if (!startedMining || !stringToDraw || editGui.isOpen()) return
    
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(stringToDraw, 0, 0)
    Renderer.finishDraw()
}

// Events
new Event(feature, "tick", makeStringToDraw, registerWhen)
new Event(feature, "onChatPacket", addGemstoneAmount, registerWhen, /^PRISTINE! You found .{1,2} Flawed ([\w]+) Gemstone x([\d]+)!$/)
new Event(feature, "renderOverlay", renderGemstones, () => WorldState.getCurrentWorld() === requiredWorld && config.gemstonesProfit && startedMining && stringToDraw)
new Command(feature, "rsmsession", () => {
    profitMade = 0
    gemstonesMined = {}
    startedMining = null
})

// Starting events
feature.start()