import { addEvent } from "../../FeatureBase"
import config from "../../config"
import { EntityArmorStand } from "../../utils/Utils"

// Credits: https://github.com/EragonTheGuy/NetherFishingUtils/blob/testing/NetherFishingUtils/index.js

addEvent("timerTitleFishing", "Fishing", register("step", () => {
    if(!World.isLoaded() || !Player.getPlayer().field_71104_cf) return

    World.getAllEntitiesOfType(EntityArmorStand).forEach(entity => {
        const entityName = entity.getName()?.removeFormatting()

        if(!/^[\d\!]+/g.test(entityName)) return

        if(config.rgbTitleFishing) entity.getEntity().func_96094_a(`§Z${entityName}`)

        Client.showTitle("", entity.getName(), 1, 10, 1)
    })
}).setFps(5), null, [])