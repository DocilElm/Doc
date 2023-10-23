import FeatureManager from "./FeatureManager"
import { CustomEvents } from "./Events"

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
            const customRegister = CustomEvents[event.eventName]

            // If the custom trigger doesn't exist, switch to vanilla triggers
            if(!customRegister) event._register = register(event.eventName, event.eventFunction).unregister()

            // If the custom trigger does exist
            else event._register = customRegister(event.eventFunction, event.eventArguments).unregister()

            // Starts registering events
            if(!event.registerWhen) return event._register.register() // This is stupid Doc format

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