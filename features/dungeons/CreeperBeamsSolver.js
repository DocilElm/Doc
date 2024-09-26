import config from "../../config"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"
import { onPuzzleRotationExit, onPuzzleScheduledRotation } from "../../shared/PuzzleRoomScanner"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/TextHelper"

const lanterPairs = Persistence.getDataFromFileOrLink("CreeperBeamsSolutions.json", "https://raw.githubusercontent.com/DocilElm/Doc-Data/main/dungeons/CreeperBeamsSolutions.json")
const relativeCoords = {
    lantern: [0, 74, 0],
    stone: [1, 73, 0]
}
const pairColors = [
    [0, 200, 255],
    [0, 255, 0],
    [255, 102, 102],
    [255, 255, 51],
    [255, 153, 51]
]

let solutions = []
let enteredRoomAt = null

const equals = (pos, pos2) => Math.floor(pos.x) === Math.floor(pos2.x) && Math.floor(pos.y) === Math.floor(pos2.y) && Math.floor(pos.z) === Math.floor(pos2.z)

const checkBlocks = (feat, pos, packetBlock) => {
    for (let idx = solutions.length - 1; idx >= 0; idx--) {
        let blocks = solutions[idx].blocks

        if (
            (equals(pos, blocks[0].pos) || equals(pos, blocks[1].pos)) &&
            packetBlock === net.minecraft.init.Blocks.field_180397_cI
            ) {
                solutions.splice(idx, 1)
                continue
        }
    }

    if (solutions.length === 0) {
        TextHelper.sendPuzzleMsg("Creeper Beams", enteredRoomAt)
        solutions = []
        enteredRoomAt = null
    }

    feat.update()
}

const feat = new Feature("creeperBeamsSolver", "catacombs")
    .addSubEvent(
        new Event("renderWorld", () => {
            for (let idx = 0; idx < 4; idx++) {
                let data = solutions[idx]
                if (!data) continue

                let [ block, block1 ] = data.blocks
                let [ r, g, b ] = data.color

                RenderHelper.outlineFilledBlock(block, r, g, b, 255)
                RenderHelper.outlineFilledBlock(block1, r, g, b, 255)

                if (!config().creeperBeamsSolverLine) continue

                RenderHelper.drawLineThroughPoints(data.coords, r, g, b, 255, false, 2)
            }
        }),
        () => solutions.length && enteredRoomAt
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.BLOCKCHANGE, (_, pos, packetBlock) => {
            checkBlocks(feat, pos, packetBlock)
        }),
        () => solutions.length && enteredRoomAt
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.CUSTOM.MULTIBLOCKCHANGE, (_, pos, packetBlock) => {
            checkBlocks(feat, pos, packetBlock)
        }),
        () => solutions.length && enteredRoomAt
    )
    .onUnregister(() => {
        solutions = []
        enteredRoomAt = null
    })

onPuzzleScheduledRotation((rotation) => {
    if (!config().creeperBeamsSolver) return

    const stoneBlock = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.stone, rotation))
    const lanternBlock = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.lantern, rotation))
    if (stoneBlock.type.mcBlock !== net.minecraft.init.Blocks.field_150348_b || lanternBlock.type.mcBlock !== net.minecraft.init.Blocks.field_180398_cJ) return

    ChatLib.chat(`${TextHelper.PREFIX} &aCreeper Beams detected`)

    let idx = 0

    for (let k in lanterPairs) {
        if (idx >= 4) break

        let v = lanterPairs[k]

        let block = World.getBlockAt(...TextHelper.getRealCoord(v[0], rotation))
        let block1 = World.getBlockAt(...TextHelper.getRealCoord(v[1], rotation))
        if (block.type.mcBlock !== net.minecraft.init.Blocks.field_180398_cJ || block1.type.mcBlock !== net.minecraft.init.Blocks.field_180398_cJ) continue

        solutions.push({
            blocks: [block, block1],
            coords: [
                [ Math.floor(block.getX()) + 0.5, Math.floor(block.getY()) + 0.5, Math.floor(block.getZ()) + 0.5 ],
                [ Math.floor(block1.getX()) + 0.5, Math.floor(block1.getY()) + 0.5, Math.floor(block1.getZ()) + 0.5 ]
            ],
            color: pairColors[idx]
        })

        idx++
    }

    enteredRoomAt = Date.now()

    feat.update()
})

onPuzzleRotationExit(() => {
    solutions = []
    enteredRoomAt = null
    feat.update()
})