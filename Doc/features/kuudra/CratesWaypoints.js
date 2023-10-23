import renderBeaconBeam from "../../../BeaconBeam"
import { onChatPacket } from "../../classes/Events"
import { Feature } from "../../core/Feature";
import { WorldManager } from "../../utils/World";

// Constant variables
const feature = new Feature("Crates Waypoints", "Kuudra", "");
const entityType = net.minecraft.entity.monster.EntityGiantZombie;
const chatCriteria = /^\[NPC\] Elle\: OMG\! Great work collecting my supplies\!$/;
const world = "Kuudra";

// Changeable variabels
let crates = [];
let toggle = true;

// Checks
const checkWorldAndToggle = () => WorldManager.getCurrentWorld() === world && World.isLoaded() && toggle;
const checkToggleAndCrates = () => toggle && crates && World.isLoaded();

// Logic
function getCrates() {
    crates = World.getAllEntitiesOfType(entityType)
        .filter(entity => entity.getY() < 67)
        .map(entity => [
            // Get the X and Y position of the crates
            entity.getX() + 5 * Math.cos((entity.getYaw() + 130) * (Math.PI / 180)), 
            entity.getZ() + 5 * Math.sin((entity.getYaw() + 130) * (Math.PI / 180))
        ]);
}

function renderCrates() {
    crates.forEach(entity => renderBeaconBeam(entity[0], 75, entity[1], 255/255, 0/255, 255/255, 1, true));
}

function resetVariabels() {
    crates = [];
    toggle = true;
}

// Events
new Event(feature, "step", getCrates, checkWorldAndToggle, [5]);
new Event(feature, "renderWorld", renderCrates, checkToggleAndCrates);
new Event(feature, "worldUnload", resetVariabels);

onChatPacket(() => toggle = false).setCriteria(chatCriteria);

feature.start();