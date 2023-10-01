import { addEvent } from "../../FeatureBase"
import { PREFIX, data, isInTab } from "../../utils/Utils"
import { decodeNumeral } from "../../../BloomCore/utils/Utils"

const ragAxeDisplay = new Gui()
const cdTime = 20000

let lastCast = null
let checkClass = false
let dupeClassEquation = 0
let notDupeClassEquation = 0
let dupeClass = true
let isMageClass = false

addEvent("ragnarokAxeTimer", "Misc", register("actionBar", () => {
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
        if(ragAxeDisplay.isOpen()) {
            Renderer.translate(data.ragaxecd.x, data.ragaxecd.y)
            Renderer.scale(data.ragaxecd.scale ?? 1)
            Renderer.drawStringWithShadow("Axe Cooldown: 00:00", -10, -5)
            return
        }
        if(!lastCast) return
    
        const timer = isInTab("Catacombs") && isMageClass ? dupeClass ? dupeClassEquation : notDupeClassEquation : cdTime
    
        const timePast = timer-(Date.now()-lastCast)
        const stringToRender = timePast <= 0 ? "&aAxe Cooldown: Ready!" : `&cAxe Cooldown: ${timePast/1000}`
    
        Renderer.translate(data.ragaxecd.x, data.ragaxecd.y)
        Renderer.scale(data.ragaxecd.scale ?? 1)
        Renderer.drawStringWithShadow(stringToRender, -10, -5)
    }),
    
    register("chat", () => {
        ChatLib.chat(`${PREFIX} &cDetected solo Mage buffs`)
        dupeClass = false
    }).setChatCriteria("Your Mage stats are doubled because you are the only player using this class!")    
])

register("worldUnload", () => {
    lastCast = null
    checkClass = false
    dupeClass = true
    isMageClass = false
})

register("command", () => {
    ragAxeDisplay.open()
}).setName("ragnarokAxeDisplay")

register("dragged", (dx, dy, x, y) => {
    if (!ragAxeDisplay.isOpen()) return
    data.ragaxecd.x = x
    data.ragaxecd.y = y
    data.save()
})

register("scrolled", (mx, mr, num) => {
    if (!ragAxeDisplay.isOpen()) return
    if(num == 1) data.ragaxecd.scale += 0.1
    else data.ragaxecd.scale -= 0.1
    data.save()
})