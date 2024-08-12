import { Event } from "../../core/Event"
import Feature from "../../core/Feature"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/NoDeathAnimation.js
// straight up copy and paste ^

const lividRegex = /^\w+ Livid$/

new Feature("noDeathAnimation")
    .addEvent(
        new Event("entityDeath", (entity) => {
            if (lividRegex.test(entity?.getName()?.removeFormatting())) return

            entity.getEntity().func_70106_y()
        })
    )