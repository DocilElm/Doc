import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"

// Constant variables
const feature = new Feature("RemoveFrontView", "Misc", "")

// Logic
const renderOverlay = () => {
    if (!World.isLoaded() || !config.removeFrontView) return

    if (Client.settings.getSettings().field_74320_O !== 2) return

    Client.settings.getSettings().field_74320_O = 0
}

// Events
new Event(feature, "renderOverlay", renderOverlay, () => World.isLoaded() && config.removeFrontView)

// Starting events
feature.start()