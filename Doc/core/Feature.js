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

        this.events.forEach(event => {
            // Start creating events
            const customRegister = FeatureManager.customTriggers.get(event.eventName)

            // If the custom trigger doesn't exist, switch to vanilla triggers
            if (!customRegister) event._register = register(event.eventName, event.eventFunction).unregister()

            // If the custom trigger does exist
            // Unregister is not required since that's part of the customRegister specifications
            else event._register = customRegister(event.eventFunction, event.eventArguments)

            // Starts registering events if they are not conditional
            // And return so they don't get added to the conditional events list
            if (!event.registerWhen) return event._register.register()

            FeatureManager.conditionalTriggers.get(this.name).push(event)
        })
    }

    stop() {
        // Removes the conditional triggers from still being checked
        FeatureManager.conditionalTriggers.delete(this.name)

        // Unregister all the events
        this.events.forEach(event => event._register.unregister())
    }
}