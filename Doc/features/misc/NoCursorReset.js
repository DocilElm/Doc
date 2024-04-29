import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"

// Constant variables
const Mouse = org.lwjgl.input.Mouse
const feature = new Feature("NoCursorReset", "Misc", "")

// Changeable variables
let [ mx, my ] = [ 0, 0 ]
let shouldSet = false

// Logic
const onGuiRender = (_, __, gui) => {
    if (!config.noCursorReset || !(gui instanceof net.minecraft.client.gui.inventory.GuiChest)) {
        mx = 0
        my = 0

        return
    }
    if (mx === Mouse.getX() && my === Mouse.getY()) return

    if (shouldSet && mx > 0 && my > 0) {
        shouldSet = false
        Mouse.setCursorPosition(mx, my)
        mx = 0
        my = 0

        return
    }

    mx = Mouse.getX()
    my = Mouse.getY()
}

// Events
new Event(feature, "guiRender", onGuiRender, () => World.isLoaded() && config.noCursorReset)
new Event(feature, "onOpenWindowPacket", () => shouldSet = true, () => World.isLoaded() && config.noCursorReset)
new Event(feature, "clientCloseWindow", () => {
    mx = 0
    my = 0
}, () => World.isLoaded() && config.noCursorReset)

// Starting events
feature.start()