import config from "../../config"
import { Event } from "../../core/Event"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"

const makeObj = (/** @type {Item} */item) => {
    if (!item) return

    let id = item.getID()
    let name = item.getName()
    // If it's a book use lore instead of name
    if (id === 403) name = item.getLore()[1]

    return {
        id,
        stackSize: item.getStackSize(),
        name,
        item
    }
}

const editGui = new DraggableGui("inventoryHistoryDisplay").setCommandName("editinventoryhistorydisplay")

let items = []
let history = []

editGui.onDraw(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(`&a+16 &fEnder Pearl\n&c-1 &b${Player.getName()}`, 0, 0)
    Renderer.finishDraw()
})

const onAdd = (item) => {
    history.push([`&a+${item.stackSize} ${item.name}`, Date.now()])
}

const onRemove = (previousItem) => {
    history.push([`&c-${previousItem.stackSize} ${previousItem.name}`, Date.now()])
}

const onChange = (item, previousItem) => {
    if (previousItem.stackSize < item.stackSize) {
        history.push([`&a+${item.stackSize - previousItem.stackSize} ${item.name}`, Date.now()])
        return
    }

    history.push([`&c-${previousItem.stackSize - item.stackSize} ${item.name}`, Date.now()])
}

const feat = new Feature("inventoryHistoryDisplay")
    .addEvent(
        new Event("tick", () => {
            const currentInv = Player.getInventory().getItems().map(makeObj)

            for (let idx = 0; idx < currentInv.length; idx++) {
                let item = currentInv[idx]
                let previousItem = items[idx]

                if (previousItem && !item) {
                    onRemove(previousItem)
                    continue
                }

                if (!previousItem && item) {
                    onAdd(item)
                    continue
                }

                if (!previousItem || !item) continue

                if (previousItem.id !== item.id) continue
                if (previousItem.stackSize === item.stackSize) continue

                onChange(item, previousItem)
            }

            items = currentInv
            feat.update()
        })
    )
    .addSubEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen()) return

            Renderer.retainTransforms(true)
            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())

            const currentTime = Date.now()
            for (let idx = history.length - 1; idx >= 0; idx--) {
                let data = history[idx]
                if (currentTime - data[1] > (config().inventoryHistoryTime * 1000)) {
                    history.splice(idx, 1)
                    continue
                }
                let str = data[0]

                Renderer.drawStringWithShadow(str, 0, idx === history.length - 1 ? 0 : 9 * (idx + 1))
            }

            Renderer.retainTransforms(false)
            Renderer.finishDraw()
        }),
        () => items.length
    )
    .onUnregister(() => {
        items = []
        history = []
    })