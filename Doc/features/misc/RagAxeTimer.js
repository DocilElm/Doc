import { addEvent } from "../../FeatureBase"
import { PREFIX, data, isInTab } from "../../utils/Utils"
import { decodeNumeral } from "../../../BloomCore/utils/Utils"

let lastCast = null
const ragAxeDisplay = new Gui()
let timer = 0

let [dupeRate, noDupeRate] = 0
let dungeonClass = ''
let stepCheck = true
let dupeClass = true

register("step", () => {
    if(!isInTab("Catacombs" || stepCheck)) return

    TabList.getNames().forEach(name => {
    if(!name || name.includes("!") || !/^\[(\d{1,4})\] ([\d\w_]{1,16}) ?([^\u0000-\u007F]*)? ?([\(\)\w ]+)?(\[[^\u0000-\u007F]*\])?$/.test(name.removeFormatting())) return

    const [ arr, level, username, symbol, dClass ] = name.removeFormatting().match(/^\[(\d{1,4})\] ([\d\w_]{1,16}) ?([^\u0000-\u007F]*)? ?([\(\)\w ]+)?(\[[^\u0000-\u007F]*\])?$/)

    if(username !== Player.getName() || !dClass.includes("Mage")) return
    
    let mageNumeral = `${dClass.replace(/[\(\)]/g, "").replace("Mage ", "")}`
    dungeonClass = dClass.replace(/[\(\)]/g, "").replace(/\bM{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})\b/g, "").trim()

    const mageNumber = decodeNumeral(mageNumeral)
    
    noDupeRate = (20000 -(20000 *(((Math.round(mageNumber / 2) * 2) / 100) + .25)))
    dupeRate = (20000 - (20000 * ((Math.round(mageNumber / 2) / 100) + .25)))

    stepCheck = true

    })
}).setFps(1)

register("chat", () => {
    ChatLib.chat(`${PREFIX} &cDetected solo Mage buffs`)
    dupeClass = false
}).setChatCriteria("Your Mage stats are doubled because you are the only player using this class!")

addEvent("ragnarokAxeTimer", "", register("actionBar", () => {
    lastCast = Date.now()
}).setCriteria("${*}CASTING IN 3s"), null, [
    register("renderOverlay", () => {
    if(ragAxeDisplay.isOpen()) {
        Renderer.translate(data.ragaxecd.x, data.ragaxecd.y)
        Renderer.scale(data.ragaxecd.scale ?? 1)
        Renderer.drawStringWithShadow("Axe Cooldown: 00:00", -10, -5)
        return
    }
    if(!lastCast) return
    if(isInTab("Catacombs") && dungeonClass === "Mage") {
        timer = dupeClass ? dupeRate : noDupeRate
    } else {
        timer = 20000
    }

    const timePast = timer-(Date.now()-lastCast)
    const stringToRender = timePast <= 0 ? "&aAxe Cooldown: Ready!" : `&cAxe Cooldown: ${timePast/1000}`
    
    Renderer.translate(data.ragaxecd.x, data.ragaxecd.y)
    Renderer.scale(data.ragaxecd.scale ?? 1)
    Renderer.drawStringWithShadow(stringToRender, -10, -5)
})], null, null)

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

register("worldUnload", () => {
    stepCheck = true
    dupeClass = true
    lastCast = null
    timer = 0
    dungeonClass = ''
})