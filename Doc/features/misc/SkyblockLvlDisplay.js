import AtomxApi from "../../../Atomx/AtomxApi"
import FeatureHandler from "../../../Atomx/events/FeatureHandler"
import config from "../../config"
import ScalableGui from "../../shared/Scalable"

const defaultString = `§r§8[§r§2174§r§8] §r§b49§r§3/§r§b100 XP§r`
const editGui = new ScalableGui("sblevelDisplay", defaultString).setCommand("changeskyblockleveldisplay")
const regexData = AtomxApi.getRegexData()?.ThePlayer

editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(defaultString, 0, 0)
    Renderer.finishDraw()
})

let formattedLevel = null

const handleTabName = (xp, requiredxp, totalxp, _, formatted) => formattedLevel = formatted.replace(/^§r SB Level§r§f\: /, "")

const feature = new FeatureHandler("SkyblocklevelDisplay")
    .AddEvent("tabaddpacket", handleTabName, {
        criteria: regexData.CurrentSbLevel,
        registerWhen() {
            return config.skyblockLevelDisplay
        }
    })
    .AddEvent("tabupdatepacket", handleTabName, {
        criteria: regexData.CurrentSbLevel,
        registerWhen() {
            return config.skyblockLevelDisplay
        }
    })
    .AddEvent("renderOverlay", () => {
        Renderer.translate(editGui.getX(), editGui.getY())
        Renderer.scale(editGui.getScale())
        Renderer.drawStringWithShadow(formattedLevel ?? "", 0, 0)
        Renderer.finishDraw()
    }, {
        registerWhen() {
            return World.isLoaded() && formattedLevel && !editGui.isOpen() && config.skyblockLevelDisplay
        }
    })
    .AddEvent("worldUnload", () => formattedLevel = null, {
        registerWhen() {
            return true
        }
    })
    .AddEvent("gameUnload", () => {
        feature.subEvents.forEach(it => it.unregister())
        feature.unregister()
    }, {
        registerWhen() {
            return true
        }
    })