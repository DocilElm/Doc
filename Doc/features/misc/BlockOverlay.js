import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { RenderHelper } from "../../shared/Render"

// Constant variables
const feature = new Feature("blockOverlay", "Misc", "")

// Logic
const registerWhen = () => World.isLoaded() && config.blockOverlay

const highlightBlock = ({x, y, z}, event) => {
    const ctBlock = World.getBlockAt(x, y, z)

    if (ctBlock.type.mcBlock instanceof net.minecraft.block.BlockAir) return

    // If third person disable phase
    const phase = !(Client.settings.getSettings().field_74320_O === 1)
    const r = config.blockOverlayColor.getRed() / 255
    const g = config.blockOverlayColor.getGreen() / 255
    const b = config.blockOverlayColor.getBlue() / 255
    const a = config.blockOverlayColor.getAlpha() / 255

    cancel(event)

    RenderHelper.outlineBlock(ctBlock, r, g, b, a, phase)
}

// Events
new Event(feature, "drawBlockHighlight", highlightBlock, registerWhen)

// Start events
feature.start()