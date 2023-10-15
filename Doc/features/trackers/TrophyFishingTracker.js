import { addEvent } from "../../FeatureBase"
import { onChatPacket } from "../../classes/Events"
import ScalableGui from "../../classes/ScalableGui"
import { trophyFishColors, trophyTypeColors } from "../../utils/Utils"

const editGui = new ScalableGui("trophyFishingTracker").setCommand("trophyDisplayLocation")
let fishesCaught = {}

addEvent("trophyFishingTracker", "Tracker", onChatPacket((fishName, fishType, event, formatted) => {
    if(!fishesCaught[fishName]) fishesCaught[fishName] = { BRONZE: 0, SILVER: 0, GOLD: 0, DIAMOND: 0 }

    fishesCaught[fishName][fishType]++
}).setCriteria(/^TROPHY FISH\! You caught an? ([\w\d ]+) ([\w]+)\.$/), null, [
    register("renderOverlay", () => {
        if(!World.isLoaded()) return
    
        const strToDraw = []
    
        Object.keys(fishesCaught).forEach(fish => {
            let str = `${trophyFishColors[fish]}${fish}&f: `
            Object.keys(fishesCaught[fish]).forEach(types => {
                str += `${trophyTypeColors[types]}${fishesCaught[fish][types]} `
            })
            strToDraw.push(str)
        })
    
        editGui.renderString(strToDraw.join("\n"))
    })
], "Crimson Isle")

editGui.onRender(() => editGui.renderString(["&9Vanille&f: &80 &70 &60 &b0", "&5Karate Fish&f: &80 &70 &60 &b0"].join("\n")))
register("command", () => fishesCaught = {}).setName("rstrophy")