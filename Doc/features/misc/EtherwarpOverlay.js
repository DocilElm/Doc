import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { getEtherwarpBlockSuccess, holdingAOTV } from "../../../BloomCore/utils/Utils"
import { RenderHelper } from "../../shared/Render"
import config from "../../config"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/EtherwarpOverlay.js

// Constant variables
const feature = new Feature("EtherwarpOverlay", "Misc", "")

// Logic
const renderWorld = () => {
    if (!config.etherwarpOverlay || !Player.isSneaking()) return

    const [ success, endBlock ] = getEtherwarpBlockSuccess(false, 61)
    if (!success || !endBlock) return

    const block = World.getBlockAt(...endBlock)
    const [ r, g, b, a ] = [
        config.etherwarpOverlayColor.getRed() / 255,
        config.etherwarpOverlayColor.getGreen() / 255,
        config.etherwarpOverlayColor.getBlue() / 255,
        config.etherwarpOverlayColor.getAlpha() / 255,
    ]

    RenderHelper.outlineBlock(block, r, g, b, a)
    RenderHelper.filledBlock(block, r, g, b, 50 / 255)
}

// Events
new Event(feature, "renderWorld", renderWorld, () => World.isLoaded() && holdingAOTV() && config.etherwarpOverlay)

// Starting events
feature.start()