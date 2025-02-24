import { Keybind } from "../../../KeybindFix"
import config from "../../config"
import DraggableGui from "../../shared/DraggableGui"
import { Persistence } from "../../shared/Persistence"
import { TextHelper } from "../../shared/TextHelper"

const toggleSprintKeybind = new Keybind("§fToggle Sprint", Keyboard.KEY_NONE, "Doc")
const sprintKey = new KeyBind(Client.getMinecraft().field_71474_y.field_151444_V)
const forwardKey = new KeyBind(Client.getMinecraft().field_71474_y.field_74351_w)
const editGui = new DraggableGui("toggleSprintDisplay", config().toggleSprintText ?? "&bToggle Sprint&f: &aEnabled").setCommandName("edittoggleSprint")

let hasEnabled = false

editGui.onDraw(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(config().toggleSprintText ?? "&bToggle Sprint&f: &aEnabled", 0, 0)
    Renderer.finishDraw()
})

const renderOverlay = register("renderOverlay", () => {
    if (editGui.isOpen()) return

    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(config().toggleSprintText, 0, 0)
    Renderer.finishDraw()
}).unregister()

toggleSprintKeybind.registerKeyPress(() => {
    Persistence.data.toggleSprint = !Persistence.data.toggleSprint

    if (Persistence.data.toggleSprint && config().toggleSprintDisplay) renderOverlay.register()
    else if (config().toggleSprintDisplay) renderOverlay.unregister()

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