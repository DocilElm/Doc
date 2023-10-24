import { onActionBarPacket, onChatPacket } from "../classes/Events"

export const CustomEvents = {
    "command": (fn, [commandName]) =>  register("command", fn).setName(commandName),
    "renderSpecificEntity": (fn, [EntityType]) => register("renderEntity", (entity, position, partialTicks, event) => {
        if(entity.entity instanceof EntityType) return fn(entity, position, partialTicks, event);
    }),
    "step": (fn, [stepAmount]) => register("step", fn).setFps(stepAmount),
    "onChatPacket": (fn, criteria) => onChatPacket(fn).setCriteria(criteria),
    "onActionBarPacket": (fn, criteria) => onActionBarPacket(fn).setCriteria(criteria),
    "soundPlay": (fn, criteria) => register("soundPlay", fn).setCriteria(criteria)
}

/**
 * @param {class} feature - The feature class
 * @param {string} eventName - The event name for this event
 * @param {function} eventFunction - Callback function
 * @param {function} registerWhen - registerWhen function
 * @param {array} eventArguments - eventArguments array
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
        super(feature, "command", eventFunction, null, [commandName]);
    }
}