import { addEvent } from "../../FeatureBase"
import { onChatPacket } from "../../classes/Events"
import ScalableGui from "../../classes/ScalableGui"
import { PREFIX, entryMessages, getSeconds, isInTab, chat } from "../../utils/Utils"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/RunOverview.js

const editGui = new ScalableGui("runSplits").setCommand("runSplitsDisplay")
const defaultSplits = [
    `&a&lRun Splits`,
    `&cBlood Opened&f: &a0s`,
    `&cBlood Done&f: &a0s`,
    `&5Portal Entry&f: &a0s`,
    `&bBoss Entry&f: &a0s`,
].join("\n")

let splits = null
let runStarted = null
let bloodOpened = null
let bloodDone = null
let bossEntry = null
let firstSpawn = null

// chat
let bloodOpenChat = false
let bloodDoneChat = false
let firstSpawnChat = false
let portalEntryChat = false
let bossEntryChat = false

addEvent("dungeonRunSplits", "Dungeons", onChatPacket((bossType, bossName, bossMessage, event) => {
    const currentMessage = `[${bossType}] ${bossName}: ${bossMessage}`

    if(currentMessage === "[NPC] Mort: Here, I found this map when I first entered the dungeon.") return runStarted = Date.now()
    if(currentMessage.startsWith("[BOSS] The Watcher:") && !bloodOpened) return bloodOpened = Date.now()
    if(currentMessage === "[BOSS] The Watcher: You have proven yourself. You may pass.") return bloodDone = Date.now()
    if(currentMessage === "[BOSS] The Watcher: Let's see how you can handle this.") return firstSpawn = Date.now()
    if(entryMessages.has(currentMessage)) return bossEntry = Date.now()
}).setCriteria(/^\[(BOSS|NPC)\] ([\w ]+): (.+)$/), null, [
    register("tick", () => {
        if(!World.isLoaded() || !isInTab("Catacombs")) return

        const bloodOpenedStr = !bloodOpened && runStarted ? getSeconds(Date.now(), runStarted) : getSeconds(bloodOpened, runStarted)
        const bloodDoneStr = !bloodDone && bloodOpened ? getSeconds(Date.now(), bloodOpened) : getSeconds(bloodDone, bloodOpened)
        const portalEntryStr = !bossEntry && bloodDone ? getSeconds(Date.now(), bloodDone) : getSeconds(bossEntry, bloodDone)
        const bossEntryStr = !bossEntry && bloodDone ? getSeconds(Date.now(), runStarted) : getSeconds(bossEntry, runStarted)
        const firstSpawnStr = !firstSpawn && bloodOpened ? getSeconds(Date.now(), bloodOpened) : getSeconds(firstSpawn, bloodOpened)

        splits = [
            `&a&lRun Splits`,
            `&cBlood Opened&f: &a${bloodOpenedStr}`,
            `&cBlood Done&f: &a${bloodDoneStr} &7(&cFirst Spawn&f: &a${firstSpawnStr}&7)`,
            `&5Portal Entry&f: &a${portalEntryStr}`,
            `&bBoss Entry&f: &a${bossEntryStr}`,
        ].join("\n")

        if(!bloodOpenChat && bloodOpened && runStarted) chat(`${PREFIX} &aBlood Opened&f: &6${getSeconds(bloodOpened, runStarted)}`), bloodOpenChat = true
        if(!bloodDoneChat && bloodDone && bloodOpened) chat(`${PREFIX} &aBlood Done&f: &6${getSeconds(bloodDone, bloodOpened)}`), bloodDoneChat = true
        if(!firstSpawnChat && firstSpawn && bloodOpened) chat(`${PREFIX} &aFirst group of mobs spawned at&f: &6${getSeconds(firstSpawn, bloodOpened)}`), firstSpawnChat = true
        if(!portalEntryChat && bossEntry && bloodDone) chat(`${PREFIX} &aPortal Entry&f: &6${getSeconds(bossEntry, bloodDone)}`), portalEntryChat = true
        if(!bossEntryChat && bossEntry && bloodDone) chat(`${PREFIX} &aBoss Entry&f: &6${getSeconds(bossEntry, runStarted)}`), bossEntryChat = true
    }),
    register("renderOverlay", () => {
        if(!World.isLoaded() || !isInTab("Catacombs") || !splits) return
    
        editGui.renderString(splits)
    })
], "Catacombs")

editGui.onRender(() => {
    editGui.renderString(defaultSplits)
})

register("worldUnload", () => {
    splits = null
    runStarted = null
    bloodOpened = null
    bloodDone = null
    bossEntry = null
    firstSpawn = null

    bloodOpenChat = false
    bloodDoneChat = false
    firstSpawnChat = false
    portalEntryChat = false
    bossEntryChat = false
})