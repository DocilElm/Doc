import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { TextHelper } from "../../shared/Text"

// Credits: https://github.com/EragonTheGuy/NetherFishingUtils/blob/testing/NetherFishingUtils/index.js

// Constant variables
const feature = new Feature("bossBarFishing", "Fishing", "")
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
const seaCreaturesRegex = /^\[Lv[\d]+\] ([\w ]+) ([\d\w.,]+)\/([\d\w.,]+)❤$/

// Changeable variables
let renderEntities = []

// Logic
const registerWhen = () => World.isLoaded() && config().bossBarFishing

const checkEntities = () => {
    // Filter out the entities that dont match the regex
    const entities = World.getAllEntitiesOfType(net.minecraft.entity.item.EntityArmorStand).filter(entity => {
        if (
            !seaCreaturesRegex.test(entity.getName()?.removeFormatting()) ||
            !bossBarEntities.some(name => entity.getName().removeFormatting().includes(name))
        ) return false

        return true
    })

    // Scan for entities and return an array with their values
    renderEntities = entities.map(entity => {
        const [ _, __, scHp, scMaxHp ] = entity.getName().removeFormatting().match(seaCreaturesRegex)

        return [ entity.getName(), TextHelper.convertToNumber(scHp), TextHelper.convertToNumber(scMaxHp) ]
    })
}

const renderBossBar = () => {
    if (!registerWhen() || !renderEntities) return

    const screenWidth = Renderer.screen.getWidth()
    const boxWidth = screenWidth / 4
    const baseYPos = 35

    renderEntities.forEach((entity, index) => {
        if (!entity) return

        const name = entity[0]
        const hp = entity[1]
        const maxHp = entity[2]

        const width = boxWidth * 1.5 + boxWidth * 2.5
        const height = baseYPos + (30 * index)

        // Make a base boss bar line
        Renderer.drawLine(
            Renderer.color(0, 0, 0, 80),
            boxWidth * 1.5,
            height,
            boxWidth * 2.5,
            height,
            10
        )

        // Add the current mob's name on top of it
        Renderer.drawStringWithShadow(
            name,
            (width / 2) - (Renderer.getStringWidth(name) / 2),
            height - 15
            )

        // Make a green bar with [current hp / max hp values]
        Renderer.drawLine(
            Renderer.color(0, 190, 0, 150),
            boxWidth * 1.5 + 1,
            height,
            boxWidth * 1.5 + (boxWidth - 1) * (hp / maxHp),
            height,
            8
        )

        // Make the [hp/maxhp] string to dispaly
        const hpString = `&f${hp}/${maxHp}`

        // Rendering the string in the center of the bar
        Renderer.drawStringWithShadow(
            hpString,
            (width / 2) - (Renderer.getStringWidth(hpString) / 2),
            height - 4
        )

        Renderer.finishDraw()
    })
}

// Events
new Event(feature, "step", checkEntities, registerWhen, 3)
new Event(feature, "renderOverlay", renderBossBar, () => registerWhen() && renderEntities)

// Starting events
feature.start()