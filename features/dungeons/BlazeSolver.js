import config from "../../config"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { onPuzzleRotationExit, onPuzzleScheduledRotation } from "../../shared/PuzzleRoomScanner"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/TextHelper"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/features/BlazeSolver.js

const blazeHealthRegex = /^\[Lv15\] Blaze [\d,]+\/([\d,]+)❤$/
const Blocks = net.minecraft.init.Blocks
const BlockBedrock = Blocks.field_150357_h
const BlockBanner = Blocks.field_180393_cK
const relativeCoords = {
    bannerTop: [-4, 59, -5],
    bedrockTop: [5, 68, -8],
    bannerBottom1: [-3, 69, 10],
    bannerBottom2: [3, 69, 10]
}

let inBlaze = false
let isTop = false
let blazes = []
let enteredRoomAt = null
let lastBlazes = null

const reset = () => {
    inBlaze = false
    isTop = false
    blazes = []
    enteredRoomAt = null
    lastBlazes = null
}

const feat = new Feature("blazeSolver", "catacombs")
    .addSubEvent(
        new Event(EventEnums.STEP, () => {
            blazes = World.getAllEntitiesOfType(net.minecraft.entity.item.EntityArmorStand)
                .filter(it => blazeHealthRegex.test(it.getName().removeFormatting()))
                .map(it => [it, Math.floor(it.getName().removeFormatting().match(blazeHealthRegex)[1].replace(/,/g, ""))])

            if (blazes.length === 9) enteredRoomAt = Date.now()
            if (blazes.length === 0 && enteredRoomAt && lastBlazes === 1) {
                TextHelper.sendPuzzleMsg("Blaze", enteredRoomAt)
                if (config().blazeSolverDone) ChatLib.command("pc Blaze Done")

                reset()
                feat.update()

                return
            }

            blazes.sort((a, b) => a[1] - b[1])

            if (isTop) blazes.reverse()

            lastBlazes = blazes.length

            feat.update()
        }, 5),
        () => inBlaze
    )
    .addSubEvent(
        new Event("renderWorld", () => {
            let nextBlazes = []

            for (let idx = 0; idx < blazes.length; idx++) {
                let entity = blazes[idx][0]
                let [ x, y, z ] = [ entity.getX(), entity.getY() - 2, entity.getZ() ]
                let [ r, g, b ] = idx == 0 ? [0, 255, 0] : idx == 1 ? [250, 250, 51] : [255, 255, 255]

                if (idx <= 1) nextBlazes[idx] = [ x, y, z ]

                RenderHelper.drawEntityBoxFilled(x, y, z, 0.6, 1.8, r, g, b, 255)
            }

            if (!nextBlazes[1] || !config().blazeSolverLine) return

            // Draw line to next blaze
            RenderHelper.drawLineThroughPoints(nextBlazes, 0, 255, 0, 255, false, 2)
        }),
        () => inBlaze && blazes.length
    )
    .addSubEvent(
        new Event(EventEnums.RENDERENTITY, (_, __, ___, event) => {
            cancel(event)
        }, net.minecraft.entity.monster.EntityBlaze),
        () => inBlaze && config().blazeSolverHide
    )
    .onUnregister(() => {
        reset()
    })

onPuzzleScheduledRotation((rotation) => {
    if (!config().blazeSolver && !config().blazeSolverLine) return

    // Top
    const bannerTop = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.bannerTop, rotation)).type.mcBlock
    const bedrockTop = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.bedrockTop, rotation)).type.mcBlock
    // Bottom
    const bannerBottom1 = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.bannerBottom1, rotation)).type.mcBlock
    const bannerBottom2 = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.bannerBottom2, rotation)).type.mcBlock

    inBlaze = (bannerTop === BlockBanner && bedrockTop === BlockBedrock) || (bannerBottom1 === BlockBanner && bannerBottom2 === BlockBanner)
    isTop = bannerTop === BlockBanner && bedrockTop === BlockBedrock

    if (!inBlaze) return

    ChatLib.chat(`${TextHelper.PREFIX} &aBlaze room detected`)

    feat.update()
})

onPuzzleRotationExit(() => {
    if (!inBlaze) return

    reset()
    feat.update()
})