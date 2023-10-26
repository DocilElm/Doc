import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { WorldState } from "../../shared/World"

// Constant variables
const feature = new Feature("showExtraStats", "Dungeons", "")
const requiredWorld = "Catacombs"
const criteria = "                             > EXTRA STATS <"

// Logic
const checkWorld = () => WorldState.getCurrentWorld() === requiredWorld
const sendCommand = () => ChatLib.command("showextrastats")

// Events
new Event(feature, "onChatPacket", sendCommand, checkWorld, criteria)

// Starting events
feature.start()