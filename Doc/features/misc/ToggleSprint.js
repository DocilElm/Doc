import { Keybind } from "../../../KeybindFix"
import config from "../../config"
import { Persistence } from "../../shared/Persistence"
import ScalableGui from "../../shared/Scalable"
import { TextHelper } from "../../shared/Text"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/ToggleSprint.js

const toggleSprintKeybind = new Keybind("§fToggle Sprint", Keyboard.KEY_NONE, "Doc")
const sprintKey = new KeyBind(Client.getMinecraft().field_71474_y.field_151444_V)
const forwardKey = new KeyBind(Client.getMinecraft().field_71474_y.field_74351_w)
const editGui = new ScalableGui("toggleSprintDisplay", config.toggleSprintText ?? "&bToggle Sprint&f: &aEnabled").setCommand("edittoggleSprint")

let hasEnabled = false

// Default render
editGui.onRender(() => {
    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(config.toggleSprintText ?? "&bToggle Sprint&f: &aEnabled", 0, 0)
    Renderer.retainTransforms(false)
    Renderer.finishDraw()
})

toggleSprintKeybind.registerKeyPress(() => {
    Persistence.data.toggleSprint = !Persistence.data.toggleSprint
    Persistence.data.save()

    ChatLib.chat(`${TextHelper.PREFIX} &bToggle Sprint&f: ${Persistence.data.toggleSprint ? "&aEnabled" : "&cDisabled"}`)
})

forwardKey.registerKeyDown(() => {
    if (!Persistence.data.toggleSprint && hasEnabled) {
        sprintKey.setState(false)
        hasEnabled = false
        
        return
    }

    if (!World.isLoaded() || !Persistence.data.toggleSprint) return

    sprintKey.setState(true)
    hasEnabled = true
})

register("renderOverlay", () => {
    if (!World.isLoaded() || editGui.isOpen() || !Persistence.data.toggleSprint || !config.toggleSprintDisplay) return

    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(config.toggleSprintText, 0, 0)
    Renderer.retainTransforms(false)
    Renderer.finishDraw()
})