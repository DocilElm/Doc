import ElementUtils from "../../../DocGuiLib/core/Element"
import HandleGui from "../../../DocGuiLib/core/Gui"
import TextInputElement from "../../../DocGuiLib/elements/TextInput"
import { CenterConstraint, CramSiblingConstraint, UIBlock, UIText } from "../../../Elementa"
import { addCommand } from "../../shared/Command"
import { Persistence } from "../../shared/Persistence"
import { TextHelper } from "../../shared/TextHelper"
import { AbstractGui, textInputScheme } from "./AbstractGui"
import { Button } from "./Button"

const gui = new HandleGui()

let commandCooldown = null

class Alias {
    constructor(parent, command, alias, commandList) {
        this.command = command
        this.alias = alias
        this.parent = parent
        this.commandList = commandList
        this.commandList.push(this)
        this.id = this.commandList.length - 1
        this.init()
    }

    init() {
        this.mainBox = new UIBlock(ElementUtils.getJavaColor([0, 0, 0, 0]))
            .setX((5).percent())
            .setY(new CramSiblingConstraint(5))
            .setWidth((98).percent())
            .setHeight((10).percent())
            .setChildOf(this.parent)

        this.aliasText = new UIText("Alias: ")
            .setX((0).pixels())
            .setY(new CenterConstraint())
            .setChildOf(this.mainBox)

        this.aliasInput = new TextInputElement(this.alias, 1, 1, 25, 90)
        this.aliasInput._setPosition(
            new CramSiblingConstraint(2),
            (0).percent()
        )
        this.aliasInput._create(textInputScheme).setChildOf(this.mainBox)

        this.commandText = new UIText("Command: ")
            .setX(new CramSiblingConstraint(2))
            .setY(new CenterConstraint())
            .setChildOf(this.mainBox)
        this.commandInput = new TextInputElement(this.command, 1, 1, 25, 90)
        this.commandInput._setPosition(
            new CramSiblingConstraint(2),
            (0).percent()
        )
        this.commandInput._create(textInputScheme).setChildOf(this.mainBox)

        this.removeButton = new Button("&cX", [0, 0, 0, 0], [196, 3, 3, 255])
        this.removeButton
            .component
            .setX(new CramSiblingConstraint(2))
            .setY((1).percent())
            .setWidth((8).percent())
            .setHeight((90).percent())
            .setChildOf(this.mainBox)

        this.removeButton.onClick(() => this.remove())
    }

    create() {
        const cmdValue = this.commandInput.getText()
        const aliasValue = this.aliasInput.getText()
        if (!cmdValue || !aliasValue.getText()) return

        this.command = cmdValue.replace(/\//, "")
        this.alias = aliasValue.getText().replace(/\//, "")

        Persistence.data.commandAliases[this.alias] = { command: this.command }
    }

    remove() {
        this.parent.removeChild(this.mainBox)
        delete Persistence.data.commandAliases[this.alias]
        this.commandList.splice(this.id, 1)

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
        if (commandCooldown && (Date.now() - commandCooldown) <= 3000) return

        if (msg === this.alias) {
            commandCooldown = Date.now()
            cancel(event)
            ChatLib.command(this.command, TextHelper.shouldSendAsClient(this.command.split(" ")?.[0]))

            return
        }

        const cmd = msg.split(" ")[0]
        const args = msg.split(`${cmd} `)[1]

        if (cmd !== this.alias || !args) return

        commandCooldown = Date.now()
        cancel(event)
        ChatLib.command(`${this.command} ${args}`, TextHelper.shouldSendAsClient(this.command.split(" ")?.[0]))
    }
}

const cmdAlias = new class CommandAliases extends AbstractGui {
    constructor() {
        super("&b&lDoc Command Aliases")
        this.commandList = []

        register("messageSent", (msg, event) => {
            if (!msg.startsWith("/")) return

            for (let idx = 0; idx < this.commandList.length; idx++) {
                let alias = this.commandList[idx]
                alias.messageSent(msg.replace(/\//g, ""), event)
            }
        })
    }

    _addAlias(alias, command) {
        if (this.commandList.some(it => it.alias.toLowerCase() === alias.toLowerCase())) return
        new Alias(this.scrollComp, command, alias, this.commandList)
    }

    onAdd() {
        new Alias(this.scrollComp, "", "", this.commandList)
    }

    onSave() {
        for (let idx = 0; idx < this.commandList.length; idx++) {
            let alias = this.commandList[idx]
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