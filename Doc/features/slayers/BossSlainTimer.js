import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { TextHelper } from "../../shared/Text"

// Constant variables
const feature = new Feature("bossSlainTimer", "Slayer", "")

// Changeable variables
let bossSpawned = null
let bossSlainPacket = null

// Logic
const registerWhen = () => config().bossSlainTimer

const startBossTime = (message, event) => {
    if (message === "Slay the boss!") return bossSpawned = Date.now()
    if (message !== "Boss slain!" || !bossSpawned) return

    bossSlainPacket = Date.now()
}

const getBossTime = (message, event) => {
    if (!bossSpawned) return

    const timeFromKill = !bossSlainPacket ? Date.now() : bossSlainPacket

    ChatLib.chat(`${TextHelper.PREFIX} &aBoss Slain: &6${((timeFromKill-bossSpawned)/1000).toFixed(2)}`)

    bossSpawned = null
    bossSlainPacket = null
}

// Events
new Event(feature, "onScoreboardPacket", startBossTime, registerWhen)
new Event(feature, "onChatPacket", getBossTime, registerWhen, "  SLAYER QUEST COMPLETE!")
new Event(feature, "worldUnload", () => {
    bossSpawned = null
    bossSlainPacket = null
})

// Starting events
feature.start()