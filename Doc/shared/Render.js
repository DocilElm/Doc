const AxisAlignedBB = net.minecraft.util.AxisAlignedBB

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
export const getBlockBoundingBox = (ctBlock, filled = false) => {
    const mcBlock = ctBlock.type.mcBlock

    if (ctBlock.type.getName().includes("Stair")) return [
        ctBlock.getX(),
        ctBlock.getY(),
        ctBlock.getZ(),
        ctBlock.getX() + 1,
        ctBlock.getY() + 1,
        ctBlock.getZ() + 1
    ]

    return [
        ctBlock.getX() + mcBlock.func_149704_x() - (filled ? .01 : 0),
        ctBlock.getY() + mcBlock.func_149665_z() - (filled ? .01 : 0),
        ctBlock.getZ() + mcBlock.func_149706_B() - (filled ? .01 : 0),
        ctBlock.getX() + mcBlock.func_149753_y() + (filled ? .01 : 0),
        ctBlock.getY() + mcBlock.func_149669_A() + (filled ? .01 : 0),
        ctBlock.getZ() + mcBlock.func_149693_C() + (filled ? .01 : 0)
    ]
}

const getAxisValues = (axis) => [
        axis.field_72340_a, // Min X
        axis.field_72338_b, // Min Y
        axis.field_72339_c, // Min Z
        axis.field_72336_d, // Max X
        axis.field_72337_e, // Max Y
        axis.field_72334_f // Max Z
    ]

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
        const [ x0, y0, z0, x1, y1, z1 ] = getBlockBoundingBox(ctBlock, true)

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
     * - Gets the gui's X and Y values
     * @param {GuiContainer} mcGuiContainer The GuiContainer. if null it'll try to assign the current GuiContainer
     * @returns {[Number, Number] | null}
     */
    static getGuiRenderPositions(mcGuiContainer) {
        if (!Client.isInGui()) return

        // Assign the current gui incase this is null
        if (!mcGuiContainer) mcGuiContainer = Client.currentGui.get()

        return [
            guiContainerLeftField.get(mcGuiContainer),
            guiContainerTopField.get(mcGuiContainer)
        ]
    }
    /**
     * - Gets the given slotNumber's render position [x, y]
     * @param {Number} slotNumber 
     * @param {GuiContainer | null} mcGuiContainer
     * @returns {[Number, Number]}
     */
    static getSlotRenderPosition(slotNumber, mcGuiContainer) {
        if (!Client.isInGui()) return

        if (!mcGuiContainer) mcGuiContainer = Client.currentGui.get()

        const [ x, y ] = this.getGuiRenderPositions(mcGuiContainer)

        const slot = mcGuiContainer.field_147002_h.func_75139_a(slotNumber)

        return [x + slot.field_75223_e, y + slot.field_75221_f]
    }

    /**
     * - Gets the GuiContainer [x1, y1, x2, y2] bounds using the last slot [44]
     * @param {GuiContainer} mcGuiContainer 
     * @returns {[Number, Number, Number, Number]}
     */
    static getGuiRenderBoundings(mcGuiContainer) {
        if (!Client.isInGui()) return
        
        if (!mcGuiContainer) mcGuiContainer = Client.currentGui.get()

        const [ x, y ] = [ guiContainerLeftField.get(mcGuiContainer), guiContainerTopField.get(mcGuiContainer) ]
        const [ slotX, slotY ] = this.getSlotRenderPosition(44, mcGuiContainer)

        return [
            x,
            y,
            slotX,
            slotY
        ]
    }

    /**
     * 
     * @param {Number[][]} points - List of vertices as [[x, y, z], [x, y, z], ...]
     * @param {Number} r 
     * @param {Number} g 
     * @param {Number} b 
     * @param {Number} a 
     * @param {Boolean} phase - Show the line through walls
     * @param {Number} lineWidth - The width of the line
     */
    static drawLineThroughPoints(points, r, g, b, a, phase=true, lineWidth=3) {
        Tessellator.pushMatrix()

        GL11.glLineWidth(lineWidth)
        Tessellator.begin(GL11.GL_LINE_STRIP)
        GlStateManager.func_179129_p(); // disableCullFace
        Tessellator.depthMask(false)
        Tessellator.disableTexture2D()
        Tessellator.enableBlend()

        if (phase) Tessellator.disableDepth()

        Tessellator.colorize(r, g, b, a)
        points.forEach(([x, y, z]) => {
            Tessellator.pos(x, y, z).tex(0, 0)
        })

        Tessellator.draw()

        if (phase) Tessellator.enableDepth()

        GlStateManager.func_179089_o(); // enableCull
        Tessellator.enableTexture2D()
        Tessellator.disableBlend()
        Tessellator.depthMask(true)
        Tessellator.popMatrix()

    }

    /**
     * - Draws an entity box with the given AxisAlignedBB values
     * @param {AxisAlignedBB} axis 
     * @param {Number} r 
     * @param {Number} g 
     * @param {Number} b 
     * @param {Number} a 
     * @param {Number} lineWidth
     * @param {Boolean} phase 
     */
    static drawEntityAxis(axis, r, g, b, a, lineWidth = 1, phase = false) {
        const [ x0, y0, z0, x1, y1, z1 ] = getAxisValues(axis)

        Tessellator.pushMatrix()

        GL11.glLineWidth(lineWidth)
        Tessellator.begin(GL11.GL_LINE_STRIP, false)
        GL11.glEnable(GL11.GL_LINE_SMOOTH)

        GlStateManager.func_179129_p() // disableCullFace
        Tessellator.enableBlend()
        Tessellator.blendFunc(770, 771)
        Tessellator.depthMask(false)
        Tessellator.disableTexture2D()

        if (phase) Tessellator.disableDepth()
        
        Tessellator.colorize(r, g, b, a)

        const locations = [
            // Lower rectangle
            [x0, y0, z0],
            [x0, y0, z1],
            [x1, y0, z1],
            [x1, y0, z0],
            [x0, y0, z0],
            // Upper rectangle
            [x0, y1, z0],
            [x0, y1, z1],
            [x1, y1, z1],
            [x1, y1, z0],
            [x0, y1, z0],
            // Upper rectangle (part 2 ?)
            [x0, y1, z1],
            [x0, y0, z1],
            [x1, y0, z1],
            [x1, y1, z1],
            [x1, y1, z0],
            [x1, y0, z0],
        ]

        locations.forEach(([x, y, z]) => {
            Tessellator.pos(x, y, z)
        })

        Tessellator.draw()

        GlStateManager.func_179089_o() // enableCull
        Tessellator.disableBlend()
        Tessellator.depthMask(true)
        Tessellator.enableTexture2D()
        if (phase) Tessellator.enableDepth()

        GL11.glDisable(GL11.GL_LINE_SMOOTH)
        Tessellator.popMatrix()
    }

    /**
     * - Draws an entity box with the given [x, y, z, w, h] values
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} z 
     * @param {Number} w 
     * @param {Number} h 
     * @param {Number} r 
     * @param {Number} g 
     * @param {Number} b 
     * @param {Number} a 
     * @param {Number} lineWidth
     * @param {Boolean} phase 
     */
    static drawEntityBox(x, y, z, w, h, r, g, b, a, lineWidth = 1, phase = false) {
        const axis = new AxisAlignedBB(
            x - w / 2,
            y,
            z - w / 2,
            x + w / 2,
            y + h,
            z + w / 2
        )

        this.drawEntityAxis(axis, r, g, b, a, lineWidth, phase)
    }

    /**
     * - Draws an entity filled box with the given AxisAlignedBB values
     * @param {AxisAlignedBB} axis 
     * @param {Number} r 
     * @param {Number} g 
     * @param {Number} b 
     * @param {Number} a 
     * @param {Number} lineWidth
     * @param {Boolean} phase 
     */
    static drawEntityAxisFilled(axis, r, g, b, a, lineWidth = 1, phase = false) {
        const [ x0, y0, z0, x1, y1, z1 ] = getAxisValues(axis)

        Tessellator.pushMatrix()

        GL11.glLineWidth(lineWidth)
        Tessellator.begin(GL11.GL_QUADS, true)
        GL11.glEnable(GL11.GL_LINE_SMOOTH)

        GlStateManager.func_179129_p() // disableCullFace
        Tessellator.enableBlend()
        Tessellator.blendFunc(770, 771)
        Tessellator.depthMask(false)
        Tessellator.disableTexture2D()

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

        GlStateManager.func_179089_o() // enableCull
        Tessellator.disableBlend()
        Tessellator.depthMask(true)
        Tessellator.enableTexture2D()
        if (phase) Tessellator.enableDepth()

        GL11.glDisable(GL11.GL_LINE_SMOOTH)
        Tessellator.popMatrix()
    }

    /**
     * - Draws an entity filled box with the given [x, y, z, w, h] values
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} z 
     * @param {Number} w 
     * @param {Number} h 
     * @param {Number} r 
     * @param {Number} g 
     * @param {Number} b 
     * @param {Number} a 
     * @param {Number} lineWidth
     * @param {Boolean} phase 
     */
    static drawEntityBoxFilled(x, y, z, w, h, r, g, b, a, lineWidth = 1, phase = false) {
        const axis = new AxisAlignedBB(
            x - w / 2,
            y,
            z - w / 2,
            x + w / 2,
            y + h,
            z + w / 2
        )

        this.drawEntityAxisFilled(axis, r, g, b, a, lineWidth, phase)
    }
}