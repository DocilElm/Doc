import { Event } from "../../core/Event"
import EventEnums, { ParticleEnums } from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { RenderHelper } from "../../shared/Render"

let block = null

const feat = new Feature("boxBerberis", "the rift", "dreadfarm")
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.SPAWNPARTICLE, (type, [x, y, z]) => {
            if (type !== ParticleEnums.FIREWORKS_SPARK || Math.hypot(Player.getX() - x, Player.getZ() - z) > 20) return

            const sideBlock = World.getBlockAt(x - 1, y, z - 1)
            const blockBelow = World.getBlockAt(x - 1, y - 1, z - 1)

            if (
                sideBlock.type.mcBlock !== net.minecraft.init.Blocks.field_150330_I ||
                blockBelow.type.mcBlock !== net.minecraft.init.Blocks.field_150458_ak
            ) return

            block = sideBlock
            feat.update()
        })
    )
    .addSubEvent(
        new Event("renderWorld", () => {
            RenderHelper.outlineFilledBlock(block, 0, 255, 255, 255, false)
        }),
        () => block
    )
    .onUnregister(() => {
        block = null
    })