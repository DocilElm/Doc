import AtomxApi from "../../../Atomx/AtomxApi"
import FeatureHandler from "../../../Atomx/events/FeatureHandler"
import config from "../../config"
import ScalableGui from "../../shared/Scalable"

const defaultString = `&l&7[Lvl 100] &l&6Ender Dragon &bMAX LEVEL`
const editGui = new ScalableGui("petDisplay", defaultString).setCommand("changepetdisplaylocation")
const regexData = AtomxApi.getRegexData()?.ThePlayer

editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(defaultString, 0, 0)
    Renderer.finishDraw()
})

let petName = null
let petLevel = null

const handleTabName = (tabName, _, formatted) => {
    if (tabName === " MAX LEVEL") return petLevel = "&l&bMAX LEVEL"

    const match0 = tabName.match(regexData.CurrentPet)
    const match1 = tabName.match(regexData.CurrentPetXp)

    if (match0) return petName = formatted
    if (!match1) return

    petLevel = formatted
}

new FeatureHandler("PetDisplay")
    .AddEvent("tabaddpacket", handleTabName, {
        registerWhen() {
            return config.petDisplay
        }
    })
    .AddEvent("tabupdatepacket", handleTabName, {
        registerWhen() {
            return config.petDisplay
        }
    })
    .AddEvent("renderOverlay", () => {
        Renderer.translate(editGui.getX(), editGui.getY())
        Renderer.scale(editGui.getScale())
        Renderer.drawStringWithShadow(`${petName} ${petLevel}`, 0, 0)
        Renderer.finishDraw()
    }, {
        registerWhen() {
            return World.isLoaded() && petName && !editGui.isOpen() && config.petDisplay
        }
    })
    .AddEvent("worldUnload", () => {
        petName = null
        petLevel = null
    }, {
        registerWhen() {
            return true // should always be enabled
        }
    })