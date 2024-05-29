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
    const phase = !(Client.settings.getSettings()?.field_74320_O === 1)
    const color = config.blockOverlayColor
    
    const [ r, g, b, a ] = [color.getRed(), color.getGreen(), color.getBlue(), color.getAlpha() / 255]
    const [ r1, g1, b1 ] = [color.getRed() / 255, color.getGreen() / 255, color.getBlue() / 255]

    cancel(event)

    RenderHelper.outlineBlockMC(ctBlock, r, g, b, a, phase)
    if (config.blockOverlayFill) RenderHelper.filledBlock(ctBlock, r1, g1, b1, 50 / 255, phase)
}

// Events
new Event(feature, "drawBlockHighlight", highlightBlock, registerWhen)

// Start events
feature.start()