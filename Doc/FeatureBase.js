import config from "./config"
import { checkConfig, getSubArea } from "./utils/Utils"

const events = new Map() // [featureName, settingsObj]
let currentWorld = null
let currentArea = null

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
    events.set(name, {
        featureName: name,
        event: event.unregister(),
        configCategory: category,
        toggled: bool,
        sideEvents: sideEvents.map(reg => reg.unregister()),
        requiredWorld: world,
        requiredArea: area,
        isPogObject: isPogObject,
        isRegistered: false
    })
}

const checkForWorld = (obj) => (!obj.requiredWorld || currentWorld.removeFormatting().includes(obj.requiredWorld))
const checkForArea = (obj) => (!obj.requiredArea || currentArea.removeFormatting().includes(obj.requiredArea))

const registerEvents = (obj) => {
    if(!obj) return events.forEach(settingsObj => {
        settingsObj.event.register()
        settingsObj.sideEvents.forEach(event => event.register())
        settingsObj.isRegistered = true
    })

    obj.event.register()
    obj.sideEvents.forEach(event => event.register())
    obj.isRegistered = true
}

const unregisterEvents = (obj) => {
    if(!obj) return events.forEach(settingsObj => {
        settingsObj.event.unregister()
        settingsObj.sideEvents.forEach(event => event.unregister())
        settingsObj.isRegistered = false
    })

    obj.event.unregister()
    obj.sideEvents.forEach(event => event.unregister())
    obj.isRegistered = false
}

register("step", () => {
    if(!World.isLoaded() || !TabList.getNames()?.some(a => a.includes(Player.getName()))) return unregisterEvents()

    currentWorld = TabList.getNames()?.find(names => names.removeFormatting()?.match(/^Area|Dungeon: ([\w\d ]+)$/))
    currentArea = currentWorld?.includes("Catacombs") ? "Dungeons" : getSubArea(currentWorld)

    events.forEach(settingsObj => {
        const featureName = settingsObj.featureName
        const settingsToggle = settingsObj.isPogObject ? checkConfig(settingsObj.configCategory, featureName) : config[featureName]
        const isRegistered = settingsObj.isRegistered
        const toggledBool = settingsObj.toggled === null ? settingsToggle : settingsObj.toggled

        if(!currentWorld || !currentArea) return unregisterEvents()
        else if(settingsToggle && toggledBool && checkForWorld(settingsObj) && checkForArea(settingsObj) && !isRegistered) return registerEvents(settingsObj)
        else if(!settingsToggle && !toggledBool || isRegistered && (!checkForWorld(settingsObj) || !checkForArea(settingsObj))) return unregisterEvents(settingsObj)
    })
}).setFps(1)

register("gameUnload", () => unregisterEvents())