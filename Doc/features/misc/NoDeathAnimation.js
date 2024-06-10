import config from "../../config"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/NoDeathAnimation.js
// straight up copy and paste ^

const lividRegex = /^\w+ Livid$/

register("entityDeath", (entity) => {
    if (!config().noDeathAnimation || lividRegex.test(entity?.getName()?.removeFormatting())) return

    entity.getEntity().func_70106_y()
})