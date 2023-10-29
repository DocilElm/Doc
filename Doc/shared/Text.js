const romanNumerals = {M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1}
const numeralValues = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}

export class TextHelper {
    /**
     * - Matches the given regex with the given string
     * @param {RegExp} regex 
     * @param {String} string 
     * @returns {RegExpMatchArray | null}
     */
    static getRegexMatch(regex, string) {
        return regex.test(string) ? string.match(regex) : null
    }

    // from bloomcore
    /**
    * Decodes a roman numeral into it's respective number. Eg VII -> 7, LII -> 52 etc.
    * Returns null if the numeral is invalid.
    * Supported symbols: I, V, X, L, C, D, M
    * @param {String} numeral 
    * @returns {Number | null}
    */
    static decodeNumeral = (numeral) => {
        if (!numeral.match(/^[IVXLCDM]+$/)) return null
        let sum = 0
        for (let i = 0; i < numeral.length; i++) {
            let curr = numeralValues[numeral[i]]
            let next = i < numeral.length-1 ? numeralValues[numeral[i+1]] : 0
   
            if (curr < next) {
                sum += next - curr
                i++
                continue
            }
            sum += curr
        }
        return sum
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
   static matchesCriteria = (fn, criteria, unformatted, event, formatted) => {
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
  
        for (let key in romanNumerals) {
          while (number >= romanNumerals[key]) {
            result += key;
            number -= romanNumerals[key];
          }
        }
  
        return result
    }

    static dropToRoman(selectedDrop, formattedDrop) {
        if (!/(Rune|Enchanted Book)/.test(selectedDrop)) return selectedDrop

        if(selectedDrop === "Enchanted Book Bundle") return selectedDrop = formattedDrop === "§5§o§6Enchanted Book Bundle" ? "The One Bundle" : "Quantum Bundle"

        const number = selectedDrop.match(/([\d]+)/)?.[1]
        if (!number) return selectedDrop

        return selectedDrop.replace(number, this.convertToRoman(number))
    }
}