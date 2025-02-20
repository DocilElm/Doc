import { DGlStateManager } from "./DGlStateManager"

const AxisAlignedBB = Java.type("net.minecraft.util.AxisAlignedBB")
const GuiUtils = Java.type("net.minecraftforge.fml.client.config.GuiUtils")
const RenderGlobal = Java.type("net.minecraft.client.renderer.RenderGlobal")
const MCTessellator = Java.type("net.minecraft.client.renderer.Tessellator").func_178181_a()
const DefaultVertexFormats = Java.type("net.minecraft.client.renderer.vertex.DefaultVertexFormats")
const WorldRenderer = MCTessellator.func_178180_c()
const IBlockStateAir = new BlockType("minecraft:air").getDefaultState()
const inRenderer = Renderer.INSTANCE
const mcRenderItemField = Java.type("net.minecraft.client.Minecraft").class.getDeclaredField("field_175621_X")
mcRenderItemField.setAccessible(true)
const MCRenderItem = mcRenderItemField.get(Client.getMinecraft())
export const MCRenderHelper = Java.type("net.minecraft.client.renderer.RenderHelper")

// From BeaconBeam module
const ResourceLocation = Java.type("net.minecraft.util.ResourceLocation")
const MathHelper = Java.type("net.minecraft.util.MathHelper")
const beaconBeam = new ResourceLocation("textures/entity/beacon_beam.png")

// From BloomCore
const GuiContainer = Java.type("net.minecraft.client.gui.inventory.GuiContainer")
const guiContainerLeftField = GuiContainer.class.getDeclaredField("field_147003_i")
const guiContainerTopField = GuiContainer.class.getDeclaredField("field_147009_r")
guiContainerLeftField.setAccessible(true)
guiContainerTopField.setAccessible(true)

/**
 * - Gets the given [AxisAlignedBB] [Min] and [Max] positions
 * @param {AxisAlignedBB} axis 
 * @returns {[number, number, number, number, number, number]}
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

/**
 * - Draws a title with subtitle in the middle of the screen
 * @param {string} title The title
 * @param {string} subtitle The subtitle for this Title
 * @param {number} ms The amount of ms this title should be displayed for
 */
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

export class RenderHelper {
    /**
     * - Gets the gui's X and Y values
     * @param {GuiContainer?} mcGuiContainer The GuiContainer. if null it'll try to assign the current GuiContainer
     * @returns {[number, number]?}
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
     * @param {number} slotNumber 
     * @param {GuiContainer?} mcGuiContainer
     * @returns {[number, number]}
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
     * @returns {[number, number, number, number]}
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
     * - Draws a line through the given points
     * @param {number[][]} points The points in an array of arrays
     * @param {number} r Red (`0` - `255`)
     * @param {number} g Green (`0` - `255`)
     * @param {number} b Blue (`0` - `255`)
     * @param {number} a Alpha (`0` - `255`)
     * @param {boolean} phase Whether to render the lines through walls or not (`true` by default)
     * @param {number} lineWidth The width of the line
     * @param {boolean} translate Whether to translate the rendering coords to the [RenderViewEntity] coords (`true` by default)
     */
    static drawLineThroughPoints(points, r, g, b, a, phase = true, lineWidth = 3, translate = true) {
        const [ realX, realY, realZ ] = this.getInterp()

        GL11.glLineWidth(lineWidth)
        DGlStateManager
            .pushMatrix()
            .disableCull()
            .disableLighting()
            .disableTexture2D()
            .enableBlend()
            .tryBlendFuncSeparate(770, 771, 1, 0)

        if (translate) DGlStateManager.translate(-realX, -realY, -realZ)
        if (phase) DGlStateManager.disableDepth()

        DGlStateManager.color(r / 255, g / 255, b / 255, a / 255)

        WorldRenderer.func_181668_a(3, DefaultVertexFormats.field_181705_e)
        for (let idx = 0; idx < points.length; idx++) {
            let [ x, y, z ] = points[idx]
            WorldRenderer.func_181662_b(x, y, z).func_181675_d()
        }
        MCTessellator.func_78381_a()

        if (translate) DGlStateManager.translate(realX, realY, realZ)
        if (phase) DGlStateManager.enableDepth()

        DGlStateManager
            .color(1, 1, 1, 1)
            .enableCull()
            .enableLighting()
            .enableTexture2D()
            .enableBlend()
            .popMatrix()
        GL11.glLineWidth(2)
    }

    static getRenderViewEntity() {
        return Client.getMinecraft().func_175606_aa() // getRenderViewEntity
    }

    static getInterp(customTicks) {
        const render = this.getRenderViewEntity()
        const pticks = Tessellator.getPartialTicks()

        return [
            this.interpolate(render.field_70165_t, render.field_70142_S, customTicks || pticks),
            this.interpolate(render.field_70163_u, render.field_70137_T, customTicks || pticks),
            this.interpolate(render.field_70161_v, render.field_70136_U, customTicks || pticks)
        ]
    }

    /**
     * - Calls the [drawOutlinedBoundingBox] from minecraft's [RenderGlobal]
     * - NOTE: this does not setup anything in the stack, it directly calls the method.
     * @param {AxisAlignedBB} aabb
     * @param {number} r Red (`0` - `255`)
     * @param {number} g Green (`0` - `255`)
     * @param {number} b Blue (`0` - `255`)
     * @param {number} a Alpha (`0` - `255`)
     * @returns {this}
     */
    static drawOutlinedBoundingBox(aabb, r, g, b, a) {
        RenderGlobal.func_181563_a(aabb, r, g, b, a)

        return this
    }

    /**
     * - Draws a filled box at the given [AxisAlignedBB]
     * - NOTE: this does not setup anything in the stack, it directly draws.
     * @param {AxisAlignedBB} aabb 
     * @param {number} r Red (`0` - `255`)
     * @param {number} g Green (`0` - `255`)
     * @param {number} b Blue (`0` - `255`)
     * @param {number} a Alpha (`0` - `255`)
     */
    static drawFilledBoundingBox(aabb, r, g, b, a) {
        const [ x0, y0, z0, x1, y1, z1 ] = getAxisValues(aabb)
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
    }

    static drawOutlinedBox(aabb, r, g, b, a, phase = true, lineWidth = 3, translate = true, customTicks) {
        const [ realX, realY, realZ ] = this.getInterp(customTicks)

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

        this.drawOutlinedBoundingBox(aabb, r, g, b, a)

        if (translate) DGlStateManager.translate(realX, realY, realZ)
        if (phase) DGlStateManager.enableDepth()

        DGlStateManager
            .disableBlend()
            .enableAlpha()
            .enableTexture2D()
            .color(1, 1, 1, 1)
            .enableLighting()
            .popMatrix()

        GL11.glLineWidth(2)
    }

    static drawFilledBox(aabb, r, g, b, a, phase = true, translate = true, customTicks) {
        const [ realX, realY, realZ ] = this.getInterp(customTicks)

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

        this.drawFilledBoundingBox(aabb, r, g, b, a)

        if (translate) DGlStateManager.translate(realX, realY, realZ)
        if (phase) DGlStateManager.enableDepth()

        DGlStateManager
            .disableBlend()
            .enableAlpha()
            .enableTexture2D()
            .color(1, 1, 1, 1)
            .enableCull()
            .enableLighting()
            .popMatrix()
    }

    /**
     * - Draws an entity box with the given [x, y, z, w, h] values
     * @param {number} x X axis
     * @param {number} y Y axis
     * @param {number} z Z axis
     * @param {number} w Width
     * @param {number} h Height
     * @param {number} r Red (`0` - `255`)
     * @param {number} g Green (`0` - `255`)
     * @param {number} b Blue (`0` - `255`)
     * @param {number} a Alpha (`0` - `255`)
     * @param {boolean} phase Whether to render the box through walls or not (`false` by default)
     * @param {number} lineWidth The width of the line
     * @param {boolean} translate Whether to translate the rendering coords to the [RenderViewEntity] coords (`true` by default)
     */
    static drawEntityBox(x, y, z, w, h, r, g, b, a, lineWidth = 1, phase = false, translate = true, customTicks = null) {
        if (x == null) return

        const axis = new AxisAlignedBB(
            x - w / 2,
            y,
            z - w / 2,
            x + w / 2,
            y + h,
            z + w / 2
        )

        this.drawOutlinedBox(axis, r, g, b, a, phase, lineWidth, translate, customTicks)
    }

    /**
     * - Draws an entity filled box with the given [x, y, z, w, h] values
     * @param {number} x X axis
     * @param {number} y Y axis
     * @param {number} z Z axis
     * @param {number} w Width
     * @param {number} h Height
     * @param {number} r Red (`0` - `255`)
     * @param {number} g Green (`0` - `255`)
     * @param {number} b Blue (`0` - `255`)
     * @param {number} a Alpha (`0` - `255`)
     * @param {boolean} phase Whether to render the filled box through walls or not (`false` by default)
     * @param {boolean} translate Whether to translate the rendering coords to the [RenderViewEntity] coords (`true` by default)
     */
    static drawEntityBoxFilled(x, y, z, w, h, r, g, b, a, phase = false, translate = true, customTicks = null) {
        if (x == null) return

        const axis = new AxisAlignedBB(
            x - w / 2,
            y,
            z - w / 2,
            x + w / 2,
            y + h,
            z + w / 2
        )

        this.drawFilledBox(axis, r, g, b, a, phase, translate, customTicks)
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

    /**
     * - (mostly) Internal use.
     * - Gets the [AxisAlignedBB] for the given [Block]
     * - The same way mojang does it (kind of)
     * @param {Block} ctBlock
     * @returns 
     */
    static getCTBlockAxis(ctBlock) {
        if (ctBlock.getState() != IBlockStateAir)
            ctBlock.type.mcBlock.func_180654_a(World.getWorld(), ctBlock.pos.toMCBlock())

        // getSelectedBoundingBox - func_180646_a
        return ctBlock.type.mcBlock.func_180646_a(World.getWorld(), ctBlock.pos.toMCBlock())
            .func_72314_b(0.002, 0.002, 0.002) // func_72314_b - expand
    }

    /**
     * - Renders an outline like at the given [Block]
     * - This is (mostly) [Mojang]'s code
     * @param {Block} ctBlock
     * @param {number} r Red (`0` - `255`)
     * @param {number} g Green (`0` - `255`)
     * @param {number} b Blue (`0` - `255`)
     * @param {number} a Alpha (`0` - `255`)
     * @param {boolean} phase Whether to render the filled block through walls or not (`true` by default)
     * @param {number} lineWidth The width of the line to outline this block
     * @param {boolean} translate Whether to translate the rendering coords to the [RenderViewEntity] coords (`true` by default)
     * @returns
     */
    static outlineBlock(ctBlock, r, g, b, a, phase = true, lineWidth = 3, translate = true, customTicks) {
        if (!ctBlock) return

        this.drawOutlinedBox(this.getCTBlockAxis(ctBlock), r, g, b, a, phase, lineWidth, translate, customTicks)
    }

    /**
     * - Renders a filled block like at the given [Block]
     * @param {Block} ctBlock
     * @param {number} r Red (`0` - `255`)
     * @param {number} g Green (`0` - `255`)
     * @param {number} b Blue (`0` - `255`)
     * @param {number} a Alpha (`0` - `255`)
     * @param {boolean} phase Whether to render the filled block through walls or not (`true` by default)
     * @param {boolean} translate Whether to translate the rendering coords to the [RenderViewEntity] coords (`true` by default)
     * @link Huge thanks to [Ch1ck3nNeedsRNG](https://github.com/PerseusPotter)
     * @returns
     */
    static filledBlock(ctBlock, r, g, b, a, phase = true, translate = true, customTicks) {
        if (!ctBlock) return

        this.drawFilledBox(this.getCTBlockAxis(ctBlock), r, g, b, a, phase, translate, customTicks)
    }

    /**
     * - Draws a beacon beam
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} r 0 - 255
     * @param {number} g 0 - 255
     * @param {number} b 0 - 255
     * @param {number} a 0 - 255
     * @param {boolean} phase Whether it should render through walls or not
     * @param {number} height The limit height for the beam to render to (`300` by default)
     * @param {boolean} translate Whether to translate the rendering coords to the [RenderViewEntity] coords (`true` by default)
     * @link From [NotEnoughUpdates](https://github.com/NotEnoughUpdates/NotEnoughUpdates/blob/master/src/main/java/io/github/moulberry/notenoughupdates/core/util/render/RenderUtils.java#L220)
     */
    static renderBeaconBeam(x, y, z, r, g, b, a, phase = false, height = 300, translate = true) {
        const [ realX, realY, realZ ] = this.getInterp()

        DGlStateManager.pushMatrix()

        if (translate) DGlStateManager.translate(-realX, -realY, -realZ)
        if (phase) DGlStateManager.disableDepth()

        r = r / 255
        g = g / 255
        b = b / 255
        a = a / 255

        Client.getMinecraft().func_110434_K().func_110577_a(beaconBeam) //getTextureManager().bindTexture()

        GL11.glTexParameterf(GL11.GL_TEXTURE_2D, GL11.GL_TEXTURE_WRAP_S, GL11.GL_REPEAT)
        GL11.glTexParameterf(GL11.GL_TEXTURE_2D, GL11.GL_TEXTURE_WRAP_T, GL11.GL_REPEAT)

        DGlStateManager
            .disableLighting()
            .enableCull()
            .enableTexture2D()
            .tryBlendFuncSeparate(GL11.GL_SRC_ALPHA, GL11.GL_ONE, GL11.GL_ONE, GL11.GL_ZERO)
            .enableBlend()
            .tryBlendFuncSeparate(GL11.GL_SRC_ALPHA, GL11.GL_ONE_MINUS_SRC_ALPHA, GL11.GL_ONE, GL11.GL_ZERO)

        const time = World.getTime() + Tessellator.getPartialTicks()
        const d1 = MathHelper.func_181162_h(-time * 0.2 - MathHelper.func_76128_c(-time * 0.1))
        const d2 = time * 0.025 * -1.5
        const d4 = 0.5 + Math.cos(d2 + 2.356194490192345) * 0.2
        const d5 = 0.5 + Math.sin(d2 + 2.356194490192345) * 0.2
        const d6 = 0.5 + Math.cos(d2 + (Math.PI / 4)) * 0.2
        const d7 = 0.5 + Math.sin(d2 + (Math.PI / 4)) * 0.2
        const d8 = 0.5 + Math.cos(d2 + 3.9269908169872414) * 0.2
        const d9 = 0.5 + Math.sin(d2 + 3.9269908169872414) * 0.2
        const d10 = 0.5 + Math.cos(d2 + 5.497787143782138) * 0.2
        const d11 = 0.5 + Math.sin(d2 + 5.497787143782138) * 0.2
        const d14 = -1 + d1
        const d15 = height * 2.5 + d14

        WorldRenderer.func_181668_a(GL11.GL_QUADS, DefaultVertexFormats.field_181709_i)
        WorldRenderer.func_181662_b(x + d4, y + height, z + d5).func_181673_a(1, d15).func_181666_a(r, g, b, a).func_181675_d()
        WorldRenderer.func_181662_b(x + d4, y, z + d5).func_181673_a(0, d14).func_181666_a(r, g, b, a).func_181675_d()
        WorldRenderer.func_181662_b(x + d6, y, z + d7).func_181673_a(0, d14).func_181666_a(r, g, b, 1).func_181675_d()
        WorldRenderer.func_181662_b(x + d6, y + height, z + d7).func_181673_a(0, d15).func_181666_a(r, g, b, a).func_181675_d()
        WorldRenderer.func_181662_b(x + d10, y + height, z + d11).func_181673_a(1, d15).func_181666_a(r, g, b, a).func_181675_d()
        WorldRenderer.func_181662_b(x + d10, y, z + d11).func_181673_a(1, d14).func_181666_a(r, g, b, 1).func_181675_d()
        WorldRenderer.func_181662_b(x + d8, y, z + d9).func_181673_a(0, d14).func_181666_a(r, g, b, 1).func_181675_d()
        WorldRenderer.func_181662_b(x + d8, y + height, z + d9).func_181673_a(0, d15).func_181666_a(r, g, b, a).func_181675_d()
        WorldRenderer.func_181662_b(x + d6, y + height, z + d7).func_181673_a(1, d15).func_181666_a(r, g, b, a).func_181675_d()
        WorldRenderer.func_181662_b(x + d6, y, z + d7).func_181673_a(1, d14).func_181666_a(r, g, b, 1).func_181675_d()
        WorldRenderer.func_181662_b(x + d10, y, z + d11).func_181673_a(0, d14).func_181666_a(r, g, b, 1).func_181675_d()
        WorldRenderer.func_181662_b(x + d10, y + height, z + d11).func_181673_a(0, d15).func_181666_a(r, g, b, a).func_181675_d()
        WorldRenderer.func_181662_b(x + d8, y + height, z + d9).func_181673_a(1, d15).func_181666_a(r, g, b, a).func_181675_d()
        WorldRenderer.func_181662_b(x + d8, y, z + d9).func_181673_a(1, d14).func_181666_a(r, g, b, 1).func_181675_d()
        WorldRenderer.func_181662_b(x + d4, y, z + d5).func_181673_a(0, d14).func_181666_a(r, g, b, 1).func_181675_d()
        WorldRenderer.func_181662_b(x + d4, y + height, z + d5).func_181673_a(0, d15).func_181666_a(r, g, b, a).func_181675_d()
        MCTessellator.func_78381_a()

        DGlStateManager.disableCull()

        const d12 = -1 + d1
        const d13 = height + d12

        WorldRenderer.func_181668_a(GL11.GL_QUADS, DefaultVertexFormats.field_181709_i)
        WorldRenderer.func_181662_b(x + 0.2, y + height, z + 0.2).func_181673_a(1, d13).func_181666_a(r, g, b, 0.25 * a).func_181675_d()
        WorldRenderer.func_181662_b(x + 0.2, y, z + 0.2).func_181673_a(1, d12).func_181666_a(r, g, b, 0.25).func_181675_d()
        WorldRenderer.func_181662_b(x + 0.8, y, z + 0.2).func_181673_a(0, d12).func_181666_a(r, g, b, 0.25).func_181675_d()
        WorldRenderer.func_181662_b(x + 0.8, y + height, z + 0.2).func_181673_a(0, d13).func_181666_a(r, g, b, 0.25 * a).func_181675_d()
        WorldRenderer.func_181662_b(x + 0.8, y + height, z + 0.8).func_181673_a(1, d13).func_181666_a(r, g, b, 0.25 * a).func_181675_d()
        WorldRenderer.func_181662_b(x + 0.8, y, z + 0.8).func_181673_a(1, d12).func_181666_a(r, g, b, 0.25).func_181675_d()
        WorldRenderer.func_181662_b(x + 0.2, y, z + 0.8).func_181673_a(0, d12).func_181666_a(r, g, b, 0.25).func_181675_d()
        WorldRenderer.func_181662_b(x + 0.2, y + height, z + 0.8).func_181673_a(0, d13).func_181666_a(r, g, b, 0.25 * a).func_181675_d()
        WorldRenderer.func_181662_b(x + 0.8, y + height, z + 0.2).func_181673_a(1, d13).func_181666_a(r, g, b, 0.25 * a).func_181675_d()
        WorldRenderer.func_181662_b(x + 0.8, y, z + 0.2).func_181673_a(1, d12).func_181666_a(r, g, b, 0.25).func_181675_d()
        WorldRenderer.func_181662_b(x + 0.8, y, z + 0.8).func_181673_a(0, d12).func_181666_a(r, g, b, 0.25).func_181675_d()
        WorldRenderer.func_181662_b(x + 0.8, y + height, z + 0.8).func_181673_a(0, d13).func_181666_a(r, g, b, 0.25 * a).func_181675_d()
        WorldRenderer.func_181662_b(x + 0.2, y + height, z + 0.8).func_181673_a(1, d13).func_181666_a(r, g, b, 0.25 * a).func_181675_d()
        WorldRenderer.func_181662_b(x + 0.2, y, z + 0.8).func_181673_a(1, d12).func_181666_a(r, g, b, 0.25).func_181675_d()
        WorldRenderer.func_181662_b(x + 0.2, y, z + 0.2).func_181673_a(0, d12).func_181666_a(r, g, b, 0.25).func_181675_d()
        WorldRenderer.func_181662_b(x + 0.2, y + height, z + 0.2).func_181673_a(0, d13).func_181666_a(r, g, b, 0.25 * a).func_181675_d()
        MCTessellator.func_78381_a()

        if (translate) DGlStateManager.translate(realX, realY, realZ)
        if (phase) DGlStateManager.enableDepth()

        DGlStateManager
            .enableLighting()
            .enableTexture2D()
            .popMatrix()
    }

    static renderWaypoint(text, x, y, z, r, g, b, a, phase = true) {
        const block = World.getBlockAt(x, y, z)

        this.outlineBlock(block, r, g, b, a, phase)
        this.filledBlock(block, r, g, b, 50, phase)
        Tessellator.drawString(text, x + 0.5, y + 5, z + 0.5, Renderer.WHITE, true)
        this.renderBeaconBeam(x, y, z, r, g, b, a, phase)
    }

    /**
     * - Draws an outline filled block
     */
    static outlineFilledBlock(ctBlock, r, g, b, a, phase = true, translate = true, a2 = 80) {
        if (!ctBlock) return

        this.outlineBlock(ctBlock, r, g, b, a, phase, 2, translate)
        this.filledBlock(ctBlock, r, g, b, a2, phase, translate)
    }

    /**
     * - Internal use.
     * - Sets up the vertices for an image and begins drawing it
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     */
    static _beginImage(x, y, width, height) {
        WorldRenderer.func_181668_a(7, DefaultVertexFormats.field_181707_g)
        WorldRenderer.func_181662_b(x, y + height, 0).func_181673_a(0, 1).func_181675_d()
        WorldRenderer.func_181662_b(x + width, y + height, 0).func_181673_a(1, 1).func_181675_d()
        WorldRenderer.func_181662_b(x + width, y, 0).func_181673_a(1, 0).func_181675_d()
        WorldRenderer.func_181662_b(x, y, 0).func_181673_a(0, 0).func_181675_d()
        MCTessellator.func_78381_a()
    }

    static preDrawRect() {
        Tessellator.enableBlend()
        Tessellator.disableTexture2D()
        Tessellator.tryBlendFuncSeparate(770, 771, 1, 0)
    }

    static postDrawRect() {
        Tessellator.disableBlend()
        Tessellator.enableTexture2D()
        Tessellator.colorize(1, 1, 1, 1)
    }

    static drawRect(x, y, width, height, solid = true, lineWidth = null) {
        if (lineWidth && lineWidth > 0) GL11.glLineWidth(lineWidth)
        WorldRenderer.func_181668_a(solid ? 6 : 2, DefaultVertexFormats.field_181705_e)
        WorldRenderer.func_181662_b(x, y + height, 0).func_181675_d()
        WorldRenderer.func_181662_b(x + width, y + height, 0).func_181675_d()
        WorldRenderer.func_181662_b(x + width, y, 0).func_181675_d()
        WorldRenderer.func_181662_b(x, y, 0).func_181675_d()
        MCTessellator.func_78381_a()
        if (lineWidth && lineWidth > 0) GL11.glLineWidth(1)
    }

    static colorARGB(color) {
        inRenderer.doColor$ctjs(color)
    }

    static drawItem(item, x, y, scale = 1, zlvl = 200) {
        if (scale !== 1) Renderer.scale(scale)

        Tessellator.colorize(1, 1, 1, 1)
        MCRenderHelper.func_74519_b()
        MCRenderHelper.func_74520_c()
        MCRenderItem.field_77023_b = zlvl
        MCRenderItem.func_175042_a(item.itemStack, x / scale, y / scale)
        MCRenderHelper.func_74518_a()
        MCRenderHelper.func_74518_a()

        if (scale !== 1) Renderer.scale(1 / scale)
    }
}