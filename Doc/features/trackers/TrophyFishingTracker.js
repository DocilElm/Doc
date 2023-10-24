import ScalableGui from "../../classes/ScalableGui"
import { Command, Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { trophyFishColors, trophyTypeColors } from "../../utils/Utils"
import { WorldManager } from "../../utils/World"

// Constant variables
const editGui = new ScalableGui("trophyFishingTracker").setCommand("trophyDisplayLocation")
const feature = new Feature("trophyFishingTracker", "Trackers", "")
const requiredWorld = "Crimson Isle"

// Changeable variables
let fishesCaught = {}

// World checks
const checkWorld = () => WorldManager.getCurrentWorld() === requiredWorld && World.isLoaded()

// Default display
editGui.onRender(() => editGui.renderString(["&9Vanille&f: &80 &70 &60 &b0", "&5Karate Fish&f: &80 &70 &60 &b0"].join("\n")))

// Events
new Event(feature, "onChatPacket", (fishName, fishType, event, formatted) => {
    if(!fishesCaught[fishName]) fishesCaught[fishName] = { BRONZE: 0, SILVER: 0, GOLD: 0, DIAMOND: 0 }

    fishesCaught[fishName][fishType]++
}, checkWorld, /^TROPHY FISH\! You caught an? ([\w\d ]+) ([\w]+)\.$/)

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
}, checkWorld)

new Command(feature, "rstrophy", () => {
    fishesCaught = {}
})

// Starting events
feature.start()