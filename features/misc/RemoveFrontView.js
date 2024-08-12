import { Event } from "../../core/Event"
import Feature from "../../core/Feature"

new Feature("removeFrontView")
    .addEvent(
        new Event("renderOverlay", () => {
            if (Client.settings.getSettings().field_74320_O !== 2) return

            Client.settings.getSettings().field_74320_O = 0
        })
    )