import config from "../../config"
import { Event } from "../../core/Event"
import Feature from "../../core/Feature"
import { addCommand } from "../../shared/Command"
import { InventoryButton } from "../../shared/InventoryButton"
import { Persistence } from "../../shared/Persistence"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/TextHelper"

const InventoryButtonsData = Persistence.getDataFromFileOrLink("InventoryButtonsData.json", "https://raw.githubusercontent.com/DocilElm/Doc-Data/main/misc/InventoryButtonsData.json")
const leftSlots = [9, 18, 27, 36]
const bottomSlots = [37, 38, 39, 40, 41, 42, 43]
const rightSlots = [17, 26, 35, 44]
const mainArray = [...leftSlots, ...rightSlots, ...bottomSlots]
const buttonsCreated = new Map()

const getOffset = (slot) => {
    if (leftSlots.some(num => num === slot)) return [ -27, 0 ]
    if (rightSlots.some(num => num === slot)) return [ 27, 0 ]
    if (!bottomSlots.some(num => num === slot)) return

    return [ 0, 27 ]
}

const makeButton = (slot, texture, command) => {
    const [ x, y ] = getOffset(slot)

    if (texture.startsWith("minecraft:")) {
        new InventoryButton(slot, null, buttonsCreated)
            .setItem(new Item(texture))
            .setCommand(command)
            .onMouseHover((mx, my) => {
                RenderHelper.drawHoveringText([ command, TextHelper.PREFIX2 ], mx, my)
            })
            .setOffset(x, y)
            .setCalculateSize(true)
            .setCheckFn(() => (Client.currentGui.get() instanceof net.minecraft.client.gui.inventory.GuiInventory || Client.currentGui.get() instanceof net.minecraft.client.gui.inventory.GuiChest) && config().inventoryButtons)

        return
    }

    new InventoryButton(slot, null, buttonsCreated)
        .createItemByTexture(InventoryButtonsData[texture])
        .setCommand(command)
        .onMouseHover((mx, my) => {
            RenderHelper.drawHoveringText([ command, TextHelper.PREFIX2 ], mx, my)
        })
        .setOffset(x, y)
        .setCalculateSize(true)
        .setCheckFn(() => (Client.currentGui.get() instanceof net.minecraft.client.gui.inventory.GuiInventory || Client.currentGui.get() instanceof net.minecraft.client.gui.inventory.GuiChest) && config().inventoryButtons)
}

const checkSaved = () => {
    Object.keys(Persistence.data.inventoryButtons)?.forEach(slot => {
        if (buttonsCreated.has(parseInt(slot))) return

        const { textureName, command } = Persistence.data.inventoryButtons[slot]

        makeButton(parseInt(slot), textureName, command)
    })
}

new Feature("inventoryButtons")
    .addEvent(
        new Event("renderOverlay", () => {
            const currGui = Client.currentGui?.get()
            if (!(currGui instanceof net.minecraft.client.gui.inventory.GuiInventory || currGui instanceof net.minecraft.client.gui.inventory.GuiChest)) return

            buttonsCreated.forEach(it => it.draw())
        })
    )
    .onRegister(() => {
        checkSaved()
    })

const addButton = (slot, textureName, ...command) => {
    if (mainArray[Math.floor(slot) - 1] in Persistence.data.inventoryButtons) return ChatLib.chat(`${TextHelper.PREFIX} &cInventory button with Slot &b${slot} &calready exists in data`)
    if (!slot || slot > mainArray.length) return ChatLib.chat(`${TextHelper.PREFIX} &cPlease set a valid slot. the available slots are: &b1-${mainArray.length}`)
    if (!textureName || !(textureName in InventoryButtonsData) && !textureName.startsWith("minecraft:")) return ChatLib.chat(`${TextHelper.PREFIX} &cPlease set a valid texture name. the available texture names are &7(this is case sensitive)&f:\n&b${Object.keys(InventoryButtonsData).join(", ")} &cor you could also use minecraft name &7(e.g minecraft:ender_pearl)`)
    if (!command[0] || !command.length) return ChatLib.chat(`${TextHelper.PREFIX} &cPlease set a valid command`)

    const theCommand = command.join(" ").replace(/\//g, "")
    const theSlot = mainArray[Math.floor(slot) - 1]

    makeButton(theSlot, textureName, theCommand)
    ChatLib.chat(`${TextHelper.PREFIX} &aSuccessfully created inventory button with Command &b/${theCommand}`)

    Persistence.data.inventoryButtons[theSlot] = {
        textureName: textureName,
        command: theCommand
    }

    Persistence.data.save()
    checkSaved()
}

const removeButton = (slot) => {
    if (!slot) return ChatLib.chat(`${TextHelper.PREFIX} &cPlease set a valid slot number`)

    const theSlot = mainArray[Math.floor(slot) - 1]
    if (!theSlot || !(theSlot in Persistence.data.inventoryButtons)) return ChatLib.chat(`${TextHelper.PREFIX} &cSlot ${slot} is not in the saved data or it's an invalid slot`)

    buttonsCreated.get(theSlot).delete()
    buttonsCreated.delete(theSlot)
    
    delete Persistence.data.inventoryButtons[theSlot]
    Persistence.data.save()

    ChatLib.chat(`${TextHelper.PREFIX} &aSuccessfully deleted inventory button with slot&f: &b${slot}`)
    checkSaved()
}

// Command
addCommand("invbtn", "&bEdits your inventory buttons &7(&aadd&f/&cremove&7)", (type, slot, textureName, ...command) => {
    if (!type) return ChatLib.chat(`${TextHelper.PREFIX} &cInvalid type please use on of the following types&f: &aadd&f, &cremove`)

    if (type.toLowerCase() === "add") return addButton(slot, textureName, ...command)
    if (type.toLowerCase() !== "remove") return

    removeButton(slot)
})