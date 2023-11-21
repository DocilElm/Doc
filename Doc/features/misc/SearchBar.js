import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { RenderHelper } from "../../shared/Render"
import ScalableGui from "../../shared/Scalable"
import { TextHelper } from "../../shared/Text"

// Constant variables
const feature = new Feature("searchBar", "Misc", "")
const editGui = new ScalableGui("searchBar").setCommand("searchBarLocation")
const [ w, h ] = [ 100, 15 ]
const highlightSlots = new Set()
const cachedSlots = new Map()
const avoidKeys = new Set([
    42, // Left shift
    199, // Home
    207, // End
    211, // Delete
    203, // Left
    205, // Right
    54, // Right shift
    29, // Left control
    157, // Right control
    58, // Caps lock
    28, // Enter
    15, // Tab
])

// Changeable variables
let shouldRender = false
let isGuiFocused = false
let findString = ""

// Logic
const registerWhen = () => config.searchBar && !editGui.isOpen()

const barHandler = () => {
    // Draw the background box for the text
    Renderer.drawRect(
        Renderer.color(255, 255, 255, 80),
        editGui.getX(),
        editGui.getY(),
        w,
        h
    )

    // If the string is falsey we make it render placeholder
    const text = !findString ? "Add Searching Text" : findString.removeFormatting()

    // Draw the text in the center of the background box
    Renderer.drawStringWithShadow(
        text,
        (editGui.getX() + w / 2) - (Renderer.getStringWidth(text) / 2),
        editGui.getY() + h / 4
    )

    // Draw a small box in the background box if the component is focused
    if (!isGuiFocused) return

    Renderer.drawRect(
        Renderer.color(8, 24, 168, 80),
        editGui.getX(),
        editGui.getY(),
        3,
        h
    )
}

const renderSlots = () => {
    highlightSlots.forEach(values => {
        // If cache for this index exist we get it from the cache list
        const [ x, y ] = cachedSlots.has(values[0])
            ? cachedSlots.get(values[0])
            : RenderHelper.getSlotRenderPosition(values[0], Client.currentGui.get())

        // Add to cache values if it dosent exist
        if (!cachedSlots.has(values[0])) cachedSlots.set(values[0], [x, y])

        // If the values no longer match the string we delete them
        if (!values[1].includes(findString)) highlightSlots.delete(values)
    
        Renderer.retainTransforms(true)
        Renderer.translate(x, y, 100)
        Renderer.scale(0.9)
        Renderer.drawRect(values[2], 0, 0, 17, 17)
        Renderer.retainTransforms(false)
    })
}

const keyHandler = (char, keycode, gui, event) => {
    if (!isGuiFocused) return

    // Esc [1]
    if (keycode === 1) return isGuiFocused = false, cancel(event)
    // Backspace [14]
    else if (keycode === 14) return findString = findString.slice(0, -1)
    // yep
    else if (avoidKeys.has(keycode)) return cancel(event)

    findString += char
    cancel(event)
}

const checkItems = () => {
    if (!shouldRender || !findString) return highlightSlots.clear()

    Player.getContainer().getItems()?.forEach((item, index) => {
        if (!item) return

        const name = item.getName()?.removeFormatting()?.toLowerCase()
        const lore = item.getLore()?.join("")?.removeFormatting()?.toLowerCase()

        if (name.includes(findString.toLowerCase())) return highlightSlots.add([index, name, Renderer.GREEN])

        if (!lore.includes(findString.toLowerCase())) return

        highlightSlots.add([index, lore, Renderer.BLUE])
    })
}

const changeFocusState = (mx, my) => isGuiFocused = TextHelper.checkBoundingBox([mx, my], [editGui.getX(), editGui.getY(), editGui.getX() + w, editGui.getY() + h])
const changeShouldRender = (_, __, gui) => shouldRender = gui instanceof net.minecraft.client.gui.inventory.GuiChest

const reset = () => {
    shouldRender = false
    isGuiFocused = false
    cachedSlots.clear()
    highlightSlots.clear()
}

// Default display
editGui.onRender(() => barHandler())

// Events
new Event(feature, "guiKey", keyHandler, registerWhen)
new Event(feature, "step", checkItems, registerWhen, 1)

// Handle both displays
new Event(feature, "guiRender", () => {
    if (!shouldRender || editGui.isOpen()) return

    barHandler()
    renderSlots()
}, () => registerWhen() && shouldRender)

new Event(feature, "guiMouseClick", changeFocusState, registerWhen)
new Event(feature, "guiClosed", reset, registerWhen)
new Event(feature, "postGuiRender", changeShouldRender, registerWhen)

// Starting events
feature.start()