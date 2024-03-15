import FeatureHandler from "../../../Atomx/events/FeatureHandler"
import config from "../../config"
import { TextHelper } from "../../shared/Text"

const Mouse = org.lwjgl.input.Mouse

const onMouseClick = (_, __, mouseButton) => {
    // Only right click and chat open
    if (mouseButton !== 1 || !Client.isInChat()) return

    // Using these because ct wrapper adds to it
    // so the mouseX and mouseY are always offset
    const [ mx, my ] = [ Mouse.getX(), Mouse.getY() ]

    const chatGui = Client.getChatGUI()
    const chatComponent = chatGui.func_146236_a(mx, my) // getChatComponent

    // Return if the chat component does not exist
    if (!chatComponent?.func_150261_e()) return
    
    // Get max chat width taking scale into consideration
    const screenScale = new net.minecraft.client.gui.ScaledResolution(Client.getMinecraft()).func_78325_e() // getScaleFactor
    const maxChatWidth = Math.floor(screenScale * (320 - 40) + 320)

    let components = []

    for (let idx = 0; idx < maxChatWidth; idx++) {
        let scannedComponent = chatGui.func_146236_a(idx, my)

        if (!scannedComponent) continue

        // Check whether ctrl is down
        // if it is we copy formatted text
        // if it isn't we remove formatting
        components.push(
            Client.isControlDown()
                ? scannedComponent.func_150261_e()?.replace(/§/g, "&")
                : scannedComponent.func_150261_e()?.removeFormatting()?.replace(/§z/g, "") // Remove sba's rainbow format
                )

        // For some reason nothing was working well until i added this method
        idx += Renderer.getStringWidth(scannedComponent?.func_150265_g()) * 2 // getChatComponentText_TextValue
    }
    
    ChatLib.command(`ct copy ${components.join("")}`, true)
    ChatLib.chat(`${TextHelper.PREFIX} &aCopied chat to clipboard`)
}

new FeatureHandler("CopyChat")
    .AddEvent("guiMouseClick", onMouseClick, {
        registerWhen() {
            return Client.isInChat() && config.copyChat
        }
    })