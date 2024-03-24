import { Persistence } from "./Persistence"
import { RenderHelper } from "./Render"

const leftSlots = [9, 18, 27, 36]
const bottomSlots = [37, 38, 39, 40, 41, 42, 43]
const rightSlots = [17, 26, 35, 44]
const slotColor = Renderer.color(100, 100, 100, 150)
const slotBorderColor = Renderer.color(50, 50, 50, 150)
export const slotsCreated = new Map()
export const InventoryButtonsData = Persistence.getDataFromFileOrLink("InventoryButtonsData.json", "https://raw.githubusercontent.com/DocilElm/Doc/main/JsonData/InventoryButtonsData.json")
export const mainArray = [...leftSlots, ...rightSlots, ...bottomSlots]

const NBTTagCompoundClass = net.minecraft.nbt.NBTTagCompound
const NBTTagListClass = net.minecraft.nbt.NBTTagList
const ItemStackClass = net.minecraft.item.ItemStack
const skullClass = net.minecraft.init.Items.field_151144_bL

const createSkull = (texture) => {
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

export class InventorySlot {
    /**
     * - Creates a new inventory slot with the given slot number
     * @param {Number} slot 
     */
    constructor(slot, textureName, command = null, saveToList = true) {
        this.slot = slot
        this.item = textureName.startsWith("minecraft:") ? new Item(textureName) : createSkull(InventoryButtonsData[textureName])
        this.pos = null
        this.command = command
        this.cachedPos = new Map()

        if (saveToList) slotsCreated.set(this.slot, this)
    }

    /**
     * - Sets the command which this inventory slot will run whenever it's clicked
     * @param {String} command The command to run (without "/")
     * @returns this for method chaining
     */
    setCommand(command) {
        this.command = command

        return this
    }

    /**
     * - Gets this [InventorySlot]'s boundary box
     * @returns {Array} [ x, y, x1, y1 ]
     */
    getBoundary() {
        const size = Player.getContainer()?.getSize()
        if (!size) return

        if (this.cachedPos.has(size)) return this.cachedPos.get(size)

        const slot = size === 45
            ? this.slot
            : this.slot + (size - 45)

        const [ x, y ] = RenderHelper.getSlotRenderPosition(slot)
        let [ dx, dy ] = [ 0, 0 ]

        if (leftSlots.some(num => num === this.slot)) dx = -27
        if (rightSlots.some(num => num === this.slot)) dx = 27
        if (bottomSlots.some(num => num === this.slot)) dy = 27

        const coords = [
            x + dx,
            y + dy,
            x + dx + 16,
            y + dy + 16
        ]

        this.cachedPos.set(size, coords)

        return coords
    }

    /**
     * - Draws the item set for this [InventorySlot]
     * @returns this for method chaining
     */
    draw() {
        this.drawOutline()
        const [ x, y ] = this.getBoundary()

        Renderer.drawRect(slotColor, x, y, 16, 16)
        this.item.draw(x, y)

        return this
    }

    /**
     * - Draws the outline for this [InventorySlot]'s slot
     * @param {Number} thickness 
     */
    drawOutline(thickness = 1) {
        const [ x1, y1, x2, y2 ] = this.getBoundary()

        // Top line
        Renderer.drawLine(slotBorderColor, x1, y1, x2, y1, thickness)
        
        // Left line
        Renderer.drawLine(slotBorderColor, x1, y1, x1, y2, thickness)
        
        // Right line
        Renderer.drawLine(slotBorderColor, x2, y1, x2, y2, thickness)
        
        // Bottom line
        Renderer.drawLine(slotBorderColor, x1, y2, x2, y2, thickness)
    }

    /**
     * - Checks whether this slot was clicking and if it was it runs the assigned command
     * @param {Array} param0 MouseClick X, Y
     */
    onMouseClick(mx, my, btn) {
        const [ x, y, x1, y1 ] = this.getBoundary()
        if (!(mx >= x && mx <= x1 && my >= y && my <= y1)) return

        if (btn !== 0 || !this.command) return
        
        ChatLib.command(this.command)
    }
}