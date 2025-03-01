import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"
import { Persistence } from "../../shared/Persistence"
import { TextHelper } from "../../shared/TextHelper"

const editGui = new DraggableGui("smolderingPolarization").setCommandName("editsmolderingpolarization")

let registerTime = null
let inEffects = false

editGui.onDraw(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(`&aSmoldering Polarization&f: &b59m 59s`, 0, 0)
    Renderer.finishDraw()
})

const formatTime = (time) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)

    if (hours <= 0 && minutes > 0) return `${minutes}m ${seconds}s`
    if (hours <= 0 && minutes <= 0) return `&c${seconds}s`
    return `${hours}hr ${minutes}m ${seconds}s`
}

const feat = new Feature("smolderingPolarizationDisplay")
    .addEvent(
        new Event(/*EventEnums.PACKET.SERVER.CHAT*/ EventEnums.CHAT, () => {
            Persistence.data.smolderingPolarization.time += 3600000
            registerTime = Date.now() + (Persistence.data.smolderingPolarization.time || 1)
            feat.update()
        }, /^You ate a Re\-heated Gummy Polar Bear\!$/)
    )
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.WINDOWOPEN, (name) => {
            inEffects = /^(?:\(\d+\/\d+\) )?Active Effects$/.test(name)
            feat.update()
        })
    )
    .addEvent(
        new Event(EventEnums.PACKET.CUSTOM.WINDOWCLOSE, () => {
            inEffects = false
            feat.update()
        })
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.WINDOWITEMS, (mcItems) => {
            for (let idx = 0; idx < mcItems.length; idx++) {
                if (idx > 53) break
                let mcItem = mcItems[idx]
                if (!mcItem) continue

                let name = mcItem./* getDisplayName */func_82833_r()
                if (name?.removeFormatting() !== "Smoldering Polarization I") continue

                let lore = mcItem./* getTooltip */func_82840_a(Player.getPlayer(), Client.getMinecraft()./* gameSettings */field_71474_y./* advancedItemTooltips */field_82882_x)
                let remainingTime = lore[6]?.removeFormatting()
                if (!remainingTime) continue

                let match = remainingTime.match(/^Remaining\: (\d+\:)?(\d+\:)?(\d+)?$/)
                if (!match) continue

                let [ _, hours, minutes, seconds ] = match
                if (hours && !minutes) {
                    let total = 0
                    let mins = +hours.replace(":", "")

                    total += mins * 60000
                    total += seconds * 1000
                    Persistence.data.smolderingPolarization.time = total
                    registerTime = Date.now() + (Persistence.data.smolderingPolarization.time || 1)
                    ChatLib.chat(`${TextHelper.PREFIX} &cDetected Smoldering Polarization`)
                    break
                }

                let total = 0
                let hrs = +hours.replace(":", "")
                let mins = +minutes.replace(":", "")
                total += hrs * 3600000
                total += mins * 60000
                total += seconds * 1000

                Persistence.data.smolderingPolarization.time = total
                registerTime = Date.now() + (Persistence.data.smolderingPolarization.time || 1)
                ChatLib.chat(`${TextHelper.PREFIX} &cDetected Smoldering Polarization`)
                break
            }

            inEffects = false
            feat.update()
        }),
        () => inEffects
    )
    .addSubEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen()) return

            const msTime = registerTime - Date.now()
            if (msTime < 0) {
                registerTime = null
                Persistence.data.smolderingPolarization.time = 0
                return feat.update()
            }

            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())
            Renderer.drawStringWithShadow(`&aSmoldering Polarization&f: &b${formatTime((msTime) / 1000)}`, 0, 0)
            Renderer.finishDraw()
        }),
        () => registerTime && Persistence.data.smolderingPolarization.time > 0
    )
    .onRegister(() => {
        registerTime = Date.now() + (Persistence.data.smolderingPolarization.time || 1)
        feat.update()
    })
    .onUnregister(() => {
        inEffects = false
        if (!registerTime) return

        const nwTime = registerTime - Date.now()
        Persistence.data.smolderingPolarization.time = nwTime < 0 ? 0 : nwTime

        registerTime = null
    })