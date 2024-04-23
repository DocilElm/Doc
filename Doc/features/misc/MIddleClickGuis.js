import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { TextHelper } from "../../shared/Text"

// Credits: https://github.com/Skytils/SkytilsMod/blob/1.x/src/main/kotlin/gg/skytils/skytilsmod/features/impl/misc/MiscFeatures.kt#L428

// Constant variables
const feature = new Feature("MiddleClickGui", "Misc", "")

// Logic
const onMouseClick = (_, __, mbtn, gui, event) => {
    if (mbtn !== 0 || !(gui instanceof net.minecraft.client.gui.inventory.GuiChest)) return

    const container = Player.getContainer()
    const containerSize = container.getSize() - 36

    const slot = gui.getSlotUnderMouse()?.field_75222_d
    if (!slot || slot >= containerSize || container.getName()?.startsWith("The Hex")) return

    const item = container.getItems()[slot]
    if (TextHelper.getSkyblockItemID(item)) return
    if (
        item.getName().removeFormatting() === "Reforge Item" ||
        item.getName().removeFormatting() === "Salvage Item"
        ) return

    cancel(event)
    container.click(slot, false, "MIDDLE")
}

// Events
new Event(feature, "guiMouseClick", onMouseClick, () => config.middleClickGui)

// Starting events
feature.start()