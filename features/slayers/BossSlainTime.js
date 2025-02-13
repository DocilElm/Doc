import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { TextHelper } from "../../shared/TextHelper"

let serverTicks = 0
let spawnedAtTicks = 0
let spawnedAtTime = null
let killedAtTicks = null
let killedAtTime = null

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
            killedAtTime = Date.now()
            killedAtTicks = serverTicks
        }, /^Boss slain\!$/),
        () => spawnedAtTime
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, () => {
            if (!killedAtTime) killedAtTime = Date.now()
            if (!killedAtTicks) killedAtTicks = serverTicks

            new TextComponent(`${TextHelper.PREFIX} &aBoss Slain! Real Time&f: &6${((killedAtTime - spawnedAtTime) / 1000).toFixed(2)}s &aServer Time&f: &6${((killedAtTicks - spawnedAtTicks) * 0.05).toFixed(2)}s`)
                .setHover("show_text", "&cServer time might not be 100% accurate")
                .chat()
            serverTicks = 0
            spawnedAtTicks = 0
            spawnedAtTime = null
            killedAtTime = null
            killedAtTicks = null
            feat.update()
        }, /^  SLAYER QUEST COMPLETE\!$/),
        () => spawnedAtTime
    )
    .onUnregister(() => {
        serverTicks = 0
        spawnedAtTicks = 0
        spawnedAtTime = null
        killedAtTime = null
        killedAtTicks = null
    })