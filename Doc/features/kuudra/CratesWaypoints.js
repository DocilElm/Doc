import renderBeaconBeam from "../../../BeaconBeam"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { WorldState } from "../../shared/World"

// Constant variables
const feature = new Feature("cratesWaypoints", "Kuudra", "")
const entityType = net.minecraft.entity.monster.EntityGiantZombie
const chatCriteria = /^\[NPC\] Elle\: OMG\! Great work collecting my supplies\!$/
const requiredWorld = "Kuudra"

// Changeable variabels
let crates = []
let toggle = true

// Checks
const registerWhen = () => WorldState.getCurrentWorld() === requiredWorld && toggle && config.cratesWaypoints
const checkToggleAndCrates = () => crates && registerWhen()

// Logic
const getCrates = () => crates = World.getAllEntitiesOfType(entityType)
    .filter(entity => entity.getY() < 67)
    .map(entity => [
        // Get the X and Y position of the crates
        entity.getX() + 5 * Math.cos((entity.getYaw() + 130) * (Math.PI / 180)), 
        entity.getZ() + 5 * Math.sin((entity.getYaw() + 130) * (Math.PI / 180))
    ])

const renderCrates = () => crates.forEach(entity => renderBeaconBeam(entity[0], 75, entity[1], 255/255, 0/255, 255/255, 1, true))

const resetVariabels = () => {
    crates = []
    toggle = true
}

// Events
new Event(feature, "step", getCrates, registerWhen, 5)
new Event(feature, "renderWorld", renderCrates, checkToggleAndCrates)
new Event(feature, "onChatPacket", () => toggle = false, null, chatCriteria)
new Event(feature, "worldUnload", resetVariabels)

// Starting events
feature.start()