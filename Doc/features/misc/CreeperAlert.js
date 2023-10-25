import { Command, Event } from "../../core/Events"
import { Feature } from "../../core/Feature"

// Constant values
const feature = new Feature("CreeperAlert", "Misc", "Watch out! A creeper! aw man");
const eventName = "renderSpecificEntity";
const commandName = "stupidcreepers";
const entityType = net.minecraft.entity.monster.EntityCreeper;
const warningText = "Creeper"

// Changeable variables
let toggle = false;

// Logic
function onCreeperDraw(_, {x, y, z})  {
    Tessellator.drawString(warningText, x + Player.getX(), y + Player.getY(), z + Player.getZ());
}


new Event(feature, eventName, onCreeperDraw, (() => toggle), entityType);
new Command(feature, commandName, () => toggle = !toggle);

feature.start();