export default new class FeatureManager {
    constructor() {
        this.features = []
        // Add the internal stack to conditional triggers by default
        this.conditionalTriggers = new Map([["internal", []]])
        
        // This list holds the events registered
        this.featuresRegistered = new Set()
        this.customTriggers = new Map()
        this.registerWhenTrigger = register("step", this.registerWhenCheck.bind(this)).setFps(1)
        
        // Clean up events on game unload
        register("gameUnload", () => {
            // Loop through every conditional trigger and unregister its events
            // then delete the name [featureName] from the map
            this.conditionalTriggers.forEach((featureEvents, featureName) => {
                featureEvents.forEach(event => event._register.unregister())
                this.conditionalTriggers.delete(featureName)
            })

            // Clearing up from memory
            this.registerWhenTrigger.unregister()
            this.conditionalTriggers.clear()
            this.featuresRegistered.clear()
            this.customTriggers.clear()
            this.features = null
            this.registerWhenTrigger = null
        })
    }

    registerWhenCheck() {
        // This loops over the conditional events which are stored in an array per feature
        for (let featureEvents of this.conditionalTriggers.values()) {
            for (let idx = 0; idx < featureEvents.length; idx++) {
                let event = featureEvents[idx]

                // If the feature hasn't been registered and the [registerWhen]
                // is true we register it once
                if (!this.featuresRegistered.has(event) && event.registerWhen()) {
                    event._register.register()
                    this.featuresRegistered.add(event)

                    continue
                }

                if (!(this.featuresRegistered.has(event) && !event.registerWhen())) continue

                event._register.unregister()
                this.featuresRegistered.delete(event)
            }
        }
    }

    /**
     * - Makes a custom event trigger with the given param
     * @param {String} eventName 
     * @param {Function} invokeFn 
     * @returns this for method chaining
     */
    createCustomEvent(eventName, invokeFn) {
        this.customTriggers.set(eventName.toLowerCase(), invokeFn)
        return this
    }
}