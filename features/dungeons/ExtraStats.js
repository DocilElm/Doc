import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"

new Feature("showExtraStats", "catacombs")
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, () => ChatLib.command("showextrastats"), /^ *> EXTRA STATS <$/)
    )