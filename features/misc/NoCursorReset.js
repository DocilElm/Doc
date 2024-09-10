import config from "../../config"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { TextHelper } from "../../shared/TextHelper"

// Credits: https://github.com/Skytils/SkytilsMod/blob/1.x/src/main/kotlin/gg/skytils/skytilsmod/mixins/hooks/util/MouseHelperHook.kt

const blacklistedMods = ["skytils", "skyblockaddons"]
const hasBlacklisted = blacklistedMods.some(it => net.minecraftforge.fml.common.Loader.isModLoaded(it))
const Mouse = Java.type("org.lwjgl.input.Mouse")
const GLDisplay = Java.type("org.lwjgl.opengl.Display")

// Saving the original [mouseHelper] to re-set it once the module is unloaded
let originalMouseHelper = Client.getMinecraft().field_71417_B // mouseHelper
let windowClosed = null

if (!hasBlacklisted) {
    // Set the mc instance's [mouseHelper] to a custom made one
    // which will have a check before [ungrabMouseCursor] calls [setCursorPosition]
    Client.getMinecraft().field_71417_B = new JavaAdapter(net.minecraft.util.MouseHelper, {
        // ungrabMouseCursor()
        func_74373_b() {
            // If no cursor reset is set to false
            // we implement the normal behavior
            if (!config().noCursorReset) {
                Mouse.setCursorPosition(GLDisplay.getWidth() / 2, GLDisplay.getHeight() / 2)
                Mouse.setGrabbed(false)

                return
            }

            // Check whether we should re-set the position of the cursor or not
            // by checking if the time between [windowClosed] and [now] (whenever this method is called)
            // is below 100ms
            if (!Client.isInGui() || !windowClosed || (Date.now() - windowClosed) > 100) {
                Mouse.setCursorPosition(GLDisplay.getWidth() / 2, GLDisplay.getHeight() / 2)
                windowClosed = null
            }

            Mouse.setGrabbed(false)
        }
    })
}

config().getConfig().registerListener("noCursorReset", (_, v) => {
    if (!v || !hasBlacklisted) return

    ChatLib.chat(`${TextHelper.PREFIX} &cFeature &7[&6NoCursorReset&7]&c was enabled while having blacklisted mods meaning this feature will not work because you have either &6Skytils &cor &6SkyblockAddons&r`)
})

new Feature("noCursorReset")
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.WINDOWCLOSE, () => {
            windowClosed = Date.now()
        })
    )

register("gameUnload", () => {
    if (hasBlacklisted) return

    // field_71417_B - mouseHelper
    Client.getMinecraft().field_71417_B = originalMouseHelper
    windowClosed = null
})