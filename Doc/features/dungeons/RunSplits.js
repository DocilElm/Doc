import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"
import ScalableGui from "../../shared/Scalable"
import { TextHelper } from "../../shared/Text"
import { WorldState } from "../../shared/World"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/RunOverview.js
// i will make an actual recode later on

// Constant variables
const feature = new Feature("dungeonRunSplits", "Dungeons", "")
const defaultSplits = [
    `&a&lRun Splits`,
    `&cBlood Opened&f: &a0s`,
    `&cBlood Done&f: &a0s`,
    `&5Portal Entry&f: &a0s`,
    `&bBoss Entry&f: &a0s`,
].join("\n")
const editGui = new ScalableGui("runSplits", defaultSplits).setCommand("runSplitsDisplay")

// Changeable variables
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

// Logic
const registerWhen = () => WorldState.inDungeons() && config().dungeonRunSplits

const handleChatPacket = (_, __, ___, ____, formatted) => {
    const currentMessage = formatted.removeFormatting()

    if (currentMessage === "[NPC] Mort: Here, I found this map when I first entered the dungeon.") return runStarted = Date.now()
    if (currentMessage.startsWith("[BOSS] The Watcher:") && !bloodOpened) return bloodOpened = Date.now()
    if (currentMessage === "[BOSS] The Watcher: You have proven yourself. You may pass.") return bloodDone = Date.now()
    if (currentMessage === "[BOSS] The Watcher: Let's see how you can handle this.") return firstSpawn = Date.now()
    if (!Persistence.dungeonBossEntryMessage.has(currentMessage)) return

    return bossEntry = Date.now()
}

const makeStringToDraw = () => {
    // Reset splits to an empty array
    splits = []

    const bloodOpenedStr = !bloodOpened && runStarted ? TextHelper.getSecondsSince(Date.now(), runStarted) : TextHelper.getSecondsSince(bloodOpened, runStarted)
    const bloodDoneStr = !bloodDone && bloodOpened ? TextHelper.getSecondsSince(Date.now(), bloodOpened) : TextHelper.getSecondsSince(bloodDone, bloodOpened)
    const portalEntryStr = !bossEntry && bloodDone ? TextHelper.getSecondsSince(Date.now(), bloodDone) : TextHelper.getSecondsSince(bossEntry, bloodDone)
    const bossEntryStr = !bossEntry && bloodDone ? TextHelper.getSecondsSince(Date.now(), runStarted) : TextHelper.getSecondsSince(bossEntry, runStarted)
    const firstSpawnStr = !firstSpawn && bloodOpened ? TextHelper.getSecondsSince(Date.now(), bloodOpened) : TextHelper.getSecondsSince(firstSpawn, bloodOpened)

    splits = [
        `&a&lRun Splits`,
        `&cBlood Opened&f: &a${bloodOpenedStr}`,
        `&cBlood Done&f: &a${bloodDoneStr} &7(&cFirst Spawn&f: &a${firstSpawnStr}&7)`,
        `&5Portal Entry&f: &a${portalEntryStr}`,
        `&bBoss Entry&f: &a${bossEntryStr}`,
    ].join("\n")

    if (!bloodOpenChat && bloodOpened && runStarted) ChatLib.chat(`${TextHelper.PREFIX} &aBlood Opened&f: &6${TextHelper.getSecondsSince(bloodOpened, runStarted)}`), bloodOpenChat = true
    if (!bloodDoneChat && bloodDone && bloodOpened) ChatLib.chat(`${TextHelper.PREFIX} &aBlood Done&f: &6${TextHelper.getSecondsSince(bloodDone, bloodOpened)}`), bloodDoneChat = true
    if (!firstSpawnChat && firstSpawn && bloodOpened) ChatLib.chat(`${TextHelper.PREFIX} &aFirst group of mobs spawned at&f: &6${TextHelper.getSecondsSince(firstSpawn, bloodOpened)}`), firstSpawnChat = true
    if (!portalEntryChat && bossEntry && bloodDone) ChatLib.chat(`${TextHelper.PREFIX} &aPortal Entry&f: &6${TextHelper.getSecondsSince(bossEntry, bloodDone)}`), portalEntryChat = true
    if (!bossEntryChat && bossEntry && bloodDone) ChatLib.chat(`${TextHelper.PREFIX} &aBoss Entry&f: &6${TextHelper.getSecondsSince(bossEntry, runStarted)}`), bossEntryChat = true
}

const renderString = () => {
    if (!registerWhen() || !splits || editGui.isOpen()) return

    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(splits, 0, 0)
    Renderer.finishDraw()
}

// Resets the variables to their default value
const reset = () => {
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
}

// Default display
editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(defaultSplits, 0, 0)
    Renderer.finishDraw()
})

// Events
new Event(feature, "onChatPacket", handleChatPacket, registerWhen, /^\[(BOSS|NPC)\] ([\w ]+): (.+)$/)
new Event(feature, "tick", makeStringToDraw, registerWhen)
new Event(feature, "renderOverlay", renderString, () => registerWhen() && splits)
new Event(feature, "worldUnload", reset)

// Starting events
feature.start()