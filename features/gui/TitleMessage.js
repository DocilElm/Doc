import ElementUtils from "../../../DocGuiLib/core/Element"
import HandleGui from "../../../DocGuiLib/core/Gui"
import TextInputElement from "../../../DocGuiLib/elements/TextInput"
import { CramSiblingConstraint, UIBlock } from "../../../Elementa"
import { addCommand } from "../../shared/Command"
import { Persistence } from "../../shared/Persistence"
import { showTitle } from "../../shared/Render"
import { TextHelper } from "../../shared/TextHelper"
import { AbstractGui, bottomLineEffect, textInputScheme } from "./AbstractGui"
import { Button } from "./Button"

const gui = new HandleGui()

class Title {
    constructor(parent, title, criteria, time, list) {
        this.parent = parent
        this.title = title
        this.criteria = criteria
        this.time = time
        this.list = list
        this.list.push(this)
        this.id = this.list.length - 1
        this.dirty = false
        this._register = null
        this.init()
    }

    init() {
        this.mainBox = new UIBlock(ElementUtils.getJavaColor([0, 0, 0, 0]))
            .setX((0).percent())
            .setY(new CramSiblingConstraint(5))
            .setWidth((98).percent())
            .setHeight((10).percent())
            .setChildOf(this.parent)

        this.titleInput = new TextInputElement(this.title, 1, 1, 25, 90)
        this.titleInput
            ._setPosition(
                (5).percent(),
                (0).percent()
            )
            ._create(textInputScheme)
            .setChildOf(this.mainBox)

        this.criteriaInput = new TextInputElement(this.criteria, 1, 1, 25, 90)
        this.criteriaInput
            ._setPosition(
                (33).percent(),
                (0).percent()
            )
            ._create(textInputScheme)
            .setChildOf(this.mainBox)

        this.timeInput = new TextInputElement(this.time, 1, 1, 25, 90)
        this.timeInput
            ._setPosition(
                (60).percent(),
                new CramSiblingConstraint(3)
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
            this.titleInput.bgBox,
            this.criteriaInput.bgBox,
            this.timeInput.bgBox
        ], true))
    }

    create(internal = false) {
        const titleValue = this.titleInput.getValue()
        const criteriaValue = this.criteriaInput.getValue()
        // Update time because this can be changed without
        // changing the other params so to avoid not saving time
        // we do this ugly workaround
        if (!internal && this.timeInput.getText()) {
            this.time = +(this.timeInput.getText() || 1)
            Persistence.data.messageTitles[this.criteria] = {
                title: this.title,
                time: this.time
            }
            this.dirty = true
        }

        if ((!criteriaValue || !titleValue) && !internal) return
        if (this._register) this.removeRegister()

        if (!internal) {
            this.title = titleValue
            this.criteria = criteriaValue
        }

        Persistence.data.messageTitles[this.criteria] = {
            title: this.title,
            time: this.time
        }

        this._register = register("chat", () => {
            if (this.dirty) return this.removeRegister()
            showTitle(this.title, TextHelper.PREFIX, this.time * 1000)
        }).setCriteria(this.criteria)
    }

    markDirty() {
        this.dirty = true
    }

    remove() {
        this.removeRegister()
        this.parent.removeChild(this.mainBox)
        delete Persistence.data.messageTitles[this.criteria]
        this.list.splice(this.id, 1)

        ChatLib.chat(`${TextHelper.PREFIX} &cRemoved Title Message with criteria &b${this.criteria}`)
    }

    removeRegister() {
        if (!this._register) return
        this.markDirty()
        this._register.unregister()
        this._register = null
        this.dirty = false
    }
}

const titleMsg = new class TitleMessage extends AbstractGui {
    constructor() {
        super("Title Message", ["Title", "Criteria", "Time (s)"], { startX: 5, padding: 27 })
    }

    _addTitle(title, criteria, time) {
        if (this.list.some(it => it.title.toLowerCase() === title.toLowerCase() || it.criteria.toLowerCase() === criteria.toLowerCase())) return
        new Title(this.scrollComp, title, criteria, time, this.list).create(true)
    }

    onAdd() {
        new Title(this.scrollComp, "", "", 1, this.list)
    }

    onSave() {
        for (let idx = 0; idx < this.list.length; idx++) {
            let v = this.list[idx]
            v.create()
        }

        ChatLib.chat(`${TextHelper.PREFIX} &aSuccessfully created Title Messages`)
    }
}

gui._drawNormal(titleMsg.bgBoxComp)

for (let k in Persistence.data.messageTitles) {
    let v = Persistence.data.messageTitles[k]
    if (v == null || k == null) continue
    titleMsg._addTitle(v.title, k, v.time)
}

addCommand("titlemsg", "Opens the Title Message UI", () => gui.ctGui.open())
gui.registers.onClose(() => titleMsg.onSave())