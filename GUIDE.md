# Structure of Doc

**PULL REQUESTS!**  
These are the backbone of contributing. Do not force push changes without consultations. Open a pull request to get your feature merged so we can TALK about changes before you add them.

## Features

Features are a class that contains metadata and feature related information

```js
class Feature {
    cosntructor(name, category, description) {
        this.events = [];
    }
}
```

Currently there is not much to say about the feature class.

## Config

Persistent, non-user facing config should be handled like events wihtin a feature. You can handle user facing config. - This is directed at Doc

## Events

### Event
Events are handled on a per feature base and work using an overarching class
```js
class Event {
    constructor(feature, eventName, eventFunction, registerWhen, eventArguments) {
        feature.events.push(this)
    }
}
```
You need to pass in a feature to the event so the event can be correlated to this feature. This is used to track, enable and disable events on a per feature basis.

The parameters work as follows:  
`feature` - An instance of the feature class  
`eventName` - The name of the event to use when calling `eventFunction`  
`eventFunction` - The underlying logic of what happens when conditions are met for an Event
`onlyWhen` - A condition that is matched every second to register the event
`eventArguments` - Arguments which are based per event

### EventWrapper

Next are `EventWrappers`. These perfom some method of making things easier. For example Command is an EventWrapper and as it's commonly used it allows for some things to be set internally.

```js
class Command extends Event {
    constructor(feature, commandName, eventFunction) {
        super(feature, "command", eventFunction, commandName)
    }
}
```

This is a primitive example of what EventWrappers can achieve and they should NOT be used for each event. Only events that happen a LOT.

### Custom Events

Custom events are events created to be used within the system. These events are created and triggered by certain things. 

We track custom events in our feature manager so we can assign events to them if the event so wishes.
Under the hood they are `registers` with conditions attached to them. We use these to both wrap `registers` for the `Event` class aswell as creating whole new events.

Here is an example where it's being used to wrap `registers`
```js
// Wrapper for registers
FeatureManager.createCustomEvent("command", (fn, commandName) => {
    return register("command", fn).setName(commandName).unregister()
})

// For the second constructor parameter, here are the types
/**
 * @param fn The variable name used for "eventFunction"
 * @param commandName The variable name used for "eventArguments" 
 */
```
So with this examle we can get the gist of the system. We create a new `eventName` and for the event to actually work add a function to create our conditioned register for the event.
> The second argument needs to be a function

And this is an example of how to create a new "custom" event
```js
// New custom event
FeatureManager.createCustomEvent("renderSpecificEntity", (fn, entityType) => {
    return register("renderEntity", (entity, position, partialTicks, event) => {
        if (entity.entity instanceof entityType) fn(entity, position, partialTicks, event)
    }).unregister()
})
```
Calling unregister is required.

### Practical Example

So to understand how this system would look like within a feature we will pull up a practical example
```js
// We store our constant variables here so they can be modified swiftly if needed
const feature = new Feature("Example Feature", "Example Category", "This is an example feature")
const entityType = net.minecraft.entity.monster.EntityEnderman

// Right under constant variables we put the declartions of variables that change throughout runtime
let toggle = false;

// Named function is used, be that through variable assigned arrow functions or the function keyword
// We only want the position so just discard the first parameter
function onRenderOfEnderman(_, position) {
    // This is just basic chat triggers and reading their documentation
    Tessellator.drawString("Enderman", position.x + Player.getX(), position.y + Player.getY(), position.z + Player.getZ())
}

// Here is a little more logic to be used later
function onCommandRun() {
    toggle = !toggle
    ChatLib.chat("Enderman are now being marked, or not")
}

// What happens here is we register the event to a feature, we pass in a function to be called when conditions are met, we also pass along a special eventArgument which for this specifc event is an entity class so the event is only called when the entity is of entityType

// We also add a check to see if the feature is "enabled" in a sense for config purposes. This could perfectly fine be a check to see if the config is enabled
// The check is relatively simple this time so we can just put it directly into here
new Event(feature, "renderSpecificEntity", onRenderOfEnderman, () => toggle, entityType)

// We also want something to turn on the previous event, so we use a Command here
new Command(feature, "enderman", onCommandRun)

// Lastly we commence the feature for processing
feature.start();
```
And like magic under the hood the condition is checked, the generic custom event is created for this event, etc.

### Conclusion

You can now create and use events throughout the code.

## File Strucutre

It's quite straightforward.

`features` is where features go within a subdirectory named after the thing it pertains to.  

`core` is where generic, unchanging files go. They represent the core system and allow features to operate  

`data` is a folder created per user session with their data

`shared` is a folder where classes go the share state across features. A world class which contains helper function like #getArea() are located. These allow for an API so these methods can be tweaked internally without breaking everything but everything getting the benefit of it.

> Temporary  
> For example you'd move your TextHandler class to `shared` and then for each kind of function you have here you'd create a custom trigger with a generate register command that generates a packet trigger with filtered stuff. You'd then move #getCurrentMsg to some sort of ChatState class which would have other functions like #getRank etc. which pertain to ranks