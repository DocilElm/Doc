import PriceHelper from "./Price"
import { TextHelper } from "./Text"

// Credits: BloomCore

// Regex
const essenceRegex =       /(Undead|Wither) Essence x(\d+)/
const enchantedBookRegex = /^Enchanted Book \(([\wd ]+)\)$/
const chestPriceRegex =    /^([\d,]+) Coins$/

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

export default class ItemHandler {
    static getCroesusProfit(lore) {
        if (!lore) return
    
        let result = {
            profit: 0,
            items: []
        }

        let chestPrice = 0
        let costLoreIndex = null
        let totalEssence = 0

        lore.forEach((itemLore, index) => {
            if (!itemLore || (costLoreIndex && index >= costLoreIndex)) return

            const unformattedLore = itemLore.removeFormatting()?.replace(/'s/g, "")

            // Check for "Cost" inside of lore and save the index if it exists
            if (/^Cost$/.test(unformattedLore) && !costLoreIndex) {
                costLoreIndex = index
                return
            }

            // Check if the items are the wrong ones
            if (unformattedLore.startsWith("Contents") || unformattedLore.includes("Chest") || totalEssence >= 2) return

            // Create default variables
            let itemID = null
            let amount = 1
            let ultName = null
    
            // Check for enchant book or wither essence and create an ItemID based off of the name
            if (enchantedBookRegex.test(unformattedLore)) {
                const enchantName = unformattedLore.match(enchantedBookRegex)[1]
                const tempName = enchantName.split(" ")
                const match = tempName[tempName.length - 1].match(/([IVXLCDM]+)/)

                // If the book contains roman numeral we decode them
                // so the api knows what to do when getting the price of it
                if (match) {
                    const normalNumber = TextHelper.decodeNumeral(match[1])

                    itemID = `ENCHANTMENT_${enchantName.replace(match[1], normalNumber).replace(/ /g, "_").toUpperCase()}`
                    ultName = enchantName.replace(match[1], normalNumber).replace(/ /g, "_").toUpperCase()

                }
                else {
                    itemID = `ENCHANTMENT_${enchantName.replace(/ /g, "_").toUpperCase()}`
                    ultName = enchantName.replace(/ /g, "_").toUpperCase()
                }
            }
    
            if (essenceRegex.test(unformattedLore)) {
                const [ _, type, amountR ] = unformattedLore.match(essenceRegex)
                itemID = `ESSENCE_${type}`.toUpperCase()
                amount = parseInt(amountR)

                totalEssence++
            }
    
            if (!itemID) itemID = unformattedLore.toUpperCase().replace(/- /, "").replace(/ /g, "_")
            if (itemID in SpecialItemID) itemID = SpecialItemID[itemID]
    
            // Push items lore into the array
            result.items.push(`\n${itemLore}`)

            // Calculate the current item's price
            if (ultName) return result.profit += Math.floor(PriceHelper.getSellPrice(itemID, ultName) * amount)

            result.profit += Math.floor(PriceHelper.getSellPrice(itemID) * amount)

        })

        if (costLoreIndex) {
            chestPrice = parseInt(lore[costLoreIndex+1]?.removeFormatting()?.match(chestPriceRegex)?.[1]?.replace(/,/g, "") ?? 0)

            // Add dungeon chest key price to the chest price in case this is required
            const chestKey = lore[costLoreIndex+2]?.removeFormatting() === "Dungeon Chest Key" ? PriceHelper.getSellPrice("DUNGEON_CHEST_KEY") : 0
            chestPrice += chestKey
        }

        // Calculate total profit
        result.profit = result.profit - chestPrice

        return result
    }

    constructor(item) {
        this.item = item
        this.name = item.getName()
        this.itemID = TextHelper.getSkyblockItemID(item)
        this.itemLore = item.getLore()
        this.amount = 1

        this.getSbID()
    }

    getSbID() {
        const itemName = this.name.removeFormatting()

        if (essenceRegex.test(itemName)) {
            const [ _, type, amount ] = itemName.match(essenceRegex)

            this.itemID = `ESSENCE_${type}`.toUpperCase()
            this.amount = parseInt(amount)
        }

        if (this.itemID.startsWith("ENCHANTMENT")) {
            if (this.itemLore.length < 2) return
            this.name = this.itemLore[1]
        }

        this.getValue()
    }

    getValue(){
        return Math.floor(PriceHelper.getSellPrice(this.itemID) * this.amount)
    }
}