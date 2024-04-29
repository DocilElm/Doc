import ElementUtils from "../../../DocGuiLib/core/Element"
import HandleGui from "../../../DocGuiLib/core/Gui"
import Button from "../../../DocGuiLib/elements/Button"
import { CenterConstraint, ScrollComponent, UIRoundedRectangle, UIText } from "../../../Elementa"
import { CancelMessage, cancelsCreated } from "../../shared/CancelMessage"
import { CommandAlias, commandsCreated, scheme } from "../../shared/CommandAlias"
import { KeybindShortcut, keybindsCreated } from "../../shared/KeyShortcutHandler"
import { Persistence } from "../../shared/Persistence"
import { TextHelper } from "../../shared/Text"
import { TitleMessage, titlesCreated } from "../../shared/TitleMessage"

const gui = new HandleGui("", "Doc").setCommand("aliasesshortcut")

const bgbox = new UIRoundedRectangle(3)
    .setX(new CenterConstraint())
    .setY(new CenterConstraint())
    .setWidth((25).percent())
    .setHeight((50).percent())
    .setColor(ElementUtils.getJavaColor([24, 24, 24, 150]))

new UIText(TextHelper.PREFIX2)
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
new Button("Alias", 0, 0, 15, 8, true)
    ._setPosition(
        (5).percent(),
        (80).percent()
    )
    .onMouseClickEvent(() => new CommandAlias(scroll))
    ._create(scheme).setChildOf(bgbox)

new Button("Key", 0, 0, 15, 8, true)
    ._setPosition(
        (22).percent(),
        (80).percent()
    )
    .onMouseClickEvent(() => new KeybindShortcut(scroll))
    ._create(scheme).setChildOf(bgbox)

new Button("Title", 0, 0, 15, 8, true)
    ._setPosition(
        (39).percent(),
        (80).percent()
    )
    .onMouseClickEvent(() => new TitleMessage(scroll))
    ._create(scheme).setChildOf(bgbox)

new Button("Cancel", 0, 0, 15, 8, true)
    ._setPosition(
        (56).percent(),
        (80).percent()
    )
    .onMouseClickEvent(() => new CancelMessage(scroll))
    ._create(scheme).setChildOf(bgbox)

new Button("Save", 0, 0, 15, 8, true)
    ._setPosition(
        (73).percent(),
        (80).percent()
    )
    .onMouseClickEvent(() => {
        commandsCreated.forEach(aliasClass => aliasClass._createCommand())
        keybindsCreated.forEach(keyClass => keyClass._addKeybind())
        titlesCreated.forEach(it => it.create())
        cancelsCreated.forEach(it => it.create())

        ChatLib.chat(`${TextHelper.PREFIX} &aSuccessfully created.`)
    })
    ._create(scheme).setChildOf(bgbox)

// Load command aliases from settings
Object.keys(Persistence.data.commandAliases)?.forEach(key => {
    const obj = Persistence.data.commandAliases[key]

    new CommandAlias(scroll, key, obj.command)
})

// Load keybind shortcuts from settings
Object.keys(Persistence.data.keyShortcuts)?.forEach(key => {
    const obj = Persistence.data.keyShortcuts[key]

    new KeybindShortcut(scroll, parseInt(key), obj.msg)._addKeybind(true)
})

// Load TitleMessages from settings
Object.keys(Persistence.data.showMessageTitle)?.forEach(key => {
    new TitleMessage(scroll, Persistence.data.showMessageTitle[key], key).create(true)
})

// Load CancelMessages from settings
Object.keys(Persistence.data.cancelMessage)?.forEach(key => {
    new TitleMessage(scroll, key).create(true)
})

gui._drawNormal(bgbox)

register("messageSent", (msg, event) => {
    if (!msg.startsWith("/")) return

    commandsCreated.forEach(aliasClass => aliasClass.messageSent(msg.replace(/\//g, ""), event))
})

register("guiKey", (char, keycode) => {
    if (!gui.ctGui.isOpen()) return

    keybindsCreated.forEach(keyClass => {
        if (!keyClass.isFocused) return

        keyClass.onKeyType(keycode)
    })
})

register("guiMouseClick", (mx, my, mbtn) => {
    if (!gui.ctGui.isOpen()) return

    keybindsCreated.forEach(keyClass => {
        if (!keyClass.isFocused) return

        keyClass.onKeyType(mbtn, true)
    })
})