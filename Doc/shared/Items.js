import PriceHelper from "./Price"
import { TextHelper } from "./Text"

// Credits: BloomCore

// Regex
const essenceRegex =       /(Undead|Wither) Essence x(\d+)/
const enchantedBookRegex = /^Enchanted Book \(([\wd ]+)\)$/
const chestPriceRegex =    /^([\d,]+) Coins$/

export default class ItemHandler {
    static getCroesusProfit(lore) {
        if(!lore) return
    
        let result = {
            profit: 0,
            items: []
        }

        let chestPrice = 0
        let costLoreIndex = null
        let totalEssence = 0

        lore.forEach((itemLore, index) => {
            if (!itemLore || (!!costLoreIndex && index >= costLoreIndex)) return

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
                const enchantName = unformattedLore.match(enchantedBookRegex)[1].toUpperCase().replace(/ /g, "_")
                itemID = `ENCHANTMENT_${enchantName}`
                ultName = enchantName
            }
    
            if (essenceRegex.test(unformattedLore)) {
                const [ _, type, amountR ] = unformattedLore.match(essenceRegex)
                itemID = `ESSENCE_${type}`.toUpperCase()
                amount = parseInt(amountR)

                totalEssence++
            }
    
            if (!itemID) itemID = unformattedLore.toUpperCase().replace(/ /g, "_")
    
            // Push items lore into the array
            result.items.push(`\n${itemLore}`)

            // Calculate the current item's price
            if (ultName) return result.profit += Math.floor(PriceHelper.getSellPrice(itemID, ultName) * amount)

            result.profit += Math.floor(PriceHelper.getSellPrice(itemID) * amount)

        })

        if (!!costLoreIndex) {
            chestPrice = parseInt(lore[costLoreIndex+1]?.removeFormatting()?.match(chestPriceRegex)?.[1]?.replace(/,/g, ""))

            // Add dungeon chest key price to the chest price in case this is required
            const chestKey = lore[costLoreIndex+2]?.removeFormatting() === "Dungeon Chest Key" ? PriceHelper.getSellPrice("DUNGEON_CHEST_KEY") : 0
            chestPrice += chestKey
        }

        // Calculate total profit
        result.profit = result.profit - chestPrice

        return result
    }

    constructor(item){
        this.item = item
        this.name = item.getName()
        this.itemID = TextHelper.getSkyblockItemID(item)
        this.itemLore = item.getLore()
        this.amount = 1

        this.getSbID()
    }

    getSbID(){
        const itemName = this.name.removeFormatting()

        if (essenceRegex.test(itemName)){
            const [ ar, type, amount ] = itemName.match(essenceRegex)

            this.itemID = `ESSENCE_${type}`.toUpperCase()
            this.amount = parseInt(amount)
        }

        if (this.itemID.startsWith("ENCHANTMENT")){
            if (this.itemLore.length < 2) return
            this.name = this.itemLore[1]
        }

        this.getValue()
    }

    getValue(){
        return Math.floor(PriceHelper.getSellPrice(this.itemID) * this.amount)
    }
}