import { PREFIX, isInTab } from "../../utils/Utils"
import { decodeNumeral } from "../../../BloomCore/utils/Utils"
import ScalableGui from "../../classes/ScalableGui"
import { Feature } from "../../core/Feature"
import { Event } from "../../core/Events"

// Constant variables
const editGui = new ScalableGui("ragaxecd").setCommand("ragnarokAxeDisplay")
const feature = new Feature("ragnarokAxeTimer", "Misc", "")
const cdTime = 20000

// Changeable variables
let lastCast = null
let checkClass = false
let dupeClassEquation = 0
let notDupeClassEquation = 0
let dupeClass = true
let isMageClass = false

// World checks
const checkWorld = () => World.isLoaded()

// Default display
editGui.onRender(() => editGui.renderString("Axe Cooldown: 00:00"))

// Events
new Event(feature, "onActionBarPacket", () => {
    lastCast = Date.now()

    if(!isInTab("Catacombs") || checkClass) return

    TabList.getNames().forEach(name => {
        const unformattedName = name.removeFormatting()

        if(!/^\[[\d]+\] [\w]+ .+ \(Mage ([IVXLCDM]+)\)$/.test(unformattedName)) return

        const [ arr, lvl ] = unformattedName.match(/^\[[\d]+\] [\w]+ .+ \(Mage ([IVXLCDM]+)\)$/)

        const mageNumber = decodeNumeral(lvl)

        notDupeClassEquation = (20000 -(20000 *(((Math.round(mageNumber / 2) * 2) / 100) + .25)))
        dupeClassEquation = (20000 - (20000 * ((Math.round(mageNumber / 2) / 100) + .25)))

        isMageClass = true
    })

    checkClass = true
}, checkWorld, /^.+CASTING IN 3s$/)

new Event(feature, "renderOverlay", () => {
    if(!lastCast) return
    
    const timer = isInTab("Catacombs") && isMageClass ? dupeClass ? dupeClassEquation : notDupeClassEquation : cdTime

    const timePast = timer-(Date.now()-lastCast)
    const stringToRender = timePast <= 0 ? "&aAxe Cooldown: Ready!" : `&cAxe Cooldown: ${timePast/1000}`

    editGui.renderString(stringToRender)
}, checkWorld)

new Event(feature, "onChatPacket", () => {
    ChatLib.chat(`${PREFIX} &cDetected solo Mage buffs`)
    dupeClass = false
}, checkWorld, "Your Mage stats are doubled because you are the only player using this class!")

new Event(feature, "worldUnload", () => {
    lastCast = null
    checkClass = false
    dupeClass = true
    isMageClass = false
}, null)

// Starting events
feature.start()