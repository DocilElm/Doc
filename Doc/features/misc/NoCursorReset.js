import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"

// Constant variables
const Mouse = org.lwjgl.input.Mouse
const feature = new Feature("NoCursorReset", "Misc", "")

// Changeable variables
let [ mx, my ] = [ 0, 0 ]
let openedWindow = null
let ticks = 0

// Logic
const onWindowClosedPacket = () => {
    if (!config.noCursorReset) return

    mx = Mouse.getX()
    my = Mouse.getY()
    openedWindow = Date.now()
}

const onGuiRender = (_, __, gui) => {
    if (!config.noCursorReset || !(gui instanceof net.minecraft.client.gui.inventory.GuiChest)) return

    if (ticks >= 2 && openedWindow) {
        Mouse.setCursorPosition(mx, my)
        openedWindow = null
        mx = 0
        my = 0
        ticks = 0
    }

    if (!openedWindow || (Date.now() - openedWindow) >= 50 || mx === 0 || my === 0) return

    ticks++
}

// Events
new Event(feature, "onWindowClosedPacket", onWindowClosedPacket, () => World.isLoaded() && config.noCursorReset)
new Event(feature, "guiRender", onGuiRender, () => World.isLoaded() && config.noCursorReset)

// Starting events
feature.start()