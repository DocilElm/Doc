import ElementUtils from "../../DocGuiLib/core/Element"
import ButtonElement from "../../DocGuiLib/elements/Button"
import TextInputElement from "../../DocGuiLib/elements/TextInput"
import { CramSiblingConstraint, UIRoundedRectangle } from "../../Elementa"
import { scheme } from "./CommandAlias"
import { Persistence } from "./Persistence"

export const cancelsCreated = new Set()

export class CancelMessage {
    constructor(parent, criteria) {
        this.parent = parent
        this.criteria = criteria
        this.shouldRegister = true

        cancelsCreated.add(this)

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

        this.criteriaInput = new TextInputElement(this.criteria ?? "criteria", 1, 1, 60, 90)
        this.criteriaInput._create(scheme).setChildOf(this.mainBox)
        
        this.removeButton = new ButtonElement("Remove", 70, 1, 30, 90, false)
            .onMouseClickEvent(this._removeTitle.bind(this))
            ._create(scheme)
            .setColor(ElementUtils.getJavaColor([100, 30, 22, 150]))
            .setChildOf(this.mainBox)
    }

    _removeTitle() {
        this.register = null
        this.shouldRegister = false
        this.parent.removeChild(this.mainBox)
        
        delete Persistence.data.cancelMessage[this.criteria]
        Persistence.data.save()

        cancelsCreated.delete(this)
    }

    create(internal = false) {
        if (this.register) return

        if (!internal) {
            this.criteria = this.criteria ?? this.criteriaInput.textInput.getText()

            Persistence.data.cancelMessage[this.criteria] = 0
            Persistence.data.save()
        }

        this.register = register("chat", (event) => {
            if (!this.shouldRegister) return

            cancel(event)
        }).setCriteria(this.criteria)
    }
}