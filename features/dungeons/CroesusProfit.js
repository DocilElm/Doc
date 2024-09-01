import Price from "../../../Atomx/skyblock/Price"
import config from "../../config"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"
import { TextHelper } from "../../shared/TextHelper"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/features/dungeonChestProfit/DungeonChestProfit.js

const editGui = new DraggableGui("croesusProfit").setCommandName("editcroesusProfit")
const defaultObj = [{"name":"§o§fWood Chest§r","profit":88044.64846536363,"items":["\n§5§o§aEnchanted Book (Rejuvenate I§a)","\n§5§o§dWither Essence §8x19","\n§5§o§dUndead Essence §8x19"],"opened":true},{"name":"§o§6Gold Chest§r","profit":17072.572037910286,"items":["\n§5§o§aEnchanted Book (§d§lWisdom I§a)","\n§5§o§aEnchanted Book (Rejuvenate I§a)","\n§5§o§dWither Essence §8x19","\n§5§o§dUndead Essence §8x16"],"opened":false},{"name":"§o§bDiamond Chest§r","profit":-171773.64709388334,"items":["\n§5§o§aEnchanted Book (Infinite Quiver VI§a)","\n§5§o§aEnchanted Book (Rejuvenate I§a)","\n§5§o§aEnchanted Book (§d§lUltimate Wise I§a)","\n§5§o§dWither Essence §8x18","\n§5§o§dUndead Essence §8x30"],"opened":false},{"name":"§o§2Emerald Chest§r","profit":-453951.7728089731,"items":["\n§5§o§5Hot Potato Book","\n§5§o§aEnchanted Book (§d§lCombo I§a)","\n§5§o§dWither Essence §8x24","\n§5§o§dUndead Essence §8x35"],"opened":false},{"name":"§o§5Obsidian Chest§r","profit":-807824.8239397707,"items":["\n§5§o§aEnchanted Book (§d§lBank II§a)","\n§5§o§aEnchanted Book (§d§lUltimate Jerry II§a)","\n§5§o§aEnchanted Book (§d§lLast Stand I§a)","\n§5§o§dWither Essence §8x36","\n§5§o§dUndead Essence §8x52"],"opened":false},{"name":"§o§8Bedrock Chest§r","profit":-916028.9558925,"items":["\n§5§o§aEnchanted Book (§d§lLast Stand II§a)","\n§5§o§aEnchanted Book (§d§lSwarm I§a)","\n§5§o§aEnchanted Book (§d§lWisdom II§a)","\n§5§o§dWither Essence §8x46","\n§5§o§dUndead Essence §8x57"],"opened":false}]
const croesusRegex = /^(?:Master Mode )?The Catacombs - ([FloorVI\d ]*)$/
const essenceRegex = /^(Undead|Wither) Essence x(\d+)$/
const enchantedBookRegex = /^Enchanted Book \(([\wd ]+)\)$/
const SpecialItemID = {
    "ADAPTIVE_BLADE": "STONE_BLADE",
    "SPIRIT_SHORTBOW": "ITEM_SPIRIT_BOW",
    "SPIRIT_BOOTS": "THORNS_BOOTS",
    "WITHER_CLOAK_SWORD": "WITHER_CLOAK",
    "DUNGEON_DISC": "DUNGEON_DISC_1",
    "OLD_DISC": "DUNGEON_DISC_4",
    "NECRON_DISC": "DUNGEON_DISC_5",
    "CLOWN_DISC": "DUNGEON_DISC_2",
    "WATCHER_DISC": "DUNGEON_DISC_3"
}

let inCroesus = false
let shouldScan = false
let chestData = []

const getProfit = (lore) => {
    if (!lore) return

    let result = {
        name: lore[0],
        profit: 0,
        items: [],
        opened: false
    }

    let chestPrice = 0

    for (let idx = 2; idx < lore.length; idx++) {
        let unformatted = lore[idx]?.removeFormatting()?.replace(/'s/g, "")
        if (!unformatted) continue

        // If the chest is opened set the flag to be true
        if (/^Already opened!$/.test(unformatted)) {
            result.opened = true
            result.profit = -Infinity
            break
        }

        // Find the cost of the chest
        if (/^Cost$/.test(unformatted)) {
            chestPrice = Math.floor(lore[idx + 1].removeFormatting()?.replace(/([,]+| Coins)/g, ""))

            let keyPrice = lore[idx + 2]?.removeFormatting() === "Dungeon Chest Key"
                ? Price.getSellPrice("DUNGEON_CHEST_KEY")
                : 0

            chestPrice += keyPrice

            break
        }

        if (enchantedBookRegex.test(unformatted)) {
            let enchantName = unformatted.match(enchantedBookRegex)[1]
            let match = enchantName.match(/([IVXLCDM]+)$/)
            result.items.push(`\n${lore[idx]}`)

            if (match) {
                let normalNumber = TextHelper.decodeNumeral(match[1])

                result.profit += Price.getSellPrice(
                    `ENCHANTMENT_${enchantName.replace(match[1], normalNumber).replace(/ /g, "_").toUpperCase()}`,
                    enchantName.replace(match[1], normalNumber).replace(/ /g, "_").toUpperCase()
                )

                continue
            }

            result.profit += Price.getSellPrice(
                `ENCHANTMENT_${enchantName.replace(/ /g, "_").toUpperCase()}`,
                enchantName.replace(/ /g, "_").toUpperCase()
            )

            continue
        }

        if (essenceRegex.test(unformatted)) {
            let [ _, type, amount ] = unformatted.match(essenceRegex)

            result.profit += Price.getSellPrice(`ESSENCE_${type}`.toUpperCase()) * Math.floor(amount)
            result.items.push(`\n${lore[idx]}`)

            continue
        }

        let itemID = unformatted.toUpperCase().replace(/- /, "").replace(/ /g, "_")
        if (itemID in SpecialItemID) itemID = SpecialItemID[itemID]

        result.items.push(`\n${lore[idx]}`)
        result.profit += Price.getSellPrice(itemID)
    }

    result.profit = result.profit - (chestPrice || 0)

    return result
}

// Default display
editGui.onDraw(() => {
    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())

    let str = ""

    for (let idx = 0; idx < defaultObj.length; idx++) {
        let data = defaultObj[idx]
        let profitColor = data.profit < 0 ? "&c" : "&a"
        let opened = data.opened ? "&aOpened" : `${profitColor}${TextHelper.addCommasTrunc(data.profit)}`

        if (config().croesusProfitMode === 1) {
            str += `${data.name}\n&bTotal Profit&f: ${opened}\n\n`
            continue
        }

        str += `${data.name}${data.items}\n&bTotal Profit&f: ${opened}\n\n`
    }

    Renderer.drawStringWithShadow(str, 0, 10)
    Renderer.retainTransforms(false)
    Renderer.finishDraw()
})

const feat = new Feature("croesusProfitDisplay", "dungeon hub")
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.WINDOWOPEN, (title) => {
            inCroesus = croesusRegex.test(title)
            shouldScan = inCroesus
            if (!inCroesus && chestData.length) chestData = []

            feat.update()
        })
    )
    .addEvent(
        new Event(EventEnums.PACKET.CUSTOM.WINDOWCLOSE, () => {
            inCroesus = false
            shouldScan = false
            chestData = []
            feat.update()
        })
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.WINDOWITEMS, (items) => {
            for (let idx = 9; idx < 17; idx++) {
                let item = new Item(items[idx])
                if (item.getID() === 160) continue

                chestData.push(getProfit(item.getLore()))
            }

            if (config().croesusProfitSort) {
                chestData = chestData.sort((a, b) => b.profit - a.profit)
            }

            shouldScan = false
            feat.update()
        }),
        () => shouldScan
    )
    .addSubEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen()) return

            Renderer.retainTransforms(true)
            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())

            let str = ""

            for (let idx = 0; idx < chestData.length; idx++) {
                let data = chestData[idx]
                let profitColor = data.profit < 0 ? "&c" : "&a"
                let opened = data.opened ? "&aOpened" : `${profitColor}${TextHelper.addCommasTrunc(data.profit)}`

                if (config().croesusProfitMode === 1) {
                    str += `${data.name}\n&bTotal Profit&f: ${opened}\n\n`
                    continue
                }

                str += `${data.name}${data.items}\n&bTotal Profit&f: ${opened}\n\n`
            }

            Renderer.drawStringWithShadow(str, 0, 10)

            Renderer.retainTransforms(false)
            Renderer.finishDraw()
        }),
        () => chestData.length
    )
    .onUnregister(() => {
        inCroesus = false
        shouldScan = false
        chestData = []
    })