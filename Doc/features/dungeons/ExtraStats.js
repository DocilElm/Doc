import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { WorldState } from "../../shared/World"

// Constant variables
const feature = new Feature("showExtraStats", "Dungeons", "")
const requiredWorld = "Catacombs"
const criteria = "                             > EXTRA STATS <"

// Logic
const registerWhen = () => WorldState.getCurrentWorld() === requiredWorld && config.showExtraStats
const sendCommand = () => ChatLib.command("showextrastats")

// Events
new Event(feature, "onChatPacket", sendCommand, registerWhen, criteria)

// Starting events
feature.start()