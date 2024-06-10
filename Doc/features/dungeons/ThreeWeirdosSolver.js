import FeatureHandler from "../../../Atomx/events/FeatureHandler"
import { WorldState } from "../../../Atomx/skyblock/World"
import config from "../../config"
import { RenderHelper } from "../../shared/Render"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/ThreeWeirdosSolver.js

const solutions = [
    /The reward is not in my chest!/,
    /At least one of them is lying, and the reward is not in \w+'s chest.?/,
    /My chest doesn't have the reward\. We are all telling the truth.?/,
    /My chest has the reward and I'm telling the truth!/,
    /The reward isn't in any of our chests.?/,
    /Both of them are telling the truth\. Also, \w+ has the reward in their chest.?/,
]
const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]]

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

const handleChat = (npcName, message, event) => {
    if (!solutions.some(solution => solution.test(message))) return

    cancel(event)
    ChatLib.chat(`&e[NPC] &b&l${npcName}&f: &a&l${message}`)
    handleChest(npcName)
}

const renderSolution = () => {
    if (!currentChest) return

    RenderHelper.filledBlock(currentChest, 0, 1, 0, 80 / 255)
}

const reset = () => {
    currentChest = null
}

new FeatureHandler("ThreeWeirdosSolver")
    .AddEvent("chatpacket", handleChat, {
        criteria: /\[NPC\] (\w+): (.+)/,
        registerWhen() {
            return WorldState.inDungeons() && config().threeWeirdosSolver
        }
    })
    .AddEvent("chatpacket", reset, {
        criteria: /^PUZZLE SOLVED\! (.{1,16}) wasn\'t fooled by .+\! Good job\!$/,
        registerWhen() {
            return WorldState.inDungeons() && config().threeWeirdosSolver
        }
    })
    .AddEvent("chatpacket", reset, {
        criteria: /^PUZZLE FAIL\! (.{1,16}) was fooled by .+\! Yikes\!$/,
        registerWhen() {
            return WorldState.inDungeons() && config().threeWeirdosSolver
        }
    })
    .AddEvent("renderWorld", renderSolution, {
        registerWhen() {
            return WorldState.inDungeons() && currentChest && config().threeWeirdosSolver
        }
    })
    .AddEvent("worldUnload", reset, {
        registerWhen() {
            return true
        }
    })