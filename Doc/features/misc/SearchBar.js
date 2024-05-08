import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { RenderHelper } from "../../shared/Render"
import ScalableGui from "../../shared/Scalable"
import TextInputElement from "../../../DocGuiLib/elements/TextInput"
import { Window } from "../../../Elementa"

// Constant variables
const feature = new Feature("searchBar", "Misc", "")
const editGui = new ScalableGui("searchBar").setCommand("searchBarLocation")
const window = new Window()
const [ width, height ] = [ 100, 15 ]
const highlightSlots = new Map()
const cachedSlots = new Map()
const scheme = {
    "TextInput": {
        "backgroundBox": [255, 255, 255, 100],
        "textColor": [71, 188, 4, 255],
        "textScale": 1,
        "mouseEnter": [0, 0, 0, 80],
        "mouseLeave": [71, 188, 4, 255]
    }
}

// Changeable variables
let findString = ""

// Creating Elementa component
const textInputComponent = new TextInputElement("Add Searching Text")
    ._setPosition((editGui.getX()).pixels(), (editGui.getY()).pixels())
    ._setSize((100).pixels(), (15).pixels())
    .onKeyTypeEvent((text) => findString = text)

textInputComponent._create(scheme).setChildOf(window)

// Logic
const registerWhen = () => config.searchBar && !editGui.isOpen()

const renderSlots = () => {
    highlightSlots.forEach(obj => {
        // If cache for this index exist we get it from the cache list
        const [ x, y ] = cachedSlots.has(obj.slot)
            ? cachedSlots.get(obj.slot)
            : RenderHelper.getSlotRenderPosition(obj.slot, Client.currentGui.get())

        // Add to cache values if it dosent exist
        if (!cachedSlots.has(obj.slot)) cachedSlots.set(obj.slot, [x, y])
    
        Renderer.retainTransforms(true)
        Renderer.translate(x, y, 100)
        Renderer.scale(0.9)
        Renderer.drawRect(obj.color, 0, 0, 17, 17)
        Renderer.retainTransforms(false)
    })
}

const keyHandler = (char, keycode, _, event) => {
    if (!textInputComponent.textInput.hasFocus() || editGui.isOpen()) return
    
    window.keyType(char, keycode)
    cancel(event)
}

const getMatch = (itemName, itemLore, string) => {
    if (!itemName || !itemLore || !string) return

    const inName = itemName.includes(string.toLowerCase())
    const inLore = itemLore.includes(string.toLowerCase())

    if (inName) return 1
    if (!inLore) return

    return 2
}

const makeMatch = (itemName, itemLore, idx, matchType) => {
    if (!itemName || !itemLore || !matchType) return

    if (matchType === 1) {
        highlightSlots.set(idx, {
            slot: idx,
            string: findString,
            color: Renderer.WHITE
        })

        return
    }

    if (matchType !== 2) return

    highlightSlots.set(idx, {
        slot: idx,
        string: findString,
        color: Renderer.DARK_AQUA
    })
}

const checkItems = () => {
    if (!findString && highlightSlots.size || !Client.isInGui()) return highlightSlots.clear()
    if (!findString) return

    // Check whether the current [findString] matches the saved [findString]
    highlightSlots.forEach(obj => {
        const { slot, string } = obj

        if (string === findString) return

        highlightSlots.delete(slot)
    })

    // Check whether there is matching items with the current [findString]
    Player.getContainer().getItems()?.forEach((item, idx) => {
        if (!item || highlightSlots.has(idx)) return

        const itemName = item.getName()?.removeFormatting()?.toLowerCase()
        const itemLore = item.getLore()?.join("")?.removeFormatting()?.toLowerCase()

        if (/\,/g.test(findString)) {
            const tempArr = findString.split(",")
            const match = tempArr.map(str => itemName.includes(str.toLowerCase()) || itemLore.includes(str.toLowerCase())).includes(false)

            if (match) return

            tempArr.forEach(str => {
                makeMatch(itemName, itemLore, idx, getMatch(itemName, itemLore, str))
            })

            return
        }

        makeMatch(itemName, itemLore, idx, getMatch(itemName, itemLore, findString))
    })
}

const onMouseClick = (mx, my, mbtn, gui) => {
    if (editGui.isOpen()) return

    if (gui instanceof net.minecraft.client.gui.inventory.GuiInventory || gui instanceof net.minecraft.client.gui.inventory.GuiChest) {
        window.mouseClick(mx, my, mbtn)
    }
}

const reset = () => {
    cachedSlots.clear()
    highlightSlots.clear()
}

// Default display
editGui.onRender(() => {
    textInputComponent.bgBox.setX((editGui.getX()).pixels())
    textInputComponent.bgBox.setY((editGui.getY()).pixels())

    window.draw()
})
editGui.setSize(width, height)

// Events
new Event(feature, "guiKey", keyHandler, registerWhen)
new Event(feature, "step", checkItems, registerWhen, 5)

// Handle both displays
new Event(feature, "guiRender", (_, __, gui) => {
    if (editGui.isOpen()) return

    if (!(gui instanceof net.minecraft.client.gui.inventory.GuiInventory || gui instanceof net.minecraft.client.gui.inventory.GuiChest)) return textInputComponent.textInput.unfocus()
    
    textInputComponent.bgBox.setX((editGui.getX()).pixels())
    textInputComponent.bgBox.setY((editGui.getY()).pixels())
    window.draw()
    renderSlots()
}, () => registerWhen())

new Event(feature, "guiMouseClick", onMouseClick, registerWhen)
new Event(feature, "guiClosed", reset, registerWhen)

// Starting events
feature.start()