import { Event } from "../../core/Event"
import Feature from "../../core/Feature"
import { TextHelper } from "../../shared/TextHelper"

const Mouse = org.lwjgl.input.Mouse

const getStr = (str, width, chatGui, y) => {
    const scale = Renderer.screen.getScale()
    const isCtrlDown = Client.isControlDown()
    const normalWidth = Renderer.getStringWidth(" ") * Renderer.screen.getScale()
    let count = 0

    for (let idx = 0; idx < width; idx++) {
        let comp = chatGui.func_146236_a(idx, y)
        if (!comp && count > 10) break
        if (!comp) {
            count++
            idx += normalWidth
            continue
        }

        let text = isCtrlDown
            ? comp.func_150261_e()?.replace(/§/g, "&")
            : comp.func_150261_e()?.removeFormatting()?.replace(/§z/g, "")

        str += text
        idx += (Renderer.getStringWidth(comp.func_150261_e()) * scale) - 1
        count = 0
    }

    const ny = y - (10 * scale)
    const compBelow = chatGui.func_146236_a(15, ny)
    if (compBelow) {
        const msg = compBelow.func_150261_e().removeFormatting()
        print(`${msg}\n${/^ \w/.test(msg)}\n`)
        if (/^ \w/.test(msg)) {
            str = getStr(str, width, chatGui, ny)
        }
    }

    return str
}

new Feature("copyChat")
    .addEvent(
        new Event("guiMouseClick", (_, __, mouseButton) => {
            if (!Client.isInChat() || mouseButton !== 1) return

            const y = Mouse.getY()
            const chatGui = Client.getChatGUI()
            const chatWidth = Client.getChatGUI().func_146228_f() * Renderer.screen.getScale()

            let str = getStr("", chatWidth, chatGui, y)

            ChatLib.command(`ct copy ${str}`, true)
            ChatLib.chat(`${TextHelper.PREFIX} &aCopied message to clipboard`)
        })
    )