class FeatureManager {
    constructor() {
        this.features = [];
        this.conditionalTriggers = new Map();

        this.registerWhenStep = register("step", this.registerWhenStepFn.bind(this)).setFps(1)
    }

    registerWhenStepFn() {
        // This loops over the conditional events which are stored in an array per feature
        this.conditionalTriggers.forEach(
            featureEvents => featureEvents.forEach(
                // If the register when is true, register the event
                // else unregister the event
                event => event.registerWhen() ? event._register.register() : event._register.unregister()
            )
        );
    }
}

export default new FeatureManager();