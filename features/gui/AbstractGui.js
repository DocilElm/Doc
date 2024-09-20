import ElementUtils from "../../../DocGuiLib/core/Element"
import { CenterConstraint, OutlineEffect, ScrollComponent, UIBlock, UIText } from "../../../Elementa"
import { Button } from "./Button"

export const textInputScheme = {
    TextInput: {
        background: { color: [45, 58, 75, 80] }
    },
    Keybind: {
        background: { color: [45, 58, 75, 80] }
    }
}

const Effect = Java.type("gg.essential.elementa.effects.Effect")

/** 
 * @param {number[]} color [0 - 255]
 * @param {number} thickness The thickness of the line
 * @param {UIComponent[]} comps The components this effect should use to calculate the width of the line
 * 
*/
export const bottomLineEffect = (color, thickness = 1, comps = [], shouldPad = false) => {
    return new JavaAdapter(Effect, {
        getData() {
            const res = [null, 0]
            if (comps.length === 1) {
                res[0] = comps[0].getLeft()
                res[1] = comps[0].getWidth()
                return res
            }

            let pad = (comps[1].getLeft() - comps[0].getRight()) / 2 + 0.25

            for (let idx = 0; idx < comps.length; idx++) {
                let comp = comps[idx]
                if (idx === 0) res[0] = comp.getLeft()
                res[1] += comp.getWidth() + (shouldPad ? pad : 0)
            }

            return res
        },
        beforeChildrenDraw() {
            const bounds = this.boundComponent
            const [ y, height ] = [ bounds.getTop(), bounds.getHeight() ]

            let [ startX, totalWidth ] = this.getData()

            Renderer.drawLine(
                Renderer.color(...color),
                startX,
                y + height + thickness,
                startX + totalWidth,
                y + height + thickness,
                thickness
            )
        }
    })
}

export class AbstractGui {
    constructor(name, columns, columnData = { startX: 5, padding: 28 }) {
        this.list = []
        this.columns = columns
        this.columnData = columnData
        this.title = `&b&lDoc ${name}`.addColor()

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

        if (this.columns) {
            this._makeColumns()
        }

        this.scrollComp = new ScrollComponent()
            .setX(new CenterConstraint())
            .setY((15).percent())
            .setWidth((100).percent())
            .setHeight((60).percent())
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

    _makeColumns() {
        if (this.columns.length === 1) {
            new UIText(this.columns[0])
                .setX(new CenterConstraint())
                .setY((10).percent())
                .setChildOf(this.bgBoxComp)
            return
        }

        for (let idx = 0; idx < this.columns.length; idx++) {
            let text = this.columns[idx]
            let x = this.columnData.startX + (this.columnData.padding * idx)
            new UIText(text)
                .setX((x).percent())
                .setY((10).percent())
                .setChildOf(this.bgBoxComp)
        }
    }

    /**
     * - Meant to be overriden
     */
    onAdd() {}
}