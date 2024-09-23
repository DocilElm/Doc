import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { TextHelper } from "../../shared/TextHelper"

let holding = false
let ticks = 0
let coord = null

const feat = new Feature("mushroomTimer", "the rift", ["dreadfarm", "west village"])
    .addEvent(
        new Event(EventEnums.PACKET.CLIENT.HELDITEMCHANGE, () => {
            holding = TextHelper.getSkyblockItemID(Player.getHeldItem()) === "FARMING_WAND"
            ticks = 0
            feat.update()
        })
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.CUSTOM.TICK, () => {
            const lookingAt = Player.lookingAt()
            const lookingAtMushroom = lookingAt?.type?.mcBlock === net.minecraft.init.Blocks.field_150338_P
            if (!lookingAtMushroom) {
                ticks = 0
                feat.update()
                return
            }
            if (ticks && lookingAtMushroom) {
                ticks--
                feat.update()
                return
            }

            ticks = 80
            coord = [ lookingAt.getX(), lookingAt.getY(), lookingAt.getZ() ]
            feat.update()
        }),
        () => holding
    )
    .addSubEvent(
        new Event("renderWorld", () => {
            const time = ticks * 0.05
            const color = time > 1 ? Renderer.RED : Renderer.GREEN

            Tessellator.drawString(`${time.toFixed(2)}`, coord[0] + 0.5, coord[1] + 0.5, coord[2] + 0.5, color, false, 2)
        }),
        () => ticks
    )
    .onUnregister(() => {
        holding = false
        ticks = 0
    })