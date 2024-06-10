import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { RenderHelper } from "../../shared/Render"

// Constant variables
const feature = new Feature("BoxMiniboss", "Slayer", "")
const miniBossNames = [
    "Revenant Sycophant",
    "Revenant Champion",
    "Deformed Revenant",
    "Atoned Champion",
    "Atoned Revenant",
    "Tarantula Vermin",
    "Tarantula Beast",
    "Mutant Tarantula",
    "Pack Enforcer",
    "Sven Follower",
    "Sven Alpha",
    "Voidling Devotee",
    "Voidling Radical",
    "Voidcrazed Maniac",
    "Flare Demon",
    "Kindleheart Demon",
    "Burningsoul Demon"
]

// Changeable variables
let entities = []

// Logic
const scanEntities = () => {
    entities = World.getAllEntitiesOfType(net.minecraft.entity.item.EntityArmorStand)
        .filter(it => Player.asPlayerMP().canSeeEntity(it) && miniBossNames.some(a => it?.getName()?.removeFormatting()?.includes(a)))
}

const renderWorld = () => {
    if (!entities.length || !config().boxMiniboss) return

    entities.forEach(entity => {
        let [ width, height, y ] = /Sven|Tarantula/g.test(entity.getName().removeFormatting())
            ? [ 1, 1, 1 ]
            : [ 0.6, 2, 2]

        RenderHelper.drawEntityBox(
            entity.getX(),
            entity.getY() - y,
            entity.getZ(),
            width,
            height,
            0,
            1,
            1,
            1,
            2,
            false
        )
    })
}

// Events
new Event(feature, "step", scanEntities, () => World.isLoaded() && config().boxMiniboss, 1)
new Event(feature, "renderWorld", renderWorld, () => World.isLoaded() && entities.length && config().boxMiniboss)

// Starting events
feature.start()