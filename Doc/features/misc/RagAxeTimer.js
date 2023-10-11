import { addEvent } from "../../FeatureBase"
import { PREFIX, isInTab } from "../../utils/Utils"
import { decodeNumeral } from "../../../BloomCore/utils/Utils"
import ScalableGui from "../../classes/ScalableGui"
import { onActionBarPacket, onChatPacket } from "../../classes/Events"

const editGui = new ScalableGui("ragaxecd").setCommand("ragnarokAxeDisplay")
const cdTime = 20000

let lastCast = null
let checkClass = false
let dupeClassEquation = 0
let notDupeClassEquation = 0
let dupeClass = true
let isMageClass = false

addEvent("ragnarokAxeTimer", "Misc", onActionBarPacket(() => {
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
}).setCriteria(/^.+CASTING IN 3s$/), null, [
    register("renderOverlay", () => {
        if(!lastCast) return
    
        const timer = isInTab("Catacombs") && isMageClass ? dupeClass ? dupeClassEquation : notDupeClassEquation : cdTime
    
        const timePast = timer-(Date.now()-lastCast)
        const stringToRender = timePast <= 0 ? "&aAxe Cooldown: Ready!" : `&cAxe Cooldown: ${timePast/1000}`
    
        editGui.renderString(stringToRender)
    }),
    
    onChatPacket(() => {
        ChatLib.chat(`${PREFIX} &cDetected solo Mage buffs`)
        dupeClass = false
    }).setCriteria("Your Mage stats are doubled because you are the only player using this class!")
])

editGui.onRender(() => {
    editGui.renderString("Axe Cooldown: 00:00")
})

register("worldUnload", () => {
    lastCast = null
    checkClass = false
    dupeClass = true
    isMageClass = false
})