import ElementUtils from "../../../DocGuiLib/core/Element"
import { CenterConstraint, OutlineEffect, UIBlock, UIText } from "../../../Elementa"

export class Button {
    constructor(text, color, outlineColor) {
        this.component = new UIBlock(ElementUtils.getJavaColor(color)).enableEffect(new OutlineEffect(ElementUtils.getJavaColor(outlineColor), 0.5))
        this.text = text
        this.textComponent = new UIText(text.addColor())
            .setX(new CenterConstraint())
            .setY(new CenterConstraint())
            .setChildOf(this.component)
        this.listeners = []

        this.component.onMouseClick((comp, event) => {
            for (let idx = 0; idx < this.listeners.length; idx++) {
                let fn = this.listeners[idx]
                fn(comp, event)
            }
        })
    }

    /**
     * @param {(UIComponent, UIClickEvent) => void} fn
     */
    onClick(fn) {
        this.listeners.push(fn)
    }
}