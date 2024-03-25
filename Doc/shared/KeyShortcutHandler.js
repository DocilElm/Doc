import ElementUtils from "../../DocGuiLib/core/Element"
import Button from "../../DocGuiLib/elements/Button"
import TextInput from "../../DocGuiLib/elements/TextInput"
import { CramSiblingConstraint, UIRoundedRectangle } from "../../Elementa"
import { Persistence } from "./Persistence"
import { scheme } from "./CommandAlias"
import { TextHelper } from "./Text"

export const keybindsCreated = new Set()

export class KeybindShortcut {
    constructor(parent, keycode = 0, msg = null) {
        this.parent = parent
        this.keycode = keycode
        this.msg = msg
        this.keybind = null

        this.isFocused = false

        keybindsCreated.add(this)

        this._init()
    }

    _init() {
        this.mainBox = new UIRoundedRectangle(3)
            .setX((20).percent())
            .setY(new CramSiblingConstraint(5))
            .setWidth((70).percent())
            .setHeight((10).percent())
            .setColor(ElementUtils.getJavaColor([0, 0, 0, 0]))
            .setChildOf(this.parent)

        this.commandInput = new TextInput(this.msg ?? "Message", 1, 1, 30, 90)
        this.commandInput._create(scheme).setChildOf(this.mainBox)

        this.setKeycodeButton = new Button("", 35, 1, 30, 90, false).onMouseClickEvent(this.onClick.bind(this))
        this.setKeycodeButton._create(scheme).setChildOf(this.mainBox)

        this.setText(Keyboard.getKeyName(this.keycode))
        
        this.removeButton = new Button("Remove", 68, 1, 30, 90, false)
            .onMouseClickEvent(this._removeKeybind.bind(this))
            ._create(scheme)
            .setColor(ElementUtils.getJavaColor([100, 30, 22, 150]))
            .setChildOf(this.mainBox)
    }

    /**
     * - Sets a text to the keybind button
     * - if the key is less than 3 length it'll add "Key: " to it
     * @param {String} text 
     * @returns 
     */
    setText(text = "") {
        const string = text.length <= 3 ? `Key: ${text}` : text
        this.setKeycodeButton.text.setText(string)

        return this
    }

    /**
     * - Runs whenever the keybind button is clicked
     * - sets the focus/unfocus and changes the keybind button text
     * @returns 
     */
    onClick() {
        this.isFocused = !this.isFocused
        if (!this.isFocused) return this.setText(Keyboard.getKeyName(this.keycode))

        this.setText("****")
    }

    /**
     * - Sets the focus/unfocus and changes the keybind button text
     * @returns this for method chaining
     */
    unfocus() {
        this.isFocused = false
        this.setText(Keyboard.getKeyName(this.keycode))

        return this
    }

    /**
     * - Sets the keybind for this class
     * - calls the #unfocus method to change the keybind button text
     * @param {Number} keycode 
     * @returns this for method chaining
     */
    onKeyType(keycode) {
        if (keycode === 1) return this.unfocus()
        this.keycode = keycode
        this.unfocus()

        return this
    }

    /**
     * - Creates the [keybind] with [msg] for this class to run
     */
    _addKeybind(msg = null) {
        if (!this.keycode) return ChatLib.chat(`${TextHelper.PREFIX} &cError while trying to create keybind with keyname ${Keyboard.getKeyName(this.keycode)}`)

        if (!msg && this.commandInput.textInput?.getText()) this.msg = this.commandInput.textInput?.getText()
        if (!this.msg) return
        if (this.keybind) {
            const oldKeycode = this.keybind.getKeyCode()
            KeyBind.removeKeyBind(this.keybind)

            Client.scheduleTask(2, () => {
                if (oldKeycode === this.keycode) return
                
                delete Persistence.data.keyShortcuts[oldKeycode]
                Persistence.data.save()
            })
        }

        this.keybind = new KeyBind(`ShortCut: ${this.keycode}`, this.keycode, "Doc")
        this.keybind.registerKeyPress(() => ChatLib.say(this.msg))

        Persistence.data.keyShortcuts[this.keycode] = {
            msg: this.msg
        }
        Persistence.data.save()
    }

    /**
     * - Removes this Keybind from the [Gui]
     * - and deletes it from the list so it cannot be ran
     */
    _removeKeybind() {
        if (this.keybind) KeyBind.removeKeyBind(this.keybind) // i love chattriggers so much
        this.parent.removeChild(this.mainBox)
        this.keybind = null
        
        delete Persistence.data.keyShortcuts[this.keycode]
        Persistence.data.save()

        keybindsCreated.delete(this)
    }
}