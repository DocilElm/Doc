const romanNumerals = {"M": 1000, "CM": 900, "D": 500, "CD": 400, "C": 100, "XC": 90, "L": 50, "XL": 40, "X": 10, "IX": 9, "V": 5, "IV": 4, "I": 1}

const MCItemStack = net.minecraft.item.ItemStack

export class TextHelper {
    static PREFIX = "&0[&4Doc&0]&r"

    /**
     * - Matches the given regex with the given string
     * @param {RegExp} regex 
     * @param {String} string 
     * @returns {RegExpMatchArray | null}
     */
    static getRegexMatch(regex, string) {
        return regex.test(string) ? string.match(regex) : null
    }

    // This function was inspired from BloomCore
    /**
    * Decodes a roman numeral into it's respective number. Eg VII -> 7, LII -> 52 etc.
    * Returns null if the numeral is invalid.
    * Supported symbols: I, V, X, L, C, D, M
    * @param {String} numeral 
    * @returns {Number | null}
    */
    static decodeNumeral(numeral) {
        if (!numeral.match(/^[IVXLCDM]+$/)) return null
        
        let number = 0
        
        for (let index = 0; index < numeral.length; index++) {
            // Get the current symbol
            let currentSymbolValue = romanNumerals[numeral[index]]
            // If it is possible, get the next one
            let nextSymbolValue = (index + 1 < numeral.length) ? romanNumerals[numeral[index + 1]] : 0
   
            // Check if the current one is smaller than the next,
            // if so it falls under the special rules of roman numerals
            if (currentSymbolValue < nextSymbolValue) {
                number += nextSymbolValue - currentSymbolValue
                // Skip the next numeral
                index++
            } else {
                // Otherwise just add the number
                number += currentSymbolValue
            }
            
        }

        return number
   }

   /**
    * - Check if the criteria is a regex or a string
    * - Regex is way more intensive so only use that if needed
    * @param {Function} fn Callback function
    * @param {String | RegExp} criteria The criteria to match with
    * @param {String} unformatted The current unformatted text
    * @param {Event} event The current packet event
    * @param {String} formatted The current formatted text
    * @returns returns the callback fn with the given matches or the current msg if the criteria is null
    */
   static matchesCriteria(fn, criteria, unformatted, event, formatted) {
        if (!criteria) return fn(unformatted, event, formatted)
        
        else if (typeof(criteria) === "string") {
            if (unformatted !== criteria) return

            return fn(unformatted, event, formatted)
        }

        else if (criteria instanceof RegExp) {
            const match = unformatted.match(criteria)
            if (!match) return

            return fn(...match.slice(1), event, formatted)
        }
    }

    static convertToRoman(number) {
        if (!number) return number

        let result = ""
  
        // Loop over the romanNumerals
        for ([roman, value] of romanNumerals) {
            // If the number is greater than the value of the current roman numeral
            // it means that part of it can be replaced by the current roman numeral
            while (number >= value) {
                // Add the numeral to the result
                result += roman 
                // Remove that value from the number
                number -= value
            }
        }
  
        return result
    }

    static dropToRoman(selectedDrop, formattedDrop) {
        if (!/(Rune|Enchanted Book)/.test(selectedDrop)) return selectedDrop

        if (selectedDrop === "Enchanted Book Bundle") return selectedDrop = formattedDrop === "§5§o§6Enchanted Book Bundle" ? "The One Bundle" : "Quantum Bundle"

        const number = selectedDrop.match(/([\d]+)/)?.[1]
        if (!number) return selectedDrop

        return selectedDrop.replace(number, this.convertToRoman(number))
    }

    static addCommas(number) {
        return number?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ',') ?? number
    }

    static addCommasTrunc(number) {
        return this.addCommas(Math.trunc((Math.round(number * 100) / 100)))
    }

    /**
     * - Gets the extra attributes of the Item
     * @param {Item} item 
     * @returns {Object}
     */
    static getExtraAttribute(item) {
        return item?.getNBT()?.toObject()?.tag?.ExtraAttributes
    }

    // From BloomCore
    /**
     * - Gets the Skyblock item ID of the given MCItem or CT Item
     * @param {Item | MCItemStack} item 
     */
    static getSkyblockItemID(item) {
        if (item instanceof MCItemStack) item = new Item(item)
        if (!(item instanceof Item)) return

        const extraAttributes = item.getNBT()?.getCompoundTag("tag")?.getCompoundTag("ExtraAttributes")
        const itemID = extraAttributes?.getString("id")

        if (itemID !== "ENCHANTED_BOOK") return itemID
        
        // Enchanted books are a pain in the ass
        const enchantments = extraAttributes.getCompoundTag("enchantments")
        const enchants = [...enchantments.getKeySet()]

        if (!enchants.length) return

        const enchantment = enchants[0]
        const level = enchantments.getInteger(enchants[0])

        return `ENCHANTMENT_${enchantment.toUpperCase()}_${level}`
    }
}