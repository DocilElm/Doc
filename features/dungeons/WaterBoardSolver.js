import config from "../../config"
import { scheduleTask } from "../../core/CustomRegisters"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import DraggableGui from "../../shared/DraggableGui"
import { Persistence } from "../../shared/Persistence"
import { onPuzzleRotationExit, onPuzzleScheduledRotation } from "../../shared/PuzzleRoomScanner"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/TextHelper"
import { Keybind } from "../../../KeybindFix"
import { addCommand } from "../../shared/Command"
import Location from "../../shared/Location"

const Blocks = net.minecraft.init.Blocks
const blockStickyPiston = Blocks.field_150320_F
const blockWool = Blocks.field_150325_L
const blockLever = Blocks.field_150442_at
const blockHardenedClay = Blocks.field_150405_ch
const blockEmeraldBlock = Blocks.field_150475_bE
const blockDiamondBlock = Blocks.field_150484_ah
const blockQuartzBlock = Blocks.field_150371_ca
const blockGoldBlock = Blocks.field_150340_R
const blockStone = Blocks.field_150348_b
const blockAir = Blocks.field_150350_a
const solutions = Persistence.getDataFromFileOrLink("WaterSolutions.json", "https://raw.githubusercontent.com/Desco1/WaterSolver/master/src/main/resources/watertimes.json")
const customSolutions = Persistence.getDataFromFile("CustomWaterSolutions.json", {}) // Recorded solutions
const editGui = new DraggableGui("waterBoardDisplay").setCommandName("editwaterBoardDisplay")
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

let currentSolution = null
let levers = []
let openedWater = false
let render = []

let shouldRecord = false
let leversRecorded = {}
let data = {
    variant: null,
    subvariant: null
}

editGui.onDraw(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&6GOLD&f: &eClick now\n&aEMERALD&f: &a5.5s", 0, 0)
    Renderer.finishDraw()
})

const getLevers = (rotation) => {
    for (let k in relativeCoords.levers) {
        let v = relativeCoords.levers[k]
        let block = World.getBlockAt(...TextHelper.getRealCoord(v, rotation))

        levers.push({
            name: k,
            block: block
        })
    }
}

const getLeverByName = (name) => levers.find(it => it.name === name)
const getLeverByBlock = (block) => levers.find(it => it.block.toString() === block.toString())

const recordLever = (obj) => {
    const { name } = obj
    if (!(name in leversRecorded)) leversRecorded[name] = { array: [], name }

    leversRecorded[name].array.push(Date.now())
}

const feat = new Feature("waterBoardSolver", "catacombs")
    .addSubEvent(
        new Event("renderWorld", () => {
            if (!currentSolution) return

            let leverLines = []
            render = []

            for (let k in currentSolution) {
                let v = currentSolution[k]
                let lever = getLeverByName(k)
                if (!lever) continue

                let block = lever.block

                for (let idx = 0; idx < v.length; idx++) {
                    let time = v[idx]
                    let y = block.getY() + (2.5 * idx || 1)

                    let str = time <= 0 ? `§eClick now` : `§a${time}s`
                    if (!openedWater) {
                        Tessellator.drawString(`${leverNames[k]} ${str}`, block.getX() + 0.5, y, block.getZ() + 0.5)
                        render.push([`${leverNames[k]} ${str}`, time])
                        continue
                    }

                    let timeRemaining = time - ((Date.now() - openedWater) / 1000)
                    if (timeRemaining <= 4) leverLines.push([ block.getX(), block.getY(), block.getZ() ])

                    str = timeRemaining <= 0 ? `§eClick now` : `§a${timeRemaining.toFixed(2)}s`
                    Tessellator.drawString(`${leverNames[k]} ${str}`, block.getX() + 0.5, y, block.getZ() + 0.5)
                    render.push([`${leverNames[k]} ${str}`, time])
                }
            }

            if (!leverLines.length) return

            for (let idx = 0; idx < 3; idx++) {
                let v = leverLines[idx]
                let v2 = leverLines[idx + 1]
                if (!v || !v2) continue

                let [ r, g, b ] = lineColors[idx]
                RenderHelper.drawLineThroughPoints([v, v2], r, g, b, 1)
            }
        }),
        () => data.variant
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.CLIENT.BLOCKPLACEMENT, (block) => {
            if (!openedWater && block.toString() === getLeverByName("minecraft:water")?.block?.toString()) {
                openedWater = Date.now()
                feat.update()
            }

            const obj = getLeverByBlock(block)
            if (!obj) return

            if (shouldRecord) return recordLever(obj)

            // Removes the first index so that the user doesn't see the "click now" even when it shouldn't
            const time = currentSolution?.[obj.name]?.[0]
            const actualTime = openedWater ? time - ((Date.now() - openedWater) / 1000) : 10

            if (time <= 0) return currentSolution?.[obj.name]?.splice(0, 1)
            if (actualTime >= 1) return

            currentSolution?.[obj.name]?.splice(0, 1)
        }),
        () => data.variant
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.CUSTOM.OPENEDCHEST, () => {
            TextHelper.sendPuzzleMsg("Water Board", openedWater)
            currentSolution = null
            openedWater = null
            levers = []
        }),
        () => openedWater
    )
    .addSubEvent(
        new Event("renderOverlay", () => {
            if (editGui.isOpen()) return

            if (shouldRecord) {
                const text = `&a${((Date.now() - (openedWater ?? Date.now())) / 1000).toFixed(1)}s`
        
                Renderer.drawStringWithShadow(
                    text,
                    Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(text.removeFormatting()) / 2,
                    Renderer.screen.getHeight() / 2
                    )
            }

            Renderer.retainTransforms(true)
            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())

            render.sort((a, b) => a[1] - b[1])

            for (let idx = 0; idx < render.length; idx++) {
                let str = render[idx][0]

                Renderer.drawStringWithShadow(str, 0, 10 * idx)
            }

            Renderer.retainTransforms(false)
            Renderer.finishDraw()
        }),
        () => data.variant && config().waterBoardSolverDisplay
    )
    .onUnregister(() => {
        currentSolution = null
        openedWater = null
        levers = []
        shouldRecord = false
        data = {
            variant: null,
            subvariant: null
        }
    })

const getSolutionFromCustom = () => {
    const URL = config().waterBoardChannelURL
    const fileName = URL.match(/.+\/(\w+\.json)/)?.[1]
    if (!fileName || !URL) return ChatLib.chat(`${TextHelper.PREFIX} &cError while getting the custom url solutions`)

    const otherSolution = Persistence.getDataFromFileOrLink(fileName, URL)
    if (!otherSolution) return ChatLib.chat(`${TextHelper.PREFIX} &cError while getting the custom url solutions`)

    return otherSolution?.[roomData.variant]?.[roomData.subvariant]
}

const getSolution = (variant, subvariant) => {
    switch (config().waterBoardChannelMode) {
        case 1: return solutions?.[variant]?.[subvariant]
        case 2: return customSolutions?.[variant]?.[subvariant]
        case 3: return getSolutionFromCustom()
        default:
            return customSolutions?.[variant]?.[subvariant] ?? solutions?.[variant]?.[subvariant]
    }
}

const getVariant = (rotation, currentY) => {
    let leftPushed = World.getBlockAt(...TextHelper.getRealCoord([-1, currentY, -11], rotation))
    let rightPushed = World.getBlockAt(...TextHelper.getRealCoord([1, currentY, -11], rotation))

    if (leftPushed.type.mcBlock === blockAir || leftPushed.type.mcBlock === blockStone) {
        leftPushed = World.getBlockAt(...TextHelper.getRealCoord([-1, currentY, -12], rotation))
    }

    if (rightPushed.type.mcBlock === blockAir || rightPushed.type.mcBlock === blockStone) {
        rightPushed = World.getBlockAt(...TextHelper.getRealCoord([1, currentY, -12], rotation))
    }

    const left = leftPushed.type.mcBlock
    const right = rightPushed.type.mcBlock
    let variant = null

    if (left === blockGoldBlock && right === blockHardenedClay) variant = 0
    if (left === blockEmeraldBlock && right === blockQuartzBlock) variant = 1
    if (left === blockQuartzBlock && right === blockDiamondBlock) variant = 2
    if (left === blockGoldBlock && right === blockQuartzBlock) variant = 3

    return variant
}

onPuzzleScheduledRotation((rotation) => {
    if (!config().waterBoardSolver) return

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

    ChatLib.chat(`${TextHelper.PREFIX} &aWater Board detected`)

    scheduleTask(() => {
        const variant = getVariant(rotation, bottomPiston.getY())
        getLevers(rotation)
        if (variant == null) return ChatLib.chat(`${TextHelper.PREFIX} &cError while attempting to scan the current waterboard &6Variant &cnot found`)

        let subvariant = ""

        for (let idx = 0; idx < woolColors.length; idx++) {
            let k = woolColors[idx]
            let v = relativeCoords.wool[k]
            let woolBlock = World.getBlockAt(...TextHelper.getRealCoord(v, rotation))
            if (woolBlock.getMetadata() !== k) continue

            subvariant += `${idx}`
        }

        data.variant = variant
        data.subvariant = subvariant
        currentSolution = getSolution(variant, subvariant)

        feat.update()
    }, 8)
})

onPuzzleRotationExit(() => {
    currentSolution = null
    openedWater = null
    levers = []
    data = {
        variant: null,
        subvariant: null
    }
    leversRecorded = {}
    render = []
    feat.update()
})

new Keybind("§fRecord custom waterboard", Keyboard.KEY_NONE, "Doc")
    .registerKeyPress(() => {
        if (!Location.inWorld("catacombs")) return

        shouldRecord = !shouldRecord
        ChatLib.chat(`${TextHelper.PREFIX} ${shouldRecord ? "&aEnabled" : "&cDisabled"} Water Board solution recording`)

        const { variant, subvariant } = data
        if (!shouldRecord && Object.keys(leversRecorded).length >= 1 && variant != null) {
            if (!(variant in customSolutions)) customSolutions[variant] = {}

            const currentSolution = customSolutions[variant][subvariant] = {}

            for (let k in leversRecorded) {
                let { array, name } = leversRecorded[k]

                currentSolution[name] = array.map(v => {
                    let time = (v - (openedWater ?? Date.now())) / 1000

                    return time < 0 ? "0" : time.toFixed(1)
                })
            }

            leversRecorded = {}
            ChatLib.chat(`${TextHelper.PREFIX} &aSuccessfully saved&f: &b${variant} &awith subvariant&f: &b${subvariant}`)
        }
    })

addCommand("wb", "WaterBoard solver commands", (type, variant, subvariant) => {
    if (!type) return ChatLib.chat(`${TextHelper.PREFIX} &cMakes sure to add a mode &7(modes: delete, tutorial)`)
    if (type.toLowerCase() === "tutorial") {
        ChatLib.chat(`
            ${TextHelper.PREFIX} &aWaterboard recording solutions tutorial
            &bRequirements:
                &a* have a keybind already set for it &7(check your controls it should be in there)&r
                &a* be outside of waterboard before pressing the keybind &7(you can go in and out and it'll still work)&r
            &bonce you press the keybind it should &aEnable&f/&cDisable &bthe feature of recording so you will be able to just start clicking levers/water
            &bthere's also a timer in the middle of your screen so you know when to do everything in case your solution requires a timer for it &7(the timer starts after clicking the water lever)&r
            &bafter doing all this you might be wondering &6"so how do i remove a recorded solution that i accidentally made" &bwell it's simple the feature itself will tell you the &6Variant &band &6Subvariant &bof the currently saved solution
            &bthen you can just do &6/doc wb delete <variant> <subvariant> &7e.g (/doc wb delete 1 134)
        `)
        return
    }
    if (type.toLowerCase() !== "delete") return
    if (!variant || !subvariant) return ChatLib.chat(`${TextHelper.PREFIX} &cPlease add a variant and subvariant`)
    if (!customSolutions?.[variant]?.[subvariant]) return ChatLib.chat(`${TextHelper.PREFIX} &cVariant/Subvariant was not found in the custom solutions file`)

    delete customSolutions[variant][subvariant]
    ChatLib.chat(`${TextHelper.PREFIX} &aSuccessfully deleted variant&f: &b${variant} &awith subvariant&f: &b${subvariant} &afrom the custom solutions file`)
})

register("gameUnload", () => {
    Persistence.saveDataToFile("CustomWaterSolutions.json", customSolutions)
})