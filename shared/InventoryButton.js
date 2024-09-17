import { RenderHelper } from "./Render"
import { TextHelper } from "./TextHelper"

const PatcherConfig = Java.type("club.sk1er.patcher.config.PatcherConfig")
const NBTTagCompoundClass = net.minecraft.nbt.NBTTagCompound
const NBTTagListClass = net.minecraft.nbt.NBTTagList
const ItemStackClass = net.minecraft.item.ItemStack
const skullClass = net.minecraft.init.Items.field_151144_bL

const slotColor = Renderer.color(100, 100, 100, 150)
const slotBorderColor = Renderer.color(50, 50, 50, 150)
const fixedScales = [
    1, // Default -> Feature disabled
    0.5, // Small
    1, // Normal
    1.5, // 3
    2 // 4
]

export const createSkull = (texture) => {
    // This is probably not needed but idc
    const uuid = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".replace(/x/g, () => parseInt(Math.random() * 9, 16))
    const itemStack = new ItemStackClass(skullClass, 1, 3)
    const tag = new NBTTagCompoundClass()
    const skullOwner = new NBTTagCompoundClass()
    const properties = new NBTTagCompoundClass()
    const textures = new NBTTagListClass()
    const textures_0 = new NBTTagCompoundClass()

    skullOwner.func_74778_a("Id", uuid) // setString
    skullOwner.func_74778_a("Name", uuid) // setString

    textures_0.func_74778_a("Value", texture) // setString
    textures.func_74742_a(textures_0) // appentTag

    properties.func_74782_a("textures", textures) // setTag
	skullOwner.func_74782_a("Properties", properties) // setTag
	tag.func_74782_a("SkullOwner", skullOwner) // setTag
    itemStack.func_77982_d(tag) // setTagCompound

    return new Item(itemStack)
}

/**
 * - Gets the current patcher [InventoryScale]
 * @returns {number?}
 */
const getInventoryScale = () => PatcherConfig?.inventoryScale

// Used to store all instances of [InventoryButton]
// this is used to call the [_mouseClick] method later on
const allButtons = new Set()

export class InventoryButton {
    /**
     * - Creates an inventory like button
     * @param {number} slot The slot to use for Rendering
     * @param {Item?} item The item to use for Rendering
     * @param {Map?} list The list to push this [InventoryButton] class
     */
    constructor(slot, item = null, list = null) {
        // Base fields
        this.slot = slot
        this.item = item
        this.list = list

        // 
        this.rightClickFn = null
        this.leftClickFn = null
        this.middleClickFn = null
        this.mouseHoverFn = null
        this.xOffset = 0
        this.yOffset = 0
        this.texture = null
        this.calculateSize = false
        this.dirty = false
        this.checkFn = () => World.isLoaded()

        // Add [this] class to the list if it's defined
        if (this.list) this.list.set(this.slot, this)

        // Add [this] class to the buttons list
        // this is to be able to call the _mouseClick method
        allButtons.add(this)
    }

    /**
     * - Internal use
     * - Gets this [InventoryButton]'s boundary box
     * @returns {[number, number, number, number]}
     */
    _getBoundary() {
        const containerSize = Player.getContainer().getSize()
        const [ x, y ] = this.calculateSize && containerSize > 45
            ? RenderHelper.getSlotRenderPosition(this.slot + (containerSize - 45))
            : RenderHelper.getSlotRenderPosition(this.slot)

        return [
            x + this.xOffset,
            y + this.yOffset,
            x + this.xOffset + 16,
            y + this.yOffset + 16
        ]
    }

    /**
     * - Sets this [InventoryButton]'s item
     * @param {Item} item
     * @returns this for method chaining
     */
    setItem(item) {
        if (!item) throw new Error(`[Doc] InventoryButton class: ${item} is not a valid item`)
        
        this.item = item

        return this
    }

    /**
     * - Sets the CalculateSize boolean for this [InventoryButton]
     * @param {boolean} bool
     * @returns this for method chaining
     */
    setCalculateSize(bool) {
        this.calculateSize = bool

        return this
    }

    /**
     * - Sets the slot for this [InventoryButton] class
     * @param {number} slot
     * @returns this for method chaining
     */
    setSlot(slot) {
        if (!slot) throw new Error(`[Doc] InventoryButton class: ${slot} is not a valid slot`)

        this.slot = slot

        return this
    }

    /**
     * - Sets a function that is ran before running the mouseClick events
     * - This requires to return a boolean
     * @param {() => void} fn
     * @returns this for method chaining
     */
    setCheckFn(fn) {
        this.checkFn = fn

        return this
    }

    /**
     * - Sets this [InventoryButton]'s [x, y] offsets
     * @param {number} x
     * @param {number} y
     * @returns this for method chaining
     */
    setOffset(x = 0, y = 0) {
        this.xOffset = x
        this.yOffset = y

        return this
    }

    /**
     * - Sets this [InventoryButton]'s command to run whenever left click is detected
     * @param {string} command
     * @returns this for method chaining
     */
    setCommand(command) {
        if (!command) throw new Error(`[Doc] InventoryButton class: ${command} is not a valid command`)

        this.leftClickFn = () => {
            const cmd = command.replace(/\//, "")
            ChatLib.command(cmd, TextHelper.shouldSendAsClient(cmd.split(" ")?.[0]))
        }

        return this
    }

    /**
     * - Creates an item skull with the given texture in it
     * - sets this [InventoryButton]'s item to the created skull
     * @param {string} texture
     * @returns this for method chaining
     */
    createItemByTexture(texture) {
        if (!texture) throw new Error(`[Doc] InventoryButton class: ${texture} is not a valid texture`)

        this.setItem(createSkull(texture))
        this.texture = texture

        return this
    }

    /**
     * - Draws this [InventoryButton] in the screen
     * - If the user is using patcher inventory scale it'll take that into consideration.
     */
    draw() {
        if (this.dirty) return

        const [ x, y ] = this._getBoundary()

        const patcherScale = getInventoryScale()
        // If patcher scale is set
        // we use the fixed scales to scale this render
        const scale = patcherScale
            ? fixedScales[patcherScale]
            : 1 // otherwise 1

        Renderer.retainTransforms(true)
        Renderer.scale(scale ?? 2) // If the scale is null/undefined default to 2

        this._drawOutline() // Draw outline for rect
        Renderer.drawRect(slotColor, x, y, 16, 16) // Draws a rect that's similar to a slot
        this.item.draw(x, y) // Draw the item in this position

        Renderer.retainTransforms(false)
        Renderer.finishDraw()
    }
    
    /**
     * - Assigns the function to be ran whenever this [InventoryButton] is right clicked
     * @param {() => void} fn 
     * @returns this for method chaining
     */
    onRightClick(fn) {
        if (typeof(fn) !== "function") throw new Error(`[Doc] InventoryButton class: ${fn} is not a valid function`)

        this.rightClickFn = fn

        return this
    }

    /**
     * - Assigns the function to be ran whenever this [InventoryButton] is left clicked
     * @param {() => void} fn 
     * @returns this for method chaining
     */
    onLeftClick(fn) {
        if (typeof(fn) !== "function") throw new Error(`[Doc] InventoryButton class: ${fn} is not a valid function`)

        this.leftClickFn = fn

        return this
    }

    /**
     * - Assigns the function to be ran whenever this [InventoryButton] is middle clicked
     * @param {() => void} fn 
     * @returns this for method chaining
     */
    onMiddleClick(fn) {
        if (typeof(fn) !== "function") throw new Error(`[Doc] InventoryButton class: ${fn} is not a valid function`)

        this.middleClickFn = fn

        return this
    }

    /**
     * - Assigns the function to be ran whenever this [InventoryButton] is left clicked
     * @param {() => void} fn 
     * @returns this for method chaining
     */
    onMouseClick(fn) {
        this.onLeftClick(fn)

        return this
    }

    /**
     * -  Assigns the function to be ran whenever this [InventoryButton] is hovered
     * @param {() => void} fn 
     * @returns this for method chaining
     */
    onMouseHover(fn) {
        if (typeof(fn) !== "function") throw new Error(`[Doc] InventoryButton class: ${fn} is not a valid function`)

        this.mouseHoverFn = fn

        return this
    }

    /**
     * - Internal use.
     * @param {number} mx
     * @param {number} my
     * @param {number} mbtn
     * @returns
     */
    _mouseClick(mx, my, mbtn) {
        if (!this.checkFn() || this.dirty) return
        
        const [ x, y, x1, y1 ] = this._getBoundary()
        if (!(mx >= x && mx <= x1 && my >= y && my <= y1)) return

        if (mbtn === 2 && this.middleClickFn) return this.middleClickFn(mx, my)
        if (mbtn === 1 && this.rightClickFn) return this.rightClickFn(mx, my)
        if (!this.leftClickFn || mbtn !== 0) return

        this.leftClickFn(mx, my)
    }

    /**
     * - Internal use.
     * @param {number} mx
     * @param {number} my
     * @param {MCTGuiScreen} gui
     * @returns
     */
    _mouseHover(mx, my, gui) {
        if (!this.checkFn() || !this.mouseHoverFn || this.dirty) return
        
        const [ x, y, x1, y1 ] = this._getBoundary()
        if (!(mx >= x && mx <= x1 && my >= y && my <= y1)) return

        this.mouseHoverFn(mx, my, gui)
    }

    /**
     * - Internal use.
     * - Draws an outline around this [InventoryButton]'s rect
     */
    _drawOutline() {
        const [ x1, y1, x2, y2 ] = this._getBoundary()

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
     * - Mostly internal use
     * - Marks this instance `dirty` so it doesn't run it's click methods anymore
     * @returns {this} this for method chaining
     */
    markDirty() {
        this.dirty = true

        return this
    }

    /**
     * - Deletes this class from the list and the internal list
     */
    delete() {
        this.dirty = true
        allButtons.delete(this)
        if (this.list) this.list.delete(this)
        delete this
    }
}

register("guiMouseClick", (mx, my, mbtn, gui) => {
    if (!(gui instanceof net.minecraft.client.gui.inventory.GuiInventory || gui instanceof net.minecraft.client.gui.inventory.GuiChest)) return

    // Calls all the button's [_mouseClick] method to check whether
    // that button was clicked
    allButtons.forEach(btn => btn._mouseClick(mx, my, mbtn))
})

register("postGuiRender", (mx, my, gui) => {
    if (!(gui instanceof net.minecraft.client.gui.inventory.GuiInventory || gui instanceof net.minecraft.client.gui.inventory.GuiChest)) return

    // Calls all the button's [_mouseHover] method to check whether
    // that the current mouse position is hovering this button
    allButtons.forEach(btn => btn._mouseHover(mx, my, gui))
})