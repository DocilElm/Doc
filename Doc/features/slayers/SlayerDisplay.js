import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { RenderHelper } from "../../shared/Render"
import ScalableGui from "../../shared/Scalable"
import { TextHelper } from "../../shared/Text"

// Constant variables
const feature = new Feature("SlayerDisplay")
const editGui = new ScalableGui("slayerDisplay").setCommand("editslayerDisplay")
const spawnedByRegex = /^Spawned by: (\w+)$/
const timeRegex = /^\d+\:\d+( .+)?/
const entityNameRegex = /^☠ (.+)$/

// Changeable variables
let shouldScan = false
let displayList = {
    time: null,
    name: null,
    spawnedBy: null
}

// Default
editGui.onRender(() => {
    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(`&c02:59`, 0, 0)
    Renderer.drawStringWithShadow(`&c☠ &fAtoned Horror &a6M`, 0, 10)
    Renderer.drawStringWithShadow(`&eSpawned by: &a${Player.getName()}`, 0, 20)
    Renderer.retainTransforms(false)
    Renderer.finishDraw()
})

// Functions
const getEntitiesWithin = ([x, y, z], [x1, y1, z1]) => World.getWorld().func_72872_a(
    net.minecraft.entity.item.EntityArmorStand, // class
    new net.minecraft.util.AxisAlignedBB(
        x,
        y,
        z,
        x1,
        y1,
        z1
        )
    )

// Logic
const onTick = () => {
    if (!World.isLoaded() || !shouldScan || !config.slayerDisplay) return
    
    if (!displayList.spawnedBy) {
        World.getAllEntitiesOfType(net.minecraft.entity.item.EntityArmorStand).forEach(it => {
            if (!spawnedByRegex.test(it.getName()?.removeFormatting())) return
            
            const [ _, spawnerName ] = it.getName().removeFormatting().match(spawnedByRegex)
            if (spawnerName.toLowerCase() !== Player.getName().toLowerCase()) return
            
            displayList.spawnedBy = it
        })
        
        return
    }
    
    const [ x, y, z ] = [
        displayList.spawnedBy?.getX(),
        displayList.spawnedBy?.getY(),
        displayList.spawnedBy?.getZ()
    ]
    
    getEntitiesWithin([ x - 0.1, y - 5, z -0.1 ], [ x + 0.1, y + 5, z + 0.1 ]).forEach(mcEntity => {
        if (displayList.time) return
        
        const entity = new Entity(mcEntity)
        const name = entity.getName()?.removeFormatting()
        
        if (entityNameRegex.test(name)) return displayList.name = entity
        if (!timeRegex.test(name)) return
        
        displayList.time = entity
    })
    
    if (!displayList.name) ChatLib.chat(`${TextHelper.PREFIX} &cFailed creating slayer data. &7name: ${displayList.name} time: ${displayList.time} spawnedBy: ${displayList.spawnedBy}`)
    
    shouldScan = false
}

const renderOverlay = () => {
    if (!displayList.name || !displayList.time || editGui.isOpen()) return
    
    if (displayList.name.isDead()) {
        displayList = {
            time: null,
            name: null,
            spawnedBy: null
        }
        
        return
    }
    
    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(displayList.time.getName(), 0, 0)
    Renderer.drawStringWithShadow(displayList.name.getName(), 0, 10)
    Renderer.drawStringWithShadow(displayList.spawnedBy.getName(), 0, 20)
    Renderer.retainTransforms(false)
    Renderer.finishDraw()
}

const renderWorld = () => {
    if (!displayList.name || !config.slayerDisplayBox) return

    let [ width, height, y ] = /Sven|Tarantula/g.test(displayList.name.getName().removeFormatting())
        ? [ 1, 1, 1 ]
        : [ 0.6, 2, 2]

    RenderHelper.drawEntityBox(
        displayList.spawnedBy.getX(),
        Math.floor(displayList.spawnedBy.getY() - y),
        displayList.spawnedBy.getZ(),
        width,
        height,
        0,
        1,
        0,
        1,
        3,
        false
    )
}

// Events
new Event(feature, "onScoreboardPacket", () => shouldScan = true, () => World.isLoaded(), "Slay the boss!")
new Event(feature, "tick", onTick, () => World.isLoaded() && shouldScan && config.slayerDisplay)
new Event(feature, "renderOverlay", renderOverlay, () => World.isLoaded() && displayList.name && config.slayerDisplay)
new Event(feature, "renderWorld", renderWorld, () => World.isLoaded() && displayList.name && config.slayerDisplay && config.slayerDisplayBox)
new Event(feature, "worldUnload", () => {
    shouldScan = false
    displayList = {
        time: null,
        name: null,
        spawnedBy: null
    }
})

// Starting events
feature.start()