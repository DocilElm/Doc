import ElementUtils from "../../../DocGuiLib/core/Element"
import TextInputElement from "../../../DocGuiLib/elements/TextInput"
import { AdditiveConstraint, CenterConstraint, ConstantColorConstraint, CramSiblingConstraint, ScrollComponent, SiblingConstraint, UIRoundedRectangle, UIText, Window } from "../../../Elementa"
import config from "../../config"
import { Persistence } from "../../shared/Persistence"

export const window = new Window()
const ChatComponentText = Java.type("net.minecraft.util.ChatComponentText")
const tileSign = Java.type("net.minecraft.client.gui.inventory.GuiEditSign").class.getDeclaredField("field_146848_f")
tileSign.setAccessible(true)

const colorPalette = {
    primary: [0, 60, 67, 150],
    secondary: [119, 176, 170, 150]
}
const scheme = {
    "TextInput": {
        "backgroundBox": colorPalette.primary,
        "textColor": [255, 255, 255, 255],
        "textScale": 1,
        "mouseEnter": [0, 0, 0, 80],
        "mouseLeave": [255, 255, 255, 255]
    }
}

// Changeable variables
let previousGui = null
let firstType = false
let hoverText = null

const itemData = Persistence.getDataFromFileOrLink("BazaarData.json", "https://raw.githubusercontent.com/DocilElm/Doc/main/JsonData/BazaarData.json")

const matchString = (string, displayName) => {
    const name = displayName.toLowerCase()
    const cleanName = name.replace(/\'s/g, "")
    const withoutTil = name.replace(/\'/g, "")

    return ( name.includes(string.toLowerCase()) || cleanName.includes(string.toLowerCase()) || withoutTil.includes(string.toLowerCase()) )
}

const getItems = (str) => {
    if (!str) return
    str = str.trim()

    let res = []

    for (let idx = 0; idx < itemData.length; idx++) {
        let obj = itemData[idx]

        if (!(matchString(str, obj.displayName.removeFormatting()) || obj.lore.some(it => it.removeFormatting().toLowerCase().includes(str.toLowerCase())))) continue

        res.push(obj)
    }

    return res
}

const addTextToSign = (string) => {
    if (!string) return

    const currentTileSign = tileSign.get(Client.currentGui.get())

    currentTileSign.field_145915_a[0] = new ChatComponentText(string)

    // displayGuiScreen(GuiScreen guiScreenIn)
    Client.getMinecraft().func_147108_a(null)

    // setIngameFocus()
    if (Client.currentGui.get() === null) Client.getMinecraft().func_71381_h()
}

// UI
const mainBgBox = new UIRoundedRectangle(3)
    .setX(new CenterConstraint())
    .setY((30).percent())
    .setHeight((50).percent())
    .setWidth((50).percent())
    .setColor(new ConstantColorConstraint(ElementUtils.getJavaColor([0, 0, 0, 0])))
    .setChildOf(window)

const inputText = new TextInputElement("")
inputText
    ._setPosition(new CenterConstraint(), (1).pixels())
    ._setSize((42).percent(), (8).percent())
    ._create(scheme)
    .setChildOf(mainBgBox)

const secondaryBgBox = new UIRoundedRectangle(3)
    .setX(new CenterConstraint())
    .setY(new CramSiblingConstraint(5))
    .setHeight((70).percent())
    .setWidth((42).percent())
    .setColor(new ConstantColorConstraint(ElementUtils.getJavaColor(colorPalette.primary)))
    .setChildOf(mainBgBox)

const resultsText = new UIText(`Results: ${Persistence.data?.bazaarClicked?.length + Persistence.data.bazaarStrings?.length}`)
    .setX(new CenterConstraint())
    .setY((1).pixels())
    .setChildOf(secondaryBgBox)

const scrollableBgBox = new UIRoundedRectangle(3)
    .setX(new CenterConstraint())
    .setY(new CramSiblingConstraint(3))
    .setHeight((90).percent())
    .setWidth((93).percent())
    .setColor(new ConstantColorConstraint(ElementUtils.getJavaColor([0, 0, 0, 0])))
    .setChildOf(secondaryBgBox)

const scrollable = new ScrollComponent("", 5.0, ElementUtils.getJavaColor([255, 255, 255, 255]), false, true)
    .setX((1).pixels())
    .setY((1).pixels())
    .setHeight((90).percent())
    .setWidth((95).percent())
    .setChildOf(scrollableBgBox)

const scrollableSlider = new UIRoundedRectangle(3)
    .setX(new CramSiblingConstraint(2))
    .setY((5).pixels())
    .setHeight((5).pixels())
    .setWidth((5).pixels())
    .setColor(new ConstantColorConstraint(ElementUtils.getJavaColor(colorPalette.secondary)))
    .setChildOf(secondaryBgBox)

scrollable.setScrollBarComponent(scrollableSlider, true, false)

const buttonsClass = new Set()

class ItemButton {
    constructor(obj) {
        this.obj = obj
        this.signText = this.obj.displayName.removeFormatting().replace(/(\[Lvl 1\] )/, "")

        this._init()
        buttonsClass.add(this)
    }

    _init() {
        this.button = new UIRoundedRectangle(10)
            .setX(new CenterConstraint())
            .setY(new AdditiveConstraint(new SiblingConstraint(), (3).pixels()))
            .setHeight((17).percent())
            .setWidth((95).percent())
            .setColor(new ConstantColorConstraint(ElementUtils.getJavaColor(colorPalette.secondary)))
            .setChildOf(scrollable)

        this.text = new UIText(this.obj.displayName)
            .setX(new CenterConstraint())
            .setY(new CenterConstraint())
            .setChildOf(this.button)

        this.button
        .onMouseClick((component, event) => {
            if (event.mouseButton !== 0) return
            if (this.obj.text) return addTextToSign(this.obj.displayName.removeFormatting())

            const bazaarClicked = Persistence.data.bazaarClicked

            if (bazaarClicked && !bazaarClicked.find(it => it.id === this.obj.id)) {
                if (bazaarClicked.length >= 5) bazaarClicked.reverse().splice(0, 1)

                bazaarClicked.push(this.obj)
                Persistence.data.save()
            }

            addTextToSign(this.signText)
        })
        .onMouseEnter(() => {
            if (this.obj.text) return hoverText = null

            hoverText = this.obj.lore
        })
        .onMouseLeave(() => hoverText = null)
    }

    _delete() {
        scrollable.removeChild(this.button)
        buttonsClass.delete(this)
    }
}

Persistence.data.bazaarClicked?.reverse()?.forEach(obj => new ItemButton(obj))
Persistence.data.bazaarStrings?.reverse()?.forEach(obj => new ItemButton(obj))

// Events
register("tick", () => {
    const containerName = Player.getContainer().getName()
    
    if (!previousGui) return previousGui = containerName

    if (previousGui === containerName) return

    previousGui = containerName
})

const registerWhen = () => (Client.currentGui.get() instanceof net.minecraft.client.gui.inventory.GuiEditSign) && previousGui.includes("Bazaar") && config.bazaarOverlay

register(net.minecraftforge.client.event.GuiScreenEvent.DrawScreenEvent.Pre, (event) => {
    if (config.bazaarOverlayReset && firstType && !registerWhen()) {
        hoverText = []
        scrollable.clearChildren()
        buttonsClass.forEach(btnClass => btnClass._delete())
        inputText.textInput.setText("")
        Persistence.data.bazaarClicked?.reverse()?.forEach(obj => new ItemButton(obj))
        Persistence.data.bazaarStrings?.reverse()?.forEach(obj => new ItemButton(obj))
        resultsText.setText(`Results: ${Persistence.data?.bazaarClicked?.length + Persistence.data.bazaarStrings?.length}`)
    }

    if (!registerWhen()) return firstType = false

    cancel(event)
    window.draw()

    if (!firstType) {
        inputText.textInput.grabWindowFocus()
        firstType = true
    }

    if (hoverText) {
        Renderer.translate(0, 0, 300)
        Client.currentGui.get().func_146283_a(hoverText, Client.getMouseX(), Client.getMouseY())
    }
})

register("guiMouseClick", (mx, my, mbtn, _, event) => {
    if (!registerWhen()) return

    cancel(event)
    window.mouseClick(mx, my, mbtn)
})

register("guiKey", (char, keycode, _, event) => {
    if (!registerWhen()) return

    if (keycode === Keyboard.KEY_F && Keyboard.isKeyDown(Keyboard.KEY_LCONTROL)) {
        cancel(event)
        inputText.textInput.grabWindowFocus()

        return
    }

    if (!inputText.textInput.hasFocus()) return
    if (keycode === Keyboard.KEY_ESCAPE) return

    window.keyType(char, keycode)
    cancel(event)
})

register("scrolled", (_, __, dir) => {
    if (!registerWhen()) return

    window.mouseScroll(dir)
})

register("guiMouseDrag", (mx, my, mbtn) => {
    if (!registerWhen()) return

    window.mouseDrag(mx, my, mbtn)
})

register("guiMouseRelease", () => {
    if (!registerWhen()) return

    window.mouseRelease()
})

inputText.onKeyTypeEvent((str, char, keycode) => {
    // On enter press send the text as typed
    if (keycode === Keyboard.KEY_RETURN) {
        addTextToSign(str)

        if (str && !Persistence.data.bazaarStrings?.some(it => it.displayName === str.toLowerCase())) {
            if (Persistence.data.bazaarStrings.length >= 5) Persistence.data.bazaarStrings.reverse().splice(0, 1)

            Persistence.data.bazaarStrings.push({
                "displayName": str.toLowerCase(),
                "id": `${str.toUpperCase()}`,
                "text": true
            })
            Persistence.data.save()
        }

        return
    }
    if (str.length <= 3) return

    hoverText = []
    scrollable.clearChildren()
    buttonsClass.forEach(btnClass => btnClass._delete())

    getItems(str)?.forEach(obj => new ItemButton(obj))

    resultsText.setText(`Results: ${buttonsClass.size}`)
})