import { addEvent } from "../../FeatureBase"
import { onActionBarPacket, onChatPacket, onScoreboardPacket } from "../../classes/Events"
import ScalableGui from "../../classes/ScalableGui"
import { getChampion, getJsonDataFromFile, mathTrunc } from "../../utils/Utils"

const editGui = new ScalableGui("ghostTracker").setCommand("ghostDisplayLocation")
let bazaarApi = getJsonDataFromFile("data/Bazaar.json")

let oldChampionXp = 0
let oldItemName = null

let sessionKills = 0
let sessionDrops = {}
let sessionMagicFind = 0
let sessionScavenger = 0
let currentCombo = ""

const reset = () => {
    oldChampionXp = 0
    oldItemName = null
    sessionKills = 0
    sessionDrops = {}
    sessionMagicFind = 0
    sessionScavenger = 0
    currentCombo = ""
    bazaarApi = getJsonDataFromFile("data/Bazaar.json")
}

addEvent("ghostTracker", "Tracker", onActionBarPacket((xpAmount, event) => {
    const championXp = parseFloat(getChampion(Player.getHeldItem()))
    if(!championXp || championXp === oldChampionXp) return
    if(!!oldItemName && oldItemName !== Player.getHeldItem()) return oldChampionXp = 0, oldItemName = null

    sessionKills++
    oldChampionXp = championXp
    oldItemName = Player.getHeldItem()
}).setCriteria(/^[\d,]+\/[\d,]+❤.+ \+([\d.,]+) Combat [\(\) \d%\/.,]+ .+$/), null, [
    onChatPacket((drop, mf, event) => {
        if(!sessionDrops[drop]) sessionDrops[drop] = 0
        sessionDrops[drop]++
        sessionMagicFind = mf
    }).setCriteria(/^RARE DROP\! ([\w ]+) \(\+(\d+)% ✯ Magic Find\)$/),
    
    onChatPacket(() => {
        if(!sessionDrops["Death Materialized"]) sessionDrops["Death Materialized"] = 0
    
        sessionDrops["Death Materialized"]++
    }).setCriteria(/^The ghost\'s death materialized 1,000,000 coins from the mists\!$/),
    
    onChatPacket((kills, event, formattedMsg) => {
        const comboKills = parseInt(kills)

        if(sessionKills < comboKills) sessionKills = comboKills

        currentCombo = formattedMsg
    }).setCriteria(/^\+([\d,.]+) Kill Combo?.+$/),
    
    onChatPacket((event, formattedMsg) => {
        currentCombo = formattedMsg
    }).setCriteria(/^Your Kill Combo has expired! You reached a [\d,.]+ Kill Combo!$/),
    
    onScoreboardPacket((msg, event) => {
        if(msg <= 1 || msg >= 10000) return
    
        sessionScavenger = (msg*sessionKills)
    }).setCriteria(/^Purse\: [\d,.]+ \(\+([\d,.]+)\)$/),
    
    register("renderOverlay", () => {
        if(!sessionKills) return
    
        const strToDraw = [
            `&7Ghost Kills&f: &6${sessionKills}`,
            `&bMagic Find&f: &b${sessionMagicFind}✯`,
            `&eScavenger Profit&f: &6${mathTrunc(sessionScavenger)}`,
        ]
    
        let sessionTotalProfit = 0
        Object.keys(sessionDrops).forEach(drop => {
          strToDraw.push(`&9${drop}&f: &6${sessionDrops[drop]}`)
          // ugly
          if(drop === "Death Materialized") return sessionTotalProfit += 1000000*sessionDrops[drop]
          if(drop === "Ghostly Boots") return sessionTotalProfit += 77777*sessionDrops[drop]
    
          sessionTotalProfit += (bazaarApi?.products?.[drop.toUpperCase()]?.quick_status?.sellPrice * sessionDrops[drop])
        })
        strToDraw.push(currentCombo)
        strToDraw.push(`&aTotal Profit&f: &6${mathTrunc(sessionTotalProfit)}`)
    
        editGui.renderString(strToDraw.join("\n"))
    })
], "Dwarven Mines")

editGui.onRender(() => {
    const str = [
        `&7Ghost Kills&f: &610`,
        `&bMagic Find&f: &b10`,
        `&eScavenger Profit&f: &610`,
    ].join("\n")

    editGui.renderString(str)
})

register("worldUnload", () => reset())