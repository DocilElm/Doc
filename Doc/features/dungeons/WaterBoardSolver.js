import { Keybind } from "../../../KeybindFix"
import { Command, Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"
import { TextHelper } from "../../shared/Text"
import Dungeons from "../../../Atomx/skyblock/Dungeons"
import config from "../../config"
import ScalableGui from "../../shared/Scalable"
import { RenderHelper } from "../../shared/Render"

// Credits: https://github.com/Desco1/WaterSolver/
// and also unclaimedbloom6 for giving me the idea of making a recording feature for it

// Constant variables
const feature = new Feature("WaterBoard", "Dungeons", "")
const editGui = new ScalableGui("waterBoardDisplay", "&cRed\n&aGreen").setCommand("waterboardsolverdisplay")
const blockPos = net.minecraft.util.BlockPos
const solutions = Persistence.getDataFromFileOrLink("WaterSolutions.json", "https://raw.githubusercontent.com/Desco1/WaterSolver/master/src/main/resources/watertimes.json")
const customSolutions = Persistence.getDataFromFile("CustomWaterSolutions.json", {})
const woolColors = {
    10: "&dPurple",
    1: "&6Orange",
    11: "&9Blue",
    5: "&aGreen",
    14: "&cRed"
}
// i gave up so this is here now
const woolColors2 = [10, 1, 11, 5, 14]

const lineColors = [
    [ 0, 255, 0 ],
    [ 0, 0, 255 ],
    [ 255, 0, 0 ],
    [ 255, 255, 255 ],
    [ 0, 0, 0 ]
]

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

const leverTypes2 = {
    "QUARTZ": "minecraft:quartz_block",
    "GOLD": "minecraft:gold_block",
    "COAL": "minecraft:coal_block",
    "DIAMOND": "minecraft:diamond_block",
    "EMERALD": "minecraft:emerald_block",
    "CLAY": "minecraft:hardened_clay",
    "WATER": "minecraft:water"
}
const beingRendered = new Set()
const leversScanned = new Map()
const leversScanned2 = new Map()
const woolScanned = new Set()
const cachedY = new Map()
const leversRecorded = new Map()

// Changeable variables
let hasScanned = false
let currentBoard = {}
let openedWater = null
let shouldRescan = false

let shouldRecord = false
let scannedVariants = {
    variant: -1,
    subVariant: null
}
let recordedSolution = {}

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

const reset = () => {
    beingRendered.clear()
    leversScanned.clear()
    leversScanned2.clear()
    woolScanned.clear()
    cachedY.clear()
    
    hasScanned = false
    currentBoard = {}
    openedWater = null
    shouldRescan = false
    scannedVariants = {
        variant: -1,
        subVariant: null
    }
}

// Logic
const scanWaterBoard = () => {
    if (!World.isLoaded() || hasScanned || !config.waterBoardSolver) return

    const [ x1, z1 ] = TextHelper.getRoomCenter()

    let rotation = null
    let pos = null
    let variant = -1
    let subVariant = ""

    net.minecraft.util.EnumFacing.field_176754_o.forEach(horizontal => {
        const horizontalBP = new BlockPos(x1, 56, z1).toMCBlock().func_177967_a(horizontal, 7)

        if (World.getBlockAt(new BlockPos(horizontalBP).up(2)).type.mcBlock !== net.minecraft.init.Blocks.field_150399_cn) return

        rotation = horizontal
        pos = horizontalBP
    })

    if (!rotation || !pos) return

    woolColors2.forEach((colors, idx) => {
        const woolBlock = World.getBlockAt(new BlockPos(pos.func_177967_a(rotation.func_176734_d(), 3 + idx)))

        if (woolBlock?.getMetadata() !== colors) return

        subVariant += idx.toString()
        woolScanned.add(woolColors[colors])
    })

    leverNames.forEach(name => {
        const ctBlock = getLeverPos(pos, rotation.func_176734_d(), name)

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

    const pistonBlockPos = new BlockPos(pos.func_177967_a(rotation, 5)).up(26)

    const blocksBelowPiston = blockPos.func_177980_a(new blockPos(pistonBlockPos.x + 1, 78, pistonBlockPos.z + 1), new blockPos(pistonBlockPos.x - 1, 77, pistonBlockPos.z - 1))

    blocksBelowPiston.forEach(block => {
        const [ xA, yA, zA ] = getVectorValues(block)
        const blockUnderPiston = World.getBlockAt(xA, yA, zA)

        if (blockUnderPiston.type.getName() === "tile.air.name" || blockUnderPiston.type.getName() === "Stone") return

        switch (blockUnderPiston.type.getName()) {
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

    if (foundGold && foundClay) variant = 0
    if (foundEmerald && foundQuartz) variant = 1
    if (foundQuartz && foundDiamond) variant = 2
    if (foundGold && foundQuartz) variant = 3

    if (shouldRecord) {
        scannedVariants.variant = variant
        scannedVariants.subVariant = subVariant
        hasScanned = true

        ChatLib.chat(`${TextHelper.PREFIX} &aCurrent variant being recorded&f: &b${scannedVariants.variant} &aWith Subvariant&f: &b${scannedVariants.subVariant}`)

        return
    }

    const currentSolution = customSolutions?.[variant]?.[subVariant] ?? solutions?.[variant]?.[subVariant]

    if (!shouldRescan && !currentSolution) {
        shouldRescan = true
        hasScanned = false
        ChatLib.chat(`${TextHelper.PREFIX} &cScanner failed attempting to re-scan`)
        Client.scheduleTask(20, () => scanWaterBoard())
        
        return
    }

    if (!currentSolution) {
        ChatLib.chat(`${TextHelper.PREFIX} &cSolution not found for WaterBoard Solver! &8The scanner will try again once you go out and back inside waterboard if this issue persists the solution might just not exist`)

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

new Keybind(`§fRecord custom waterboard`, Keyboard.KEY_NONE, "Doc")
    .registerKeyPress(() => {
        shouldRecord = !shouldRecord

        ChatLib.chat(`${TextHelper.PREFIX} ${shouldRecord ? "&aEnabled" : "&cDisabled"} Waterboard solution recording`)

        // Save current solution if the list isn't empty and the user disabled recording
        if (!shouldRecord && leversRecorded.size >= 1 && scannedVariants.variant !== -1) {
            const a = recordedSolution[scannedVariants.variant] = {}
            a[scannedVariants.subVariant] = {}

            const currentSolution = recordedSolution[scannedVariants.variant][scannedVariants.subVariant] = {}

            leversRecorded.forEach(leverObj => {
                const newArray = leverObj.array.map(value => {
                    const time = (value - (openedWater ?? Date.now())) / 1000
            
                    return time < 0 ? "0" : time.toFixed(1)
                })

                currentSolution[leverObj.blockName] = newArray
            })

            Persistence.saveDataToFile("CustomWaterSolutions.json", recordedSolution)
            // Update the json data from the variable
            // i know i could've done this alot better but oh well
            if (!(scannedVariants.variant in customSolutions)) customSolutions[scannedVariants.variant] = {}
            if (!(scannedVariants.subVariant in customSolutions[scannedVariants.variant])) customSolutions[scannedVariants.variant][scannedVariants.subVariant] = {}

            customSolutions[scannedVariants.variant][scannedVariants.subVariant] = recordedSolution[scannedVariants.variant][scannedVariants.subVariant]

            // Send message to let the player know what was saved
            ChatLib.chat(`${TextHelper.PREFIX} &aSuccessfully saved&f: &b${scannedVariants.variant} &awith subvariant&f: &b${scannedVariants.subVariant}`)

            leversRecorded.clear()
            recordedSolution = {}
            reset()
        }
    })

const recordLevers = (leverObj) => {
    if (!shouldRecord || !leverObj) return

    const { block, name } = leverObj
    const blockName = leverTypes2[name]

    if (!leversRecorded.has(name)) leversRecorded.set(name, { array: [], blockName: blockName })

    const currentLeverMap = leversRecorded.get(name).array
    currentLeverMap.push(Date.now())
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

    // If the custom solutions recording is enabled we return
    // and pass the currently clicked lever object to the recorder
    if (shouldRecord) return recordLevers(listObj)

    // Removes the first index so that the user doesn't see the "click now" even when it shouldn't
    const time = currentBoard?.[listObj.name]?.[0]
    const actualTime = openedWater ? time - ((Date.now() - openedWater) / 1000) : 10

    if (time <= 0) return currentBoard?.[listObj.name]?.splice(0, 1)
    if (actualTime >= 1) return

    currentBoard?.[listObj.name]?.splice(0, 1)
}

const renderTimer = () => {
    let toRender = []

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

            const timeRes = time - ((Date.now() - openedWater) / 1000)

            if (timeRes <= 4) toRender.push([ block.getX(), block.getY(), block.getZ() ])

            stringToDraw = timeRes <= 0 ? `§eClick now` : `§a${timeRes.toFixed(2)}s`

            Tessellator.drawString(`${leverName} ${stringToDraw}`, Math.floor(block.getX()), y, Math.floor(block.getZ()))
        })
    })

    toRender.forEach((value, idx) => {
        if (idx > 2) return

        const value2 = toRender[idx + 1]
        if (!value || !value2) return

        const arr = [value, value2]
        const color = lineColors[idx]

        RenderHelper.drawLineThroughPoints(arr, color[0], color[1], color[2], 1)
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

    if (!shouldRecord) return

    const text = `&a${((Date.now() - (openedWater ?? Date.now())) / 1000).toFixed(1)}s`

    Renderer.drawStringWithShadow(
        text,
        Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(text.removeFormatting()) / 2,
        Renderer.screen.getHeight() / 2
        )
}

// Events
new Event(feature, "worldUnload", reset)
new Event(feature, "onPlayerBlockPlacement", detectBlockPlacement, () => World.isLoaded() && Dungeons.inPuzzle() && Dungeons.getCurrentRoomName() === "Water Board" && hasScanned && config.waterBoardSolver)
new Event(feature, "renderWorld", renderTimer, () => World.isLoaded() && Dungeons.inPuzzle() && Dungeons.getCurrentRoomName() === "Water Board" && hasScanned && config.waterBoardSolver)
new Event(feature, "renderOverlay", drawString, () => World.isLoaded() && Dungeons.inPuzzle() && Dungeons.getCurrentRoomName() === "Water Board" && hasScanned && config.waterBoardSolver && config.waterBoardSolverDisplay && !editGui.isOpen())
Dungeons.onRoomIDEvent((name) => {
    if (!World.isLoaded() || !config.waterBoardSolver) return
    if (name === "Water Board") return scanWaterBoard()

    reset()
})
new Command(feature, "deletesolution", (variant, subvariant) => {
    if (!variant || !subvariant) return ChatLib.chat(`${TextHelper.PREFIX} &cPlease add a variant or subvariant!`)
    if (!customSolutions?.[variant]?.[subvariant]) return ChatLib.chat(`${TextHelper.PREFIX} &cVariant/Subvariant was not found in the custom solutions file!`)

    delete customSolutions[variant][subvariant]
    Persistence.saveDataToFile("CustomWaterSolutions.json", customSolutions)

    ChatLib.chat(`${TextHelper.PREFIX} &aSuccessfully deleted variant&f: &b${variant} &awith subvariant&f: &b${subvariant} &afrom the custom solutions file`)
})
new Command(feature, "recordingtutorial", () => {
    ChatLib.chat(`
        ${TextHelper.PREFIX} &aWaterboard recording solutions tutorial
        &bRequirements:
            &a* have a keybind already set for it &7(check your controls it should be in there)&r
            &a* be outside of waterboard before pressing the keybind &7(you can go in and out and it'll still work)&r
        &bonce you press the keybind it should &aEnable&f/&cDisable &bthe feature of recording so you will be able to just start clicking levers/water
        &bthere's also a timer in the middle of your screen so you know when to do everything in case your solution requires a timer for it &7(the timer starts after clicking the water lever)&r
        &bafter doing all this you might be wondering &6"so how do i remove a recorded solution that i accidentally made" &bwell it's simple the feature itself will tell you the &6Variant &band &6Subvariant &bof the currently saved solution
        &bthen you can just do &6/deletesolution <variant> <subvariant> &7e.g (/deletesolution 1 134)
    `)
})

// Starting events
feature.start()