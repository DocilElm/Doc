import ElementUtils from "../../../DocGuiLib/core/Element"
import HandleGui from "../../../DocGuiLib/core/Gui"
import KeybindElement from "../../../DocGuiLib/elements/Keybind"
import TextInputElement from "../../../DocGuiLib/elements/TextInput"
import { CenterConstraint, CramSiblingConstraint, UIBlock, UIText } from "../../../Elementa"
import { addCommand } from "../../shared/Command"
import { Persistence } from "../../shared/Persistence"
import { TextHelper } from "../../shared/TextHelper"
import { AbstractGui, textInputScheme } from "./AbstractGui"
import { Button } from "./Button"

const gui = new HandleGui()

class Shortcut {
    constructor(parent, keyCode, msg, shortcutList) {
        this.parent = parent
        this.keyCode = keyCode
        this.msg = msg
        this.shortcutList = shortcutList
        this.shortcutList.push(this)
        this.id = this.shortcutList.length - 1
        this.init()
    }

    init() {
        this.mainBox = new UIBlock(ElementUtils.getJavaColor([0, 0, 0, 0]))
            .setX((5).percent())
            .setY(new CramSiblingConstraint(5))
            .setWidth((98).percent())
            .setHeight((10).percent())
            .setChildOf(this.parent)

        this.msgText = new UIText("Message: ")
            .setX((0).pixels())
            .setY(new CenterConstraint())
            .setChildOf(this.mainBox)

        this.msgInput = new TextInputElement(this.msg, 1, 1, 30, 90)
        this.msgInput
            ._setPosition(
                new CramSiblingConstraint(2),
                (0).percent()
            )
            ._create(textInputScheme)
            .setChildOf(this.mainBox)

        this.keybindBtn = new KeybindElement(this.keyCode, 0, 0, 25, 90)
        this.keybindBtn
            ._setPosition(
                new CramSiblingConstraint(2),
                (0).percent()
            )
            ._create(textInputScheme)
            .setChildOf(this.mainBox)

        this.removeButton = new Button("&cX", [0, 0, 0, 0], [196, 3, 3, 255])
        this.removeButton
            .component
            .setX(new CramSiblingConstraint(3))
            .setY((1).percent())
            .setWidth((8).percent())
            .setHeight((90).percent())
            .setChildOf(this.mainBox)

        this.removeButton.onClick(() => this.remove())
    }

    /**
     * - Checks whether the given [keyCode] is currently being used
     * - by other keybind in controls
     * @param {number} keyCode
     * @returns {boolean}
     */
    checkKeycode(keyCode) {
        return Client.settings.settings.field_74324_K.some(it => it.func_151463_i() === keyCode)
    }

    create() {
        const ncode = this.keybindBtn.getValue()
        const input = this.msgInput.getText()
        if (ncode === 0) return this.remove()
        if (!input) return

        this.msg = input
        this.keyCode = ncode
        Persistence.data.keyShortcuts[this.keyCode] = {
            msg: this.msg
        }
    }

    remove() {
        this.parent.removeChild(this.mainBox)
        delete Persistence.data.keyShortcuts[this.keyCode]
        this.shortcutList.splice(this.id, 1)

        ChatLib.chat(`${TextHelper.PREFIX} &cRemoved KeyShortcut with key &b${this.keybindBtn._getKeyName().replace(/Key: /, "")}`)
    }

    onKeyPress(keyCode) {
        if (keyCode !== this.keyCode || !this.msg) return
        if (this.checkKeycode(keyCode)) {
            ChatLib.chat(`${TextHelper.PREFIX} &cLooks like you have another keybind bound to key &b${this.keybindBtn._getKeyName().replace(/Key: /, "")} &cPlease change this KeyShortcut keybind`)
            return
        }

        ChatLib.say(this.msg)
    }
}

const keyShortcuts = new class KeyShortcuts extends AbstractGui {
    constructor() {
        super("&b&lDoc Key Shortcuts")
        this.shortcutList = []

        register("clicked", (_, __, btn, state) => {
            if (!World.isLoaded() || !state || Client.isInGui()) return

            for (let idx = 0; idx < this.shortcutList.length; idx++) {
                /** @type {Shortcut} */
                let shortcut = this.shortcutList[idx]
                shortcut.onKeyPress(-100 + btn)
            }
        })

        register(net.minecraftforge.fml.common.gameevent.InputEvent.KeyInputEvent, () => {
            if (!World.isLoaded() || !Keyboard.getEventKeyState() || Client.isInGui()) return
            const key = Keyboard.getEventKey()
            if (!key) return

            for (let idx = 0; idx < this.shortcutList.length; idx++) {
                /** @type {Shortcut} */
                let shortcut = this.shortcutList[idx]
                shortcut.onKeyPress(key)
            }
        })        
    }

    _addShortcut(keyCode, msg) {
        if (this.shortcutList.some(it => it.keyCode === keyCode && it.msg === msg)) return
        new Shortcut(this.scrollComp, keyCode, msg, this.shortcutList)
    }

    onAdd() {
        new Shortcut(this.scrollComp, 0, "", this.shortcutList)
    }

    onSave() {
        for (let idx = 0; idx < this.shortcutList.length; idx++) {
            /** @type {Shortcut} */
            let shortcut = this.shortcutList[idx]
            shortcut.create()
        }

        ChatLib.chat(`${TextHelper.PREFIX} &aSuccessfully created KeyShortcuts`)
    }
}

gui._drawNormal(keyShortcuts.bgBoxComp)

Object.keys(Persistence.data.keyShortcuts)?.forEach(key => {
    const obj = Persistence.data.keyShortcuts[key]

    keyShortcuts._addShortcut(+key, obj.msg)
})

addCommand("ksho", "Opens the Key Shortcuts UI", () => gui.ctGui.open())
gui.registers.onClose(() => keyShortcuts.onSave())