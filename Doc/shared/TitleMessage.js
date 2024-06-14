import ElementUtils from "../../DocGuiLib/core/Element"
import ButtonElement from "../../DocGuiLib/elements/Button"
import TextInputElement from "../../DocGuiLib/elements/TextInput"
import { CramSiblingConstraint, UIRoundedRectangle } from "../../Elementa"
import { Persistence } from "./Persistence"
import { showTitle } from "./Render"
import { TextHelper } from "./Text"

export const titlesCreated = new Set()

export class TitleMessage {
    constructor(parent, title, criteria) {
        this.parent = parent
        this.title = title
        this.criteria = criteria
        this.shouldRegister = true

        titlesCreated.add(this)

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

        this.criteriaInput = new TextInputElement(this.criteria ?? "criteria", 1, 1, 30, 90)
        this.criteriaInput._create().setChildOf(this.mainBox)

        this.titleInput = new TextInputElement(this.title ?? "title", 35, 1, 30, 90)
        this.titleInput._create().setChildOf(this.mainBox)
        
        this.removeButton = new ButtonElement("Remove", 70, 1, 30, 90, false)
            .onMouseClickEvent(this._removeTitle.bind(this))
            ._create()
            .setColor(ElementUtils.getJavaColor([100, 30, 22, 150]))
            .setChildOf(this.mainBox)
    }

    _removeTitle() {
        this.register = null
        this.shouldRegister = false
        this.parent.removeChild(this.mainBox)
        
        delete Persistence.data.showMessageTitle[this.criteria]
        Persistence.data.save()

        titlesCreated.delete(this)
    }

    create(internal = false) {
        if (this.register) return

        if (!internal) {
            this.title = this.title ?? this.titleInput.textInput.getText()
            this.criteria = this.criteria ?? this.criteriaInput.textInput.getText()

            Persistence.data.showMessageTitle[this.criteria] = this.title
            Persistence.data.save()
        }

        this.register = register("chat", () => {
            if (!this.shouldRegister) return

            showTitle(this.title, TextHelper.PREFIX, 1000)
            World.playSound("random.successful_hit", 1, 1)
        }).setCriteria(this.criteria)
    }
}