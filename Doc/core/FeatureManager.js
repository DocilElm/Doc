export default new class FeatureManager {
    constructor() {
        this.features = []
        // Add the internal stack to conditional triggers by default
        this.conditionalTriggers = new Map([["internal", []]])
        
        // This list holds the events registered
        this.featuresRegistered = new Set()

        this.customTriggers = new Map()

        this.registerWhenStep = register("step", this.registerWhenStepFn.bind(this)).setFps(1)
        
        register("gameUnload", () => {
            // Loop through every conditional trigger and unregister its events
            // then delete the name [featureName] from the map
            this.conditionalTriggers.forEach((featureEvents, featureName) => {
                featureEvents.forEach(event => event._register.unregister())
                this.conditionalTriggers.delete(featureName)
            })

            this.conditionalTriggers.clear()
            this.featuresRegistered.clear()
        })
    }

    registerWhenStepFn() {
        // This loops over the conditional events which are stored in an array per feature
        this.conditionalTriggers.forEach(featureEvents => 
            featureEvents.forEach(event => {
                // If the feature hasn't been registered and the [registerWhen]
                // is true we register it once
                if (!this.featuresRegistered.has(event) && event.registerWhen()) {
                    event._register.register()
                    this.featuresRegistered.add(event)

                    return
                }

                // Else if it's not well we unregister and delete the event from the list
                else if (this.featuresRegistered.has(event) && !event.registerWhen()) {
                    event._register.unregister()
                    this.featuresRegistered.delete(event)

                    return
                }

            })
        )
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