import Dungeons from "../../../Atomx/skyblock/Dungeons"
import config from "../../config"
import { Persistence } from "../../shared/Persistence"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/Text"
import { WorldState } from "../../shared/World"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/TriviaSolver.js

const stdata = Persistence.getDataFromURL("https://data.skytils.gg/solvers/oruotrivia.json")
const solutions = new Map()
// Make the data into solutions
Object.keys(stdata)?.forEach(key => {
    const value = stdata[key]

    // Adding the solutions to the question in the map
    solutions.set(key, value)
})

let enteredRoom = null
let currentQuestion = null
let currSolutions = []
let currentBlock = null
// Used to change the chat color and position of the messages
let chat = []
let answers = []

const sendChat = () => {
    chat.forEach(msg => ChatLib.chat(msg))
    ChatLib.chat(" ")
    answers.forEach(msg => ChatLib.chat(`                                ${msg}`))
    ChatLib.chat(" ")
}

const reset = () => {
    enteredRoom = null
    currentQuestion = null
    currSolutions = []
    chat = []
    answers = []
    currentBlock = null
}

const inSolutions = (question, answer) => {
    if (question === "What SkyBlock year is it?") {
        const year = Math.floor((Date.now() / 1000 - 1560276000) / 446400 + 1)

        return answer === `Year ${year}`
    }
    
    return solutions.get(question)?.some(a => a === answer)
}

register("chat", (event) => {
    if (!WorldState.inDungeons() || !config.triviaQuizSolver) return

    const evMsg = ChatLib.getChatMessage(event, true)
    const msg = evMsg?.removeFormatting()

    if (/^\[STATUE\] Oruo the Omniscient\: .+$/.test(msg) && !enteredRoom) return enteredRoom = Date.now()

    const match = msg.match(/^ +(.+\?)$/)
    if (match) {
        cancel(event)

        currentQuestion = match[1]
        chat.push(`&b&l${msg}`)

        return
    }

    const answerMatch = msg.match(/^ +[ⓐ|ⓑ|ⓒ] (.+)$/)
    if (answerMatch) {
        cancel(event)

        const isSol = inSolutions(currentQuestion, answerMatch[1])
        if (isSol) currSolutions.push(answerMatch[1])

        const msg1 = isSol
            ? `&a&l${msg.replace(/^( +)/, "")}`
            : `&c${msg.replace(/^( +)/, "")}`

        answers.push(msg1)

        if (msg.includes("ⓒ")) Client.scheduleTask(2, () => sendChat())

        return
    }

    if (/^ +Question \#\d+$/.test(msg)) {
        cancel(event)
        
        chat = []
        answers = []
        currentBlock = null

        chat.push(`                                &b&l${msg.replace(/^( +)/, "")}`)

        return
    }

    if (
        /^\[STATUE\] Oruo the Omniscient\: I bestow upon you all the power of a hundred years\!$/.test(msg) ||
        /^\[STATUE\] Oruo the Omniscient\: Yikes/.test(msg)
        ) {
            ChatLib.chat(`${TextHelper.PREFIX} &aTrivia took&f: &6${((Date.now() - enteredRoom) / 1000).toFixed(2)}s`)
            reset()

            return
        }
})

const checkArmorStand = () => {
    if (Dungeons.getCurrentRoomName() !== "Quiz" || !config.triviaQuizSolver) return

    World.getAllEntitiesOfType(net.minecraft.entity.item.EntityArmorStand)
        .forEach(a => {
            const match = a.getName().removeFormatting().match(/([ⓐⓑⓒ]) ([^.]+)[.+]?/)
            if (!match) return
            let [_, question, answer] = match

            if (currSolutions.some(a => a == answer)) {
                currentBlock = World.getBlockAt(Math.floor(a.getX()), a.getY() + 1, Math.floor(a.getZ()))
                a.getEntity().func_96094_a(`§6${question} §a§l${answer}`)
            
                return
            }
        
            a.getEntity().func_96094_a(`§6${question} §4${answer}`)
        })
}

register("step", checkArmorStand).setFps(1)

register("renderWorld", () => {
    if (!WorldState.inDungeons() || !config.triviaQuizSolver || !currentBlock) return

    RenderHelper.filledBlock(currentBlock, 0, 1, 0, 80 / 255, false)
})

register("worldUnload", () => reset())