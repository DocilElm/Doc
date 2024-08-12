import config from "../../config"
import { Event } from "../../core/Event"
import Feature from "../../core/Feature"
import { RenderHelper } from "../../shared/Render"

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

            if (ctBlock.type.mcBlock instanceof net.minecraft.block.BlockAir) return

            // If third person disable phase
            const phase = !(Client.settings.getSettings()?.field_74320_O === 1)
            const color = getColor(config().blockOverlayColor)

            const [ r, g, b, a ] = [color.getRed(), color.getGreen(), color.getBlue(), color.getAlpha()]
            const [ r1, g1, b1 ] = [color.getRed(), color.getGreen(), color.getBlue()]

            cancel(event)

            RenderHelper.outlineBlock(ctBlock, r, g, b, a, phase, 2)
            if (config().blockOverlayFill) RenderHelper.filledBlock(ctBlock, r1, g1, b1, 50, phase)
        })
    )