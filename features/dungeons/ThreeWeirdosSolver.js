import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { RenderHelper } from "../../shared/Render"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/features/ThreeWeirdosSolver.js

const solutions = [
    /The reward is not in my chest!/,
    /At least one of them is lying, and the reward is not in \w+'s chest.?/,
    /My chest doesn't have the reward\. We are all telling the truth.?/,
    /My chest has the reward and I'm telling the truth!/,
    /The reward isn't in any of our chests.?/,
    /Both of them are telling the truth\. Also, \w+ has the reward in their chest.?/,
]
const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]]
const npcRegex = /^\[NPC\] (\w+): (.*)$/
const puzzleDoneRegex = /^PUZZLE SOLVED! (\w{1,16}) wasn't fooled by \w+! Good job!$/
const puzzleFailedRegex = /^PUZZLE FAIL\! (\w{1,16}) was fooled by \w+! Yikes!$/

let currentChest = null

const handleChest = (npcName) => {
    if (currentChest) return
    
    const armorStand = World.getAllEntitiesOfType(net.minecraft.entity.item.EntityArmorStand).find(a => a?.getName()?.removeFormatting() === npcName)
    if (!armorStand) return

    let [ x, y, z ] = [ Math.floor(armorStand.getX()), armorStand.getY(), Math.floor(armorStand.getZ()) ]
    
    for (let dir of directions) {
        let [dx, dz] = dir
        let block = World.getBlockAt(x+dx, y, z+dz)

        if (block.type.getID() !== 54) continue
        
        currentChest = block
        return
    }
}

const feat = new Feature("threeWeirdosSolver", "catacombs")
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, (npcName, message, event) => {
            if (!solutions.some(solution => solution.test(message))) return

            cancel(event)
            ChatLib.chat(`&e[NPC] &b&l${npcName}&f: &a&l${message}`)
            handleChest(npcName)

            feat.update()
        }, npcRegex)
    )
    .addSubEvent(
        new Event("renderWorld", () => {
            RenderHelper.outlineFilledBlock(currentChest, 0, 255, 0, 255)
        }),
        () => currentChest
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, () => {
            currentChest = null
            feat.update()
        }, puzzleDoneRegex),
        () => currentChest
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, () => {
            currentChest = null
            feat.update()
        }, puzzleFailedRegex),
        () => currentChest
    )
    .onUnregister(() => {
        currentChest = null
    })