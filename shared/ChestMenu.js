// Credits to https://chattriggers.com/modules/v/ChestMenu

const InventoryBasic = net.minecraft.inventory.InventoryBasic
const GuiChest = net.minecraft.client.gui.inventory.GuiChest

export class ChestMenu {
    constructor(name, rows) {
        this.items = []
        this.slotAmount = rows * 9
        this.basicinv = new InventoryBasic(
            name.addColor(),
            true,
            this.slotAmount
        )
        this.gui = null
    }

    setTitle(title) {
        this.basicinv.func_110133_a(title.addColor())
        return this
    }

    setItem(idx, item) {
        if (idx < 0 || idx >= this.slotAmount) return
        this.items[idx] = item
        this.basicinv.func_70299_a(idx, item?.itemStack || null)
        return this
    }

    setItems(list) {
        this.clear()

        for (let idx = 0; idx < list.length; idx++) {
            let item = list[idx]
            this.setItem(idx, item)
        }

        return this
    }

    clear() {
        this.items = []
        this.basicinv.func_174888_l()
        return this
    }

    open() {
        if (!this.gui) {
            this.gui = new JavaAdapter(GuiChest, {
                // cancel all [keyTyped] inputs and only listen for
                // [ESC] and inventory key (Default is E so whenever E is pressed close gui)
                func_73869_a(_, keycode) {
                    if (keycode === 1 || keycode === this.field_146297_k.field_71474_y.field_151445_Q.func_151463_i()) {
                        Player.getPlayer().func_71053_j()
                    }
                },
                // cancel [handleMouseInput] so the user cannot click in the gui
                func_146274_d() {}
            }, Player.getPlayer().field_71071_by, this.basicinv)
        }
        GuiHandler.openGui(this.gui)
    }
}