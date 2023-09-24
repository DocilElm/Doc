import config from "./config"
import { checkConfig } from "./utils/Utils"

let events = {}
let eventsRegistered = {}

let currentWorld = null
let currentArea = null

let firstTimeLoading = true

export const addEvent = (name, category, event, bool, sideEvents = [], world, area, isPogObject = false) => {
    events[name] = {
        event: event,
        configCategory: category,
        toggled: bool,
        sideEvents: sideEvents,
        requiredWorld: world,
        requiredArea: area,
        isPogObject: isPogObject
    }
}

const registerEvents = (values) => {
    if(values){
        events[values].event.register()
        events[values].sideEvents.forEach(events => events.register())
        eventsRegistered[values] = true
        return
    }
    Object.keys(events).forEach(values => {
        events[values].event.register()
        events[values].sideEvents.forEach(events => events.register())
        eventsRegistered[values] = true
    })
}

const unregisterEvents = (values) => {
    if(values){
        events[values].event.unregister()
        events[values].sideEvents.forEach(events => events.unregister())
        eventsRegistered[values] = false
        return
    }
    Object.keys(events).forEach(values => {
        events[values].event.unregister()
        events[values].sideEvents.forEach(events => events.unregister())
        eventsRegistered[values] = false
    })
}

const checkForWorld = (values) => (!events[values].requiredWorld || currentWorld.removeFormatting().includes(events[values].requiredWorld))
const checkForArea = (values) => (!events[values].requiredArea || currentArea.removeFormatting().includes(events[values].requiredArea))

register("step", () => {
    if(!World.isLoaded() || !TabList.getNames()?.some(a => a.includes(Player.getName()))) return unregisterEvents()
    if(firstTimeLoading) return unregisterEvents(), firstTimeLoading = false
    
    const registeredEvents = Object.keys(events)

    currentWorld = TabList.getNames()?.find(names => names.removeFormatting()?.match(/^Area|Dungeon: ([\w\d ]+)$/))

    currentArea = currentWorld?.includes("The Rift") 
        ? Scoreboard.getLines()?.find(f => f.getName().removeFormatting().match(/ ф (.+)/))?.getName()?.removeFormatting()?.replace(/[^\u0000-\u007F]/g, "")
        : Scoreboard.getLines()?.find(f => f.getName().removeFormatting().match(/ ⏣ (.+)/))?.getName()?.removeFormatting()?.replace(/[^\u0000-\u007F]/g, "")
    
    registeredEvents.forEach(values => {
        const bool = events[values].isPogObject
            ? checkConfig(events[values].configCategory, values)
            : config[values]
        
        if(!currentWorld || !currentArea) return unregisterEvents()
        else if(bool && events[values].toggled && checkForWorld(values) && checkForArea(values) && !eventsRegistered[values]) return registerEvents(values)
        else if(!bool && !events[values].toggled && !checkForWorld(values) && !checkForArea(values) && eventsRegistered[values]) return unregisterEvents(values)
    })
}).setFps(1)

register("gameUnload", () => {
    const registeredEvents = Object.keys(events)
    
    registeredEvents.forEach(values => {
        events[values].event.unregister()
        events[values].sideEvents.forEach(events => events.unregister())
    })
})