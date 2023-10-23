import { addEvent } from "../../FeatureBase"
import { onChatPacket } from "../../classes/Events"
import ScalableGui from "../../classes/ScalableGui"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { PREFIX, createDungeonsMeter, createSlayersMeter, data, getJsonDataFromUrl, getScoreboard, isInTab, mathTrunc, setDungeonsMeter, setSlayersMeter } from "../../utils/Utils"

// Constant variables
const DungeonsMeterData = getJsonDataFromUrl("https://raw.githubusercontent.com/DocilElm/Doc/main/JsonData/DungeonsMeterData.json")
const SlayersMeterData = getJsonDataFromUrl("https://raw.githubusercontent.com/DocilElm/Doc/main/JsonData/SlayersMeterData.json")
const editGui = new ScalableGui("rngMeter").setCommand("rngMeterDisplay")
const feature = new Feature("RngMeter", "Misc", "")

// Changeable variabels
let strToDraw = ""
let currValue = null
let addScore = true

// Logic
const makeStrToDraw = (jsonData, dataType, currentValue) => {
    if(!currentValue) return
    currValue = currentValue

    const selectedDrop = data.rngMeter?.[dataType]?.[currentValue]?.selectedDrop
    if(!selectedDrop) return strToDraw = `&cNo Rng selected for &6${currentValue}`

    const score = data.rngMeter[dataType]?.[currentValue]?.score
    const requiredScore = jsonData[currentValue]?.[selectedDrop]?.scoreRequired
    const formatName = jsonData[currentValue]?.[selectedDrop]?.formattedName
    const formatColor = score >= requiredScore ? "&6" : "&7"
    const progress = ((score/requiredScore)*100).toFixed(2)

    strToDraw = `${formatName}&f: ${formatColor}${mathTrunc(score)}&b/&6${mathTrunc(requiredScore)} ${formatColor}(${progress >= 100 ? 100 : progress}%)`
}

const renderHandler = () => {
    if(isInTab("Catacombs")) getScoreboard().forEach(a => {
        if(!/^  The Catacombs \(([\w\d].{1,2})\)$/.test(a)) return
        makeStrToDraw(DungeonsMeterData, "dungeonsData", a.match(/^  The Catacombs \(([\w\d].{1,2})\)$/)[1])
    })
    else getScoreboard().forEach(line => {
        if(!/([\w ]+) [IV]+$/.test(line)) return

        makeStrToDraw(SlayersMeterData, "slayersData", line.match(/([\w ]+) [IV]+$/)[1])
    })

    editGui.renderString(strToDraw)
}

// Events
new Event(feature, "renderOverlay", renderHandler, () => World.isLoaded())

feature.start()

/*
addEvent("RngMeter", "Misc", register("renderOverlay", () => {
    if(!World.isLoaded()) return

    if(isInTab("Catacombs")) getScoreboard().forEach(a => {
        if(!/^  The Catacombs \(([\w\d].{1,2})\)$/.test(a)) return
        makeStrToDraw(DungeonsMeterData, "dungeonsData", a.match(/^  The Catacombs \(([\w\d].{1,2})\)$/)[1])
    })
    else getScoreboard().forEach(line => {
        if(!/([\w ]+) [IV]+$/.test(line)) return

        makeStrToDraw(SlayersMeterData, "slayersData", line.match(/([\w ]+) [IV]+$/)[1])
    })

    editGui.renderString(strToDraw)
}), null, [
    onChatPacket((amount) => {
        setSlayersMeter(currValue, null, parseFloat(amount.replace(/,/g, "")), "score")

        const selectedDrop = data.rngMeter.slayersData[currValue]?.selectedDrop
        if(data.rngMeter.slayersData[currValue]?.score <= SlayersMeterData[currValue]?.[selectedDrop]?.scoreRequired) return

        Client.showTitle("&cRNG Meter Max!", PREFIX, 10, 40, 10)
        World.playSound("random.successful_hit", 1, 1)
    }).setCriteria(/^   RNG Meter \- ([\d,]+) Stored XP$/),
    
    onChatPacket((score, rank) => {
        if(!addScore || !["S", "S+"].includes(rank)) return
    
        const actualScore = rank === "S" ? Math.floor(parseInt(score)*0.7) : parseInt(score)
        const savedScore = data.rngMeter.dungeonsData[currValue]?.score
    
        setDungeonsMeter(currValue, null, savedScore+actualScore, "score")
        addScore = false
    }).setCriteria(/^ *Team Score: (\d+) \(([\w\+]{1,2})\)$/),

    onChatPacket((m, itemName) => {
        if(!currValue || data.rngMeter.dungeonsData[currValue]?.selectedDrop !== itemName) return
    
        createDungeonsMeter(currValue)
    }).setCriteria(/^    (RARE REWARD\! )?(.+)$/),
    onChatPacket((drop) => {
        if(!drop.includes(data.rngMeter.slayersData[currValue]?.selectedDrop)) return

        createSlayersMeter(currValue)
    }).setCriteria(/^[\w ]+ DROP\! \(([\w\d\(\)'◆ ]+)\)(?: \(\+(\d+)% ✯ Magic Find\))?$/),

    onChatPacket(() => {
        const selectedDrop = data.rngMeter.dungeonsData[currValue]?.selectedDrop
        if(data.rngMeter.dungeonsData[currValue]?.score <= DungeonsMeterData[currValue]?.[selectedDrop]?.scoreRequired || !isInTab("Catacombs")) return

        Client.showTitle("&cRNG Meter Max!", PREFIX, 10, 40, 10)
        World.playSound("random.successful_hit", 1, 1)
    }).setCriteria(/^Starting in [\d] seconds\.$/)
])

editGui.onRender(() => editGui.renderString(`§9Bonzo's Staff&f: &70&b/&631,800 &7(0%)`))

register("worldUnload", () => addScore = true)*/