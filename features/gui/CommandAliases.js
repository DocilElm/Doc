import ElementUtils from "../../../DocGuiLib/core/Element"
import HandleGui from "../../../DocGuiLib/core/Gui"
import TextInputElement from "../../../DocGuiLib/elements/TextInput"
import { CramSiblingConstraint, UIBlock } from "../../../Elementa"
import { addCommand } from "../../shared/Command"
import { Persistence } from "../../shared/Persistence"
import { TextHelper } from "../../shared/TextHelper"
import { AbstractGui, bottomLineEffect, textInputScheme } from "./AbstractGui"
import { Button } from "./Button"

const gui = new HandleGui()

let commandCooldown = null

class Alias {
    constructor(parent, command, alias, list) {
        this.command = command
        this.alias = alias
        this.parent = parent
        this.list = list
        this.list.push(this)
        this.id = this.list.length - 1
        this.init()
    }

    init() {
        this.mainBox = new UIBlock(ElementUtils.getJavaColor([0, 0, 0, 0]))
            .setX((5).percent())
            .setY(new CramSiblingConstraint(5))
            .setWidth((98).percent())
            .setHeight((10).percent())
            .setChildOf(this.parent)

        this.aliasInput = new TextInputElement(this.alias, 1, 1, 25, 90)
        this.aliasInput._setPosition(
            (10).percent(),
            (0).percent()
        )
        this.aliasInput._create(textInputScheme).setChildOf(this.mainBox)

        this.commandInput = new TextInputElement(this.command, 1, 1, 25, 90)
        this.commandInput._setPosition(
            (40).percent(),
            (0).percent()
        )
        this.commandInput._create(textInputScheme).setChildOf(this.mainBox)

        this.removeButton = new Button("&cX", [0, 0, 0, 0], [196, 3, 3, 255])
        this.removeButton
            .component
            .setX(new CramSiblingConstraint(5))
            .setY((1).percent())
            .setWidth((8).percent())
            .setHeight((90).percent())
            .setChildOf(this.mainBox)

        this.removeButton.onClick(() => this.remove())

        this.mainBox.enableEffect(bottomLineEffect([45, 58, 75, 150], 1.5, [
            this.aliasInput.bgBox,
            this.commandInput.bgBox
        ], true))
    }

    create() {
        const cmdValue = this.commandInput.getText()
        const aliasValue = this.aliasInput.getText()
        if (!cmdValue || !aliasValue) return

        this.command = cmdValue.replace(/\//, "")
        this.alias = aliasValue.replace(/\//, "")

        Persistence.data.commandAliases[this.alias] = { command: this.command }
    }

    remove() {
        this.parent.removeChild(this.mainBox)
        delete Persistence.data.commandAliases[this.alias]
        this.list.splice(this.id, 1)

        ChatLib.chat(`${TextHelper.PREFIX} &cRemoved Command Alias with alias &b${this.alias}`)
    }

    /**
     * - Checks whether the command sent matches this [alias] for this [AliasCommand]
     * - if it does run the [command] for this class
     * @param {string} msg
     * @param {CancellableEvent} event
     * @returns
     */
    messageSent(msg, event) {
        if (msg === this.alias) {
            cancel(event)
            if (commandCooldown && (Date.now() - commandCooldown) <= 3000) return
            ChatLib.command(this.command, TextHelper.shouldSendAsClient(this.command.split(" ")?.[0]))
            commandCooldown = Date.now()

            return
        }

        const cmd = msg.split(" ")[0]
        const args = msg.split(`${cmd} `)[1]

        if (cmd !== this.alias || !args) return

        cancel(event)
        if (commandCooldown && (Date.now() - commandCooldown) <= 3000) return
        ChatLib.command(`${this.command} ${args}`, TextHelper.shouldSendAsClient(this.command.split(" ")?.[0]))
        commandCooldown = Date.now()
    }
}

const cmdAlias = new class CommandAliases extends AbstractGui {
    constructor() {
        super("Command Aliases", ["Alias", "Criteria"], { startX: 15, padding: 30 })

        register("messageSent", (msg, event) => {
            if (!msg.startsWith("/")) return

            for (let idx = 0; idx < this.list.length; idx++) {
                let alias = this.list[idx]
                alias.messageSent(msg.replace(/\//g, ""), event)
            }
        })
    }

    _addAlias(alias, command) {
        if (this.list.some(it => it.alias.toLowerCase() === alias.toLowerCase() && it.command.toLowerCase() === command.toLowerCase())) return
        new Alias(this.scrollComp, command, alias, this.list)
    }

    onAdd() {
        new Alias(this.scrollComp, "", "", this.list)
    }

    onSave() {
        for (let idx = 0; idx < this.list.length; idx++) {
            let alias = this.list[idx]
            alias.create()
        }

        ChatLib.chat(`${TextHelper.PREFIX} &aSuccessfully created Command Aliases`)
    }
}

gui._drawNormal(cmdAlias.bgBoxComp)

Object.keys(Persistence.data.commandAliases)?.forEach(key => {
    const obj = Persistence.data.commandAliases[key]
    cmdAlias._addAlias(key, obj.command)
})

addCommand("aliasc", "Opens the Command Aliases UI", () => gui.ctGui.open())
gui.registers.onClose(() => cmdAlias.onSave())