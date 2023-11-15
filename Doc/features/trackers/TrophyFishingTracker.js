import config from "../../config"
import { Command, Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"
import ScalableGui from "../../shared/Scalable"
import { WorldState } from "../../shared/World"

// Constant variables
const editGui = new ScalableGui("trophyFishingTracker").setCommand("trophyDisplayLocation")
const feature = new Feature("trophyFishingTracker", "Trackers", "")
const trophyTypeColors = {
    BRONZE: "&8",
    SILVER: "&7",
    GOLD: "&6",
    DIAMOND: "&b"
}
const requiredWorld = "Crimson Isle"

// Changeable variables
let fishesCaught = {}
let stringToDraw = null

// Default display
editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(["&9Vanille&f: &80 &70 &60 &b0", "&5Karate Fish&f: &80 &70 &60 &b0"].join("\n"), 0, 0)
    Renderer.finishDraw()
})

// Logic
const registerWhen = () => WorldState.getCurrentWorld() === requiredWorld && config.trophyFishingTracker

const handleChat = (fishName, fishType, event, formatted) => {
    if(!fishesCaught[fishName]) fishesCaught[fishName] = { BRONZE: 0, SILVER: 0, GOLD: 0, DIAMOND: 0 }

    fishesCaught[fishName][fishType]++
}

const makeStringToDraw = () => {
    let tempArray = []
    
    Object.keys(fishesCaught).forEach(fish => {
        let tempString = `${Persistence.trophyFishColors[fish]}${fish}&f: `
        Object.keys(fishesCaught[fish]).forEach(types => {
            tempString += `${trophyTypeColors[types]}${fishesCaught[fish][types]} `
        })
        tempArray.push(tempString)
    })

    stringToDraw = tempArray.join("\n")
    tempArray = null
}

const renderTrophy = () => {
    if (!stringToDraw || editGui.isOpen()) return
    
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(stringToDraw, 0, 0)
    Renderer.finishDraw()
}

// Events
new Event(feature, "chat", handleChat, registerWhen, /^TROPHY FISH\! You caught an? ([\w\d ]+) ([\w]+)\.$/)
new Event(feature, "tick", makeStringToDraw, registerWhen)
new Event(feature, "renderOverlay", renderTrophy, () => WorldState.getCurrentWorld() === requiredWorld && config.trophyFishingTracker && stringToDraw)

new Command(feature, "rstrophy", () => {
    fishesCaught = {}
})

// Starting events
feature.start()