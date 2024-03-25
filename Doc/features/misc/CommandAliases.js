import ElementUtils from "../../../DocGuiLib/core/Element"
import HandleGui from "../../../DocGuiLib/core/Gui"
import Button from "../../../DocGuiLib/elements/Button"
import { CenterConstraint, ScrollComponent, UIRoundedRectangle, UIText } from "../../../Elementa"
import { CommandAlias, commandsCreated, scheme } from "../../shared/CommandAlias"
import { Persistence } from "../../shared/Persistence"
import { TextHelper } from "../../shared/Text"

const gui = new HandleGui("", "Doc").setCommand("commandaliases")

const bgbox = new UIRoundedRectangle(3)
    .setX(new CenterConstraint())
    .setY(new CenterConstraint())
    .setWidth((25).percent())
    .setHeight((50).percent())
    .setColor(ElementUtils.getJavaColor([24, 24, 24, 150]))

new UIText("Doc's command aliases")
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
    .onMouseClickEvent(() => new CommandAlias(scroll))
    ._create(scheme).setChildOf(bgbox)

new Button("Save", 0, 0, 15, 8, true)
    ._setPosition(
        (52).percent(),
        (80).percent()
    )
    .onMouseClickEvent(() => {
        commandsCreated.forEach(aliasClass => aliasClass._createCommand())
        ChatLib.chat(`${TextHelper.PREFIX} &aSuccessfully created aliases!`)
    })
    ._create(scheme).setChildOf(bgbox)

Object.keys(Persistence.data.commandAliases)?.forEach(key => {
    const obj = Persistence.data.commandAliases[key]

    new CommandAlias(scroll, key, obj.command)
})

gui._drawNormal(bgbox)

register("messageSent", (msg, event) => {
    if (!msg.startsWith("/")) return

    commandsCreated.forEach(aliasClass => aliasClass.messageSent(msg.replace(/\//g, ""), event))
})