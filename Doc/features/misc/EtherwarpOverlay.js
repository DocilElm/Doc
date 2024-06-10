import { Feature } from "../../core/Feature"
import { getEtherwarpBlockSuccess, holdingAOTV } from "../../../BloomCore/utils/Utils"
import { RenderHelper } from "../../shared/Render"
import config from "../../config"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/EtherwarpOverlay.js

// Constant variables
const feature = new Feature("EtherwarpOverlay", "Misc", "")

// Logic
const renderWorld = () => {
    if (!config().etherwarpOverlay || !Player.isSneaking()) return

    const [ success, endBlock ] = getEtherwarpBlockSuccess(false, 61)
    if (!success || !endBlock) return

    const block = World.getBlockAt(...endBlock)
    const [ r, g, b, a ] = [
        config().etherwarpOverlayColor[0],
        config().etherwarpOverlayColor[1],
        config().etherwarpOverlayColor[2],
        config().etherwarpOverlayColor[3],
    ]

    RenderHelper.outlineBlock(block, r, g, b, a)
    RenderHelper.filledBlock(block, r, g, b, 50 / 255)
}

// Events
const registerWorld = register("renderWorld", renderWorld).unregister()

register("tick", () => {
    if (!World.isLoaded() || !holdingAOTV() || !config().etherwarpOverlay) return registerWorld.unregister()

    registerWorld.register()
})

// Starting events
feature.start()