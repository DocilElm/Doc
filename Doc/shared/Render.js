// From BloomCore

const GuiContainer = Java.type("net.minecraft.client.gui.inventory.GuiContainer")

const guiContainerLeftField = GuiContainer.class.getDeclaredField("field_147003_i")
const guiContainerTopField = GuiContainer.class.getDeclaredField("field_147009_r")
guiContainerLeftField.setAccessible(true)
guiContainerTopField.setAccessible(true)

/**
 * 
 * @param {Block} ctBlock 
 * @returns {Number[]} - A 6-long array of numbers with the [x0, y0, z0, x1, y1, z1] corners of the block's bounding box.
 */
export const getBlockBoundingBox = (ctBlock) => {
    const mcBlock = ctBlock.type.mcBlock

    if (ctBlock.type.getName().includes("Stair")) return [
        ctBlock.getX() + 0,
        ctBlock.getY() + 0,
        ctBlock.getZ() + 0,
        ctBlock.getX() + 1,
        ctBlock.getY() + 1,
        ctBlock.getZ() + 1
    ]

    return [
        ctBlock.getX() + mcBlock.func_149704_x(),
        ctBlock.getY() + mcBlock.func_149665_z(),
        ctBlock.getZ() + mcBlock.func_149706_B(),
        ctBlock.getX() + mcBlock.func_149753_y(),
        ctBlock.getY() + mcBlock.func_149669_A(),
        ctBlock.getZ() + mcBlock.func_149693_C()
    ]
}

export class RenderHelper {
    static outlineBlock(ctBlock, r, g, b, a, phase = true, thick = 3) {
        const [ x0, y0, z0, x1, y1, z1 ] = getBlockBoundingBox(ctBlock)

        Tessellator.pushMatrix()

        GL11.glLineWidth(thick)
        Tessellator.begin(3)
        Tessellator.depthMask(false)
        Tessellator.disableTexture2D()
        Tessellator.enableBlend()
        
        if (phase) Tessellator.disableDepth()
        
        const locations = [
            [x0, y0, z0],
            [x0, y0, z1],
            [x0, y1, z1],
            [x1, y1, z1],
            [x1, y1, z0],
            [x0, y1, z0],
            [x0, y0, z0],
            [x1, y0, z0],
            [x1, y0, z1],
            [x0, y0, z1],
            [x0, y1, z1],
            [x0, y1, z0],
            [x1, y1, z0],
            [x1, y0, z0],
            [x1, y0, z1],
            [x1, y1, z1]
        ]

        Tessellator.colorize(r, g, b, a)

        locations.forEach(([x, y, z]) => {
            Tessellator.pos(x, y, z).tex(0, 0)
        })
        Tessellator.draw()

        if (phase) Tessellator.enableDepth()

        Tessellator.enableTexture2D()
        Tessellator.disableBlend()
        Tessellator.depthMask(true)
        Tessellator.popMatrix()
    }

    static filledBlock(ctBlock, r, g, b, a, phase = true) {
        const [ x0, y0, z0, x1, y1, z1 ] = getBlockBoundingBox(ctBlock)

        Tessellator.pushMatrix()

        Tessellator.begin(GL11.GL_QUADS)
        GlStateManager.func_179129_p() // disableCullFace
        Tessellator.depthMask(false)
        Tessellator.disableTexture2D()
        Tessellator.enableBlend()
        
        if (phase) Tessellator.disableDepth()
        
        Tessellator.colorize(r, g, b, a)
        
        const locations = [
            [x1, y0, z1],
            [x1, y0, z0],
            [x0, y0, z0],
            [x0, y0, z1],

            [x1, y1, z1],
            [x1, y1, z0],
            [x0, y1, z0],
            [x0, y1, z1],

            [x0, y1, z1],
            [x0, y1, z0],
            [x0, y0, z0],
            [x0, y0, z1],

            [x1, y1, z1],
            [x1, y1, z0],
            [x1, y0, z0],
            [x1, y0, z1],

            [x1, y1, z0],
            [x0, y1, z0],
            [x0, y0, z0],
            [x1, y0, z0],

            [x0, y1, z1],
            [x1, y1, z1],
            [x1, y0, z1],
            [x0, y0, z1]
        ]

        locations.forEach(([x, y, z]) => {
            Tessellator.pos(x, y, z)
        })

        Tessellator.draw()

        if (phase) Tessellator.enableDepth()

        GlStateManager.func_179089_o() // enableCull
        Tessellator.enableTexture2D()
        Tessellator.disableBlend()
        Tessellator.depthMask(true)
        Tessellator.popMatrix()
    }
    
    /**
     * 
     * @param {Number} slotNumber 
     * @param {GuiContainer} mcGuiContainer
     * @returns {[Number, Number]}
     */
    static getSlotRenderPosition(slotNumber, mcGuiContainer) {
        const guiLeft = guiContainerLeftField.get(mcGuiContainer)
        const guiTop = guiContainerTopField.get(mcGuiContainer)

        const slot = mcGuiContainer.field_147002_h.func_75139_a(slotNumber)

        return [guiLeft + slot.field_75223_e, guiTop + slot.field_75221_f]
    }
}