import config from "../../config"
import { Command, Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { InventoryButtonsData, InventorySlot, mainArray, slotsCreated } from "../../shared/InventorySlot"
import { Persistence } from "../../shared/Persistence"
import { TextHelper } from "../../shared/Text"

const feature = new Feature("InventoryButtons", "Misc", "")

// Logic
const checkSettings = () => {
    if (!World.isLoaded()) return
    
    Object.keys(Persistence.data.inventoryButtons)?.forEach(slot => {
        if (slotsCreated.has(slot)) return

        const { textureName, command } = Persistence.data.inventoryButtons[slot]
    
        new InventorySlot(parseInt(slot), textureName, command)
    })
}

const drawSlots = () => {
    if (!World.isLoaded() || !config.inventoryButtons) return
    
    const currGui = Client.currentGui?.get()
    if (!(currGui instanceof net.minecraft.client.gui.inventory.GuiInventory || currGui instanceof net.minecraft.client.gui.inventory.GuiChest)) return

    slotsCreated.forEach(slotClass => slotClass.draw())
}

const onMouseClick = (mx, my, mbtn) => {
    if (!World.isLoaded() || !config.inventoryButtons) return

    const currGui = Client.currentGui?.get()

    if (!(currGui instanceof net.minecraft.client.gui.inventory.GuiInventory || currGui instanceof net.minecraft.client.gui.inventory.GuiChest)) return

    slotsCreated.forEach(slotClass => slotClass.onMouseClick(mx, my, mbtn))
}

const addbutton = (slot, textureName, ...command) => {
    if (mainArray[parseInt(slot) - 1] in Persistence.data.inventoryButtons) return ChatLib.chat(`${TextHelper.PREFIX} &cInventory button with Slot &b${slot} &calready exists in data`)
    if (!slot || slot > mainArray.length) return ChatLib.chat(`${TextHelper.PREFIX} &cPlease set a valid slot. the available slots are: &b1-${mainArray.length}`)
    if (!textureName || !(textureName in InventoryButtonsData) && !textureName.startsWith("minecraft:")) return ChatLib.chat(`${TextHelper.PREFIX} &cPlease set a valid texture name. the available texture names are &7(this is case sensitive)&f:\n&b${Object.keys(InventoryButtonsData).join(", ")} &cor you could also use minecraft name &7(e.g minecraft:ender_pearl)`)
    if (!command[0] || !command.length) return ChatLib.chat(`${TextHelper.PREFIX} &cPlease set a valid command`)
    
    const theCommand = command.join(" ").replace(/\//g, "")
    const theSlot = mainArray[parseInt(slot) - 1]
    
    new InventorySlot(theSlot, textureName, theCommand)
    ChatLib.chat(`${TextHelper.PREFIX} &aSuccessfully created inventory button with Command &b/${theCommand}`)

    Persistence.data.inventoryButtons[theSlot] = {
        textureName: textureName,
        command: theCommand
    }

    Persistence.data.save()
}

const deletebutton = (slot) => {
    if (!slot) return ChatLib.chat(`${TextHelper.PREFIX} &cPlease set a valid slot number`)

    const theSlot = mainArray[parseInt(slot) - 1]
    if (!theSlot || !(theSlot in Persistence.data.inventoryButtons)) return ChatLib.chat(`${TextHelper.PREFIX} &cSlot ${slot} is not in the saved data or it's an invalid slot`)

    slotsCreated.delete(theSlot)
    delete Persistence.data.inventoryButtons[theSlot]
    Persistence.data.save()

    ChatLib.chat(`${TextHelper.PREFIX} &aSuccessfully deleted inventory button with slot&f: &b${slot}`)
}

// Events
new Event(feature, "renderOverlay", drawSlots, () => World.isLoaded() && config.inventoryButtons)
new Event(feature, "guiMouseClick", onMouseClick, () => World.isLoaded() && config.inventoryButtons)
new Event(feature, "step", checkSettings, () => World.isLoaded(), 1)
new Command(feature, "addbutton", addbutton)
new Command(feature, "deletebutton", deletebutton)

// Starting feature
feature.start()