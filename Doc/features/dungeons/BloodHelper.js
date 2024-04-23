import Dungeons from "../../../Atomx/skyblock/Dungeons"
import { WorldState } from "../../../Atomx/skyblock/World"
import Vector3 from "../../../BloomCore/utils/Vector3"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { RenderHelper } from "../../shared/Render"

// Credits: https://github.com/Skytils/SkytilsMod/blob/1.x/src/main/kotlin/gg/skytils/skytilsmod/features/impl/dungeons/BloodHelper.kt
// and also: https://github.com/Soopyboo32/SoopyV2/blob/master/src/features/dungeonSolvers/index.js

// Constant variables
const feature = new Feature("BloodHelper", "Dungeons", "")
const skullTextures = new Set([
    "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvNGNlYzQwMDA4ZTFjMzFjMTk4NGY0ZDY1MGFiYjM0MTBmMjAzNzExOWZkNjI0YWZjOTUzNTYzYjczNTE1YTA3NyJ9fX0K", // M2, M3, F6
    "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvZTVjMWRjNDdhMDRjZTU3MDAxYThiNzI2ZjAxOGNkZWY0MGI3ZWE5ZDdiZDZkODM1Y2E0OTVhMGVmMTY5Zjg5MyJ9fX0K", // M5
    "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvYmY2ZTFlN2VkMzY1ODZjMmQ5ODA1NzAwMmJjMWFkYzk4MWUyODg5ZjdiZDdiNWIzODUyYmM1NWNjNzgwMjIwNCJ9fX0K", // M6
    "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvOWZkNjFlODA1NWY2ZWU5N2FiNWI2MTk2YThkN2VjOTgwNzhhYzM3ZTAwMzc2MTU3YjZiNTIwZWFhYTJmOTNhZiJ9fX0K", // F5
    "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvYjM3ZGQxOGI1OTgzYTc2N2U1NTZkYzY0NDI0YWY0YjlhYmRiNzVkNGM5ZThiMDk3ODE4YWZiYzQzMWJmMGUwOSJ9fX0K", // M1, F4
    "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvNTY2MmI2ZmI0YjhiNTg2ZGM0Y2RmODAzYjA0NDRkOWI0MWQyNDVjZGY2NjhkYWIzOGZhNmMwNjRhZmU4ZTQ2MSJ9fX0K", // M4, F7
    "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvMjczOWQ3ZjRlNjZhN2RiMmVhNmNkNDE0ZTRjNGJhNDFkZjdhOTI0NTVjOWZjNDJjYWFiMDE0NjY1YzM2N2FkNSJ9fX0K", // M7
    "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvMTdkYjE5MjNkMDNjNGVmNGU5ZjZlODcyYzVhNmFkMjU3OGIxYWZmMmIyODFmYmMzZmZhNzQ2NmM4MjVmYjkifX19", // F1, F2
    "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvZjVmMGQ3OGZlMzhkMWQ3Zjc1ZjA4Y2RjZjJhMTg1NWQ2ZGEwMzM3ZTExNGEzYzYzZTNiZjNjNjE4YmM3MzJiMCJ9fX0K" // F3
])
const entityList = new Map()
const blacklisted = new Set()
const firstSpawnRegex = /^\[BOSS\] The Watcher\: Let\'s see how you can handle this\.$/

// Changeable variables
let mobsSpawned = 0
let watcherEntity = null

// Logic
const scanEntityLookMove = (mcEntity, [x, y, z]) => {
    if (!World.isLoaded() || !WorldState.inDungeons() || Dungeons.getCurrentRoomName() !== "Blood" || !config.bloodHelper || !watcherEntity) return

    if (!(mcEntity instanceof net.minecraft.entity.item.EntityArmorStand)) return

    const entity = new Entity(mcEntity)

    if (entity.distanceTo(watcherEntity) >= 20) return
    
    const entityUUID = entity.getUUID().toString()
    const obj = entityList.get(entityUUID)

    if (blacklisted.has(entityUUID)) return

    if (obj && obj.vectors.length >= 3) {
        const fvec = obj.vectors.reduce((acc, vec) => acc.add(vec), new Vector3(0, 0, 0))

        const multiply = mobsSpawned > 3 ? 10 : 14.6
        const fvecNormalized = fvec.normalize().multiply(multiply)
        const [ x1, y1, z1 ] = [
            fvecNormalized.getX(),
            fvecNormalized.getY(),
            fvecNormalized.getZ()
        ]
        const ivec = new net.minecraft.util.Vec3(x1, y1, z1)
        const vec = mcEntity.func_174791_d().func_178787_e(ivec)
        obj.finalVector = [ vec.field_72450_a, vec.field_72448_b, vec.field_72449_c ]
        obj.time = mobsSpawned > 3 ? 2750 : 4700

        blacklisted.add(entityUUID)

        mobsSpawned++
        return
    }

    if (obj) return obj.vectors.push(new Vector3(x / 32, y / 32, z / 32))

    const itemStack = mcEntity.func_82169_q(3)

    if (!itemStack || itemStack?.func_77973_b() !== net.minecraft.init.Items.field_151144_bL) return

    entityList.set(entityUUID, {
        entity: entity,
        vectors: [
            new Vector3(x / 32, y / 32, z / 32)
        ],
        finalVector: null,
        time: null,
        started: Date.now(),
        uuid: entityUUID
    })
}

const highlightSpot = () => {
    if (!watcherEntity || !config.bloodHelper) return

    entityList.forEach(obj => {
        const { entity, vectors, finalVector, time, started, uuid } = obj

        if (entity.isDead()) return entityList.delete(uuid)
        if (!finalVector) return
        
        RenderHelper.drawEntityBox(finalVector[0], finalVector[1] + 1.5, finalVector[2], 0.5, 0.5, 0, 1, 0, 1, 2, true)
        RenderHelper.drawLineThroughPoints([
            [entity.getX(), entity.getY() + 1.5, entity.getZ()],
            [finalVector[0], finalVector[1] + 1.5, finalVector[2]]
        ], 1, 0, 0, 1)

        if (time) {
            const fixedTime = ((time - (Date.now() - started)) / 1000)
            const color = fixedTime < 1.5 ? Renderer.GREEN : Renderer.RED

            Tessellator.drawString(`${fixedTime.toFixed(2)}s`, finalVector[0], finalVector[1] + 1.5, finalVector[2], color)
        }
    })
}

const scanEntities = (mcEntity) => {
    if (watcherEntity || !config.bloodHelper) return

    Client.scheduleTask(2, () => {
        const entity = new Entity(mcEntity)

        const itemStack = mcEntity.func_82169_q(3)
        if (!itemStack) return

        const helmet = new Item(itemStack)
        const nbtObj = helmet.getItemNBT()?.toObject()

        if (!helmet || !nbtObj) return

        const textureStr = nbtObj.tag?.SkullOwner?.Properties?.textures?.[0]?.Value

        if (!textureStr || !skullTextures.has(textureStr)) return

        watcherEntity = entity
    })
}

const handleChat = () => mobsSpawned = 4

// Events
new Event(feature, "forgeEntityJoin", scanEntities, () => World.isLoaded() && WorldState.inDungeons() && config.bloodHelper, net.minecraft.entity.monster.EntityZombie)
new Event(feature, "renderWorld", highlightSpot, () => WorldState.inDungeons() && Dungeons.getCurrentRoomName() === "Blood" && config.bloodHelper)
new Event(feature, "onPacketLookMove", scanEntityLookMove, () => WorldState.inDungeons() && Dungeons.getCurrentRoomName() === "Blood" && config.bloodHelper)
new Event(feature, "onChatPacket", handleChat, () => WorldState.inDungeons() && config.bloodHelper, firstSpawnRegex)
new Event(feature, "worldUnload", () => {
    entityList.clear()
    blacklisted.clear()
    mobsSpawned = 0
    watcherEntity = null
})

// Starting events
feature.start()