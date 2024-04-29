import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { createSkull } from "../../shared/InventorySlot"
import { Persistence } from "../../shared/Persistence"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/Text"

// Constant variables
const feature = new Feature("EquipmentDisplay", "Misc", "")
const equipmentSlots = [10, 19, 28, 37]
const armorSlots = [5, 6, 7, 8]
const slotColor = Renderer.color(100, 100, 100, 150)
const slotBorderColor = Renderer.color(50, 50, 50, 150)
const barrier = new Item("minecraft:barrier")
const cachedTextures = new Map()
const buttonsClass = new Set()

// Changeable variables
let shouldScan = false
let previousArray = null

// TODO: make these type of classes into its own thing
// since alot of features use these type of classes
class InventoryButton {
    constructor(texture, slot) {
        this.texture = texture
        this.item = this._createItem()
        this.slot = slot

        this.xOffset = 0
        this.yOffset = 0
        this.fn = null

        buttonsClass.add(this)
    }

    /**
     * - Creates this Button's item
     * @returns {Item}
     */
    _createItem() {
        if (!this.texture) return barrier

        const item = cachedTextures.get(this.texture) ?? createSkull(this.texture)

        if (!cachedTextures.has(this.texture)) cachedTextures.set(this.texture, item)

        return item
    }

    /**
     * - Sets the [x|y] offset for this Button
     * @param {Number} x 
     * @param {Number} y 
     * @returns this for method chaining
     */
    setOffset(x = 0, y = 0) {
        this.xOffset = x
        this.yOffset = y

        return this
    }

    /**
     * - Gets this Button's boundaries
     * @returns {[Number, Number, Number, Number]}
     */
    getBoundary() {
        const [ x, y ] = RenderHelper.getSlotRenderPosition(this.slot)

        return [
            x + this.xOffset,
            y + this.yOffset,
            x + this.xOffset + 16,
            y + this.yOffset + 16
        ]
    }

    /**
     * - Draws the button with a rect like background
     */
    draw() {
        const [ x, y ] = this.getBoundary()
        
        Renderer.drawRect(slotColor, x, y, 16, 16)
        this.item.draw(x, y)
        this._drawOutline()
    }

    /**
     * - Internal use
     * - Draws an outline on the Button
     */
    _drawOutline() {
        const [ x1, y1, x2, y2 ] = this.getBoundary()

        // Top line
        Renderer.drawLine(slotBorderColor, x1, y1, x2, y1, 1)
        
        // Left line
        Renderer.drawLine(slotBorderColor, x1, y1, x1, y2, 1)
        
        // Right line
        Renderer.drawLine(slotBorderColor, x2, y1, x2, y2, 1)
        
        // Bottom line
        Renderer.drawLine(slotBorderColor, x1, y2, x2, y2, 1)
    }

    /**
     * - Checks whether the clicked button is near
     * - this button's boundaries then runs the function if it is
     * @param {Number} mx 
     * @param {Number} my 
     * @param {Number} mbtn 
     * @returns 
     */
    mouseClick(mx, my, mbtn) {
        const [ x, y, x1, y1 ] = this.getBoundary()
        if (!(mx >= x && mx <= x1 && my >= y && my <= y1) || mbtn !== 0) return

        this.fn(mx, my)
    }

    /**
     * - Assigns the function that will run whenever this button is clicked
     * - returns the [MouseX, MouseY] as params for this function
     * @param {Function} fn 
     * @returns this for method chaining
     */
    onMouseClick(fn) {
        this.fn = fn

        return this
    }

    /**
     * - Deletes this class from the list
     */
    delete() {
        buttonsClass.delete(this)
        delete this
    }
}

// Logic
const onWindowItems = (stackArray) => {
    if (!shouldScan) return

    equipmentSlots.forEach((it, idx) => {
        const item = new Item(stackArray[it])

        if (item.getName().removeFormatting() === "Empty Equipment Slot") {
            Persistence.data.equipments[idx] = null
            Persistence.data.save()

            return
        }

        const texture = item.getNBT()?.toObject()?.tag?.SkullOwner?.Properties?.textures?.[0]?.Value
        if (!texture) {
            ChatLib.chat(`${TextHelper.PREFIX} &cError while attempting to get texture data for item&f: ${item.getName()}`)

            return
        }

        Persistence.data.equipments[idx] = texture
        Persistence.data.save()
    })

    shouldScan = false
}

const renderOverlay = () => {
    if (!(Client.currentGui.get() instanceof net.minecraft.client.gui.inventory.GuiInventory)) return

    buttonsClass.forEach(it => it.draw())
}

const onGuiClick = (mx, my, mbtn, gui) => {
    if (!(gui instanceof net.minecraft.client.gui.inventory.GuiInventory)) return

    buttonsClass.forEach(it => it.mouseClick(mx, my, mbtn))
}

const onStep = () => {
    if (previousArray === Persistence.data.equipments) return

    buttonsClass.forEach(it => it.delete())

    Persistence.data.equipments.forEach((it, idx) => {
        new InventoryButton(it, armorSlots[idx])
            .setOffset(-27)
            .onMouseClick(() => ChatLib.command("equipment"))
    })
}

// Events
new Event(feature, "step", onStep, () => World.isLoaded() && config.equipmentsDiplay, 1)
new Event(feature, "onOpenWindowPacket", (windowName) => shouldScan = windowName === "Your Equipment and Stats", () => World.isLoaded() && config.equipmentsDiplay)
new Event(feature, "onWindowItemsPacket", onWindowItems, () => World.isLoaded() && config.equipmentsDiplay)
new Event(feature, "renderOverlay", renderOverlay, () => World.isLoaded() && config.equipmentsDiplay)
new Event(feature, "guiMouseClick", onGuiClick, () => World.isLoaded() && config.equipmentsDiplay)

// Starting events
feature.start()