import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { RenderHelper } from "../../shared/Render"
import ScalableGui from "../../shared/Scalable"
import { TextHelper } from "../../shared/Text"

// Constant variables
const feature = new Feature("searchBar", "Misc", "")
const editGui = new ScalableGui("searchBar").setCommand("searchBarLocation")
const [ width, height ] = [ 100, 15 ]
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
        width,
        height
    )

    // If the string is falsey we make it render placeholder
    const text = !findString ? "Add Searching Text" : findString.removeFormatting()

    // Draw the text in the center of the background box
    Renderer.drawStringWithShadow(
        text,
        (editGui.getX() + width / 2) - (Renderer.getStringWidth(text) / 2),
        editGui.getY() + height / 4
    )

    // Draw a small box in the background box if the component is focused
    if (!isGuiFocused) return

    Renderer.drawRect(
        Renderer.color(8, 24, 168, 80),
        editGui.getX(),
        editGui.getY(),
        3,
        height
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

const checkString = (name, lore, index, string) => {
    if (name.includes(string.toLowerCase())) return highlightSlots.add([index, name, Renderer.DARK_GREEN])

    if (!lore.includes(string.toLowerCase())) return

    highlightSlots.add([index, lore, Renderer.DARK_AQUA])
}

const checkItems = () => {
    if (!shouldRender || !findString) return highlightSlots.clear()

    // Check whether the slot still matches the given [name|lore]
    highlightSlots.forEach(values => {
        const matchedValues = values[1]

        // Check whether the string can be made into an array or not
        if (findString.includes(",")) {
            // Make the string into an array
            let tempArr = findString.split(",")

            // Check whether the array matches this item's [name|lore]
            let hasMatch = tempArr.map(str => matchedValues.includes(str.toLowerCase())).includes(false)

            // If match we return so it dosent remove the item from the list
            if (!hasMatch) return

            return highlightSlots.delete(values)
        }

        // If the string still matches the [name|lore] return
        if (matchedValues.includes(findString.toLowerCase())) return

        highlightSlots.delete(values)
    })

    Player.getContainer().getItems()?.forEach((item, index) => {
        if (!item) return

        const name = item.getName()?.removeFormatting()?.toLowerCase()
        const lore = item.getLore()?.join("")?.removeFormatting()?.toLowerCase()

        // Check whether the string can be made into an array or not
        if (findString.includes(",")) {
            // Make the string into an array
            let tempArr = findString.split(",")

            // Check whether the array matches this item's [name|lore]
            let hasMatch = tempArr.map(str => name.includes(str.toLowerCase()) || lore.includes(str.toLowerCase())).includes(false)

            // If no match we return so it dosent add the item to the list
            if (hasMatch) return

            // Check lore and name to see what does the string matches
            // and adds it to the highlight list
            tempArr.forEach(a => {
                checkString(name, lore, index, a)
            })

            return
        }

        checkString(name, lore, index, findString)
    })
}

const changeFocusState = (mx, my) => isGuiFocused = TextHelper.checkBoundingBox([mx, my], [editGui.getX(), editGui.getY(), editGui.getX() + width, editGui.getY() + height])
const changeShouldRender = (_, __, gui) => shouldRender = gui instanceof net.minecraft.client.gui.inventory.GuiChest

const reset = () => {
    shouldRender = false
    isGuiFocused = false
    cachedSlots.clear()
    highlightSlots.clear()
}

// Default display
editGui.onRender(() => barHandler())
editGui.setSize(width, height)

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