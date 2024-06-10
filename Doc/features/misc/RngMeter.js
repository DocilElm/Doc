import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import DungeonsState from "../../shared/Dungeons"
import { Persistence } from "../../shared/Persistence"
import ScalableGui from "../../shared/Scalable"
import { TextHelper } from "../../shared/Text"
import { WorldState } from "../../shared/World"

// Constant variables
const defaultString = `§9Bonzo's Staff&f: &70&b/&631,800 &7(0%)`
const DungeonsMeterData = Persistence.getDataFromURL("https://raw.githubusercontent.com/DocilElm/Doc/main/JsonData/DungeonsMeterData.json")
const SlayersMeterData = Persistence.getDataFromURL("https://raw.githubusercontent.com/DocilElm/Doc/main/JsonData/SlayersMeterData.json")
const editGui = new ScalableGui("rngMeter", defaultString).setCommand("rngMeterDisplay")
const feature = new Feature("RngMeter", "Misc", "")

// Regex
const storedSlayerXPRegex =     /^   RNG Meter \- ([\d,]+) Stored XP$/
const currentTeamScoreRegex =   /^ *Team Score: (\d+) \(([\w\+]{1,2})\)$/
const currentRewardRegex =      /^    (RARE REWARD\! )?(.+)$/
const currentDroppedItemRegex = /^[\w ]+ DROP\! \(([\w\d\(\)'◆ ]+)\)(?: \(\+(\d+)% ✯ Magic Find\))?$/
const startingDungeonsRegex =   /^Starting in [\d] seconds\.$/

// Changeable variables
let stringToDraw = null
let currentValue = null
let addScore = true

// Logic
const registerWhen = () => World.isLoaded() && config().RngMeter

const makeStringToDraw = (jsonData, dataType, value) => {
    if (!value) return stringToDraw = null

    currentValue = value

    const selectedDrop = Persistence.data.rngMeter?.[dataType]?.[value]?.selectedDrop
    if (!selectedDrop) return stringToDraw = `&cNo Rng selected for &6${value}`

    const score = Persistence.data.rngMeter[dataType]?.[value]?.score
    const requiredScore = jsonData[value]?.[selectedDrop]?.scoreRequired
    const formatName = jsonData[value]?.[selectedDrop]?.formattedName
    const formatColor = score >= requiredScore ? "&6" : "&7"
    const progress = ((score/requiredScore)*100).toFixed(2)

    stringToDraw = `${formatName}&f: ${formatColor}${TextHelper.addCommasTrunc(score)}&b/&6${TextHelper.addCommasTrunc(requiredScore)} ${formatColor}(${progress >= 100 ? 100 : progress}%)`
}

const tickChecks = () => {
    if (WorldState.inDungeons()) return makeStringToDraw(DungeonsMeterData, "dungeonsData", DungeonsState.getCurrentFloor())
    
    WorldState.getScoreboard().forEach(line => {
        if(!/([\w ]+) [IV]+$/.test(line)) return

        makeStringToDraw(SlayersMeterData, "slayersData", line.match(/([\w ]+) [IV]+$/)[1])
    })
}

const renderHandler = () => {
    if (!stringToDraw || editGui.isOpen()) return
    
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(stringToDraw, 0, 0)
    Renderer.finishDraw()
}

const storeSlayerScore = (amount) => {
    if (!currentValue) return
    // Stores the score [amount] to the json file
    Persistence.createDataForMeter(currentValue, parseFloat(amount.replace(/,/g, "")))

    // This is used for the alert whenever the meter is full
    const selectedDrop = Persistence.data.rngMeter.slayersData[currentValue]?.selectedDrop

    if (Persistence.data.rngMeter.slayersData[currentValue]?.score <= SlayersMeterData[currentValue]?.[selectedDrop]?.scoreRequired) return

    Client.showTitle("&cRNG Meter Max!", TextHelper.PREFIX, 10, 40, 10)
    World.playSound("random.successful_hit", 1, 1)
}

const storeTeamScore = (score, rank) => {
    // Check wheather we can add the score or if the rank is [S, S+]
    if (!addScore || !["S", "S+"].includes(rank)) return

    // Checks if it's S or S+ to store the correct score amount per rank
    const actualScore = rank === "S" ? Math.floor(parseInt(score)*0.7) : parseInt(score)
    const savedScore = Persistence.data.rngMeter.dungeonsData[currentValue]?.score

    // Saves the score [score] to json file
    Persistence.createDataForMeter(currentValue, savedScore+actualScore)
    addScore = false
}

const checkCurrentReward = (m, itemName) => {
    // Checks wheather the current value exists or the [itemName] equals to the selected drop
    if (!currentValue || Persistence.data.rngMeter.dungeonsData[currentValue]?.selectedDrop !== itemName) return

    // Removes all of the data in the json file since the meter gets reset
    Persistence.createDataForMeter(currentValue)
}

const checkCurrentDrop = (drop) => {
    // Checks if the [drop] value is equal to the json selected drop
    if (!drop.includes(Persistence.data.rngMeter.slayersData[currentValue]?.selectedDrop)) return

    // Removes all of the data in the json file since the meter gets reset
    Persistence.createDataForMeter(currentValue)
}

const startingDungeonsAlert = () => {
    if (!currentValue || !WorldState.inDungeons()) return
    // Checks if the selected drop's score is equal to the max score
    const selectedDrop = Persistence.data.rngMeter.dungeonsData[currentValue].selectedDrop
    if (Persistence.data.rngMeter.dungeonsData[currentValue].score <= DungeonsMeterData[currentValue][selectedDrop].scoreRequired) return

    // Alerts the player if the meter is max
    Client.showTitle("&cRNG Meter Max!", TextHelper.PREFIX, 10, 40, 10)
    World.playSound("random.successful_hit", 1, 1)
}

// Default display
editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(defaultString, 0, 0)
    Renderer.finishDraw()
})

// Events
new Event(feature, "tick", tickChecks, registerWhen)
new Event(feature, "renderOverlay", renderHandler, () => World.isLoaded() && config().RngMeter && stringToDraw)
new Event(feature, "onChatPacket", storeSlayerScore, registerWhen, storedSlayerXPRegex)
new Event(feature, "onChatPacket", storeTeamScore, registerWhen, currentTeamScoreRegex)
new Event(feature, "onChatPacket", checkCurrentReward, registerWhen, currentRewardRegex)
new Event(feature, "onChatPacket", checkCurrentDrop, registerWhen, currentDroppedItemRegex)
new Event(feature, "onChatPacket", startingDungeonsAlert, registerWhen, startingDungeonsRegex)
new Event(feature, "worldUnload", () => addScore = true)

// Start the events
feature.start()