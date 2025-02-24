import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"
import { Persistence } from "../../shared/Persistence"

const editGui = new DraggableGui("quiverDisplay").setCommandName("editquiverdisplay")
const MCItem = net.minecraft.item.Item

editGui.onDraw(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&9Explosive Arrow &7(&e2329&7)", 0, 0)
    Renderer.finishDraw()
})

const feat = new Feature("quiverDisplay")
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.SETSLOT, (slotId, itemStack) => {
            if (slotId !== 44) return
            const id = MCItem./* getIdFromItem */func_150891_b(itemStack./* getItem */func_77973_b())
            if (id !== 288) return

            const item = new Item(itemStack)
            const arrowsLore = item.getLore()?.[5]
            if (!arrowsLore || !arrowsLore.includes("Active Arrow")) return
            // Lazy good
            Persistence.data.quiverArrows = arrowsLore.replace("§5§o§7Active Arrow: ", "")

            feat.update()
        })
    )
    .addEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen() || !Persistence.data.quiverArrows) return

            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())
            Renderer.drawStringWithShadow(Persistence.data.quiverArrows, 0, 0)
            Renderer.finishDraw()
        })
    )