// Importing the needed classes for the feature to work
import { Event } from "./core/Events"
import { Feature } from "./core/Feature"
import { WorldManager } from "./utils/World"

// Constant variables
// defining variables that are not going to
// change anywhere in the code here
const featureName = "test"
const requiredWorld = "Garden"
// here we make a new class of [Feature]
// passing in the args of (featureName, featureCategory, featureDescription)
// the description and category is not needed as of now but the 
// name is. because from that one we check if the feature is toggled or not
const feature = new Feature(featureName, "someCategory", "someDescription")

// Changeable variables
// defining variables that are going be changed within the code
let testArray = []

// World check
// defining the function that's going to be checked for the
// [FeatureManager] class to register/unregister
// here we're checking if the current world is equals to the
// [requiredWorld] constant and if the world is loaded
const checkWorld = () => WorldManager.getCurrentWorld() === requiredWorld && World.isLoaded()

// Logic
// this holds the logic functions for the feature although is not needed
const exampleLogic = () => {
    // In this case we're using the [exampleLogic] function
    // to make a new array with all of the names in tablist
    // then removing the formatting of them and returning that new array
    return testArray = TabList.getNames().map(name => name.removeFormatting())
}

// Events
// here we're going to define every event that we will be using
// for this feature with [Event] class

// [new Event(feature, eventName, eventFunction, registerWhen, eventArgs)]

// in this case we pass in the [Feature] class that we previously created
// so that the events all go inside of the [Feature] class's event array

// for the [exampleLogic] function we could do something like this
new Event(feature, "step", exampleLogic, checkWorld, [1])

// for normal usage we could just make the callback fn inside
new Event(feature, "step", () => {
    // Using the same code as [exampleLogic] function
    testArray = TabList.getNames().map(name => name.removeFormatting())
}, checkWorld, [1])

// Starting the events
// we need to call the [Feature] class start() method
// at the last so that all the events get started
feature.start()