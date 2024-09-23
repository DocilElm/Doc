import config from "../config"
import Location from "../shared/Location"

export default class Feature {
    /**
     * - Class that handles event based utilities
     * - For example waiting for the proper world to be loaded in order
     * - to register the event/subevents
     * @param {string} name The feature name (config name) for this Feature
     * @param {?string|string[]} world The required world for this Feature (if left empty it will not check)
     * @param {?string|string[]} area The required area for this Feature (if left empty it will not check)
     */
    constructor(name, world = null, area = null) {
        // Main class fields
        this.featureName = name
        this.isWorldArray = Array.isArray(world)
        this.isAreaArray = Array.isArray(area)

        // Required world/area stuff
        this.world = this.isWorldArray
            ? world.map(it => it.toLowerCase().removeFormatting())
            : world?.toLocaleLowerCase()?.removeFormatting()
        this.area = this.isAreaArray
            ? area.map(it => it.toLowerCase().removeFormatting())
            : area?.toLocaleLowerCase()?.removeFormatting()

        // Initial config value
        this.configValue = config()[this.featureName]

        // Events stuff
        this.events = []
        this.subevents = []
        this.hasRegistered = false

        // Listeners
        this._onRegister = []
        this._onUnregister = []

        // Initialize events
        this._init()
    }

    /**
     * - Internal use.
     * - Initializes the listeners required for this Feature
     */
    _init() {
        config().getConfig().registerListener(this.featureName, (_, val) => {
            this.configValue = val

            if (!this.configValue) return this._unregister()
            if (!this._checkWorld(Location.area) || !this._checkArea(Location.subarea)) return this._unregister()

            this._register()
        })

        Location
            .onWorldChange((worldName) => {
                if (!this._checkWorld(worldName)) return this._unregister()
                if (this.area && !this._checkArea(Location.subarea)) return this._unregister()

                this._register()
            })
            .onAreaChange((areaName) => {
                if (!this._checkArea(areaName)) return this._unregister()
                if (this.world && !this._checkWorld(Location.area)) return this._unregister()

                this._register()
            })
    }

    /**
     * - Checks whether the given [worldName] matches with this Feature's
     * - required world.
     * - NOTE: if there's no world it will always return `true`
     * @param {string} worldName
     * @returns {boolean}
     */
    _checkWorld(worldName) {
        if (!worldName) return false
        if (!this.world) return true

        if (this.isWorldArray) return this.world.some(it => it === worldName)

        return worldName === this.world
    }

    /**
     * - Checks whether the given [areaName] matches with this Feature's
     * - required area.
     * - NOTE: if there's no area it will always return `true`
     * @param {string} areaName
     * @returns {boolean}
     */
    _checkArea(areaName) {
        if (!areaName) return false
        if (!this.area) return true

        if (this.isAreaArray) return this.area.some(it => areaName.includes(it))

        return areaName.includes(this.area)
    }

    /**
     * - Internal use.
     * - Unregisters all of the events and subevents for this Feature
     * - Only unregisters if the events have been registered before-hand
     * @returns this for method chaining
     */
    _unregister() {
        if (!this.hasRegistered) return this

        for (let reg of this.events) reg.unregister()
        for (let reg of this.subevents) reg[0].unregister()
        for (let listener of this._onUnregister) listener?.()

        this.hasRegistered = false

        return this
    }

    /**
     * - Internal use.
     * - Registers all of the events and triggers the listener for this Feature
     * - Only registers the events if it should and if they haven't been registered before-hand
     * @returns this for method chaining
     */
    _register() {
        if (this.hasRegistered || !this.configValue) return this

        for (let reg of this.events) reg.register()
        for (let listener of this._onRegister) listener?.()

        this.hasRegistered = true

        return this
    }

    /**
     * - Adds a [Event] to this Feature
     * @param {import("./Event").Event} register
     * @returns this for method chaining
     */
    addEvent(register) {
        this.events.push(register.unregister())

        return this
    }

    /**
     * - Adds a [SubEvent] to this Feature
     * @param {import("./Event").Event} register
     * @param {() => boolean} fn The function that will be ran whenever this subevent gets updated
     * @returns this for method chaining
     */
    addSubEvent(register, fn) {
        this.subevents.push([register.unregister(), fn])

        return this
    }

    /**
     * - Calls the given function whenever this Feature's events have been registered
     * @param {() => void} fn
     * @returns this for method chaining
     */
    onRegister(fn) {
        this._onRegister.push(fn)

        return this
    }

    /**
     * - Calls the given function whenever this Feature's events have been unregistered
     * @param {() => void} fn
     * @returns this for method chaining
     */
    onUnregister(fn) {
        this._onUnregister.push(fn)

        return this
    }

    /**
     * - Calls all of the subevents for update
     * - Each subevent's function is ran to see whether it should be registered or not
     * @returns this for method chaining
     */
    update() {
        for (let it of this.subevents) {
            /** @type {[import("./Event").Event, () => boolean]} */
            let [ reg, fn ] = it
            if (!fn()) {
                reg.unregister()
                continue
            }

            reg.register()
        }

        return this
    }
}