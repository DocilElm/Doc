import DungeonsState from "./Dungeons"
import { TextHelper } from "./Text"
import { WorldState } from "./World"

const f7BossNames = new Set(["Maxor", "Storm", "Goldor", "Necron"])

/**
 * - Makes a split with the given [name, json] data
 * @class
 */
export default class SplitsMaker {
    /**
     * @param {ScalableGui} editGui 
     * @param {JSON} json 
     * @param {Function} registerWhen 
     */
    constructor(editGui, json, registerWhen) {
        this.editGui = editGui
        this.json = json
        this.registerWhen = registerWhen
        this.messageSent = new Set()

        this.rendererRegister = register("renderOverlay", () => {
            if (!this.registerWhen() || !this.splits || this.editGui.isOpen()) return

            Renderer.translate(this.editGui.getX(), this.editGui.getY())
            Renderer.scale(this.editGui.getScale())
            Renderer.drawStringWithShadow(this.currentSplits.join("\n"), 0, 0)
            Renderer.finishDraw()
        }).unregister()

        // Make tick register so the timer can actually go
        // down and not be a static time
        this.tickRegister = register("tick", () => {
            if (!this.registerWhen() || !this.splits) return this.rendererRegister.unregister()

            // Reset the values of the current splits
            this.currentSplits = []

            // Makes each value an array so we can use it in the logic
            const valuesIndex = Object.values(this.splits)

            // Loop through all the default splits
            Object.keys(this.splits).forEach((key, index) => {
                // Check wheather this split is null or not
                const splitTime = !this.splits[key]
                    ? Date.now() // If the split is null we use the current time
                    : this.splits[key] // If the split is not null we use its set time
                
                // Check wheather the current index is 0 or not
                const lastTime = index === 0
                    ? this.entryTime // If it is we use the entry time for this split
                    : valuesIndex[index-1] // If it is not we use the last time for this split
                
                // Push the values for this split to the current split array
                this.currentSplits.push(`${key}&f: &6${TextHelper.getSecondsSince(splitTime, lastTime)}`)

                // Check if we've sent this msg or not
                if (!this.messageSent.has(key))
                    this.sendMessage(key, index, splitTime, lastTime) // If not we try to send it
            })

            this.rendererRegister.register()
        }).unregister()

        this.reset()
    }

    /**
     * - Sets this split's boss name/name
     * @param {String} name 
     * @returns this for method chaining
     */
    setName(name) {
        this.name = name

        return this
    }

    /**
     * - Creates default values object of the given split with its json data
     * @returns
     */
    create() {
        this.tickRegister.register()

        // If name is null we use the base entries of the json
        if (!this.name) {
            Object.values(this.json).forEach(splitValue => {
                this.splits[splitValue] = null
            })

            this.objectCreated = true

            return
        }

        // We check if the split name is f7 or not
        // if it is we assign the current floor value to it instead of the boss name
        this.tempName = (WorldState.inDungeons() && f7BossNames.has(this.name))
            ? DungeonsState.getCurrentFloor()
            : this.name
        
        // Create empty entries for the current split
        // using the json values of the set split
        Object.values(this.json[this.tempName]).forEach(splitValue => {
            this.splits[splitValue] = null
        })

        this.objectCreated = true
        
        return
    }

    /**
     * - Sends a chat message whenever the given split is done counting down
     * @param {String} key 
     * @param {Number} index 
     * @param {Date} splitTime 
     * @param {Date} lastTime 
     * @returns 
     */
    sendMessage(key, index, splitTime, lastTime) {
        const keysIndex = Object.keys(this.splits)

        // Check the current split and the new one to see if the countdown has stopped
        if (!this.splits[key] && !this.splits[keysIndex[index+1]]) return

        // Send message if the countdown stopped
        ChatLib.chat(`${TextHelper.PREFIX} ${key}&f: &6${TextHelper.getSecondsSince(splitTime, lastTime)}`)

        // Save this key to the message list so we don't double send it
        this.messageSent.add(key)
    }

    /**
     * - Resets this object's valeus to default and unregisters the events
     */
    reset() {
        this.entryTime = Date.now()
        this.objectCreated = false

        // Holds the default values for this split
        this.splits = {}

        // Holds the actual splits with current values for this split
        this.currentSplits = []

        this.messageSent.clear()

        this.rendererRegister.unregister()
        this.tickRegister.unregister()
    }
}