import config from "../../config"
import { Event } from "../../core/Event"
import Feature from "../../core/Feature"
import { RenderHelper } from "../../shared/Render"

const Blocks = net.minecraft.init.Blocks
const BlockFlowingLava = Blocks.field_150356_k
const BlockLava = Blocks.field_150353_l
const BlockFlowingWater = Blocks.field_150358_i
const BlockWater = Blocks.field_150355_j
const BlockAir = Blocks.field_150350_a
const cachedColors = new Map()

const getColor = (colors) => {
    const [ r, g, b, a ] = colors

    if (cachedColors.has(colors.toString())) return cachedColors.get(colors.toString())

    const javaColor = new java.awt.Color(r / 255, g / 255, b / 255, a / 255)

    cachedColors.set(colors.toString(), javaColor)

    return javaColor
}

new Feature("blockOverlay")
    .addEvent(
        new Event("drawBlockHighlight", ({x, y, z}, event) => {
            const ctBlock = World.getBlockAt(x, y, z)
            const mcBlock = ctBlock.type.mcBlock

            if (mcBlock == BlockAir ||
                mcBlock == BlockFlowingLava ||
                mcBlock == BlockFlowingWater ||
                mcBlock == BlockLava ||
                mcBlock == BlockWater) return

            // If third person disable phase
            const phase = !(Client.settings.getSettings()?.field_74320_O === 1)
            const color = getColor(config().blockOverlayColor)
            const pticks = event.partialTicks

            const [ r, g, b, a ] = [color.getRed(), color.getGreen(), color.getBlue(), color.getAlpha()]
            const [ r1, g1, b1 ] = [color.getRed(), color.getGreen(), color.getBlue()]

            cancel(event)

            RenderHelper.outlineBlock(ctBlock, r, g, b, a, phase, 2, true, pticks)
            if (config().blockOverlayFill) RenderHelper.filledBlock(ctBlock, r1, g1, b1, 50, phase, true, pticks)
        })
    )