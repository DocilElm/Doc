import ElementUtils from "../../../DocGuiLib/core/Element"
import HandleGui from "../../../DocGuiLib/core/Gui"
import Button from "../../../DocGuiLib/elements/Button"
import { CenterConstraint, ScrollComponent, UIRoundedRectangle, UIText } from "../../../Elementa"
import { scheme } from "../../shared/CommandAlias"
import { KeybindShortcut, keybindsCreated } from "../../shared/KeyShortcutHandler"
import { Persistence } from "../../shared/Persistence"
import { TextHelper } from "../../shared/Text"

const gui = new HandleGui("", "Doc").setCommand("keybindshortcuts")

const bgbox = new UIRoundedRectangle(3)
    .setX(new CenterConstraint())
    .setY(new CenterConstraint())
    .setWidth((25).percent())
    .setHeight((50).percent())
    .setColor(ElementUtils.getJavaColor([24, 24, 24, 150]))

new UIText(`${TextHelper.PREFIX2} §bkeybind shortcuts`)
    .setX(new CenterConstraint())
    .setY((10).pixels())
    .setChildOf(bgbox)

const scroll = new ScrollComponent()
    .setX(new CenterConstraint())
    .setY((25).pixels())
    .setWidth((100).percent())
    .setHeight((65).percent())
    .setChildOf(bgbox)

// Bottom buttons
new Button("Add", 0, 0, 15, 8, true)
    ._setPosition(
        (35).percent(),
        (80).percent()
    )
    .onMouseClickEvent(() => new KeybindShortcut(scroll))
    ._create(scheme).setChildOf(bgbox)

new Button("Save", 0, 0, 15, 8, true)
    ._setPosition(
        (52).percent(),
        (80).percent()
    )
    .onMouseClickEvent(() => {
        keybindsCreated.forEach(keyClass => keyClass._addKeybind())
        ChatLib.chat(`${TextHelper.PREFIX} &aSuccessfully created keybind shortcuts!`)
    })
    ._create(scheme).setChildOf(bgbox)
Keyboard.getKeyName(this.keycode ?? 0)

Object.keys(Persistence.data.keyShortcuts)?.forEach(key => {
    const obj = Persistence.data.keyShortcuts[key]

    new KeybindShortcut(scroll, parseInt(key), obj.msg)._addKeybind(obj.msg)
})

gui._drawNormal(bgbox)

register("guiKey", (char, keycode) => {
    if (!gui.ctGui.isOpen()) return

    keybindsCreated.forEach(keyClass => {
        if (!keyClass.isFocused) return

        keyClass.onKeyType(keycode)
    })
})