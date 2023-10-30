import Promise from "../../PromiseV2"
import request from "../../requestV2"
import { Event } from "../core/Events"
import { data } from "../utils/Utils"
import { Persistence } from "./Persistence"

// Heavily inspired by BloomCore
export default new class PriceHelper {
    constructor() {
        this.bazaarSellApi = new Map()
        this.bazaarBuyApi = new Map()
        this.lowestBinApi = new Map()

        // Updating the api data
        this.update()

        new Event(null, "step", () => {
            // Wait every 20mins to update the api data
            if(!!data.apiCheckTime && Date.now()-data.apiCheckTime <= (1000*60)*20) return

            this.update()
        }, null, 1).start()
    }

    /**
     * - Loads the api data from saved files
     * - Into the map variables
     */
    loadApiData() {
        const bzApi = Persistence.getDataFromFile("Bazaar.json")
        const lbApi = Persistence.getDataFromFile("LowestBin.json")

        Object.entries(bzApi).forEach(([key, value]) => {
            this.bazaarBuyApi.set(key, value.buy)
            this.bazaarSellApi.set(key, value.sell)
        })

        Object.entries(lbApi).forEach(([key, value]) => {
            this.lowestBinApi.set(key, value)
        })
    }

    /**
     * - Updates all of the api data and saves it to their files
     */
    update() {
        Promise.all([
            request({url: "https://api.hypixel.net/skyblock/bazaar", headers: { 'User-Agent': ' Mozilla/5.0', 'Content-Type': 'application/json' }, json: true}),
            request({url: "https://moulberry.codes/lowestbin.json", headers: { 'User-Agent': ' Mozilla/5.0', 'Content-Type': 'application/json' }, json: true})
        ]).then(response => {
            if (!response[0].success) return

            // Get required bazaar data so we can easier make a map from it
            const bzPrices = Object.keys(response[0].products).reduce((previousValue, value) => {
                const product = response[0].products[value]

                previousValue[value] = {
                    buy: product.quick_status.buyPrice,
                    sell: product.quick_status.sellPrice
                }

                return previousValue
            }, {})

            Persistence.saveDataToFile("Bazaar.json", bzPrices)
            Persistence.saveDataToFile("LowestBin.json", response[1])

            this.loadApiData()

            data.apiCheckTime = Date.now()
            data.save()
        })
    }

    /**
     * - Gets the bazaar buy price or bin for the given Skyblock ID item
     * @param {String} skyblockID 
     * @returns {Number | null}
     */
    getPrice(skyblockID) {
        if (this.bazaarSellApi.has(skyblockID)) return this.bazaarSellApi.get(skyblockID)

        if (!this.lowestBinApi.has(skyblockID)) return

        return this.lowestBinApi.get(skyblockID)
    }

    /**
     * - Gets the bazaar sell price or lowest bin for the given Skyblock ID item
     * @param {String} skyblockID 
     * @returns {Number | null}
     */
    getSellPrice(skyblockID) {
        if (this.bazaarSellApi.has(skyblockID)) return this.bazaarSellApi.get(skyblockID)

        if (!this.lowestBinApi.has(skyblockID)) return

        return this.lowestBinApi.get(skyblockID)
    }
}