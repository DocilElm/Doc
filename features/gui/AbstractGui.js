import ElementUtils from "../../../DocGuiLib/core/Element"
import { CenterConstraint, CramSiblingConstraint, OutlineEffect, ScrollComponent, UIBlock, UIText } from "../../../Elementa"
import { Button } from "./Button"

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
            .setY((25).pixels())
            .setWidth((100).percent())
            .setHeight((65).percent())
            .setChildOf(this.bgBoxComp)

        this.centeredBottom = new UIBlock(ElementUtils.getJavaColor([0, 0, 0, 0]))
            .setX(new CenterConstraint())
            .setY((80).percent())
            .setWidth((40).percent())
            .setHeight((10).percent())
            .setChildOf(this.bgBoxComp)

        this.addButton = new Button("&aAdd", [45, 58, 75, 255], [35, 196, 3, 200])
        this.addButton.onClick(() => this.onAdd())
        this.addButton
            .component
            .setX(new CramSiblingConstraint(3))
            .setY((0).percent())
            .setWidth((45).percent())
            .setHeight((80).percent())
            .setChildOf(this.centeredBottom)

        this.saveButton = new Button("&bSave", [45, 58, 75, 255], [4, 103, 132, 255])
        this.saveButton.onClick(() => this.onSave())
        this.saveButton
            .component
            .setX(new CramSiblingConstraint(3))
            .setY((0).percent())
            .setWidth((45).percent())
            .setHeight((80).percent())
            .setChildOf(this.centeredBottom)
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