import config from "../../config"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import EtherwarpHelper from "../../shared/EtherwarpHelper"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/TextHelper"

const allowedID = new Set(["ASPECT_OF_THE_END", "ASPECT_OF_THE_VOID", "ETHERWARP_CONDUIT"])

let holdingAotv = false

const feat = new Feature("etherwarpOverlay")
    .addEvent(
        new Event(EventEnums.PACKET.CLIENT.HELDITEMCHANGE, () => {
            holdingAotv = allowedID.has(TextHelper.getSkyblockItemID(Player.getHeldItem()))

            feat.update()
        })
    )
    .addSubEvent(
        new Event("renderWorld", () => {
            if (!Player.isSneaking()) return

            const [ status, block ] = EtherwarpHelper.getEtherwarpBlockSuccess(61)
            if (!status) return

            const [ r, g, b, a ] = [
                config().etherwarpOverlayColor[0],
                config().etherwarpOverlayColor[1],
                config().etherwarpOverlayColor[2],
                config().etherwarpOverlayColor[3],
            ]

            RenderHelper.outlineBlock(block, r, g, b, a, true)
            RenderHelper.filledBlock(block, r, g, b, 50, true)
        }),
        () => holdingAotv
    )