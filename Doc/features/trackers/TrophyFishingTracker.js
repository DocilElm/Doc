import ScalableGui from "../../classes/ScalableGui"
import config from "../../config"
import { Command, Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { WorldState } from "../../shared/World"
import { trophyFishColors, trophyTypeColors } from "../../utils/Utils"

// Constant variables
const editGui = new ScalableGui("trophyFishingTracker").setCommand("trophyDisplayLocation")
const feature = new Feature("trophyFishingTracker", "Trackers", "")
const requiredWorld = "Crimson Isle"

// Changeable variables
let fishesCaught = {}

// Default display
editGui.onRender(() => editGui.renderString(["&9Vanille&f: &80 &70 &60 &b0", "&5Karate Fish&f: &80 &70 &60 &b0"].join("\n")))

// Logic
const registerWhen = () => WorldState.getCurrentWorld() === requiredWorld && config.trophyFishingTracker

// Events
new Event(feature, "chat", (fishName, fishType, event, formatted) => {
    if(!fishesCaught[fishName]) fishesCaught[fishName] = { BRONZE: 0, SILVER: 0, GOLD: 0, DIAMOND: 0 }

    fishesCaught[fishName][fishType]++
}, registerWhen, /^TROPHY FISH\! You caught an? ([\w\d ]+) ([\w]+)\.$/)

new Event(feature, "renderOverlay", () => {
    const strToDraw = []
    
    Object.keys(fishesCaught).forEach(fish => {
        let str = `${trophyFishColors[fish]}${fish}&f: `
        Object.keys(fishesCaught[fish]).forEach(types => {
            str += `${trophyTypeColors[types]}${fishesCaught[fish][types]} `
        })
        strToDraw.push(str)
    })

    editGui.renderString(strToDraw.join("\n"))
}, registerWhen)

new Command(feature, "rstrophy", () => {
    fishesCaught = {}
})

// Starting events
feature.start()