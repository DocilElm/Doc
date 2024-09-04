import config from "../../config"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"
import { onPuzzleRotationExit, onPuzzleScheduledRotation } from "../../shared/PuzzleRoomScanner"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/TextHelper"

const solutions = Persistence.getDataFromFileOrLink("BoulderDataNew.json", "https://raw.githubusercontent.com/DocilElm/Doc-Data/main/dungeons/BoulderData.json")?.solutions
const relativeCoords = {
    ironbar: [ 0, 70, -12 ],
    chest: [ 0, 66, -14 ],
    firstbox: [ -9, 66, -9 ]
}

/** @type {BoulderBox[]} */
let renderBlocks = []
let enteredRoomAt = null

/**
 * - Gets the current variant of boulder
 * @param {number} rotation
 * @returns {string}
 * @link Credits to [Bloom](https://github.com/UnclaimedBloom6)
 */
const getBoulderGrid = (rotation) => {
    const [ rx, ry, rz ] = relativeCoords.firstbox
    let str = ""

    for (let z = 0; z <= 15; z += 3) {
        for (let x = 0; x <= 18; x += 3) {
            let block = World.getBlockAt(...TextHelper.getRealCoord([rx + x, ry, rz + z], rotation))

            if (block.type.getID() === 0) str += "0"
            else str += "1"
        }
    }

    return str
}

class BoulderBox {
    constructor(render, click, rotation) {
        this.render = TextHelper.getRealCoord(render, rotation)
        this.click = TextHelper.getRealCoord(click, rotation)
    }

    onClick(click) {
        return click[0] === this.click[0] && click[1] === this.click[1] && click[2] === this.click[2]
    }

    toString() {
        return `BoulderBox=[render=${this.render}, click=${this.click}]`
    }
}

const feat = new Feature("boulderSolver", "catacombs")
    .addSubEvent(
        new Event("renderWorld", () => {
            for (let idx = 0; idx < renderBlocks.length; idx++) {
                let data = renderBlocks[idx]
                let block = World.getBlockAt(...data.render)

                RenderHelper.outlineBlock(block, 0, 243, 200, 255)
                RenderHelper.filledBlock(block, 0, 243, 200, 50)
            }
        }),
        () => enteredRoomAt && renderBlocks.length
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.CLIENT.BLOCKPLACEMENT, (/**@type {Block}*/block, pos) => {
            for (let idx = renderBlocks.length - 1; idx >= 0; idx--) {
                let data = renderBlocks[idx]

                if (!data.onClick(pos)) continue

                renderBlocks.splice(idx, 1)
            }

            feat.update()
        }),
        () => enteredRoomAt && renderBlocks.length
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.CUSTOM.OPENEDCHEST, () => {
            TextHelper.sendPuzzleMsg("Boulder", enteredRoomAt)
            renderBlocks = []
            enteredRoomAt = null
        }),
        () => enteredRoomAt
    )
    .onUnregister(() => {
        renderBlocks = []
        enteredRoomAt = null
    })

onPuzzleScheduledRotation((rotation) => {
    if (!config().boulderSolver) return

    const block = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.ironbar, rotation))

    if (block.type.mcBlock !== net.minecraft.init.Blocks.field_150411_aY) return

    const theGrid = getBoulderGrid(rotation)
    const currentSolution = solutions[theGrid]
    if (!currentSolution) return ChatLib.chat(`${TextHelper.PREFIX} &cBoulder room variant not found in the data`)

    ChatLib.chat(`${TextHelper.PREFIX} &aBoulder room detected`)
    enteredRoomAt = Date.now()

    for (let idx = 0; idx < currentSolution.render.length; idx++) {
        let render = currentSolution.render[idx]
        let click = currentSolution.click[idx]

        renderBlocks.push(new BoulderBox(render, click, rotation))
    }

    feat.update()
})

onPuzzleRotationExit(() => {
    renderBlocks = []
    enteredRoomAt = null
    feat.update()
})