import ScalableGui from "../../classes/ScalableGui"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import DungeonsState from "../../shared/Dungeons"
import { WorldState } from "../../shared/World"
import { PREFIX, createDungeonsMeter, createSlayersMeter, data, getJsonDataFromUrl, getScoreboard, mathTrunc, setDungeonsMeter, setSlayersMeter } from "../../utils/Utils"

// Constant variables
const DungeonsMeterData = getJsonDataFromUrl("https://raw.githubusercontent.com/DocilElm/Doc/main/JsonData/DungeonsMeterData.json")
const SlayersMeterData = getJsonDataFromUrl("https://raw.githubusercontent.com/DocilElm/Doc/main/JsonData/SlayersMeterData.json")
const editGui = new ScalableGui("rngMeter").setCommand("rngMeterDisplay")
const feature = new Feature("RngMeter", "Misc", "")

// Regex
const storedSlayerXPRegex =     /^   RNG Meter \- ([\d,]+) Stored XP$/
const currentTeamScoreRegex =   /^ *Team Score: (\d+) \(([\w\+]{1,2})\)$/
const currentRewardRegex =      /^    (RARE REWARD\! )?(.+)$/
const currentDroppedItemRegex = /^[\w ]+ DROP\! \(([\w\d\(\)'◆ ]+)\)(?: \(\+(\d+)% ✯ Magic Find\))?$/
const startingDungeonsRegex =   /^Starting in [\d] seconds\.$/

// Changeable variables
let stringToDraw = ""
let currentValue = null
let addScore = true

// Logic
const registerWhen = () => World.isLoaded() && config.RngMeter

const makeStringToDraw = (jsonData, dataType, value) => {
    if(!value) return
    currentValue = value

    const selectedDrop = data.rngMeter?.[dataType]?.[value]?.selectedDrop
    if(!selectedDrop) return stringToDraw = `&cNo Rng selected for &6${value}`

    const score = data.rngMeter[dataType]?.[value]?.score
    const requiredScore = jsonData[value]?.[selectedDrop]?.scoreRequired
    const formatName = jsonData[value]?.[selectedDrop]?.formattedName
    const formatColor = score >= requiredScore ? "&6" : "&7"
    const progress = ((score/requiredScore)*100).toFixed(2)

    stringToDraw = `${formatName}&f: ${formatColor}${mathTrunc(score)}&b/&6${mathTrunc(requiredScore)} ${formatColor}(${progress >= 100 ? 100 : progress}%)`
}

const renderHandler = () => {
    if(WorldState.inDungeons()) makeStringToDraw(DungeonsMeterData, "dungeonsData", DungeonsState.getCurrentFloor())
    
    else getScoreboard().forEach(line => {
        if(!/([\w ]+) [IV]+$/.test(line)) return

        makeStringToDraw(SlayersMeterData, "slayersData", line.match(/([\w ]+) [IV]+$/)[1])
    })

    editGui.renderString(stringToDraw)
}

const storeSlayerScore = (amount) => {
    if(!currentValue) return
    // Stores the score [amount] to the json file
    setSlayersMeter(currentValue, null, parseFloat(amount.replace(/,/g, "")), "score")

    // This is used for the alert whenever the meter is full
    const selectedDrop = data.rngMeter.slayersData[currentValue]?.selectedDrop

    if(data.rngMeter.slayersData[currentValue]?.score <= SlayersMeterData[currentValue]?.[selectedDrop]?.scoreRequired) return

    Client.showTitle("&cRNG Meter Max!", PREFIX, 10, 40, 10)
    World.playSound("random.successful_hit", 1, 1)
}

const storeTeamScore = (score, rank) => {
    // Check wheather we can add the score or if the rank is [S, S+]
    if(!addScore || !["S", "S+"].includes(rank)) return

    // Checks if it's S or S+ to store the correct score amount per rank
    const actualScore = rank === "S" ? Math.floor(parseInt(score)*0.7) : parseInt(score)
    const savedScore = data.rngMeter.dungeonsData[currentValue]?.score

    // Saves the score [score] to json file
    setDungeonsMeter(currentValue, null, savedScore+actualScore, "score")
    addScore = false
}

const checkCurrentReward = (m, itemName) => {
    // Checks wheather the current value exists or the [itemName] equals to the selected drop
    if(!currentValue || data.rngMeter.dungeonsData[currentValue]?.selectedDrop !== itemName) return

    // Removes all of the data in the json file since the meter gets reset
    createDungeonsMeter(currentValue)
}

const checkCurrentDrop = (drop) => {
    // Checks if the [drop] value is equal to the json selected drop
    if(!drop.includes(data.rngMeter.slayersData[currentValue]?.selectedDrop)) return

    // Removes all of the data in the json file since the meter gets reset
    createSlayersMeter(currentValue)
}

const startingDungeonsAlert = () => {
    if(!currentValue || !WorldState.inDungeons()) return
    // Checks if the selected drop's score is equal to the max score
    const selectedDrop = data.rngMeter.dungeonsData[currentValue].selectedDrop
    if(data.rngMeter.dungeonsData[currentValue].score <= DungeonsMeterData[currentValue][selectedDrop].scoreRequired) return

    // Alerts the player if the meter is max
    Client.showTitle("&cRNG Meter Max!", PREFIX, 10, 40, 10)
    World.playSound("random.successful_hit", 1, 1)
}

// Default display
editGui.onRender(() => editGui.renderString(`§9Bonzo's Staff&f: &70&b/&631,800 &7(0%)`))

// Events
new Event(feature, "renderOverlay", renderHandler, registerWhen)
new Event(feature, "onChatPacket", storeSlayerScore, registerWhen, storedSlayerXPRegex)
new Event(feature, "onChatPacket", storeTeamScore, registerWhen, currentTeamScoreRegex)
new Event(feature, "onChatPacket", checkCurrentReward, registerWhen, currentRewardRegex)
new Event(feature, "onChatPacket", checkCurrentDrop, registerWhen, currentDroppedItemRegex)
new Event(feature, "onChatPacket", startingDungeonsAlert, registerWhen, startingDungeonsRegex)
new Event(feature, "worldUnload", () => addScore = true)

// Start the events
feature.start()