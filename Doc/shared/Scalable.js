import ElementUtils from "../../DocGuiLib/core/Element"
import HandleGui from "../../DocGuiLib/core/Gui"
import { CenterConstraint, ConstantColorConstraint, CramSiblingConstraint, ScrollComponent, UIRoundedRectangle, UIText } from "../../Elementa"
import { Command } from "../core/Events"
import { Persistence } from "./Persistence"
import { TextHelper } from "./Text"

// big thank bloom

// Main gui to edit all of the other guis
const mainEditGui = new Gui()
const savedGui = new Set()
const text = "&a&lClick at any component to open their edit gui"
let currGui = null

export default class ScalableGui {
    constructor(featureName, defaultString = null){
        this.featureName = featureName
        this.gui = new Gui()

        this.string = defaultString
        this.width = null
        this.height = null
        this.customSize = null
        this.commandName = null

        this.selected = false

        this.gui.registerScrolled((_, __, dir) => {
            if (dir === 1) Persistence.data[this.featureName].scale += 0.02
            else Persistence.data[this.featureName].scale -= 0.02
            Persistence.data.save()

            if (this.customSize) this.customSize(dir)
        })

        this.gui.registerMouseDragged((mx, my) => {
            Persistence.data[this.featureName].x = mx
            Persistence.data[this.featureName].y = my
            Persistence.data.save()
        })

        // Save this class to use it in the main edit gui
        savedGui.add(this)
    }

    onMouseScroll(dir) {
        if (!this.selected) return

        if (dir === 1) Persistence.data[this.featureName].scale += 0.02
        else Persistence.data[this.featureName].scale -= 0.02

        Persistence.data.save()

        if (this.customSize) this.customSize(dir)
    }

    onMouseDrag(mx, my) {
        if (!this.selected) return

        Persistence.data[this.featureName].x = mx
        Persistence.data[this.featureName].y = my
        Persistence.data.save()
    }

    onMouseClick(mx, my, mbtn) {
        if (!this.getBoundingBox() || currGui && currGui !== this.featureName) return

        if (!TextHelper.checkBoundingBox([mx, my], this.getBoundingBox()) && this.selected) {
            this.selected = false
            currGui = null

            return
        }
        if (!TextHelper.checkBoundingBox([mx, my], this.getBoundingBox())) return

        this.selected = true
        currGui = this.featureName
    }

    setCommand(commandName) {
        this.commandName = commandName

        register("command", () => {
            this.open()
        }).setName(commandName)
        
        return this
    }

    /**
     * - Sets a custom size function that will be ran everytime the editGui is open
     * - and the scroll has been detected, giving the direction of this as a param to the function.
     * @param {Function} fn 
     * @returns this for method chaining
     */
    setCustomSize(fn) {
        this.customSize = fn

        return this
    }

    onRender(func) {
        this.defaultFunc = func
        this.gui.registerDraw(func)
    }

    getX() {
        return Persistence.data[this.featureName].x ?? 0
    }

    getY() {
        return Persistence.data[this.featureName].y ?? 0
    }

    getScale() {
        return Persistence.data[this.featureName].scale ?? 1
    }

    open() {
        this.gui.open()
    }

    close() {
        this.gui.close()
    }

    isOpen() {
        return this.gui.isOpen()
    }

    /**
     * - Checks whether this ScalableGui has bounding box
     * @returns {Boolean}
     */
    hasBoundingBox() {
        if (this.width !== null && this.height !== null) return true
        if (!this.string) return false

        return true
    }

    /**
     * - Sets the current ScalableGui's [width, height]
     * @param {Number} width 
     * @param {Number} height 
     * @returns this for method chaining
     */
    setSize(width, height) {
        this.width = width
        this.height = height

        return this
    }

    /**
     * - Sets the current ScalableGui's [string]
     * @param {String} string 
     * @param {Boolean} shouldCheck Whether to check if the string is already defined or not. if it is it returns without adding the new one
     * @returns this for method chaining
     */
    setString(string, shouldCheck = false) {
        if (shouldCheck && this.string !== null) return

        this.string = string

        return this
    }

    /**
     * - Gets the size [width, height] of the current string or the set values
     * @returns {[Number, Number]| null}
     */
    getSize() {
        if (!this.hasBoundingBox()) return null

        // If [w, h] values are set by the feature we return those
        if (this.width !== null && this.height !== null) return [ this.width, this.height ]

        // Check whether the string has [\n] spaces
        // if it does get the [w, h] from a 1 line string
        if (!/\n+/g.test(this.string)) return [
            Renderer.getStringWidth(this.string.removeFormatting()),
            Renderer.getFontRenderer().field_78288_b
        ]

        // Get the [w, h] values from a multiple space [\n] string

        // Gets the amount of [\n] in the string
        const spaceAmount = this.string.match(/\n+/g)?.length
        // Gets the biggest text that has [\n] on it
        const subString = this.string.match(/(.+)\n/g).reduce((a, b) => {
            if (a.length > b.length) return a
          
            a = b
          
            return a
          }, "")

        // If either of these isn't defined we return [null]
        if (!spaceAmount || !subString) return null

        // Else we return the [w, h] values
        return [
            Renderer.getStringWidth(subString.removeFormatting()), // Gets the [subString] width to use as width
            (spaceAmount + 1) * Renderer.getFontRenderer().field_78288_b // Gets the [FONT_HEIGHT] and times it by the amount of [\n]
        ]
    }

    /**
     * - Gets this ScalableGui's bounding box [ x1, y1, x2, y2 ]
     * @returns {[Number, Number, Number, Number] | null}
     */
    getBoundingBox() {
        // Using [size] so it can be checked before-hand for a null value
        // not using [ w, h ] = #getSize else it'll npe
        const size = this.getSize()

        // If the [size] is null we return || should never happen
        if (!size) return null

        // Else we return [ x1, y1, x2, y2 ] bounds
        return [
            this.getX(),
            this.getY(),
            this.getX() + size[0],
            this.getY() + size[1]
        ]
    }

    drawBoundingBox() {
        const [ x1, y1, x2, y2 ] = this.getBoundingBox()
        const thickness = 1.5
        const color = Renderer.color(0, 255, 100, 255)

        // Draw top line
        Renderer.drawLine(
            color,
            x1 - thickness,
            y1 - 1,
            x2 - thickness,
            y1 - 1,
            thickness
        )

        // Draw left side line
        Renderer.drawLine(
            color,
            x1 - thickness,
            y1 - 1,
            x1 - thickness,
            y2 - 1,
            thickness
        )

        // Draw right side line
        Renderer.drawLine(
            color,
            x2 + thickness,
            y1 + 1,
            x2 + thickness,
            y2 + 1,
            thickness
        )

        // Draw bottom line
        Renderer.drawLine(
            color,
            x1 + thickness,
            y2 + 1,
            x2 + thickness,
            y2 + 1,
            thickness
        )
    }
}

// Trigger all of the guis default function
// this is to render them in the current gui all at once
mainEditGui.registerDraw(() => {
    if (!currGui) {
        Renderer.drawStringWithShadow(
            text,
            Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(text.removeFormatting()) / 2,
            Renderer.screen.getHeight() / 2
        )
    }

    savedGui.forEach(guis => {
        guis.defaultFunc()

        if (!guis.hasBoundingBox()) return

        guis.drawBoundingBox()
    })

    if (currGui) {
        const theText = `&bCurrently editing&f: &6${currGui}`

        Renderer.retainTransforms(true)
        Renderer.translate(Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(theText.removeFormatting()) / 2, 10, 300)
        Renderer.drawRect(Renderer.BLACK, 0, 0, Renderer.getStringWidth(theText.removeFormatting()), 12)
        Renderer.drawStringWithShadow(theText, 0, 1)
        Renderer.retainTransforms(false)
        Renderer.finishDraw()
    }
})

mainEditGui.registerClicked((mx, my, mbtn) => savedGui.forEach(it => it.onMouseClick(mx, my, mbtn)))
mainEditGui.registerMouseDragged((mx, my) => savedGui.forEach(it => it.onMouseDrag(mx, my)))
mainEditGui.registerScrolled((mx, my, dir) => savedGui.forEach(it => it.onMouseScroll(dir)))

new Command(null, "docallguis", () => mainEditGui.open()).start()

const handler = new HandleGui()

const bgBox = new UIRoundedRectangle(5)
    .setX(new CenterConstraint())
    .setY(new CenterConstraint())
    .setWidth((30).percent())
    .setHeight((50).percent())
    .setColor(ElementUtils.getJavaColor([0, 0, 0, 80]))

const bgScrollable = new ScrollComponent("", 5)
    .setX(new CenterConstraint())
    .setY((1).pixels())
    .setWidth((80).percent())
    .setHeight((90).percent())
    .setChildOf(bgBox)

const scrollableSlider = new UIRoundedRectangle(3)
    .setX(new CramSiblingConstraint(2))
    .setY((5).pixels())
    .setHeight((5).pixels())
    .setWidth((5).pixels())
    .setColor(ElementUtils.getJavaColor([255, 255, 255, 80]))
    .setChildOf(bgBox)

bgScrollable.setScrollBarComponent(scrollableSlider, true, false)

const btnCreated = new Set()

class ButtonComponent {
    constructor(featureName, commandName) {
        this.featureName = featureName
        this.commandName = commandName

        this._init()
        btnCreated.add(this.featureName)
    }

    _init() {
        this.bgButtonBox = new UIRoundedRectangle(5)
            .setX((1).pixels())
            .setY(new CramSiblingConstraint(5))
            .setWidth((100).percent())
            .setHeight((12).percent())
            .setColor(ElementUtils.getJavaColor([0, 0, 0, 80]))
            .setChildOf(bgScrollable)
            .onMouseClick((comp, event) => {
                if (event.mouseButton !== 0) return

                ChatLib.command(this.commandName, true)
            })

        this.buttonText = new UIText(this.featureName)
            .setX(new CenterConstraint())
            .setY(new CenterConstraint())
            .setChildOf(this.bgButtonBox)
    }
}

new ButtonComponent("All Gui Edits", "docallguis")

register("command", () => {
    savedGui.forEach(it => {
        if (btnCreated.has(it.featureName)) return

        new ButtonComponent(it.featureName, it.commandName)
    })

    handler.ctGui.open()
}).setName("docguis")

handler._drawNormal(bgBox)