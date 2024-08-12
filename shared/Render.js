const AxisAlignedBB = net.minecraft.util.AxisAlignedBB
const GuiUtils = Java.type("net.minecraftforge.fml.client.config.GuiUtils")
const RenderGlobal = Java.type("net.minecraft.client.renderer.RenderGlobal")
const MCTessellator = Java.type("net.minecraft.client.renderer.Tessellator").func_178181_a()
const DefaultVertexFormats = Java.type("net.minecraft.client.renderer.vertex.DefaultVertexFormats")
const WorldRenderer = MCTessellator.func_178180_c()

// From BloomCore
const GuiContainer = Java.type("net.minecraft.client.gui.inventory.GuiContainer")
const guiContainerLeftField = GuiContainer.class.getDeclaredField("field_147003_i")
const guiContainerTopField = GuiContainer.class.getDeclaredField("field_147009_r")
guiContainerLeftField.setAccessible(true)
guiContainerTopField.setAccessible(true)

/**
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

/**
 * - Gets the given [AxisAlignedBB] [Min] and [Max] positions
 * @param {AxisAlignedBB} axis 
 * @returns {[ Number, Number, Number, Number, Number, Number ]}
 */
const getAxisValues = (axis, filled = false) => [
        axis.field_72340_a - (filled ? .01 : 0), // Min X
        axis.field_72338_b - (filled ? .01 : 0), // Min Y
        axis.field_72339_c - (filled ? .01 : 0), // Min Z
        axis.field_72336_d + (filled ? .01 : 0), // Max X
        axis.field_72337_e + (filled ? .01 : 0), // Max Y
        axis.field_72334_f + (filled ? .01 : 0) // Max Z
    ]

const currentTitle = {
    title: null,
    subtitle: null,
    time: null
}
let started = null

const _drawTitle = (title, subtitle) => {
    const [ x, y ] = [
        Renderer.screen.getWidth() / 2,
        Renderer.screen.getHeight() / 2
    ]

    Renderer.translate(x, y)
    Renderer.scale(4, 4)
    Renderer.drawStringWithShadow(title, -(Renderer.getStringWidth(title) / 2), -10)

    Renderer.translate(x, y)
    Renderer.scale(2, 2)
    Renderer.drawStringWithShadow(subtitle, -(Renderer.getStringWidth(subtitle) / 2), 5)
}

export const showTitle = (title, subtitle, ms) => {
    currentTitle.title = title
    currentTitle.subtitle = subtitle
    currentTitle.time = ms
}

register("renderOverlay", () => {
    if (!currentTitle.time) return
    if (!started) started = Date.now()

    const remainingTime = currentTitle.time - (Date.now() - started)

    if (remainingTime <= 0) {
        currentTitle.title = null
        currentTitle.subtitle = null
        currentTitle.time = null

        started = null

        return
    }

    _drawTitle(currentTitle.title, currentTitle.subtitle)
})

export class DGlStateManager {
    static pushMatrix() {
        GlStateManager.func_179094_E()

        return this
    }

    static popMatrix() {
        GlStateManager.func_179121_F()

        return this
    }

    static translate(x, y, z) {
        GlStateManager.func_179137_b(x, y, z)

        return this
    }

    static tryBlendFuncSeparate(srcFactor, dstFactor, srcFactorAlpha, dstFactorAlpha) {
        GlStateManager.func_179120_a(srcFactor, dstFactor, srcFactorAlpha, dstFactorAlpha)

        return this
    }

    static color(r, g, b, a) {
        GlStateManager.func_179131_c(r, g, b, a)

        return this
    }

    static enableBlend() {
        GlStateManager.func_179147_l()

        return this
    }

    static enableAlpha() {
        GlStateManager.func_179141_d()

        return this
    }

    static enableTexture2D() {
        GlStateManager.func_179098_w()

        return this
    }

    static enableDepth() {
        GlStateManager.func_179126_j()

        return this
    }

    static enableCull() {
        GlStateManager.func_179089_o()

        return this
    }

    static disableTexture2D() {
        GlStateManager.func_179090_x()

        return this
    }

    static disableLighting() {
        GlStateManager.func_179140_f()

        return this
    }

    static disableAlpha() {
        GlStateManager.func_179118_c()

        return this
    }

    static disableBlend() {
        GlStateManager.func_179084_k()

        return this
    }

    static disableDepth() {
        GlStateManager.func_179097_i()

        return this
    }

    static disableCull() {
        GlStateManager.func_179129_p()

        return this
    }

    static resetColor() {
        GlStateManager.func_179117_G()

        return this
    }
}

export class RenderHelper {
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
        if (!Client.isInGui() || slotNumber == null) return

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

    static interpolate(cr, lv, mult) {
        return lv + (cr - lv) * mult
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
        GlStateManager.func_179129_p() // disableCullFace
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

        GlStateManager.func_179089_o() // enableCull
        Tessellator.enableTexture2D()
        Tessellator.disableBlend()
        Tessellator.depthMask(true)
        Tessellator.popMatrix()

    }
    
    static getRenderViewEntity() {
        return Client.getMinecraft().func_175606_aa() // getRenderViewEntity
    }

    static getInterp() {
        const render = this.getRenderViewEntity()
        const pticks = Tessellator.getPartialTicks()

        return [
            this.interpolate(render.field_70165_t, render.field_70142_S, pticks),
            this.interpolate(render.field_70163_u, render.field_70137_T, pticks),
            this.interpolate(render.field_70161_v, render.field_70136_U, pticks)
        ]
    }

    static drawOutlinedBox(aabb, r, g, b, a, phase = true, lineWidth = 3, translate = true) {
        const [ realX, realY, realZ ] = this.getInterp()

        DGlStateManager
            .pushMatrix()
            .disableTexture2D()
            .enableBlend()
            .disableLighting()
            .disableAlpha()
            .tryBlendFuncSeparate(770, 771, 1, 0)

        GL11.glLineWidth(lineWidth)
        
        if (translate) DGlStateManager.translate(-realX, -realY, -realZ)
        if (phase) DGlStateManager.disableDepth()

        RenderGlobal.func_181563_a(aabb, r, g, b, a)

        if (translate) DGlStateManager.translate(realX, realY, realZ)
        if (phase) DGlStateManager.enableDepth()

        DGlStateManager
            .disableBlend()
            .enableAlpha()
            .enableTexture2D()
            .color(1, 1, 1, 1)
            .popMatrix()

        GL11.glLineWidth(2)
    }

    static drawFilledBox(aabb, r, g, b, a, phase = true, translate = true) {
        const [ x0, y0, z0, x1, y1, z1 ] = getAxisValues(aabb)
        const [ realX, realY, realZ ] = this.getInterp()

        DGlStateManager
            .pushMatrix()
            .disableCull()
            .disableTexture2D()
            .enableBlend()
            .disableLighting()
            .disableAlpha()
            .tryBlendFuncSeparate(770, 771, 1, 0)

        if (translate) DGlStateManager.translate(-realX, -realY, -realZ)
        if (phase) DGlStateManager.disableDepth()

        DGlStateManager.color(r / 255, g / 255, b / 255, a / 255)

        WorldRenderer.func_181668_a(5, DefaultVertexFormats.field_181705_e)
        WorldRenderer.func_181662_b(x0, y0, z0).func_181675_d()
        WorldRenderer.func_181662_b(x1, y0, z0).func_181675_d()
        WorldRenderer.func_181662_b(x0, y0, z1).func_181675_d()
        WorldRenderer.func_181662_b(x1, y0, z1).func_181675_d()
        WorldRenderer.func_181662_b(x0, y1, z1).func_181675_d()
        WorldRenderer.func_181662_b(x1, y1, z1).func_181675_d()
        WorldRenderer.func_181662_b(x0, y1, z0).func_181675_d()
        WorldRenderer.func_181662_b(x1, y1, z0).func_181675_d()
        WorldRenderer.func_181662_b(x0, y0, z0).func_181675_d()
        WorldRenderer.func_181662_b(x1, y0, z0).func_181675_d()
        MCTessellator.func_78381_a()

        WorldRenderer.func_181668_a(7, DefaultVertexFormats.field_181705_e)
        WorldRenderer.func_181662_b(x0, y0, z0).func_181675_d()
        WorldRenderer.func_181662_b(x0, y0, z1).func_181675_d()
        WorldRenderer.func_181662_b(x0, y1, z1).func_181675_d()
        WorldRenderer.func_181662_b(x0, y1, z0).func_181675_d()
        WorldRenderer.func_181662_b(x1, y0, z0).func_181675_d()
        WorldRenderer.func_181662_b(x1, y0, z1).func_181675_d()
        WorldRenderer.func_181662_b(x1, y1, z1).func_181675_d()
        WorldRenderer.func_181662_b(x1, y1, z0).func_181675_d()
        MCTessellator.func_78381_a()

        if (translate) DGlStateManager.translate(realX, realY, realZ)
        if (phase) DGlStateManager.enableDepth()

        DGlStateManager
            .disableBlend()
            .enableAlpha()
            .enableTexture2D()
            .color(1, 1, 1, 1)
            .enableCull()
            .popMatrix()
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
    static drawEntityBox(x, y, z, w, h, r, g, b, a, lineWidth = 1, phase = false, translate = true) {
        if (x == null) return
        
        const axis = new AxisAlignedBB(
            x - w / 2,
            y,
            z - w / 2,
            x + w / 2,
            y + h,
            z + w / 2
        )

        this.drawOutlinedBox(axis, r, g, b, a, phase, lineWidth, translate)
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
    static drawEntityBoxFilled(x, y, z, w, h, r, g, b, a, phase = false, translate = true) {
        if (x == null) return
        
        const axis = new AxisAlignedBB(
            x - w / 2,
            y,
            z - w / 2,
            x + w / 2,
            y + h,
            z + w / 2
        )

        this.drawFilledBox(axis, r, g, b, a, phase, translate)
    }

    // TODO: add jsdocs to this
    static drawHoveringText(
        list = [],
        mx = Client.getMouseX(),
        my = Client.getMouseY(),
        screenWidth = Renderer.screen.getWidth(),
        screenHeight = Renderer.screen.getHeight(),
        maxLength = -1,
        fontRenderer = Renderer.getFontRenderer()
        ) {
        GuiUtils.drawHoveringText(
            list,
            mx,
            my,
            screenWidth,
            screenHeight,
            maxLength,
            fontRenderer
        )
    }

    static getCTBlockAxis(ctBlock) {
        // getSelectedBoundingBox - func_180646_a
        return ctBlock.type.mcBlock.func_180646_a(World.getWorld(), ctBlock.pos.toMCBlock())
            .func_72314_b(0.0020000000949949026, 0.0020000000949949026, 0.0020000000949949026) // func_72314_b - expand
    }

    /**
     * - Renders an outline at the given [Block]
     * - This is (mostly) [Mojang]'s code
     * @param {Block} ctBlock The Ct Block to render an outline on
     * @param {Number} r Red
     * @param {Number} g Green
     * @param {Number} b Blue
     * @param {Number} a Alpha
     * @param {Boolean} phase Whether it should show the outline through walls or not (`true` by default)
     * @param {Number} thickness The thickness of the line being rendered (`3` by default)
     */
    static outlineBlock(ctBlock, r, g, b, a, phase = true, lineWidth = 3, translate = true) {
        if (!ctBlock) return

        this.drawOutlinedBox(this.getCTBlockAxis(ctBlock), r, g, b, a, phase, lineWidth, translate)
    }

    /**
     * - Renders a filled block like at the given [Block]
     * - Partially [Bloom]'s code
     * @param {Block} ctBlock The Ct Block to render on
     * @param {Number} r Red
     * @param {Number} g Green
     * @param {Number} b Blue
     * @param {Number} a Alpha
     * @param {Boolean} phase Whether it should show the filled block through walls or not (`true` by default)
     */
    static filledBlock(ctBlock, r, g, b, a, phase = true, translate = true) {
        if (!ctBlock) return

        this.drawFilledBox(this.getCTBlockAxis(ctBlock), r, g, b, a, phase, translate)
    }
}