import { ChestMenu } from "../../../ChestMenu/index";
import { Command } from "../../core/Events";
import { Feature } from "../../core/Feature";
import { TextHelper } from "../../shared/Text";

// Constant variables
const feature = new Feature("Inventory Logs", "Commands", "A way to log your current inventory")
const PREFIX = TextHelper.PREFIX

// Changeable variables
let inventoryLogs = feature.getConfig()

// Logic
function verifyInventoryName(inventoryName = []) {
    // We make use of "" being falsey in JS and inventoryName always being an array
    return inventoryName?.join(" ") || ChatLib.chat(`${PREFIX} §cMissing inventory name`)
}

function getInventory(inventoryName) {
    // Check if the inventory exists to open or remove
    return inventoryLogs[inventoryName] ?? ChatLib.chat(`${PREFIX} §cSorry, §6${inventoryName} §cis not a logged inventory`)
}

// Command
new Command(feature, "invlogs", (command, ...inventoryName) => {
    // Format the command to be lower case incase of a misstype
    command = command?.toLowerCase();

    switch(command) {
        case "list": 
            // This doesn't need the inventory name to do operations
            ChatLib.chat(`${PREFIX} §7Current logged inventories:`)
            Object.keys(inventoryLogs).forEach(inventory => ChatLib.chat(`§6- ${inventory}`))
            return
        case "add":
            // An inventory name is required
            inventoryName = verifyInventoryName(inventoryName)
            // Return here if ChatLib has been called
            if (!inventoryName) return

            inventoryLogs[inventoryName] = {}

            Player.getInventory()?.getItems()?.splice(0, 36)?.forEach((item, slot) => {
                if (item?.getNBT()) inventoryLogs[inventoryName][slot] = NBT.toObject(item.getNBT())
            })
            
            feature.save()
            ChatLib.chat(`${PREFIX} §aSuccessfully added §6${inventoryName} §ato inventory logs`)
            return
        case "open":
            inventoryName = verifyInventoryName(inventoryName)
            if (!inventoryName) return
            // An inventory is required
            const inventory = getInventory(inventoryName)
            // Return here if ChatLib has been called
            if (!inventory) return
            
            const items = Array(36).fill(null)

            Object.entries(inventory).forEach(([slot, itemNBT]) => {
                // Calculate the slot to be correct since hotbar is included and is weird
                if (slot >= 9) { // If the slot is normal inventory
                    slot -= 9
                } else { // If the slot is in the hotbar
                    slot += 27
                }

                items[slot] = new Item(net.minecraft.item.ItemStack.func_77949_a(NBT.parse(itemNBT).rawNBT)) // #loadItemStackFromNBT

                // Load the lore since it doesn't seem to do it in the function above
                // Please help this is torture and so fucking scuffed
                const lore = itemNBT.tag?.display?.Lore
                if (lore) {
                    items[slot].setLore(lore)
                }
            });

            // Make a fake ChestMenu to show the items in (Possibly in the future remove this dependency)
            // Return to stop further execution
            return new ChestMenu(`§8Inventory: §6${inventoryName}`, 4)
                .setItems(items)
                .open()
        case "remove":
            inventoryName = verifyInventoryName(inventoryName)
            // This straight up deletes the reference in memory so we save some memory here
            delete inventoryLogs[inventoryName]
            // Save the deletion
            feature.save()
            ChatLib.chat(`${PREFIX} §aSuccessfully removed §6${inventoryName} §afrom inventory logs`)
            return
        default:
            // We go to the edge to prevent indentation when sending it in chat
            return ChatLib.chat(`
${PREFIX} §cIncorrect argument, try one of the following:
§7| §6add <name> §7- Add your current inventory to the logs under <name>
§7| §6remove <name> §7- Remove the inventory with <name> from the logs
§7| §6open <name> §7- Open logged inventory with <name>
§7| §6list §7- View available inventroy logs`)
    }
})

feature.start()