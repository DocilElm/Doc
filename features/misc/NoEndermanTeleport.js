import { Event } from "../../core/Event"
import Feature from "../../core/Feature"

const feat = new Feature("noEndermanTeleport")
    .addEvent(
        new Event(net.minecraftforge.event.entity.living.EnderTeleportEvent, (event) => {
            cancel(event)
        })
    )