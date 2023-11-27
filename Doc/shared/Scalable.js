import { Command } from "../core/Events"
import { Persistence } from "./Persistence"
import { TextHelper } from "./Text"

// big thank bloom

// Main gui to edit all of the other guis
const mainEditGui = new Gui()
const savedGui = new Set()
const text = "&a&lClick at any component to open their edit gui"

export default class ScalableGui {
    constructor(featureName, defaultString = null){
        this.featureName = featureName
        this.gui = new Gui()

        this.string = defaultString
        this.width = null
        this.height = null

        this.gui.registerScrolled((_, __, dir) => {
            if (dir == 1) Persistence.data[this.featureName].scale += 0.02
            else Persistence.data[this.featureName].scale -= 0.02
            Persistence.data.save()
        })

        this.gui.registerMouseDragged((mx, my) => {
            Persistence.data[this.featureName].x = mx
            Persistence.data[this.featureName].y = my
            Persistence.data.save()
        })

        // Save this class to use it in the main edit gui
        savedGui.add(this)
    }

    setCommand(commandName) {        
        register("command", () => {
            this.open()
        }).setName(commandName)
        
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
        if (!this.hasBoundingBox) return null

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
        // Gets the first text that has [\n] on it
        const subString = this.string.match(/(.+)\n+/)?.[1]

        // If either of these isn't defined we return [null]
        if (!spaceAmount || !subString) return null

        // Else we return the [w, h] values
        return [
            Renderer.getStringWidth(subString.removeFormatting()), // Gets the [subString] width to use as width
            spaceAmount * Renderer.getFontRenderer().field_78288_b // Gets the [FONT_HEIGHT] and times it by the amount of [\n]
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
        const color = Renderer.color(0, 0, 0, 80)

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
    Renderer.drawStringWithShadow(
        text,
        Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(text.removeFormatting()) / 2,
        Renderer.screen.getHeight() / 2
    )

    savedGui.forEach(guis => {
        guis.defaultFunc()

        if (!guis.hasBoundingBox()) return

        guis.drawBoundingBox()
    })
})

mainEditGui.registerClicked((mx, my) => {
    savedGui.forEach(guis => {
        if (!guis.hasBoundingBox()) return

        // If the mouse click isnt near this component's
        // boundries we return
        if (!TextHelper.checkBoundingBox([mx, my], guis.getBoundingBox())) return

        // Else we open the component's edit gui
        guis.open()
    })
})

new Command(null, "docguis", () => mainEditGui.open()).start()