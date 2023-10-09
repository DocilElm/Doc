import { addEvent } from "../../FeatureBase"
import { onChatPacket } from "../../classes/Events"
import ScalableGui from "../../classes/ScalableGui"
import { entryMessages, getJsonDataFromFile, getScoreboard, getSeconds, isInTab } from "../../utils/Utils"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/RunSplits.js

const editGui = new ScalableGui("bossSplits").setCommand("bossSplitsDisplay")
const bossSplits = getJsonDataFromFile("data/BossSplits.json")
const f7BossNames = new Set(["Maxor", "Storm", "Goldor", "Necron"])

let currentFloor = null
let splits = {}
let currentSplits = []
let currentBossName = null
let bossEntry = null

const createObj = (bossNameV) => {
    const bossName = f7BossNames.has(bossNameV) ? currentFloor : bossNameV
    currentBossName = bossName
    
    Object.values(bossSplits[bossName]).forEach(value => {
        splits[value] = null
    })
}

addEvent("dungeonBossSplits", "Dungeon", register("tick", () => {
    if(!World.isLoaded() || !isInTab("Catacombs")) return

    if(!currentFloor) getScoreboard().forEach(a => {
        if(!/^  The Catacombs \(([\w\d].{1,2})\)$/.test(a)) return

        currentFloor = a.match(/^  The Catacombs \(([\w\d].{1,2})\)$/)[1]
    })

    const stuff = []
    const objKeys = Object.values(splits)

    Object.keys(splits).forEach((key, index) => {
        const splitTIme = !splits[key] ? Date.now() : splits[key]
        const lastTime = index === 0 ? bossEntry : objKeys[index-1]

        stuff.push(`${key}&f: &6${getSeconds(splitTIme, lastTime)}`)
    })

    currentSplits = [...stuff].join("\n")
}), null, [
    onChatPacket(() => {
        if(!bossSplits[currentBossName]) return
    
        splits[bossSplits[currentBossName].Cleared] = Date.now()
    }).setCriteria("                             > EXTRA STATS <"),
    
    onChatPacket(() => {
        if(!bossSplits[currentBossName]) return
    
        splits[bossSplits[currentBossName].Terms] = Date.now()
    }).setCriteria("The Core entrance is opening!"),
    
    onChatPacket((bossName, bossMessage, event) => {
        if(entryMessages.has(`[BOSS] ${bossName}: ${bossMessage}`)) createObj(bossName), bossEntry = Date.now()
    
        if(!bossSplits?.[currentBossName]?.[`[BOSS] ${bossName}: ${bossMessage}`]) return
    
        splits[bossSplits?.[currentBossName]?.[`[BOSS] ${bossName}: ${bossMessage}`]] = Date.now()
    }).setCriteria(/^\[BOSS\] ([\w ]+): (.+)$/),
    
    register("renderOverlay", () => {
        if(!World.isLoaded() || !isInTab("Catacombs") || !currentSplits) return
    
        editGui.renderString(currentSplits)
    })
], "Catacombs")

editGui.onRender(() => {
    const str = [
        `&dTerracotta&f: &610s`,
        `&bGiants&f: &610s`,
        `&aSadan&f: &610s`,
    ].join("\n")
    editGui.renderString(str)
})

register("worldUnload", () => {
    splits = {}
    currentSplits = []
    currentBossName = null
    bossEntry = null
    currentFloor = null
})