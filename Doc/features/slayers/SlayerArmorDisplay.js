import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import ScalableGui from "../../shared/Scalable"

// Constant variables
const feature = new Feature("SlayerArmorDisplay", "Slayer", "")
const editGui = new ScalableGui("slayerArmorDisplay").setCommand("editslayerArmorDisplay")
const nextUpgradeRegex = /Next Upgrade\: \+(\d+).? \(([\d,]+)\/([\d,]+)\)/
const pieceBonusRegex = /Piece Bonus\: \+(\d+)/
const slayerArmor = new Map()
const barrier = new Item("minecraft:barrier")

// Default
editGui.onRender(() => {
    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    barrier.draw(0, 0)
    Renderer.drawStringWithShadow(`&b+${Player.getName()} &a0&7/&c1`, 18, 5)
    barrier.draw(0, 18)
    Renderer.drawStringWithShadow(`&b+${Player.getName()} &a0&7/&c1`, 18, 5)
    barrier.draw(0, 18)
    Renderer.drawStringWithShadow(`&b+${Player.getName()} &a0&7/&c1`, 18, 5)
    barrier.draw(0, 18)
    Renderer.drawStringWithShadow(`&b+${Player.getName()} &a0&7/&c1`, 18, 5)
    Renderer.retainTransforms(false)
    Renderer.finishDraw()
})

// Logic
const scanArmor = () => {
    if (!World.isLoaded() || !config.slayerArmorDisplay) return

    const armor = [
        Player.armor.getHelmet(),
        Player.armor.getChestplate(),
        Player.armor.getLeggings(),
        Player.armor.getBoots()
    ]

    armor.forEach((item, idx) => {
        if (!item && slayerArmor.has(idx)) return slayerArmor.delete(idx)
        if (!item) return

        const itemLore = item.getLore().map(it => it.removeFormatting()).join(" ")
        if (!nextUpgradeRegex.test(itemLore)) return slayerArmor.delete(idx)

        const [ _, __, currKills, nextKills ] = itemLore.match(nextUpgradeRegex)
        const bonus = itemLore.match(pieceBonusRegex)?.[1]

        slayerArmor.set(idx, {
            item: item,
            string: `&b+${bonus} &a${currKills}&7/&c${nextKills}`,
            idx: idx
        })
    })
}

const renderOverlay = () => {
    if (!slayerArmor.size || editGui.isOpen() || !config.slayerArmorDisplay) return

    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())

    slayerArmor.forEach(obj => {
        obj.item.draw(0, 10 + ( obj.idx > 0 ? 7 : 0 ))
        Renderer.drawStringWithShadow(obj.string, 18, 5)
    })

    Renderer.retainTransforms(false)
    Renderer.finishDraw()
}

// Events
new Event(feature, "step", scanArmor, () => World.isLoaded() && config.slayerArmorDisplay, 5)
new Event(feature, "renderOverlay", renderOverlay, () => World.isLoaded() && slayerArmor.size && config.slayerArmorDisplay)

// Starting events
feature.start()