import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { WorldState } from "../../shared/World"

// Constant variables
const feature = new Feature("showExtraStats", "Dungeons", "")
const requiredWorld = "Catacombs"

// World checks
const checkWorld = () => WorldState.getCurrentWorld() === requiredWorld && World.isLoaded()

// Events
new Event(feature, "onChatPacket", () => {
    ChatLib.command("showextrastats")
}, checkWorld, "                             > EXTRA STATS <")

// Starting events
feature.start()