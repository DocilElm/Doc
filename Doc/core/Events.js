// Import custom events so they actually work
import "../shared/Registers"
import FeatureManager from "./FeatureManager"

/**
 * @param {class} feature - The feature class
 * @param {string} eventName - The event name for this event
 * @param {function} eventFunction - Callback function
 * @param {function} registerWhen - registerWhen function
 * @param {array} eventArguments - eventArguments
 * @class
 */
export class Event {
    constructor(feature, eventName, eventFunction, registerWhen = null, eventArguments = null) {
        // Allow for internal events by allowing you to skip this
        if (feature) feature.events.push(this)
        
        this.eventName = eventName
        this.eventFunction = eventFunction
        this.registerWhen = registerWhen
        this.eventArguments = eventArguments

        this._register = null
    }

    // Internal function to start the event
    start(featureName = "internal") {
        // Check if the feature has already been started once
        if (this._register) return this // Allows method chaining and variable assigning

        // Start creating events
        const customRegister = FeatureManager.customTriggers.get(this.eventName.toLowerCase())

        // If the custom trigger doesn't exist, switch to vanilla triggers
        if (!customRegister) this._register = register(this.eventName, this.eventFunction).unregister()

        // If the custom trigger does exist
        // Unregister is not required since that's part of the customRegister specifications
        else this._register = customRegister(this.eventFunction, this.eventArguments)

        // Starts registering events if they are not conditional
        // And return so they don't get added to the conditional events list
        if (this.registerWhen === null) return this._register.register()

        FeatureManager.conditionalTriggers.get(featureName).push(this)

        // Allows method chaining and variable assigning
        return this
    }

    // We default to internal since the only case it's not internal is in Feature
    // and there we can just pass false
    stop(internal = true) {
        // If the feature is internal we check if it can be remove from
        // the internal conditional triggers
        if (internal) {
            const internalEvents = FeatureManager.conditionalTriggers.get("internal")
            const removeableIndex = internalEvents.findIndex(event => event === this)
            
            if (removeableIndex !== -1) internalEvents.splice(removeableIndex, 1)
        }

        // We create a new register when we start so we can just delete it
        // First unregister since this could cause a memory leak
        this._register.unregister()
        delete this._register

        // Allows method chaining and variable assigning
        return this
    }
}

export class Command extends Event {
    constructor(feature, commandName, eventFunction) {
        super(feature, "command", eventFunction, null, commandName)
    }
}