import { scheduleTask } from "../../core/CustomRegisters"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"
import { RenderHelper } from "../../shared/Render"

const editGui = new DraggableGui("slayerBossDisplay").setCommandName("editslayerbossdisplay")
const spawnedByRegex = /^Spawned by: (\w+)$/
const entities = new HashMap()

let currentBoss = {
    spawnedBy: null,
    timeEntity: null,
    hpEntity: null
}

editGui.onDraw(() => {
    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())

    const time = "&c02:59"
    const spawnedBy = `&eSpawned by: &b${Player.getName()}`
    const name = "&c☠ &bVoidgloom Seraph IV &e64.2M&c❤"

    Renderer.drawStringWithShadow(time, Renderer.getStringWidth(spawnedBy.removeFormatting()) / 2, 0)
    Renderer.drawStringWithShadow(spawnedBy, 15, 10)
    Renderer.drawStringWithShadow(name, 0, 20)

    Renderer.retainTransforms(false)
    Renderer.finishDraw()
})

const feat = new Feature("slayerBossDisplay")
    .addEvent(
        new Event(EventEnums.FORGE.ENTITYJOIN, (mcEntity, entityId) => {
            scheduleTask(() => {
                const entityName = mcEntity./* getName */func_70005_c_()
                const match = entityName?.removeFormatting()?.match(spawnedByRegex)
                if (!match) return

                const [ _, spawnedBy ] = match
                if (spawnedBy !== Player.getName()) return

                // -1 -> timer (02:59)
                // -2 -> armrostand name (☠ Voidgloom Seraph IV 64.2M❤)
                // -3 -> actual entity (Enderman)
                entities.put(entityId - 3, "test")
                currentBoss = {
                    spawnedBy: entityName, // This name should never change therefor we can set it static
                    timeEntity: World.getWorld()./* getEntityByID */func_73045_a(entityId - 1),
                    hpEntity: World.getWorld()./* getEntityByID */func_73045_a(entityId - 2)
                }
                feat.update()
            })
        })
    )
    .addSubEvent(
        new Event("renderEntity", (entity, _, pticks) => {
            if (!entities.containsKey(entity.entity.func_145782_y())) return
            RenderHelper.drawEntityBox(
                entity.getX(),
                entity.getY(),
                entity.getZ(),
                entity.getWidth(),
                entity.getHeight(),
                0, 255, 255, 255, 2, false, true, pticks
            )
        }),
        () => entities.size()
    )
    .addSubEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen()) return
            // I am lazy
            if (currentBoss.hpEntity./* isDead */field_70128_L) {
                entities.clear()
                currentBoss = {
                    spawnedBy: null,
                    timeEntity: null,
                    hpEntity: null
                }
                feat.update()
                return
            }

            Renderer.retainTransforms(true)
            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())

            const spawnedByName = currentBoss.spawnedBy
            const timeEntityName = currentBoss.timeEntity./* getName */func_70005_c_()
            const hpEntityName = currentBoss.hpEntity./* getName */func_70005_c_()

            Renderer.drawStringWithShadow(timeEntityName, Renderer.getStringWidth(spawnedByName.removeFormatting()) / 2, 0)
            Renderer.drawStringWithShadow(spawnedByName, 15, 10)
            Renderer.drawStringWithShadow(hpEntityName, 0, 20)

            Renderer.retainTransforms(false)
            Renderer.finishDraw()
        }),
        () => entities.size()
    )
    .onUnregister(() => {
        entities.clear()
        currentBoss = {
            spawnedBy: null,
            timeEntity: null,
            hpEntity: null
        }
    })