import { renderBlockHitbox } from "../../../BloomCore/RenderUtils"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"

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

    cancel(event)

    renderBlockHitbox(ctBlock, r, g, b, 1, phase, 2.5, false)
}

// Events
new Event(feature, "drawBlockHighlight", highlightBlock, registerWhen)

// Start events
feature.start()