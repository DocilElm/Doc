import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { RenderHelper } from "../../shared/Render"
import ScalableGui from "../../shared/Scalable"
import TextInputElement from "../../../DocGuiLib/elements/TextInput"
import { Window } from "../../../Elementa"
import { TextHelper } from "../../shared/Text"
import { Persistence } from "../../shared/Persistence"

// Constant variables
const feature = new Feature("searchBar", "Misc", "")
const editGui = new ScalableGui("searchBar").setCommand("searchBarLocation").setSize(Persistence.data.searchBar.width ?? 100, Persistence.data.searchBar.height ?? 15)
const window = new Window()
const text = "&b&lClick/Drag anywhere to change the location of this display"
const text2 = "&4&lIf you use scroll you can change the width and if you hold CTRL while you scroll you can change the height"
const highlightSlots = new Map()
const cachedSlots = new Map()
const scheme = {
    "TextInput": {
        "background": {
            "color": [255, 255, 255, 100],
            "outlineColor": [255, 255, 255, 255],
            "outlineSize": 0,
            "roundness": 3
        },
        "text": {
            "color": [255, 255, 255, 255],
            "scale": 1,
            "padding": 3
        },
        "mouseEnterAnimation": {
            "color": [0, 0, 0, 80],
            "type": "OUT_EXP",
            "time": 0.5
        },
        "mouseLeaveAnimation": {
            "color": [255, 255, 255, 255],
            "type": "OUT_EXP",
            "time": 0.5
        }
    }
}

// Changeable variables
let findString = ""

const eqRegex = /^([\d,.]+) ?([+*\-%/x^]) ?([\d,.]+)/
const divmulRegex = /([\d,.]+) ?([x*/]) ?([\d,.]+)/

const equationList = {
    "x": (num1, num2) => num1 * num2,
    "*": (num1, num2) => num1 * num2,
    "+": (num1, num2) => num1 + num2,
    "/": (num1, num2) => num1 / num2,
    "%": (num1, num2) => num1 % num2,
    "^": (num1, num2) => num1 ** num2,
    "-": (num1, num2) => num1 - num2
}

const calculate = (str, res = 0) => {
    // Removes any "()" from the string
    str = str.replace(/[(),]/g, "")

    if (divmulRegex.test(str)) {
        const [ match, num1, eq, num2 ] = str.match(divmulRegex)

        const result = equationList[eq](parseFloat(num1), parseFloat(num2))

        str = str.replace(match, result)
        res = result
        
        return calculate(str, result)
    }

    const matched = str.match(eqRegex)
    
    // Checks whether it matched the regex or not
    if (!matched) return res

    // Get [number 1, type of eq, number 2]
    const [ _, num1, eq, num2 ] = matched
    
    // Run it through the function list
    const result = equationList[eq](parseFloat(num1), parseFloat(num2))
    // Add the result to the [res] variable
    res = result

    // Replace the string we just calculated with the result of the eq
    const newStr = str.replace(matched[0], result)
    // Check whether the new string matches the regex
    const match2 = newStr.match(eqRegex)
    // If it does repeat the cycle
    if (match2) return calculate(newStr, res)

    // Return the combined result
    return res
}

// Creating Elementa component
const textInputComponent = new TextInputElement("")
    ._setPosition((editGui.getX()).pixels(), (editGui.getY()).pixels())
    ._setSize((editGui.width).pixels(), (editGui.height).pixels())
    .onKeyTypeEvent((text, _, keycode) => {
        findString = text
        if (keycode === Keyboard.KEY_BACK) return

        if (/\d+/.test(text.replace(/[()]/g, "")) && text.endsWith("=") && text.match(/=/g).length < 2) {
            const result = calculate(text)
            textInputComponent.textInput.setText(`${text} ${TextHelper.addCommas( result % 1 !== 0 ? result.toFixed(2) : result )}`)
        }
    })

textInputComponent._create(scheme).setChildOf(window)
textInputComponent.textInput.onFocusLost((comp) => comp.mouseRelease())

editGui.setCustomSize((dir) => {
    if (!Persistence.data.searchBar.height) {
        Persistence.data.searchBar.height = 15
        Persistence.data.searchBar.width = 100

        Persistence.data.save()
        return
    }

    if (dir === 1 && Keyboard.isKeyDown(Keyboard.KEY_LCONTROL)) Persistence.data.searchBar.height += 1
    else if (Keyboard.isKeyDown(Keyboard.KEY_LCONTROL)) Persistence.data.searchBar.height -= 1

    if (dir === 1 && !Keyboard.isKeyDown(Keyboard.KEY_LCONTROL)) Persistence.data.searchBar.width += 10
    else if (!Keyboard.isKeyDown(Keyboard.KEY_LCONTROL)) Persistence.data.searchBar.width -= 10
    Persistence.data.save()

    textInputComponent.bgBox.setWidth((Persistence.data.searchBar.width).pixels())
    textInputComponent.bgBox.setHeight((Persistence.data.searchBar.height).pixels())

    editGui.setSize(Persistence.data.searchBar.width, Persistence.data.searchBar.height)
})

// Logic
const registerWhen = () => config().searchBar && !editGui.isOpen()

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
    if (!World.isLoaded()) return
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
    if (editGui.isOpen() || editGui.selected) {
        Renderer.translate(
            Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(text.removeFormatting()) / 2,
            Renderer.screen.getHeight() / 2
        )
        Renderer.drawStringWithShadow(text, 0, 0)

        Renderer.translate(
            Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(text2.removeFormatting()) / 2,
            Renderer.screen.getHeight() / 2
        )
        Renderer.drawStringWithShadow(text2, 0, 10)
    }

    textInputComponent.bgBox.setX((editGui.getX()).pixels())
    textInputComponent.bgBox.setY((editGui.getY()).pixels())

    window.draw()
})

// Events
new Event(feature, "guiKey", keyHandler, registerWhen)
new Event(feature, "step", checkItems, registerWhen, 5)

// Handle both displays
new Event(feature, "guiRender", (_, __, gui) => {
    if (!World.isLoaded() || editGui.isOpen()) return

    if (!(gui instanceof net.minecraft.client.gui.inventory.GuiInventory || gui instanceof net.minecraft.client.gui.inventory.GuiChest)) return window.unfocus()
    
    textInputComponent.bgBox.setX((editGui.getX()).pixels())
    textInputComponent.bgBox.setY((editGui.getY()).pixels())
    window.draw()
    renderSlots()
}, () => registerWhen())

new Event(feature, "guiMouseClick", onMouseClick, registerWhen)
new Event(feature, "guiClosed", reset, registerWhen)

// Starting events
feature.start()