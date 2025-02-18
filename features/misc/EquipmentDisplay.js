import config from "../../config"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { InventoryButton } from "../../shared/InventoryButton"
import { Persistence } from "../../shared/Persistence"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/TextHelper"

const equipmentSlots = [10, 19, 28, 37]
const armorSlots = [5, 6, 7, 8]
const barrier = new Item("minecraft:barrier")
const buttons = new Map()

let inEquipment = false
let inInv = false

const updateButtons = (feat) => {
    if (!feat) return

    const equipmentList = Persistence.data.equipments
    if (!equipmentList) return

    for (let idx = 0; idx < equipmentList.length; idx++) {
        let v = equipmentList[idx]
        if (!v) continue

        let [ texture, lore ] = v
        let inList = buttons.get(armorSlots[idx])

        // If the [slot] is in the list and the [texture] matches
        // this [texture] we continue (meaning we don't re-add the same butotn)
        if (inList && inList.texture === texture) continue

        // Otherwise if the [slot] is in the list and the
        // [texture] doesn't match this [texture] delete the old instance
        if (inList && inList.texture !== texture) {
            inList.delete()
        }

        // Creating the button itself
        if (texture === "no") {
            // If the [texture] is [no] this means that the slot was empty
            // so we can just create the button with a [barrier] item
            new InventoryButton(armorSlots[idx], null, buttons)
                .setOffset(-27)
                .setCommand("equipment")
                .setItem(barrier)
                .setCheckFn(() => Client.currentGui.get() instanceof net.minecraft.client.gui.inventory.GuiInventory && config().equipmentsDisplay && inInv)

            continue
        }

        // Otherwise if the [texture] exists
        // we'll create the item via the [createItemByTexture] method
        // and add its lore as the hover value
        new InventoryButton(armorSlots[idx], null, buttons)
            .setOffset(-27)
            .setCommand("equipment")
            .createItemByTexture(texture)
            .setCheckFn(() => Client.currentGui.get() instanceof net.minecraft.client.gui.inventory.GuiInventory && config().equipmentsDisplay && inInv)
            .onMouseHover((mx, my) => {
                RenderHelper.drawHoveringText(lore, mx, my)
            })
    }

    // Updating our [Feature] instance
    // due to it having [SubEvents] that depend on this function adding/removing
    // items to the list/map
    feat.update()
}

const feat = new Feature("equipmentsDisplay")
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.WINDOWOPEN, (title) => {
            inEquipment = title === "Your Equipment and Stats"
            feat.update()
        })
    )
    .addEvent(
        new Event("guiOpened", (event) => {
            inInv = event.gui instanceof net.minecraft.client.gui.inventory.GuiInventory
            feat.update()
        })
    )
    .addEvent(
        new Event(EventEnums.PACKET.CUSTOM.WINDOWCLOSE, () => {
            inInv = false
            feat.update()
        })
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.WINDOWITEMS, (items) => {
            for (let idx = 0; idx < equipmentSlots.length; idx++) {
                let slot = equipmentSlots[idx]
                let mcItem = items[slot]
                if (!mcItem) continue
                let item = new Item(mcItem)

                if (item.getName().removeFormatting() === "Empty Equipment Slot") {
                    Persistence.data.equipments[idx] = ["no"]
                    continue
                }

                let texture = item.getNBT()?.toObject()?.tag?.SkullOwner?.Properties?.textures?.[0]?.Value
                if (!texture) {
                    ChatLib.chat(`${TextHelper.PREFIX} &cError while attempting to get texture data for item&f: ${item.getName()}`)
                    continue
                }

                Persistence.data.equipments[idx] = [texture, item.getLore().map(it => it)]
            }

            Persistence.data.save()
            // Call the method to update equipments being displayed
            updateButtons(feat)

            inEquipment = false
            feat.update()
        }),
        () => inEquipment
    )
    .addSubEvent(
        new Event("renderOverlay", () => {
            buttons.forEach(it => it.draw())
        }),
        () => buttons.size && inInv
    )
    .onRegister(() => {
        // Update the initial button list from cache (if it exists)
        updateButtons(feat)
    })
    .onUnregister(() => {
        inInv = false
        inEquipment = false
        buttons.forEach(v => v.delete())
        buttons.clear()
    })