import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { InventoryButton } from "../../shared/InventoryButton"
import { Persistence } from "../../shared/Persistence"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/Text"

// Constant variables
const feature = new Feature("EquipmentDisplay", "Misc", "")
const equipmentSlots = [10, 19, 28, 37]
const armorSlots = [5, 6, 7, 8]
const barrier = new Item("minecraft:barrier")
const buttonsClass = new Map()

// Changeable variables
let shouldScan = false
let createdList = {}

// Logic
const onWindowItems = (stackArray) => {
    if (!shouldScan) return

    equipmentSlots.forEach((it, idx) => {
        const item = new Item(stackArray[it])

        if (item.getName().removeFormatting() === "Empty Equipment Slot") {
            Persistence.data.equipments[idx] = ["no"]
            Persistence.data.save()

            return
        }

        const texture = item.getNBT()?.toObject()?.tag?.SkullOwner?.Properties?.textures?.[0]?.Value
        if (!texture) {
            ChatLib.chat(`${TextHelper.PREFIX} &cError while attempting to get texture data for item&f: ${item.getName()}`)

            return
        }

        Persistence.data.equipments[idx] = [texture, item.getLore().map(it => it)]
        Persistence.data.save()
    })

    shouldScan = false
}

const renderOverlay = () => {
    if (!(Client.currentGui.get() instanceof net.minecraft.client.gui.inventory.GuiInventory)) return

    buttonsClass.forEach(it => it.draw())
}

const onStep = () => {
    const equipmentList = Persistence.data.equipments
    if (!equipmentList) return

    if (equipmentList.some(it => typeof(it) === "string")) return ChatLib.chat(`${TextHelper.PREFIX} &cLooks like you have old equipment data please open your equipments to re-make this data`)

    equipmentList.forEach((it, idx) => {
        if (!it || createdList[idx] && createdList[idx] === it[0]) return

        if (createdList[idx] && createdList[idx] !== it[0]) {
            buttonsClass.get(armorSlots[idx]).delete()
            delete createdList[idx]
        }

        if (!createdList[idx]) createdList[idx] = it[0]

        if (it[0] === "no") {
            new InventoryButton(armorSlots[idx], null, buttonsClass)
                .setOffset(-27)
                .setCommand("equipment")
                .setItem(barrier)
                .setCheckFn(() => Client.currentGui.get() instanceof net.minecraft.client.gui.inventory.GuiInventory && config.equipmentsDisplay)

            return
        }

        const maxLength = it[1].reduce((a, b) => {
            if (a > b.length) return a

            a = b.length
            return a
        }, 0)

        new InventoryButton(armorSlots[idx], null, buttonsClass)
            .setOffset(-27)
            .setCommand("equipment")
            .createItemByTexture(it[0])
            .setCheckFn(() => Client.currentGui.get() instanceof net.minecraft.client.gui.inventory.GuiInventory && config.equipmentsDisplay)
            .onMouseHover((mx, my, gui) => {
                RenderHelper.drawHoveringText(it[1], mx - maxLength * 4, my)
            })
    })
}

// Events
new Event(feature, "step", onStep, () => World.isLoaded() && config.equipmentsDisplay, 1)
new Event(feature, "onOpenWindowPacket", (windowName) => shouldScan = windowName === "Your Equipment and Stats", () => World.isLoaded() && config.equipmentsDisplay)
new Event(feature, "onWindowItemsPacket", onWindowItems, () => World.isLoaded() && config.equipmentsDisplay)
new Event(feature, "renderOverlay", renderOverlay, () => World.isLoaded() && config.equipmentsDisplay)

// Starting events
feature.start()