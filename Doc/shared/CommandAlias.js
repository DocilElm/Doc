import ElementUtils from "../../DocGuiLib/core/Element"
import Button from "../../DocGuiLib/elements/Button"
import TextInput from "../../DocGuiLib/elements/TextInput"
import { CramSiblingConstraint, UIRoundedRectangle } from "../../Elementa"
import { Persistence } from "./Persistence"

export const scheme = {
    "Button": {
        "backgroundBox": [0, 0, 0, 80],
        "backgroundBox1": [0, 0, 0, 0],
        "lines": [0, 0, 0, 80],
        "textColor": [255, 255, 255, 255],
        "textScale": 1,
        "mouseClick": [255, 255, 255, 80],
        "mouseEnter": [0, 0, 0, 80],
        "mouseLeave": [0, 0, 0, 0]
    },
    "TextInput": {
        "backgroundBox": [0, 0, 0, 80],
        "textColor": [255, 255, 255, 255],
        "textScale": 1,
        "mouseEnter": [0, 0, 0, 80],
        "mouseLeave": [255, 255, 255, 255]
    },
    "Text": {
        "textScale": 1,
        "textColor": [255, 255, 255, 255]
    }
}
export const commandsCreated = new Set()

let commandCooldown = null

export class CommandAlias {
    constructor(parent, alias = null, command = null) {
        this.parent = parent
        this.alias = alias
        this.command = command

        commandsCreated.add(this)

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

        this.aliasInput = new TextInput(this.alias ?? "alias", 1, 1, 30, 90)
        this.aliasInput._create(scheme).setChildOf(this.mainBox)

        this.commandInput = new TextInput(this.command ?? "command", 35, 1, 30, 90)
        this.commandInput._create(scheme).setChildOf(this.mainBox)
        
        this.removeButton = new Button("Remove", 70, 1, 30, 90, false)
            .onMouseClickEvent(this._removeCommand.bind(this))
            ._create(scheme)
            .setColor(ElementUtils.getJavaColor([100, 30, 22, 150]))
            .setChildOf(this.mainBox)
    }

    /**
     * - Creates the [command] and [alias] for this class with the
     * - text inside the TextInput
     */
    _createCommand() {
        this.command = this.commandInput.textInput.getText().replace(/\//, "")
        this.alias = this.aliasInput.textInput.getText().replace(/\//, "")

        Persistence.data.commandAliases[this.alias] = { command: this.command }
        Persistence.data.save()
    }

    /**
     * - Removes this AliasCommand from the [Gui]
     * - and deletes it from the list so it cannot be ran
     */
    _removeCommand() {
        this.parent.removeChild(this.mainBox)
        
        delete Persistence.data.commandAliases[this.alias]
        Persistence.data.save()

        commandsCreated.delete(this)
    }

    /**
     * - Checks whether the command sent matches this [alias] for this [AliasCommand]
     * - if it does run the [command] for this class
     * @param {String} msg 
     * @param {*} event 
     * @returns 
     */
    messageSent(msg, event) {
        if (commandCooldown && (Date.now() - commandCooldown) <= 3000) return

        if (msg === this.alias) {
            commandCooldown = Date.now()
            cancel(event)
            ChatLib.command(this.command)

            return
        }

        const cmd = msg.split(" ")[0]
        const args = msg.split(`${cmd} `)[1]

        if (cmd !== this.alias || !args) return

        commandCooldown = Date.now()
        cancel(event)
        ChatLib.command(`${this.command} ${args}`)
    }
}