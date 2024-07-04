import { customTriggers } from "./CustomRegisters"

export class Event {
    constructor(name, cb, args) {
        // Fields needed for this event
        this.name = name
        this.cb = cb
        this.args = args

        // The register itself
        this._register = customTriggers.get(this.name.toLowerCase())?.(this.cb, this.args) ?? register(this.name, this.cb).unregister()

        // Always start unregistered
        this.hasRegistered = false
    }

    /**
     * - Registers this [event]'s trigger
     * @returns this for method chaining
     */
    register() {
        if (this.hasRegistered) return this

        this._register.register()
        this.hasRegistered = true

        return this
    }

    /**
     * - Unregisters this [event]'s trigger
     * @returns this for method chaining
     */
    unregister() {
        if (!this.hasRegistered) return this

        this._register.unregister()
        this.hasRegistered = false

        return this
    }
}