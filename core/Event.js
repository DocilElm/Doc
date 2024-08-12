import { customTriggers } from "./CustomRegisters"

export class Event {
    constructor(name, cb, args) {
        // Fields needed for this event
        this.name = name
        this.cb = cb
        this.args = args

        // The register itself
        this.isCustom = typeof this.name === "number"
        this._register = this.isCustom
                // Custom triggers are number enums
                ? customTriggers.get(this.name)?.(this.cb, this.args)
                // Normal are just strings
                : register(this.name, this.cb).unregister()

         this.isCustom && Array.isArray(this._register)
            ? this._register.forEach(it => it.unregister())
            : this._register.unregister()

        // Always start unregistered
        this.hasRegistered = false
    }

    /**
     * - Registers this [event]'s trigger
     * @returns this for method chaining
     */
    register() {
        if (this.hasRegistered) return this

        if (this.isCustom && Array.isArray(this._register)) {
            for (let idx = 0; idx < this._register.length; idx++)
                this._register[idx].register()
            this.hasRegistered = true

            return this
        }

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

        if (this.isCustom && Array.isArray(this._register)) {
            for (let idx = 0; idx < this._register.length; idx++)
                this._register[idx].unregister()
            this.hasRegistered = false

            return this
        }

        this._register.unregister()
        this.hasRegistered = false

        return this
    }
}