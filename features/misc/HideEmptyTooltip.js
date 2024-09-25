import { Event } from "../../core/Event"
import Feature from "../../core/Feature"

new Feature("hideEmptyTooltip")
    .addEvent(
        new Event("itemTooltip", (lore, _, event) => {
            if (lore.length > 1 || lore[0].trim() !== "§o §r") return

            cancel(event)
        })
    )