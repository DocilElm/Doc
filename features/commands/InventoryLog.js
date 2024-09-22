import { ChestMenu } from "../../shared/ChestMenu"
import { addCommand } from "../../shared/Command"
import { createSkull } from "../../shared/InventoryButton"
import { Persistence } from "../../shared/Persistence"
import { TextHelper } from "../../shared/TextHelper"

const logs = Persistence.getDataFromFile("InventoryLogs.json")
const chest = new ChestMenu(`${TextHelper.PREFIX2} §bInventory§f`, 5)

let data = []

const createCustomItem = (nbt) => {
    // If it's not a skull we use default item creation
    if (nbt.id !== "minecraft:skull") {
        const item = new Item(net.minecraft.item.ItemStack.func_77949_a(NBT.parse(nbt).rawNBT))
        const lore = nbt.tag.display.Lore
        if (lore) item.setLore(lore)

        return item
    }

    // Otherwise we start doing funny skull stuff
    // it's done this way so it doesn't break the users' textures on other skull items
    const texture = nbt.tag.SkullOwner.Properties.textures[0].Value
    const item = createSkull(texture)

    const display = nbt.tag.display
    const lore = display.Lore
    const name = display.Name

    item.setName(name)
    item.setStackSize(nbt.Count)
    if (lore) item.setLore(lore)

    return item
}

addCommand("invlog", "Command which opens or logs your current inventory with a specified name", (type, name) => {
    type = type?.toLowerCase()

    switch (type) {
        case "list":
            ChatLib.chat(`${TextHelper.PREFIX} &aInventory names saved \n&6- &b${Object.keys(logs).join("\n&6- &b")}`)
            break

        case "add": {
            if (name in logs) return ChatLib.chat(`${TextHelper.PREFIX} &cInventory with name &b${name}&c already exists`)
            if (!name) return ChatLib.chat(`${TextHelper.PREFIX} &cInvalid inventory name passed`)
            logs[name] = {}

            const items = Player.getInventory().getItems()
            for (let idx = 0; idx < items.length; idx++) {
                let item = items[idx]
                if (!item) continue

                logs[name][idx] = item.getNBT().toObject()
            }

            ChatLib.chat(`${TextHelper.PREFIX} &aSuccessfully added &b${name} &ato inventory logs`)
            break
        }

        case "open": {
            if (!(name in logs)) return ChatLib.chat(`${TextHelper.PREFIX} &cInventory with name &b${name}&c does not exist`)
            const items = logs[name]
            Object.entries(items).forEach(([slot, nbt]) => {
                slot = slot < 9
                    ? slot + 36
                    : slot >= 36
                        ? slot % 36
                        : slot
                data[slot] = createCustomItem(nbt)
            })

            chest
                .setItems(data)
                .setTitle(`${TextHelper.PREFIX2} &b&lInventory&f &6${name}`)
                .open()
            break
        }

        case "remove": {
            if (!(name in logs)) return ChatLib.chat(`${TextHelper.PREFIX} &cInventory with name &b${name}&c does not exist`)
            delete logs[name]
            ChatLib.chat(`${TextHelper.PREFIX} &aSuccessfully removed &b${name} &afrom inventory logs`)
            break
        }

        default:
            ChatLib.chat(`${TextHelper.PREFIX} &cPlease add a valid mode &7modes: (add, list, remove, open)`)
            break
    }
})

register("gameUnload", () => {
    Persistence.saveDataToFile("InventoryLogs.json", logs, true, false)
})