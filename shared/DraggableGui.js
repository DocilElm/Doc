import ElementUtils from "../../DocGuiLib/core/Element"
import HandleGui from "../../DocGuiLib/core/Gui"
import { CenterConstraint, CramSiblingConstraint, ScrollComponent, UIRoundedRectangle, UIText } from "../../Elementa"
import { addCommand } from "./Command"
import { Persistence } from "./Persistence"

const guisCreated = new Set()

export default class DraggableGui {
    constructor(featureName) {
        this.featureName = featureName
        const data = Persistence.data[this.featureName]

        if (!data || !("x" in data) || !("y" in data) || !("scale" in data)) {
            Persistence.data[this.featureName] = {
                x: 0,
                y: 0,
                scale: 1
            }

            Persistence.data.save()
        }

        // Listeners
        this._onDraw = null

        // Gui data
        this.ctGui = new Gui()
        this.width = null
        this.height = null
        this.commandName = null
        this.customSize = null
        this.selected = false // used later on

        // Add listeners to this [DraggableGui]
        this.ctGui.registerScrolled((_, __, dir) => {
            if (dir === 1) Persistence.data[this.featureName].scale += 0.02
            else Persistence.data[this.featureName].scale -= 0.02

            if (this.customSize) this.customSize(dir) // later
        })

        this.ctGui.registerMouseDragged((mx, my) => {
            Persistence.data[this.featureName].x = mx
            Persistence.data[this.featureName].y = my
        })

        // Add the created [DraggableGui] to the set
        // so we can use this outside of this class internally
        guisCreated.add(this)
    }

    /**
     * - Runs the given function anytime this [DraggableGui] is being drawn
     * - NOTE: Mostly used for editing purposes so the default string is rendered here
     * @param {() => void} fn
     * @returns this for method chaining
     */
    onDraw(fn) {
        this._onDraw = fn
        this.ctGui.registerDraw(this._onDraw)

        return this
    }

    /**
     * - Sets the [commandName] of this [DraggableGui] to be opened with
     * @param {string} name
     * @returns this for method chaining
     */
    setCommandName(name) {
        this.commandName = name

        register("command", () => {
            this.ctGui.open()
        }).setName(name)

        return this
    }

    /**
     * - Sets this [DraggableGui]'s width and height
     * - NOTE: if width or height isn't passed through it won't change that part
     * - (e.g. `setSize(10)` will only change width)
     * @param {number?} width
     * @param {number?} height
     * @returns this for method chaining
     */
    setSize(width = null, height = null) {
        if (width != null) this.width = width
        if (height != null) this.height = height

        return this
    }

    setCustomSize(cb) {
        this.customSize = cb
        return this
    }

    /**
     * - Gets the `X` value of this [DraggableGui]
     * @returns {number}
     */
    getX() {
        return Persistence.data[this.featureName].x
    }

    /**
     * - Gets the `Y` value of this [DraggableGui]
     * @returns {number}
     */
    getY() {
        return Persistence.data[this.featureName].y
    }

    /**
     * - Gets the `Scale` value of this [DraggableGui]
     * @returns {number}
     */
    getScale() {
        return Persistence.data[this.featureName].scale
    }

    /**
     * - Opens this [DraggableGui]
     * @returns this for method chaining
     */
    open() {
        this.ctGui.open()

        return this
    }

    /**
     * - Closes this [DraggableGui]
     * @returns this for method chaining
     */
    close() {
        this.ctGui.close()

        return this
    }

    /**
     * - Checks whether this [DraggableGui] is open or not
     * @returns {boolean}
     */
    isOpen() {
        return this.ctGui.isOpen()
    }
}

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

addCommand("editguis", "Opens the Edit Gui", () => {
    guisCreated.forEach(it => {
        if (btnCreated.has(it.featureName)) return

        new ButtonComponent(it.featureName, it.commandName)
    })

    handler.ctGui.open()
})

handler._drawNormal(bgBox)