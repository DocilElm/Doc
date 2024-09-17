import ElementUtils from "../../../DocGuiLib/core/Element"
import { CenterConstraint, CramSiblingConstraint, OutlineEffect, ScrollComponent, UIBlock, UIText } from "../../../Elementa"
import { Button } from "./Button"

export const textInputScheme = {
    TextInput: {
        background: { color: [45, 58, 75, 80] }
    }
}

export class AbstractGui {
    constructor(title) {
        this.title = title.addColor()
        this.bgBoxComp = new UIBlock(ElementUtils.getJavaColor([3, 7, 17, 255]))
            .setX(new CenterConstraint())
            .setY(new CenterConstraint())
            .setWidth((25).percent())
            .setHeight((50).percent())
            .enableEffect(new OutlineEffect(ElementUtils.getJavaColor([4, 103, 132, 255]), 1))

        this.titleComp = new UIText(this.title)
            .setX(new CenterConstraint())
            .setY((5).percent())
            .setChildOf(this.bgBoxComp)

        this.scrollComp = new ScrollComponent()
            .setX(new CenterConstraint())
            .setY(new CramSiblingConstraint(5))
            .setWidth((100).percent())
            .setHeight((65).percent())
            .setChildOf(this.bgBoxComp)

        this.addButton = new Button("&aAdd", [45, 58, 75, 255], [35, 196, 3, 200])
        this.addButton.onClick(() => this.onAdd())
        this.addButton
            .component
            .setX(new CenterConstraint())
            .setY((80).percent())
            .setWidth((40).percent())
            .setHeight((10).percent())
            .setChildOf(this.bgBoxComp)
    }

    /**
     * - Meant to be overriden
     */
    onAdd() {}

    /**
     * - Meant to be overriden
     */
    onSave() {}
}