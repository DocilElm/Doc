import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import PriceHelper from "../../shared/Price"
import ScalableGui from "../../shared/Scalable"
import { TextHelper } from "../../shared/Text"
import { WorldState } from "../../shared/World"

// Constant variables
const defaultString = [
    `&7Ghost Kills&f: &610`,
    `&bMagic Find&f: &b10`,
    `&eScavenger Profit&f: &610`,
].join("\n")
const editGui = new ScalableGui("ghostTracker", defaultString).setCommand("ghostDisplayLocation")
const feature = new Feature("ghostTracker", "Tracker", "")
const requiredWorld = "Dwarven Mines"
const requiredArea = "The Mist"

// Changeable variables
let oldChampionXp = 0
let oldItemName = null
let sessionKills = 0
let sessionDrops = {}
let sessionMagicFind = 0
let sessionScavenger = 0
let currentCombo = ""

let stringToDraw = null

// Logic
const registerWhen = () => config.ghostTracker && WorldState.getCurrentWorld() === requiredWorld && WorldState.getCurrentArea() === requiredArea

const addKills = (xpAmount) => {
    const championXp = parseFloat(TextHelper.getExtraAttribute(Player.getHeldItem()).champion_combat_xp)

    // If no champion xp exists or champion xp equals to the last saved one
    // we return so we don't double count kills with this
    if (!championXp || championXp === oldChampionXp) return

    // If [oldItemName] exists and it dosen't equal to the current held item
    // we reset some variables so we don't double count the kills with this
    if (oldItemName && oldItemName !== Player.getHeldItem()) {
        oldChampionXp = 0
        oldItemName = null

        return
    }

    sessionKills++
    oldChampionXp = championXp
    oldItemName = Player.getHeldItem()
}

const addDrops = (drop, magicFind) => {
    // If [sessionDrops] is not defined we define it to default 0
    if (!sessionDrops[drop]) sessionDrops[drop] = 0

    sessionDrops[drop]++
    sessionMagicFind = magicFind
}

const addMaterialized = () => {
    if (!sessionDrops["Death Materialized"]) sessionDrops["Death Materialized"] = 0

    sessionDrops["Death Materialized"]++
}

const addKillCombo = (kills, event, formatted) => {
    const comboKills = parseInt(kills)
    
    if (sessionKills < comboKills) sessionKills = comboKills

    currentCombo = formatted
}

const resetKillCombo = (_, formatted) => currentCombo = formatted

const addScavenger = (amount) => {
    if(amount <= 1 || amount >= 10000) return

    sessionScavenger = (amount*sessionKills)
}

const makeStringToDraw = () => {
    if (!sessionKills || !registerWhen()) return stringToDraw = null
    
    stringToDraw = [
        `&7Ghost Kills&f: &6${sessionKills}`,
        `&bMagic Find&f: &b${sessionMagicFind}✯`,
        `&eScavenger Profit&f: &6${TextHelper.addCommasTrunc(sessionScavenger)}`,
    ]

    let sessionTotalProfit = 0

    Object.keys(sessionDrops).forEach(drop => {

        stringToDraw.push(`&9${drop}&f: &6${sessionDrops[drop]}`)

      // ugly
      if(drop === "Death Materialized") return sessionTotalProfit += 1000000*sessionDrops[drop]
      if(drop === "Ghostly Boots") return sessionTotalProfit += 77777*sessionDrops[drop]

      sessionTotalProfit += (PriceHelper.getSellPrice(drop.toUpperCase()) * sessionDrops[drop])
    })

    stringToDraw.push(currentCombo)
    stringToDraw.push(`&aTotal Profit&f: &6${TextHelper.addCommasTrunc(sessionTotalProfit)}`)

    stringToDraw = stringToDraw.join("\n")
}

const renderOverlay = () => {
    if (!registerWhen() || !stringToDraw || editGui.isOpen()) return

    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(stringToDraw, 0, 0)
    Renderer.finishDraw()
}

const reset = () => {
    oldChampionXp = 0
    oldItemName = null
    sessionKills = 0
    sessionDrops = {}
    sessionMagicFind = 0
    sessionScavenger = 0
    currentCombo = ""
    stringToDraw = null
}

// Default display
editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(defaultString, 0, 0)
    Renderer.finishDraw()
})

// Events
new Event(feature, "onActionBarPacket", addKills, registerWhen, /^[\d,]+\/[\d,]+❤.+ \+([\d.,]+) Combat [\(\) \d%\/.,]+ .+$/)
new Event(feature, "onChatPacket", addDrops, registerWhen, /^RARE DROP\! ([\w ]+) \(\+(\d+)% ✯ Magic Find\)$/)
new Event(feature, "onChatPacket", addMaterialized, registerWhen, /^The ghost\'s death materialized 1,000,000 coins from the mists\!$/)
new Event(feature, "onChatPacket", addKillCombo, registerWhen, /^\+([\d,.]+) Kill Combo?.+$/)
new Event(feature, "onChatPacket", resetKillCombo, registerWhen, /^Your Kill Combo has expired! You reached a [\d,.]+ Kill Combo!$/)
new Event(feature, "onScoreboardPacket", addScavenger, registerWhen, /^Purse\: [\d,.]+ \(\+([\d,.]+)\)$/)
new Event(feature, "tick", makeStringToDraw, registerWhen)
new Event(feature, "renderOverlay", renderOverlay, () => registerWhen() && stringToDraw)
new Event(feature, "worldUnload", reset)

// Starting events
feature.start()