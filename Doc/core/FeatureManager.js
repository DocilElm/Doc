export default new class FeatureManager {
    constructor() {
        this.features = []
        // Add the internal stack to conditional triggers by default
        this.conditionalTriggers = new Map([["internal", []]])
        this.customTriggers = new Map()

        this.registerWhenStep = register("step", this.registerWhenStepFn.bind(this)).setFps(1)
    }

    registerWhenStepFn() {
        // This loops over the conditional events which are stored in an array per feature
        this.conditionalTriggers.forEach(
                // If the register when is true, register the event
                // else unregister the event
                event => event.registerWhen() ? event._register.register() : event._register.unregister()
        )
    }

    createCustomEvent(eventName, invokeFn) {
        this.customTriggers.set(eventName.toLowerCase(), invokeFn)
        // This allows for chaining
        return this
    }
}