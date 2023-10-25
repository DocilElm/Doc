// Import custom events so they actually work
import "../shared/Registers"

/**
 * @param {class} feature - The feature class
 * @param {string} eventName - The event name for this event
 * @param {function} eventFunction - Callback function
 * @param {function} registerWhen - registerWhen function
 * @param {array} eventArguments - eventArguments
 * @class
 */
export class Event {
    constructor(feature, eventName, eventFunction, registerWhen = null, eventArguments = []) {
        feature.events.push(this);
        
        this.eventName = eventName;
        this.eventFunction = eventFunction;
        this.registerWhen = registerWhen;
        this.eventArguments = eventArguments;

        this._register = null;
    }
}

export class Command extends Event {
    constructor(feature, commandName, eventFunction) {
        super(feature, "command", eventFunction, null, commandName);
    }
}