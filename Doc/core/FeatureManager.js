import config from "../config"

export default new class FeatureManager {
    constructor() {
        this.features = []
        this.conditionalTriggers = new Map()

        this.registerWhenStep = register("step", this.registerWhenStepFn.bind(this)).setFps(1)
    }

    registerWhenStepFn() {
        // This loops through the map gathering the [featureEventArray, featureName]
        // which then it's used to register/unregister events and check for config
        this.conditionalTriggers.forEach((featureEvents, featureName) => 
            featureEvents.forEach(event => event.registerWhen() && config[featureName] ? event._register.register() : event._register.unregister())
        )
    }
}