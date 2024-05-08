import ElementUtils from "../../../DocGuiLib/core/Element"
import TextInputElement from "../../../DocGuiLib/elements/TextInput"
import { AdditiveConstraint, CenterConstraint, ConstantColorConstraint, CramSiblingConstraint, ScrollComponent, SiblingConstraint, UIRoundedRectangle, UIText, Window } from "../../../Elementa"
import config from "../../config"
import { Persistence } from "../../shared/Persistence"

export const window = new Window()
const ChatComponentText = Java.type("net.minecraft.util.ChatComponentText")
const tileSign = Java.type("net.minecraft.client.gui.inventory.GuiEditSign").class.getDeclaredField("field_146848_f")
tileSign.setAccessible(true)

const normalStar = "✪"
const masterStars = ["➊", "➋", "➌", "➍", "➎"]
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
let starsToAdd = null
let mstarsToAdd = null
let lvl100Only = false

const itemData = Persistence.getDataFromFileOrLink("ItemData.json", "https://raw.githubusercontent.com/DocilElm/Doc/main/JsonData/ItemData.json")

const getItems = (str) => {
    if (!str) return
    str = str.replace(/\[Lvl 100\] /, "")

    let res = []

    for (let idx = 0; idx < itemData.length; idx++) {
        let obj = itemData[idx]
        let displayName = obj.displayName.removeFormatting().toLowerCase()
        let clearedName = obj.displayName.removeFormatting().toLowerCase().replace(/\'s/g, "")
        
        if (!(displayName.includes(str.toLowerCase()) || clearedName.includes(str.toLowerCase()))) continue

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

const resultsText = new UIText(`Results: ${Persistence.data.auctionsClicked?.length + Persistence.data.auctionsStrings?.length}`)
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

const rightPanelBox = new UIRoundedRectangle(3)
    .setX((73).percent())
    .setY((11).percent())
    .setHeight((70).percent())
    .setWidth((20).percent())
    .setColor(ElementUtils.getJavaColor([0, 0, 0, 0]))
    .setChildOf(mainBgBox)

const normalStarsBox = new UIRoundedRectangle(3)
    .setX((1).pixels())
    .setY(new SiblingConstraint())
    .setHeight((10).percent())
    .setWidth((80).percent())
    .setColor(ElementUtils.getJavaColor([0, 0, 0, 0]))
    .setChildOf(rightPanelBox)

const masterStarsBox = new UIRoundedRectangle(3)
    .setX((1).pixels())
    .setY(new SiblingConstraint())
    .setHeight((10).percent())
    .setWidth((80).percent())
    .setColor(ElementUtils.getJavaColor([0, 0, 0, 0]))
    .setChildOf(rightPanelBox)

for (let idx = 0; idx < 5; idx++) {
    let toggled = false

    new UIText(`§7${normalStar}`)
        .setX(new CramSiblingConstraint(5))
        .setY((1).pixels())
        .setChildOf(normalStarsBox)
        .onMouseClick((comp, event) => {
            if (event.mouseButton !== 0) return

            toggled = !toggled
            toggled
                ? comp.setText(`§6${normalStar}`)
                : comp.setText(`§7${normalStar}`)

            if (!toggled) return starsToAdd = null
            starsToAdd = normalStar.repeat(idx)
        })
}

for (let idx = 0; idx < masterStars.length; idx++) {
    let star = masterStars[idx]

    let toggled = false

    new UIText(`§7${star}`)
        .setX(new CramSiblingConstraint(5))
        .setY((1).pixels())
        .setChildOf(masterStarsBox)
        .onMouseClick((comp, event) => {
            if (event.mouseButton !== 0) return

            toggled = !toggled
            toggled
                ? comp.setText(`§c${star}`)
                : comp.setText(`§7${star}`)

            if (!toggled) return mstarsToAdd = null
            mstarsToAdd = star
        })
}

new UIText(`§7✯ [Lvl 100]`)
    .setX((1).pixels())
    .setY(new CramSiblingConstraint(5))
    .setChildOf(rightPanelBox)
    .onMouseClick((comp, event) => {
        if (event.mouseButton !== 0) return

        lvl100Only = !lvl100Only
        if (lvl100Only) {
            comp.setText(`§e✯ §b[Lvl 100]`)
            inputText.textInput.setText("[Lvl 100] ")

            return
        }

        const text = inputText.textInput.getText().replace("[Lvl 100] ", "")

        comp.setText(`§7✯ [Lvl 100]`)
        inputText.textInput.setText(text)
    })

const buttonsClass = new Set()

class ItemButton {
    constructor(obj) {
        this.obj = obj
        this.signText = this.obj.displayName.removeFormatting().replace(/(\[Lvl 1\] )/, "")
        this.lvl100Mode = this.signText === "Golden Dragon" ? 200 : 100

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

            const auctionsClicked = Persistence.data.auctionsClicked

            if (auctionsClicked && !auctionsClicked.find(it => it.id === this.obj.id)) {
                if (auctionsClicked.length >= 5) auctionsClicked.splice(0, 1)

                auctionsClicked.push(this.obj)
                Persistence.data.save()
            }

            if (lvl100Only) return addTextToSign(`[Lvl ${this.lvl100Mode}] ${this.signText}`)
            if (mstarsToAdd) return addTextToSign(`${normalStar.repeat(5)}${mstarsToAdd}`)
            if (!starsToAdd) return addTextToSign(this.signText)

            addTextToSign(`${this.signText} ${starsToAdd}`)
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

Persistence.data.auctionsClicked?.reverse()?.forEach(obj => new ItemButton(obj))
Persistence.data.auctionsStrings?.reverse()?.forEach(obj => new ItemButton(obj))

// Events
register("tick", () => {
    const containerName = Player.getContainer().getName()
    
    if (!previousGui) return previousGui = containerName

    if (previousGui === containerName) return

    previousGui = containerName
})

const registerWhen = () => (Client.currentGui.get() instanceof net.minecraft.client.gui.inventory.GuiEditSign) && previousGui.includes("Auctions") && config.auctionOverlay

register(net.minecraftforge.client.event.GuiScreenEvent.DrawScreenEvent.Pre, (event) => {
    if (config.auctionOverlayReset && firstType && !registerWhen()) {
        hoverText = []
        scrollable.clearChildren()
        buttonsClass.forEach(btnClass => btnClass._delete())
        inputText.textInput.setText("")
        Persistence.data.auctionsClicked?.reverse()?.forEach(obj => new ItemButton(obj))
        Persistence.data.auctionsStrings?.reverse()?.forEach(obj => new ItemButton(obj))
        resultsText.setText(`Results: ${Persistence.data.auctionsClicked?.length + Persistence.data.auctionsStrings?.length}`)
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

        if (str && !Persistence.data.auctionsStrings?.some(it => it.displayName === str.toLowerCase())) {
            if (Persistence.data.auctionsStrings.length >= 5) Persistence.data.auctionsStrings.splice(0, 1)

            Persistence.data.auctionsStrings.push({
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