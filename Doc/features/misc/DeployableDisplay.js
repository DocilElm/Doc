import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import config from "../../config"
import { Deployable, DeployablesList, editGui, flaresTextures, orbRegex, orbStats } from "../../shared/DeployableHandler"

// Credits: https://github.com/Fix3dll/SkyblockAddons/blob/main/src/main/java/codes/biscuit/skyblockaddons/features/deployables/Deployable.java

// Constant variables
const feature = new Feature("DeployableDisplay", "Misc", "")

// Logic
const getEntitiesWithin = ([x, y, z], [x1, y1, z1]) => {
    // getEntitiesWithinAABB - Returns all entities of the specified class type which intersect with the AABB. Args: entityClass, aabb
    return World.getWorld().func_72872_a(
        net.minecraft.entity.item.EntityArmorStand,
        new net.minecraft.util.AxisAlignedBB(
            x,
            y,
            z,
            x1,
            y1,
            z1
            )
        )
}

const scanForOrb = (entity) => {
    const [ _, orbName ] = entity.getName().removeFormatting().match(orbRegex)

    if (!(orbName in orbStats)) return

    getEntitiesWithin(
        [ entity.getX() - 0.1, entity.getY() - 3, entity.getZ() - 0.1 ],
        [ entity.getX() + 0.1, entity.getY(), entity.getZ() + 0.1 ]
    ).forEach(stand => {
        const itemStack = stand.func_82169_q(3)
        // func_82150_aj - isInvisible
        if (!itemStack || !stand.func_82150_aj()) return

        const helmet = new Item(itemStack)
        const entityUUID = new Entity(stand).getUUID().toString()
        
        if (DeployablesList.has(entityUUID)) return

        const deployable = new Deployable(helmet, entity, null, entityUUID)

        if (!deployable.inRadious(entity.distanceTo(Player.getPlayer()))) return

        DeployablesList.set(entityUUID, deployable)
    })
}
const scanEntities = () => {
    if (!config().deployableDisplay) return

    World.getAllEntitiesOfType(net.minecraft.entity.item.EntityArmorStand)
        .filter(entity => entity.distanceTo(Player.getPlayer()) <= 60)
        .forEach(entity => {
            if (orbRegex.test(entity.getName()?.removeFormatting())) return scanForOrb(entity)

            const itemStack = entity.entity.func_82169_q(3)
            if (!itemStack || !entity.isInvisible()) return

            const helmet = new Item(itemStack)
            const nbtObj = helmet.getItemNBT()?.toObject()
            const entityUUID = entity.getUUID().toString()

            if (!helmet || !nbtObj || DeployablesList.has(entityUUID)) return

            const textureStr = nbtObj.tag?.SkullOwner?.Properties?.textures?.[0]?.Value
            if (!textureStr || flaresTextures.indexOf(textureStr) === -1) return

            const deployable = new Deployable(helmet, entity, textureStr, entityUUID)

            if (!deployable.inRadious(entity.distanceTo(Player.getPlayer()))) return

            DeployablesList.set(entityUUID, deployable)
        })
}

const renderOverlay = () => {
    if (!config().deployableDisplay || editGui.isOpen()) return

    let currentDeployable = null

    DeployablesList.forEach(deployable => {
        if (!currentDeployable) currentDeployable = deployable
        if (DeployablesList.size === 1) return

        // We call the draw method with internal = true
        // meaning it wont draw the item on the player's screen
        // but it will get all the logic needed (like time in this case is used)
        // for the priority system
        deployable.draw(true)

        if (
            deployable.getPriority() >= currentDeployable.getPriority() &&
            deployable.getTimeLeft() > currentDeployable.getTimeLeft()
            ) currentDeployable = deployable
    })

    if (!currentDeployable) return

    currentDeployable.draw()
}

// Events
new Event(feature, "renderOverlay", renderOverlay, () => World.isLoaded() && config().deployableDisplay)
new Event(feature, "step", scanEntities, () => World.isLoaded() && config().deployableDisplay, 1)
new Event(feature, "worldUnload", () => DeployablesList.clear())

// Starting Events
feature.start()