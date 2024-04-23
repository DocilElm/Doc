import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { TextHelper } from "../../shared/Text"

// Credits: https://github.com/Skytils/SkytilsMod/blob/1.x/src/main/kotlin/gg/skytils/skytilsmod/features/impl/misc/MiscFeatures.kt#L428

// Constant variables
const feature = new Feature("MiddleClickGui", "Misc", "")
const avoidGuis = [
    "Wardrobe",
    "Drill Anvil",
    "Anvil",
    "Storage",
    "The Hex",
    "Composter",
    "Auctions",
    "Abiphone"
]

// Logic
const onMouseClick = (_, __, mbtn, gui, event) => {
    if (mbtn !== 0 || !(gui instanceof net.minecraft.client.gui.inventory.GuiChest)) return

    const container = Player.getContainer()
    const containerSize = container.getSize() - 36

    const slot = gui.getSlotUnderMouse()?.field_75222_d
    if (!slot || slot >= containerSize || avoidGuis.some(it => container.getName()?.startsWith(it))) return

    const item = container.getItems()[slot]
    if (TextHelper.getSkyblockItemID(item)) return
    if (
        item?.getName()?.removeFormatting() === "Reforge Item" ||
        item?.getName()?.removeFormatting() === "Salvage Item"
        ) return

    cancel(event)
    container.click(slot, false, "MIDDLE")
}

// Events
new Event(feature, "guiMouseClick", onMouseClick, () => config.middleClickGui)

// Starting events
feature.start()