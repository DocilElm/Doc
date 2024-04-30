import config from "../../config"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/HideLightning.js
// straight up copy and paste ^

register("renderEntity", (_, __, ___, event) => {
    if (!config.noLightning) return

    cancel(event)
}).setFilteredClass(net.minecraft.entity.effect.EntityLightningBolt)