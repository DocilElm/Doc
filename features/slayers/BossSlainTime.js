import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { TextHelper } from "../../shared/TextHelper"

let serverTicks = 0
let spawnedAtTicks = 0
let spawnedAtTime = null
let killedAt = null

const feat = new Feature("slayerBossTime")
    .addEvent(
        new Event(EventEnums.PACKET.CUSTOM.TICK, () => {
            serverTicks++
        })
    )
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.SCOREBOARD, () => {
            spawnedAtTicks = serverTicks
            spawnedAtTime = Date.now()
            feat.update()
        }, /^Slay the boss\!$/)
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.SCOREBOARD, () => {
            killedAt = Date.now()
        }, /^Boss slain\!$/),
        () => spawnedAtTime
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, () => {
            if (!killedAt) killedAt = Date.now()

            new TextComponent(`${TextHelper.PREFIX} &aBoss Slain! Real Time&f: &6${((killedAt - spawnedAtTime) / 1000).toFixed(2)}s &aServer Time&f: &6${((serverTicks - spawnedAtTicks) * 0.05).toFixed(2)}s`)
                .setHover("show_text", "&cServer time might not be 100% accurate")
                .chat()
            serverTicks = 0
            spawnedAtTicks = 0
            spawnedAtTime = null
            killedAt = null
            feat.update()
        }, /^  SLAYER QUEST COMPLETE\!$/),
        () => spawnedAtTime
    )
    .onUnregister(() => {
        serverTicks = 0
        spawnedAtTicks = 0
        spawnedAtTime = null
        killedAt = null
    })