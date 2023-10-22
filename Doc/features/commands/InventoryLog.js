import { ChestMenu } from "../../../ChestMenu/index";
import { PREFIX, getJsonDataFromFile, saveToFile } from "../../utils/Utils";

let inventoryLogs = getJsonDataFromFile("data/InventoryLogs.json");

function logCurrentInventory() {
    const inventory = {};

    Player.getInventory()?.getItems()?.splice(0, 36)?.forEach((item, slot) => {
        if (!item?.getNBT()) return;

        inventory[slot] = NBT.toObject(item.getNBT());
    });

    return inventory;
}

register("command", (command, ...name) => {
    // Format the command to be lower case incase of a misstype
    command = command?.toLowerCase();

    // Delete the old json data so it dosen't break the code
    if(!!inventoryLogs?.[0] && inventoryLogs?.[0]?.name) {
        FileLib.delete("Doc", "data/InventoryLogs.json")
        ChatLib.chat(`\n${PREFIX} §cDetected old config files\n§7Deleting §cInventoryLogs §7please re-type the command`)
        inventoryLogs = getJsonDataFromFile("data/InventoryLogs.json")
        return
    }

    if (!command) return ChatLib.chat(`
${PREFIX} §cIncorrect command, try one of the following:
§7| §6add <name> §7- Add your current inventory to the logs under <name>
§7| §6remove <name> §7- Remove the inventory with <name> from the logs
§7| §6open <name> §7- Open logged inventory with <name>
§7| §6list §7- View available inventroy logs
    `)

    // This doesn't need the inventory name to do operations
    if (command === "list") {
        ChatLib.chat(`${PREFIX} §7Current logged inventories:`)
        Object.keys(inventoryLogs).forEach(inventoryName => ChatLib.chat(`§6- ${inventoryName}`));
        return;
    }

    // From here on we require an inventory name so here is a general check
    // We make use of 0 being falsey in JS here
    if (!name) return ChatLib.chat(`${PREFIX} §cMissing inventory name`);

    // The name can be spaced so make it one string here
    name = name.join(" ")

    // Creating an inventory doesn't require us to get the old one
    if (command === "add") {
        inventoryLogs[name] = logCurrentInventory();
        saveToFile("data/InventoryLogs.json", inventoryLogs);
        ChatLib.chat(`${PREFIX} §aSuccessfully added §6${name} §ato inventory logs`);
        return;
    };

    const inventory = inventoryLogs[name];
    // Check if the inventory exists to open or remove
    if (!inventory) {
        return ChatLib.chat(`${PREFIX} §cSorry, §6${name} §cis not a logged inventory`);
    }

    if (command === "open") {
        const items = Array(36).fill(null);

        Object.entries(inventory).forEach(([slot, itemNBT]) => {
            // Calculate the slot to be correct since hotbar is included and is weird
            if (slot >= 9) { // If the slot is normal inventory
                slot -= 9;
            } else { // If the slot is in the hotbar
                slot += 27;
            }

            items[slot] = new Item(net.minecraft.item.ItemStack.func_77949_a(NBT.parse(itemNBT).rawNBT)); // #loadItemStackFromNBT

            // Load the lore since it doesn't seem to do it in the function above
            // Please help this is torture and so fucking scuffed
            const lore = itemNBT.tag?.display?.Lore;
            if (lore) {
                items[slot].setLore(lore);
            }
        });

        // Make a fake ChestMenu to show the items in (Possibly in the future remove this dependency)
        // Return to stop further execution
        return new ChestMenu(`§8Inventory: §6${name}`, 4)
            .setItems(items)
            .open();
    }

    if (command === "remove") {
        // This straight up deletes the reference in memory so we save some memory here
        delete inventoryLogs[name];
        // Save the deletion
        saveToFile("data/InventoryLogs.json", inventoryLogs);
        ChatLib.chat(`${PREFIX} §aSuccessfully removed §6${name} §afrom inventory logs`);
        return;
    }
}).setName("invlogs");
