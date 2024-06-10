import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import ScalableGui from "../../shared/Scalable"
import { TextHelper } from "../../shared/Text"

// Constant variables
const feature = new Feature("ChampionDisplay", "Misc", "")
const editGui = new ScalableGui("championDisplay", "&bChampion &610&f: &63,000,000").setCommand("editchampiondisplay")
const championLevel = [0, 50000, 100000, 250000, 500000, 1000000, 1500000, 2000000, 2500000, 3000000]
const championLength = championLevel.length - 1

// Changeable variables
let stringToDraw = null

// Functions required by the feature
const getChampionLevel = (amount) => {
    if (!amount) return 0

    let level = 0

    for (let idx = 0; idx < championLevel.length; idx++) {
      let value = championLevel[idx]
      let secondValue = championLevel[idx + 1]

      if (!secondValue) {
        level = championLength + 1

        break
      }

      if (amount <= secondValue - value) {
        level = idx + 1

        break
      }

      else if (amount <= secondValue) {
        level = idx + 2

        break
      }

      continue
    }
    
    return level
}

// Default display
editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&bChampion &610&f: &63,000,000", 0, 0)
    Renderer.finishDraw()
})

// Logic
const createString = () => {
    if (!World.isLoaded() || !Player?.getHeldItem()) return

    const extraattributes = TextHelper.getExtraAttribute(Player.getHeldItem())
    if (!extraattributes) return stringToDraw = ""
    if (!extraattributes?.champion_combat_xp) return stringToDraw = ""

    stringToDraw = `&bChampion &6${getChampionLevel(extraattributes.champion_combat_xp)}&f: &6${TextHelper.addCommasTrunc(extraattributes?.champion_combat_xp ?? 0)}`
}

const drawString = () => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(stringToDraw, 0, 0)
    Renderer.finishDraw()
}

// Events
new Event(feature, "tick", createString, () => World.isLoaded() && config().championxpDisplay)
new Event(feature, "renderOverlay", drawString, () => World.isLoaded() && stringToDraw && !editGui.isOpen() && config().championxpDisplay)

// Starting events
feature.start()