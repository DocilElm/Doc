import config from "../../config"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import Location from "../../shared/Location"
import { TextHelper } from "../../shared/TextHelper"

let shouldDownTime = null
let commandReceived = false

const feat = new Feature("autoRequeueDungeons")
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, (name, msg) => {
            if (msg.toLowerCase() === "r") {
                shouldDownTime = null
                return
            }
            if (msg.toLowerCase() !== "dt") return

            shouldDownTime = name
            ChatLib.chat(`${TextHelper.PREFIX} &bUser &6${shouldDownTime} &bneeds downtime`)
        }, /^Party > (?:\[\d+\] .? ?)?(?:\[[^\]]+\] )?(\w{1,16}): !(\w{1,2})$/)
    )
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, () => {
            if (!Location.inWorld("catacombs")) return

            if (shouldDownTime) {
                ChatLib.say(`${shouldDownTime} needs downtime`)
                return
            }

            commandReceived = true
            feat.update()

            if (config().autoRequeueDungeonsChestMode) return

            ChatLib.command("instancerequeue")
        }, /^ +Click HERE to re-queue into The Catacombs\!$/)
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, () => {
            ChatLib.command("instancerequeue")
        }, /^  [A-z]+ CHEST REWARDS$/),
        () => commandReceived && config().autoRequeueDungeonsChestMode && Location.inWorld("catacombs")
    )
    .onUnregister(() => {
        commandReceived = false
    })