import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { TextHelper } from "../../shared/TextHelper"

let serverTicks = 0
let startedAtTicks = 0
let startedAtTime = Date.now()

const feat = new Feature("slayerBossSpawnTime")
    .addEvent(
        new Event(EventEnums.PACKET.CUSTOM.TICK, () => {
            serverTicks++
        })
    )
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, () => {
            startedAtTicks = serverTicks
            startedAtTime = Date.now()
            feat.update()
        }, /^  SLAYER QUEST STARTED!$/)
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.SCOREBOARD, () => {
            new TextComponent(`${TextHelper.PREFIX} &aSlayer Boss Spawned! &aReal Time&f: &6${((Date.now() - startedAtTime) / 1000).toFixed(2)}s &aServer Time&f: &6${((serverTicks - startedAtTicks) * 0.05).toFixed(2)}s`)
                .setHover("show_text", "&cServer time might not be 100% accurate")
                .chat()

            serverTicks = 0
            startedAtTicks = 0
            startedAtTime = null
            feat.update()
        }, /^Slay the boss\!$/),
        () => startedAtTime
    )
    .onUnregister(() => {
        serverTicks = 0
        startedAtTicks = 0
        startedAtTime = null
    })