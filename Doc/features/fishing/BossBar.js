import { addEvent } from "../../FeatureBase"
import { EntityArmorStand } from "../../utils/Utils"

// Credits: https://github.com/EragonTheGuy/NetherFishingUtils/blob/testing/NetherFishingUtils/index.js

const bossBarEntities = [
    "Carrot King",
    "Thunder",
    "Lord Jawbus",
    "Yeti",
    "Great White Shark",
    "Phantom Fisher",
    "Grim Reaper",
    "Sea Emperor"
]

let renderBossBar = false
let currentEntityHp = 0
let currentEntityMaxHp = 0
let currentEntityName = null

addEvent("bossBarFishing", "Fishing", register("step", () => {
    if(!World.isLoaded()) return
    renderBossBar = false

    World.getAllEntitiesOfType(EntityArmorStand).forEach(entity => {
        const entityName = entity.getName()?.removeFormatting()

        if(!/^\[Lv[\d]+\] ([\w ]+) ([\d\w.]+)\/([\d\w.]+)❤$/.test(entityName) || !bossBarEntities.some(listName => entityName?.includes(listName))) return

        // https://regex101.com/r/DLqaZC/1

        const [ match, scName, scHp, scMaxHp ] = entityName?.match(/^\[Lv[\d]+\] ([\w ]+) ([\d\w.]+)\/([\d\w.]+)❤$/)
        if(!match) return

        // If Hp/maxHp includes k * 1000
        // else nest ternary and check for M inside of Hp/maxHp
        // if this is not the case just parseFloat the current hp
        currentEntityHp = scHp.includes("k") ? parseFloat(scHp) * 1000 : scHp.includes("M") ? parseFloat(scHp) * 1000000 : parseFloat(scHp)
        currentEntityMaxHp = scMaxHp.includes("k") ? parseFloat(scMaxHp) * 1000 : scMaxHp.includes("M") ? parseFloat(scMaxHp) * 1000000 : parseFloat(scMaxHp)
        currentEntityName = scName
        // If boss in range we render it
        renderBossBar = true
    })
}).setFps(3), null, [
    register('renderOverlay', () => {
	    if(!World.isLoaded() || !renderBossBar || !currentEntityName) return
        
	    let widthpre = Renderer.screen.getWidth()
	    let width = widthpre / 4
	    let y = 35
        
	    Renderer.drawLine(Renderer.BLACK, width * 1.5, y, width * 2.5, y, 10)
	    Renderer.drawLine(Renderer.GRAY, width * 1.5 + 1, y, width * 2.5 - 1, y, 10 - 2)
        
	    Renderer.drawStringWithShadow(currentEntityName, widthpre / 2 - Renderer.getStringWidth(currentEntityName) / 2 - 5, y - 14)
        
        
	    rightx = width * 1.5 + (width - 1) * currentEntityHp / currentEntityMaxHp
        
	    if (rightx > width * 1.5) Renderer.drawLine(Renderer.GREEN, width * 1.5 + 1, y, rightx, y, 10 - 2)
        
	    const displaylifestring = `&0${currentEntityHp}/${currentEntityMaxHp}`
        
	    Renderer.finishDraw()
	    Renderer.scale(0.85)
	    Renderer.drawString(`${displaylifestring}`, (widthpre / 2 - Renderer.getStringWidth(displaylifestring) / 2) / 0.85, y + 3)
    })
])

register("worldUnload", () => {
    currentEntityHp = 0
    currentEntityMaxHp = 0
    renderBossBar = false
})