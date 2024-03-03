import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"
import { TextHelper } from "../../shared/Text"
import Dungeons from "../../../Atomx/skyblock/Dungeons"
import config from "../../config"
import ScalableGui from "../../shared/Scalable"

// Credits: https://github.com/Desco1/WaterSolver/

// i promise i'll recode this dumb scanner

// Constant variables
const feature = new Feature("WaterBoard", "Dungeons", "")
const editGui = new ScalableGui("waterBoardDisplay", "&cRed\n&aGreen").setCommand("waterboardsolverdisplay")
const blockPos = net.minecraft.util.BlockPos
const solutions = Persistence.getDataFromFileOrLink("WaterSolutions.json", "https://raw.githubusercontent.com/Desco1/WaterSolver/master/src/main/resources/watertimes.json")
const woolColors = {
    10: "&dPurple",
    1: "&6Orange",
    11: "&9Blue",
    5: "&aGreen",
    14: "&cRed"
}
// i gave up so this is here now
const woolColors2 = [10, 1, 11, 5, 14]

const leverNames = [
    "QUARTZ",
    "GOLD",
    "COAL",
    "DIAMOND",
    "EMERALD",
    "CLAY",
    "WATER"
]
const leverTypes = {
    "minecraft:quartz_block": "QUARTZ",
    "minecraft:gold_block": "GOLD",
    "minecraft:coal_block": "COAL",
    "minecraft:diamond_block": "DIAMOND",
    "minecraft:emerald_block": "EMERALD",
    "minecraft:hardened_clay": "CLAY",
    "minecraft:water": "WATER"
}
const beingRendered = new Set()
const leversScanned = new Map()
const leversScanned2 = new Map()
const woolScanned = new Set()
const cachedY = new Map()

// Changeable variables
let hasScanned = false
let currentBoard = {}
let openedWater = null
let shouldReturn = false

// Default gui
editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&cRed\n&aGreen", 0, 0)
    Renderer.finishDraw()
})

// Functions required by the feature
const getLeverPos = (pos, rotation, leverName) => {
    if (!leverName) return

    if (leverNames.indexOf(leverName) === 6) return World.getBlockAt(new BlockPos(pos.func_177967_a(rotation, 17)).up(4))

    const idx = leverNames.indexOf(leverName)
    if (idx === -1) return

    const shiftby = idx % 3 * 5
    const leverSide = idx < 3
        ? rotation.func_176735_f()
        : rotation.func_176746_e()

    // chestPos!!.up(5).offset(leverSide.opposite, 6).offset(roomFacing!!.opposite, 2 + shiftBy)
    //     .offset(leverSide)
    const block = World.getBlockAt(new BlockPos(pos.func_177981_b(5).func_177967_a(leverSide.func_176734_d(), 6).func_177967_a(rotation, 2 + shiftby).func_177972_a(leverSide)))
    if (!block.type) return

    return block
}

const getVectorValues = (vec) =>  [
        vec?.func_177958_n(), //getX()
        vec?.func_177956_o(), //getY()
        vec?.func_177952_p() //getZ()
    ]

const getPlayerPosition = () => [ Player.getX(), Player.getY(), Player.getZ() ]

const reset = () => {
    hasScanned = false
    openedWater = null
    beingRendered.clear()
    leversScanned.clear()
    leversScanned2.clear()
    woolScanned.clear()
    cachedY.clear()
}

// Logic
const scanWaterBoard = () => {
    if (shouldReturn) return

    let subVariant = ""
    let variant = -1;

    let chestPosition = null
    let chestRotation = null

    const [ x, _, z ] = getPlayerPosition()

    const rangeBlocks = blockPos.func_177980_a(new blockPos(x - 25, 82, z - 25), new blockPos(x + 25, 82, z + 25))
    const chestRange = blockPos.func_177980_a(new blockPos(x - 13, 54, z - 13), new blockPos(x + 13, 56, z + 13))

    chestRange.forEach(mcPos => {
        const chestPos = new BlockPos(...getVectorValues(mcPos))
        const chestBlock = World.getBlockAt(chestPos)

        if (chestBlock.type.getName() !== "Chest") return

        const isStoneDown = World.getBlockAt(chestPos.down()).type.mcBlock === net.minecraft.init.Blocks.field_150348_b
        const isGlassUp = World.getBlockAt(chestPos.up(2)).type.mcBlock === net.minecraft.init.Blocks.field_150399_cn

        if (isGlassUp && isStoneDown) {
            // EnumFacing #HORIZONTALS - field_176754_o
            net.minecraft.util.EnumFacing.field_176754_o.forEach(horizontal => {
                // #getOpposite - func_176734_d
                // using mc blockpos methods because ct wouldnt take enums and i got too lazy
                const opposite = World.getBlockAt(new BlockPos(mcPos.func_177967_a(horizontal.func_176734_d(), 3)).down(2))
                const facing = World.getBlockAt(new BlockPos(mcPos.func_177967_a(horizontal, 2)))

                if (opposite.type.mcBlock === net.minecraft.init.Blocks.field_150320_F && facing.type.mcBlock === net.minecraft.init.Blocks.field_150348_b) {
                    chestRotation = horizontal.func_176734_d()
                    chestPosition = mcPos

                    return
                }
            })
            return
        }
    })

    if (!chestRotation || !chestPosition) return

    woolColors2.forEach((colors, idx) => {
        const woolBlock = World.getBlockAt(new BlockPos(chestPosition.func_177967_a(chestRotation, 3 + idx)))

        if (woolBlock?.getMetadata() !== colors) return

        subVariant += idx.toString()
        woolScanned.add(woolColors[colors])
    })

    leverNames.forEach(name => {
        const ctBlock = getLeverPos(chestPosition, chestRotation, name)

        if (!ctBlock) return

        leversScanned.set(name, { block: ctBlock })
        // Used on the lever detection feature
        leversScanned2.set(ctBlock.toString(), { block: ctBlock, name: name })
    })

    let foundGold = false
    let foundClay = false
    let foundEmerald = false
    let foundQuartz = false
    let foundDiamond = false

    rangeBlocks.forEach(mcPos => {
        const [xR, yR, zR] = getVectorValues(mcPos)
        const pistonBlock = World.getBlockAt(xR, yR, zR).type

        if (pistonBlock.getName() !== "Piston") return

        const actualBlocks = blockPos.func_177980_a(new blockPos(xR + 1, 78, zR + 1), new blockPos(xR - 1, 77, zR - 1))

        actualBlocks.forEach(block => {
            const [xA, yA, zA] = getVectorValues(block)
            const blockUnderPiston = World.getBlockAt(xA, yA, zA).type

            if (blockUnderPiston.getName() === "tile.air.name" || blockUnderPiston.getName() === "Stone") return

            switch (blockUnderPiston.getName()) {
                case "Block of Gold":
                    foundGold = true
                    break
                case "Block of Quartz":
                    foundQuartz = true
                    break
                case "Block of Emerald":
                    foundEmerald = true
                    break
                case "Block of Diamond":
                    foundDiamond = true
                    break
                case "Hardened Clay":
                    foundClay = true
                    break
            }
        })

        if (foundGold && foundClay) return variant = 0
        if (foundEmerald && foundQuartz) return variant = 1
        if (foundQuartz && foundDiamond) return variant = 2
        if (foundGold && foundQuartz) return variant = 3
    })

    const currentSolution = solutions?.[variant]?.[subVariant]

    if (!currentSolution) {
        ChatLib.chat(`${TextHelper.PREFIX} &cSolution not found for WaterBoard Solver! &8The scanner will try again once you go out and back inside waterboard if this issue persists the solution might just no exist`)
        shouldReturn = true

        return
    }

    Object.keys(currentSolution)?.forEach(key => {
        const block = key
        const time = currentSolution[key]

        let lever = leverTypes[block]

        currentBoard[lever] = time
    })

    hasScanned = true
}

const detectBlockPlacement = (block) => {
    // lazy docilelm
    if (block.toString().toLowerCase().includes("chest") && openedWater) {
        ChatLib.chat(`${TextHelper.PREFIX} &aWater Board took&f: &6${((Date.now() - openedWater) / 1000).toFixed(2)}s`)
        openedWater = null

        return
    }

    if (!openedWater && block.toString() === leversScanned.get("WATER")?.block?.toString()) openedWater = Date.now()

    // Detect if the player clicked a lever
    if (!leversScanned2.has(block.toString())) return

    const listObj = leversScanned2.get(block.toString())

    // Removes the first index so that the user doesn't see the "click now" even when it shouldn't
    currentBoard?.[listObj.name]?.splice(0, 1)
}

const renderTimer = () => {
    Object.keys(currentBoard).forEach((listIdx) => {
        const currentSolution = currentBoard[listIdx]
        const leverName = listIdx
        const block = leversScanned.get(leverName)?.block

        if (!block) return

        currentSolution.forEach((time, idx) => {
            const inMap = cachedY.has(`${leverName}${time}`)
            const y = inMap ? cachedY.get(`${leverName}${time}`).y : block.getY() + 1 + (1.5 * idx)

            if (!inMap) beingRendered.add(`${leverName}${time}`, { y: y })

            let stringToDraw = null

            stringToDraw = time <= 0 ? `§eClick now` : `§a${time}s`

            if (!openedWater) return Tessellator.drawString(`${leverName} ${stringToDraw}`, Math.floor(block.getX()), y, Math.floor(block.getZ()))

            const timeRes = (time - ((Date.now() - openedWater) / 1000)).toFixed(2)

            stringToDraw = timeRes <= 0 ? `§eClick now` : `§a${timeRes}s`

            Tessellator.drawString(`${leverName} ${stringToDraw}`, block.getX(), y, block.getZ())
        })
    })
}

const drawString = () => {
    let y = 0

    woolScanned.forEach(value => {
        Renderer.translate(editGui.getX(), editGui.getY() + (10 * y))
        Renderer.scale(editGui.getScale())
        Renderer.drawStringWithShadow(value, 0, 0)
        Renderer.finishDraw()
        
        y++
    })
}

// Events
new Event(feature, "worldUnload", reset)
new Event(feature, "tick", scanWaterBoard, () => World.isLoaded() && Dungeons.inPuzzle() && Dungeons.getCurrentRoomName() === "Water Board" && !hasScanned && config.waterBoardSolver)
new Event(feature, "onPlayerBlockPlacement", detectBlockPlacement, () => World.isLoaded() && Dungeons.inPuzzle() && Dungeons.getCurrentRoomName() === "Water Board" && hasScanned && config.waterBoardSolver)
new Event(feature, "renderWorld", renderTimer, () => World.isLoaded() && Dungeons.inPuzzle() && Dungeons.getCurrentRoomName() === "Water Board" && hasScanned && config.waterBoardSolver)
new Event(feature, "renderOverlay", drawString, () => World.isLoaded() && Dungeons.inPuzzle() && Dungeons.getCurrentRoomName() === "Water Board" && hasScanned && config.waterBoardSolver && config.waterBoardSolverDisplay && !editGui.isOpen())
Dungeons.onRoomIDEvent((name) => {
    if (name === "Water Board") return

    shouldReturn = false
    reset()
})

// Starting events
feature.start()