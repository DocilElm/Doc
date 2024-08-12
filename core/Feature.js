import config from "../config"
import Location from "../shared/Location"

export default class Feature {
    /**
     * - Creates a new [Feature] class used to handle events stuff
     * @param {String} name The configName for this feature
     */
    constructor(name, world, area) {
        // Fields needed for this [Feature]
        this.name = name
        this.world = world?.toLowerCase()?.removeFormatting()
        this.area = area?.toLowerCase()?.removeFormatting()

        // Events list
        this.events = []
        this.subevents = []
        this.hasRegistered = false
        this.hasRegisteredSub = false

        // Listeners for this [Feature]
        this.listeners = {
            onRegister: [],
            onUnregister: []
        }

        // Initial config value (true/false)
        this.canRegister = config()[this.name]

        // Events
        config().getConfig().registerListener(this.name, (prev, value) => {
            this.canRegister = value

            if (!this.canRegister) return this._unregister()
            if (this.world && !Location.inWorld(this.world)) return this._unregister()
            if (this.area && !Location.inArea(this.area)) return this._unregister()

            this._register()
        })

        Location.onWorldChange((worldName) => {
            if (!worldName) return this._unregister()
            if (!this.world) return this._register()

            if (worldName !== this.world) return this._unregister()

            this._register()
        })

        Location.onAreaChange((areaName) => {
            if (!this.world || !this.area) return

            if (!areaName?.includes(this.area)) return this._unregister()

            this._register()
        })
    }

    /**
     * - Adds the given [Register] event into the [events] list
     * @param {Register} register 
     * @returns this for method chaining
     */
    addEvent(register) {
        this.events.push(register.unregister())

        return this
    }

    /**
     * - Adds the given [Register] event into the [subevents] list
     * @param {Register} register 
     * @param {Function} fn The function to run whenever attempting to register/unregister this event (must return a `boolean` value)
     * @returns this for method chaining
     */
    addSubEvent(register, fn) {
        this.subevents.push([register.unregister(), fn])

        return this
    }

    /**
     * - Sets the world for this feature to register its events on
     * - Will unregister them if it isn't
     * @param {String} str 
     * @returns this for method chaining
     */
    setWorld(str) {
        this.world = str.toLowerCase()?.removeFormatting()

        return this
    }
    
    /**
     * - Sets the area for this feature to register its events on
     * - Will unregister them if it isn't
     * @param {String} str 
     * @returns this for method chaining
     */
    setArea(str) {
        this.area = str.toLowerCase()?.removeFormatting()

        return this
    }

    /**
     * - Runs the given function only once whenever this [Feature]'s events are registered
     * @param {Function} fn 
     * @returns this for method chaining
     */
    onRegister(fn) {
        this.listeners.onRegister.push(fn)

        return this
    }

    /**
     * - Runs the given function only once whenever this [Feature]'s events are unregistered
     * @param {Function} fn 
     * @returns this for method chaining
     */
    onUnregister(fn) {
        this.listeners.onUnregister.push(fn)

        return this
    }

    update() {
        for (let idx = 0; idx < this.subevents.length; idx++) {
            let [ reg, fn ] = this.subevents[idx]

            if (!fn()) {
                reg.unregister()
                continue
            }

            reg.register()
        }

        return this
    }

    _registerSubEvents() {
        if (this.hasRegisteredSub) return this

        for (let idx = 0; idx < this.subevents.length; idx++) this.subevents?.[idx]?.[0]?.register()
        this.hasRegisteredSub = true

        return this
    }

    _unregisterSubEvents() {
        if (!this.hasRegisteredSub) return this

        for (let idx = 0; idx < this.subevents.length; idx++) this.subevents?.[idx]?.[0]?.unregister()
        this.hasRegisteredSub = false

        return this
    }

    _register() {
        if (this.hasRegistered || !this.canRegister) return this

        for (let idx = 0; idx < this.events.length; idx++) this.events[idx].register()
        for (let idx = 0; idx < this.listeners.onRegister.length; idx++) this.listeners.onRegister?.[idx]?.()
        this.hasRegistered = true

        return this
    }

    _unregister() {
        if (!this.hasRegistered) return this

        for (let idx = 0; idx < this.events.length; idx++) this.events[idx].unregister()
        for (let idx = 0; idx < this.subevents.length; idx++) this.subevents?.[idx]?.[0]?.unregister()
        for (let idx = 0; idx < this.listeners.onUnregister.length; idx++) this.listeners.onUnregister?.[idx]?.()
        this.hasRegistered = false

        return this
    }
}