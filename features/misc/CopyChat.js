import { Event } from "../../core/Event"
import Feature from "../../core/Feature"
import { TextHelper } from "../../shared/TextHelper"

const Mouse = org.lwjgl.input.Mouse

const add = (comp, arr, isBelow) => {
    if (!comp) return
    const str = comp.func_150261_e()?.removeFormatting()
    if (
        isBelow &&
        (!str.startsWith(" ") || str.startsWith(" ☠") || /^ \(\d+\)$/.test(str))
    ) return
    const isCtrlDown = Client.isControlDown()

    const msg = isCtrlDown
        ? comp.func_150261_e()?.replace(/§/g, "&")
        : comp.func_150261_e()?.removeFormatting()?.replace(/§z/g, "")
    if (arr.indexOf(msg) !== -1) return

    arr.push(msg)
}

new Feature("copyChat")
    .addEvent(
        new Event("guiMouseClick", (_, __, mouseButton) => {
            if (!Client.isInChat() || mouseButton !== 1) return

            const y = Mouse.getY()
            const chatGui = Client.getChatGUI()
            const scale = Renderer.screen.getScale()
            const chatWidth = 600 * scale

            let hasNextLine = false

            let normal = []
            let below = []
            let below2 = []

            for (let idx = 0; idx < chatWidth; idx += 10) {
                let comp = chatGui.func_146236_a(idx, y)
                let compbelow = chatGui.func_146236_a(idx, y - (10 * scale))
                // Just in case it's a triple line message
                let compbelow2 = chatGui.func_146236_a(idx, y - (20 * scale))

                add(comp, normal)
                if (idx >= 0 && idx <= 10 && compbelow?.func_150261_e()?.removeFormatting()?.startsWith(" ")) {
                    hasNextLine = true
                }
                if (hasNextLine) {
                    add(compbelow, below, true)
                    add(compbelow2, below2, true)
                }

                if (comp) idx += (Renderer.getStringWidth(comp.func_150261_e()) * scale)
            }

            ChatLib.command(`ct copy ${[...normal, ...below, ...below2].join("")}`, true)
            ChatLib.chat(`${TextHelper.PREFIX} &aCopied message to clipboard`)
        })
    )