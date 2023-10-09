import config from "./config"
import { checkConfig, getSubArea } from "./utils/Utils"

let events = {}
let eventsRegistered = {}

let currentWorld = null
let currentArea = null

let firstTimeLoading = true

/**
 * 
 * @param {string} name The name in the config.js file to use as the check
 * @param {string} category Config's category (not used yet so you can leave it blank)
 * @param {*} event Main register event
 * @param {boolean} bool Boolean incase a feature needs to be toggled via keybind
 * @param {array} sideEvents An array of side events if it's required
 * @param {string} world Tablist name of the world if it's required if not leave as null
 * @param {string} area Scoreboard sub area name if it's required if not leave as null
 * @param {boolean} isPogObject Used to check if the config is stored inside of a pogobject if true use this as the check
 */
export const addEvent = (name, category, event, bool, sideEvents = [], world = null, area = null, isPogObject = false) => {
    events[name] = {
        event: event.unregister(),
        configCategory: category,
        toggled: bool,
        sideEvents: sideEvents.map(reg => reg.unregister()),
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

    currentArea = currentWorld?.includes("Catacombs") ? "Dungeons" : getSubArea(currentWorld)
    
    registeredEvents.forEach(values => {
        const bool = events[values].isPogObject
            ? checkConfig(events[values].configCategory, values)
            : config[values]

        // yes for more than i hate it
        // this must be a === null statement
        // otherwise it'll take false into account
        const toggledBool = events[values].toggled === null ? bool : events[values].toggled

        if(!currentWorld || !currentArea) return unregisterEvents()
        else if(bool && toggledBool && checkForWorld(values) && checkForArea(values) && !eventsRegistered[values]) return registerEvents(values)
        else if(!bool && !toggledBool || eventsRegistered[values] && !checkForWorld(values) && !checkForArea(values)) return unregisterEvents(values)
    })
}).setFps(1)

register("gameUnload", () => {
    const registeredEvents = Object.keys(events)
    
    registeredEvents.forEach(values => {
        events[values].event.unregister()
        events[values].sideEvents.forEach(events => events.unregister())
    })
})