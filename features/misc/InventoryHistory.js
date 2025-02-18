import config from "../../config"
import { Event } from "../../core/Event"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"

const MCItem = Java.type("net.minecraft.item.Item")

const makeObj = (/** @type {MCItem} */item) => {
    if (!item) return

    let id = MCItem./* getIdFromItem */func_150891_b(item./* getItem */func_77973_b())
    let name = item.func_82833_r() // getDisplayName
    // If it's a book use lore instead of name
    if (id === 403) name = item./* getTooltip */func_82840_a(Player.getPlayer(), Client.getMinecraft()./* gameSettings */field_71474_y./* advancedItemTooltips */field_82882_x)[1]

    return {
        id,
        stackSize: item./* stackSize */field_77994_a,
        name,
        item
    }
}

const getInventory = () => {
    const inv = Player.getPlayer()./* inventory */field_71071_by
    return {
        inventory: inv,
        getItems() {
            const invSize = inv./* getSizeInventory */func_70302_i_()
            let arr = []

            for (let idx = 0; idx < invSize; idx++) {
                arr.push(makeObj(inv./* getStackInSlot */func_70301_a(idx)))
            }

            return arr
        },
        getName() {
            return inv./* getDisplayName */func_145748_c_()
        }
    }
}

const getSignature = (itemStack) => {
    return itemStack
        ./* getTagCompound */func_77978_p()
        ./* getCompoundTag */func_74775_l("SkullOwner")
        ./* getCompoundTag */func_74775_l("Properties")
        ./* getTag */func_74781_a("textures")
        ./* getCompoundTagAt */func_150305_b(0)
        ./* getString */func_74779_i("Signature")
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
            const currentInv = getInventory().getItems()

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
                if (
                    // If item is a skull check for it's signature instead
                    item.id === 397 &&
                    // If the signatures aren't equals this means that the current item
                    // should not trigger a change
                    getSignature(previousItem.item) !== getSignature(item.item)
                ) continue

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