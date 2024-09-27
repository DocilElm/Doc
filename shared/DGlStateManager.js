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

    static bindTexture(int) {
        GlStateManager.func_179144_i(int)
        return this
    }

    static scale(x, y) {
        GlStateManager.func_179152_a(x, y || x, 1)
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

    static enableLighting() {
        GlStateManager.func_179145_e()

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