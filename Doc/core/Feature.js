import FeatureManager from "./FeatureManager"

export class Feature {
    constructor(name, category, description) {
        FeatureManager.features.push(this)
        
        this.name = name
        this.category = category
        this.description = description

        this.events = []
    }

    start() {
        FeatureManager.conditionalTriggers.set(this.name, [])

        // Register it under this feature otherwise it's considered internal
        this.events.forEach(event => event.start(this.name))
    }

    stop() {
        // Removes the conditional triggers from still being checked
        FeatureManager.conditionalTriggers.delete(this.name)

        // Unregister all the events
        this.events.forEach(event => event.stop(false))
    }
}