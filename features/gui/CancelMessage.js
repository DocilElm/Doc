import ElementUtils from "../../../DocGuiLib/core/Element"
import HandleGui from "../../../DocGuiLib/core/Gui"
import TextInputElement from "../../../DocGuiLib/elements/TextInput"
import { CenterConstraint, CramSiblingConstraint, UIBlock, UIText } from "../../../Elementa"
import { addCommand } from "../../shared/Command"
import { Persistence } from "../../shared/Persistence"
import { TextHelper } from "../../shared/TextHelper"
import { AbstractGui, bottomLineEffect, textInputScheme } from "./AbstractGui"
import { Button } from "./Button"

const gui = new HandleGui()

class CMessage {
    constructor(parent, criteria, list) {
        this.parent = parent
        this.criteria = criteria
        this.list = list
        this.list.push(this)
        this.id = this.list.length - 1
        this.dirty = false
        this._register = null
        this.init()
    }

    init() {
        this.mainBox = new UIBlock(ElementUtils.getJavaColor([0, 0, 0, 0]))
            .setX((5).percent())
            .setY(new CramSiblingConstraint(5))
            .setWidth((98).percent())
            .setHeight((10).percent())
            .setChildOf(this.parent)

        this.criteriaInput = new TextInputElement(this.criteria, 1, 1, 55, 90)
        this.criteriaInput
            ._setPosition(
                (15).percent(),
                (0).percent()
            )
            ._create(textInputScheme)
            .setChildOf(this.mainBox)

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
            this.criteriaInput.bgBox
        ]))
    }

    create(internal = false) {
        const inputValue = this.criteriaInput.getText()
        if (!inputValue && !internal) return
        if (this._register) this.removeRegister()

        if (!internal) this.criteria = inputValue
        Persistence.data.cancelMessage[this.criteria] = 0

        this._register = register("chat", (event) => {
            if (this.dirty) return this.removeRegister()
            cancel(event)
        }).setCriteria(this.criteria).setPriority(Priority.LOWEST)
    }

    /**
     * - Sets this [CancelMessage] dirty meaning it was deleted
     */
    markDirty() {
        this.dirty = true
    }

    remove() {
        this.removeRegister()
        this.parent.removeChild(this.mainBox)
        delete Persistence.data.cancelMessage[this.criteria]
        this.list.splice(this.id, 1)

        ChatLib.chat(`${TextHelper.PREFIX} &cRemoved Cancel Message with criteria &b${this.criteria}`)
    }

    removeRegister() {
        if (!this._register) return

        this.markDirty()
        this._register.unregister()
        this._register = null
    }
}

const cancelMsg = new class CancelMessage extends AbstractGui {
    constructor() {
        super("Cancel Message", ["Criteria"])
    }

    _addMsg(criteria) {
        if (this.list.some(it => it.criteria === criteria)) return
        new CMessage(this.scrollComp, criteria, this.list).create(true)
    }

    onAdd() {
        new CMessage(this.scrollComp, "", this.list)
    }

    onSave() {
        for (let idx = 0; idx < this.list.length; idx++) {
            let cmsg = this.list[idx]
            cmsg.create()
        }

        ChatLib.chat(`${TextHelper.PREFIX} &aSuccessfully created Cancel Messages`)
    }
}

gui._drawNormal(cancelMsg.bgBoxComp)

Object.keys(Persistence.data.cancelMessage)?.forEach(key => {
    cancelMsg._addMsg(key)
})

addCommand("cmsg", "Opens the CancelMessage UI", () => gui.ctGui.open())
gui.registers.onClose(() => cancelMsg.onSave())