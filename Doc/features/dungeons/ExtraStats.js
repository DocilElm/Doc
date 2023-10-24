import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { WorldManager } from "../../utils/World"

// Constant variables
const feature = new Feature("showExtraStats", "Dungeons", "")
const requiredWorld = "Catacombs"

// World checks
const checkWorld = () => WorldManager.getCurrentWorld() === requiredWorld && World.isLoaded()

// Events
new Event(feature, "onChatPacket", () => {
    ChatLib.command("showextrastats")
}, checkWorld, "                             > EXTRA STATS <")