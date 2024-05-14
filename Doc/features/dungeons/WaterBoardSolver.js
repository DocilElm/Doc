import Dungeons from "../../../Atomx/skyblock/Dungeons"
import { WorldState } from "../../../Atomx/skyblock/World"
import { Keybind } from "../../../KeybindFix"
import config from "../../config"
import { Command, Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"
import { onPuzzleRotation } from "../../shared/PuzzleHandler"
import { RenderHelper } from "../../shared/Render"
import ScalableGui from "../../shared/Scalable"
import { TextHelper } from "../../shared/Text"

// Constant variables
// Blocks
const Blocks = net.minecraft.init.Blocks
const blockStickyPiston = Blocks.field_150320_F
const blockWool = Blocks.field_150325_L
const blockLever = Blocks.field_150442_at
const blockHardenedClay = Blocks.field_150405_ch
const blockEmeraldBlock = Blocks.field_150475_bE
const blockDiamondBlock = Blocks.field_150484_ah
const blockQuartzBlock = Blocks.field_150371_ca
const blockGoldBlock = Blocks.field_150340_R

const feature = new Feature("WaterBoard", "Dungeons", "")
const solutions = Persistence.getDataFromFileOrLink("WaterSolutions.json", "https://raw.githubusercontent.com/Desco1/WaterSolver/master/src/main/resources/watertimes.json")
const customSolutions = Persistence.getDataFromFile("CustomWaterSolutions.json", {}) // Recorded solutions
const editGui = new ScalableGui("waterBoardDisplay", "&cRed\n&aGreen").setCommand("waterboardsolverdisplay")
const relativeCoords = {
    topPiston: [0, 82, -13],
    bottomPiston: [-1, 78, -13],
    bottomPiston2: [-1, 77, -13],
    bottomBlueWool: [0, 58, -10],
    waterLever: [0, 60, 10],
    chestPos: [0, 56, -7],
    wool: {
        10: [0, 56, -4],
        1: [0, 56, -3],
        11: [0, 56, -2],
        5: [0, 56, -1],
        14: [0, 56, 0]
    },
    levers: {
        "minecraft:quartz_block": [-5, 61, -5],
        "minecraft:gold_block": [-5, 61, 0],
        "minecraft:coal_block": [-5, 61, 5],
        "minecraft:diamond_block": [5, 61, -5],
        "minecraft:emerald_block": [5, 61, 0],
        "minecraft:hardened_clay": [5, 61, 5],
        "minecraft:water": [0, 60, 10]
    }
}
const woolColors = [10, 1, 11, 5, 14]
const leverNames = {
    "minecraft:quartz_block": "§fQUARTZ",
    "minecraft:gold_block": "§6GOLD",
    "minecraft:coal_block": "§7COAL",
    "minecraft:diamond_block": "§bDIAMOND",
    "minecraft:emerald_block": "§aEMERALD",
    "minecraft:hardened_clay": "§dCLAY",
    "minecraft:water": "§bWATER"
}
const lineColors = [
    [ 0, 255, 0 ],
    [ 0, 0, 255 ],
    [ 255, 0, 0 ],
    [ 255, 255, 255 ],
    [ 0, 0, 0 ]
]
const cachedY = new Map()
const leversScanned = new Map()
const leversScanned2 = new Map()
const leversRecorded = new Map()
const beingRendered = new Set()

// Default gui
editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&6GOLD&f: &eClick now\n&aEMERALD&f: &a5.5s", 0, 0)
    Renderer.finishDraw()
})

// Changeable variables
let currentY = null
let currentRoation = null
let roomData = {
    variant: null,
    subvariant: null
}
let currentBoard = null
let openedWater = null
let shouldRescan = 0
let shouldRecord = false
let recordedSolution = {}

// Functions
const reset = () => {
    cachedY.clear()
    leversScanned.clear()
    leversScanned2.clear()
    beingRendered.clear()

    currentY = null
    currentRoation = null
    roomData = {
        variant: null,
        subvariant: null
    }
    currentBoard = null
    openedWater = null
    shouldRescan = 0
}

// Logic
const mapLeversBlock = () => {
    Object.keys(relativeCoords.levers).forEach(key => {
        const value = relativeCoords.levers[key]
        const block = World.getBlockAt(...TextHelper.getRealCoord(value, currentRoation))

        leversScanned.set(key, { block: block, key: key })
        leversScanned2.set(block.toString(), { block: block, key: key })
    })
}

const getSolutionFromCustom = () => {
    const URL = config.waterBoardChannelURL
    const fileName = URL.match(/.+\/(\w+\.json)/)?.[1]
    if (!fileName || !URL) return ChatLib.chat(`${TextHelper.PREFIX} &cError while getting the custom url solutions`)

    const otherSolution = Persistence.getDataFromFileOrLink(fileName, URL)
    if (!otherSolution) return ChatLib.chat(`${TextHelper.PREFIX} &cError while getting the custom url solutions`)

    return otherSolution?.[roomData.variant]?.[roomData.subvariant]
}

const getSolution = () => {
    switch (config.waterBoardChannelMode) {
        case 1: return solutions?.[roomData.variant]?.[roomData.subvariant]
        case 2: return customSolutions?.[roomData.variant]?.[roomData.subvariant]
        case 3: return getSolutionFromCustom()
        case 0:
        default:
            return customSolutions?.[roomData.variant]?.[roomData.subvariant] ?? solutions?.[roomData.variant]?.[roomData.subvariant]
    }
}

const getSubVariant = (fn) => {
    let subVariant = ""

    woolColors.forEach((key, idx) => {
        const value = relativeCoords.wool[key]
        const woolBlock = World.getBlockAt(...TextHelper.getRealCoord(value, currentRoation))

        if (woolBlock.getMetadata() !== parseInt(key)) return

        subVariant += idx.toString()
    })

    if (subVariant.length > 3) return ChatLib.chat(`${TextHelper.PREFIX} &cLooks like more than 3 sub variants were found! &7this is normally impossible so the scanner broke`)

    if (subVariant.length < 3) {
        ChatLib.chat(`${TextHelper.PREFIX} &cError while attempting to scan the current waterboard &7Sub variant not found`)
        if (shouldRescan >= 2) return

        setTimeout(() => {
            ChatLib.chat(`${TextHelper.PREFIX} &aAttempting to re-scan Water Board`)
            getVariant()
        }, 500)

        shouldRescan++
        
        return
    }

    return fn(subVariant)
}

const getVariant = () => {
    if (currentRoation == null || !currentY) return

    let variant = null

    let leftPushed = World.getBlockAt(...TextHelper.getRealCoord([-1, currentY, -11], currentRoation))
    if (leftPushed.type.getName() === "tile.air.name" || leftPushed.type.getName() === "Stone") {
        leftPushed = World.getBlockAt(...TextHelper.getRealCoord([-1, currentY, -12], currentRoation))
    }

    let rightPushed = World.getBlockAt(...TextHelper.getRealCoord([1, currentY, -11], currentRoation))
    if (rightPushed.type.getName() === "tile.air.name" || rightPushed.type.getName() === "Stone") {
        rightPushed = World.getBlockAt(...TextHelper.getRealCoord([1, currentY, -12], currentRoation))
    }

    const left = leftPushed.type.mcBlock
    const right = rightPushed.type.mcBlock

    if (left === blockGoldBlock && right === blockHardenedClay) variant = 0
    if (left === blockEmeraldBlock && right === blockQuartzBlock) variant = 1
    if (left === blockQuartzBlock && right === blockDiamondBlock) variant = 2
    if (left === blockGoldBlock && right === blockQuartzBlock) variant = 3

    if (variant === null) return ChatLib.chat(`${TextHelper.PREFIX} &cError while attempting to scan the current waterboard &7Variant not found`)

    getSubVariant((subvariant) => {
        roomData.variant = variant
        roomData.subvariant = subvariant
        
        mapLeversBlock()

        if (shouldRecord) return
        
        currentBoard = getSolution()
        if (!currentBoard?.["minecraft:water"]?.length) {
            ChatLib.chat(`${TextHelper.PREFIX} &cLooks like the Water Board solution chosen was emtpy attempting to assign a new one`)
            currentBoard = getSolution()
        }

        ChatLib.chat(`${TextHelper.PREFIX} &aCurrent Water Board: Variant ${variant} SubVariant ${subvariant}`)
    })
}

onPuzzleRotation((rotation) => {
    if (!WorldState.inDungeons() || currentRoation !== null || !config.waterBoardSolver) return

    const topPiston = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.topPiston, rotation))
    let bottomPiston = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.bottomPiston, rotation))
    const bottomBlueWool = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.bottomBlueWool, rotation))
    const waterLever = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.waterLever, rotation))

    if (bottomPiston.type.mcBlock !== blockStickyPiston) bottomPiston = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.bottomPiston2, rotation))

    if (
        topPiston.type.mcBlock !== blockStickyPiston ||
        bottomPiston.type.mcBlock !== blockStickyPiston ||
        bottomBlueWool.type.mcBlock !== blockWool ||
        waterLever.type.mcBlock !== blockLever
    ) return

    currentRoation = rotation
    currentY = bottomPiston.getY()

    Client.scheduleTask(5, () => getVariant())
})

const renderTimer = () => {
    if (!currentBoard || !config.waterBoardSolver) return
    
    let toRender = []

    // TODO: make this less ugly hello ??
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

            if (!openedWater) return Tessellator.drawString(`${leverNames[leverName]} ${stringToDraw}`, block.getX() + 0.5, y, block.getZ() + 0.5)

            const timeRes = time - ((Date.now() - openedWater) / 1000)

            if (timeRes <= 4) toRender.push([ block.getX(), block.getY(), block.getZ() ])

            stringToDraw = timeRes <= 0 ? `§eClick now` : `§a${timeRes.toFixed(2)}s`

            Tessellator.drawString(`${leverNames[leverName]} ${stringToDraw}`, block.getX() + 0.5, y, block.getZ() + 0.5)
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

const recordLevers = (leverObj) => {
    if (!shouldRecord || !leverObj) return

    const { block, key } = leverObj

    if (!leversRecorded.has(key)) leversRecorded.set(key, { array: [], key: key })

    const currentLeverMap = leversRecorded.get(key).array
    currentLeverMap.push(Date.now())
}

const detectBlockPlacement = (block) => {
    if (!config.waterBoardSolver || !openedWater && block.toString() === leversScanned.get("minecraft:water")?.block?.toString()) openedWater = Date.now()

    // Detect if the player clicked a lever
    if (!leversScanned2.has(block.toString())) return

    const listObj = leversScanned2.get(block.toString())

    // If the custom solutions recording is enabled we return
    // and pass the currently clicked lever object to the recorder
    if (shouldRecord) return recordLevers(listObj)

    // Removes the first index so that the user doesn't see the "click now" even when it shouldn't
    const time = currentBoard?.[listObj.key]?.[0]
    const actualTime = openedWater ? time - ((Date.now() - openedWater) / 1000) : 10

    if (time <= 0) return currentBoard?.[listObj.key]?.splice(0, 1)
    if (actualTime >= 1) return

    currentBoard?.[listObj.key]?.splice(0, 1)
}

const renderOverlay = () => {
    if (shouldRecord || !config.waterBoardSolver) {
        const text = `&a${((Date.now() - (openedWater ?? Date.now())) / 1000).toFixed(1)}s`

        Renderer.drawStringWithShadow(
            text,
            Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(text.removeFormatting()) / 2,
            Renderer.screen.getHeight() / 2
            )
    }

    if (!currentBoard || editGui.isOpen()) return

    let render = []

    Object.keys(currentBoard).forEach((listIdx) => {
        const currentSolution = currentBoard[listIdx]
        const leverName = listIdx
        const time = currentSolution[0]
        if (time == null) return

        let stringToDraw = null

        stringToDraw = time <= 0 ? `&eClick now` : `&a${time}s`

        if (!openedWater) {
            render.push([`${leverNames[leverName]} ${stringToDraw}`, time])
            return
        }

        const timeRes = time - ((Date.now() - openedWater) / 1000)

        stringToDraw = timeRes <= 0 ? `&eClick now` : `&a${timeRes.toFixed(2)}s`
        render.push([`${leverNames[leverName]} ${stringToDraw}`, time])
    })

    render.sort((a, b) => a[1] - b[1])

    Renderer.retainTransforms(true)
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    render.forEach((it, idx) => {
        Renderer.drawStringWithShadow(it[0], 0, idx === 0 ? 0 : 10 * idx)
    })
    Renderer.retainTransforms(false)
    Renderer.finishDraw()
}

new Keybind(`§fRecord custom waterboard`, Keyboard.KEY_NONE, "Doc")
    .registerKeyPress(() => {
        shouldRecord = !shouldRecord

        ChatLib.chat(`${TextHelper.PREFIX} ${shouldRecord ? "&aEnabled" : "&cDisabled"} Waterboard solution recording`)

        // Save current solution if the list isn't empty and the user disabled recording
        if (!shouldRecord && leversRecorded.size >= 1 && roomData.variant != null) {
            const variant = roomData.variant
            const subvariant = roomData.subvariant

            const a = recordedSolution[variant] = {}
            a[subvariant] = {}

            const currentSolution = recordedSolution[variant][subvariant] = {}

            leversRecorded.forEach(leverObj => {
                const newArray = leverObj.array.map(value => {
                    const time = (value - (openedWater ?? Date.now())) / 1000
            
                    return time < 0 ? "0" : time.toFixed(1)
                })

                currentSolution[leverObj.key] = newArray
            })

            Persistence.saveDataToFile("CustomWaterSolutions.json", recordedSolution)
            // Update the json data from the variable
            // i know i could've done this alot better but oh well
            if (!(variant in customSolutions)) customSolutions[variant] = {}
            if (!(subvariant in customSolutions[variant])) customSolutions[variant][subvariant] = {}

            customSolutions[variant][subvariant] = recordedSolution[variant][subvariant]

            // Send message to let the player know what was saved
            ChatLib.chat(`${TextHelper.PREFIX} &aSuccessfully saved&f: &b${variant} &awith subvariant&f: &b${subvariant}`)

            leversRecorded.clear()
            recordedSolution = {}
            reset()
        }
    })

// Events
new Event(feature, "renderWorld", renderTimer, () => WorldState.inDungeons() && config.waterBoardSolver)
new Event(feature, "renderOverlay", renderOverlay, () => WorldState.inDungeons() && config.waterBoardSolver)
new Event(feature, "onPlayerBlockPlacement", detectBlockPlacement, () => WorldState.inDungeons() && config.waterBoardSolver)
Dungeons.onRoomIDEvent((name) => {
    if (name === "Water Board") return

    reset()
})
new Event(feature, "worldUnload", reset)
new Command(feature, "rescanwb", () => {
    ChatLib.chat(`${TextHelper.PREFIX} &aAttempting to re-scan Water Board by command`)
    
    cachedY.clear()
    leversScanned.clear()
    leversScanned2.clear()
    beingRendered.clear()

    roomData = {
        variant: null,
        subvariant: null
    }
    currentBoard = null
    openedWater = null
    shouldRescan = 0

    getVariant()
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

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/WaterBoardTimer.js
// Detect chest opened. Chest animation means it'll only trigger when the chest is actually opened, so no cheesing!
register("packetReceived", (packet) => {
    if (!currentBoard || !openedWater || !config.waterBoardSolver) return

    const pos = new BlockPos(packet.func_179825_a())
    const block = packet.func_148868_c()
    if (!(block instanceof net.minecraft.block.BlockChest)) return

    const chestPos = [ pos.x, pos.y, pos.z ]
    const realChestPos = TextHelper.getRealCoord(relativeCoords.chestPos, currentRoation)
    if (!chestPos.every((v, i) => v == realChestPos[i])) return

    ChatLib.chat(`${TextHelper.PREFIX} &aWater Board took&f: &6${((Date.now() - openedWater) / 1000).toFixed(2)}s`)
}).setFilteredClass(net.minecraft.network.play.server.S24PacketBlockAction)

// Starting events
feature.start()