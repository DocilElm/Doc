import FeatureHandler from "../../../Atomx/events/FeatureHandler"
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
    answers.forEach(msg => ChatLib.chat(`                               ${msg}`))
    ChatLib.chat(" ")
}

const resetChat = () => {
    chat = []
    answers = []
    currentBlock = null
}

const reset = () => {
    enteredRoom = null
    currentQuestion = null
    currSolutions = []
    resetChat()
}

const quizDone = () => {
    ChatLib.chat(`${TextHelper.PREFIX} &aTrivia took&f: &6${((Date.now() - enteredRoom) / 1000).toFixed(2)}s`)
    reset()
}

const inSolutions = (question, answer) => {
    if (question === "What SkyBlock year is it?") {
        const year = Math.floor((Date.now() / 1000 - 1560276000) / 446400 + 1)

        return answer === `Year ${year}`
    }
    
    return solutions.get(question)?.some(a => a === answer)
}

const quizStarted = () => {
    if (enteredRoom) return
    enteredRoom = Date.now()
}

const handleQuestion = (question, event, formatted) => {
    cancel(event)
    currentQuestion = `${question}?`

    chat.push(formatted.replace(/§6/, "§b"))
}

const handleAnswer = (answer, event, formatted) => {
    cancel(event)

    const isSol = inSolutions(currentQuestion, answer)
    if (isSol) currSolutions.push(answer)

    const msg = isSol ? formatted.replace(/§a/, "§a§l").replace(/^( +)/, "") : formatted.replace(/§a/, "§c").replace(/^( +)/, "")

    answers.push(msg)

    if (formatted.includes("ⓒ")) Client.scheduleTask(2, () => sendChat())
}

const handleQuestionNumber = (_, event, formatted) => {
    cancel(event)

    resetChat()
    chat.push(formatted.replace(/§6/, "§b"))
}

const checkArmorStand = () => {
    // Straight up copy paste
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

new FeatureHandler("TriviaSolver")
    .AddEvent("chatpacket", quizStarted, {
        criteria: /^\[STATUE\] Oruo the Omniscient\: .+$/,
        registerWhen() {
            return WorldState.inDungeons() && !enteredRoom && config.triviaQuizSolver
        }
    })
    .AddEvent("chatpacket", handleQuestion, {
        criteria: /^ +(.+)\?$/,
        registerWhen() {
            return WorldState.inDungeons() && enteredRoom && config.triviaQuizSolver
        }
    })
    .AddEvent("chatpacket", handleAnswer, {
        criteria: /^ +[ⓐ|ⓑ|ⓒ] (.+)$/,
        registerWhen() {
            return WorldState.inDungeons() && enteredRoom && config.triviaQuizSolver
        }
    })
    .AddEvent("chatpacket", handleQuestionNumber, {
        criteria: /^ +Question \#(\d+)$/,
        registerWhen() {
            return WorldState.inDungeons() && enteredRoom && config.triviaQuizSolver
        }
    })
    .AddEvent("chatpacket", quizDone, {
        criteria: /^\[STATUE\] Oruo the Omniscient\: Yikes/,
        registerWhen() {
            return WorldState.inDungeons() && enteredRoom && config.triviaQuizSolver
        }
    })
    .AddEvent("chatpacket", quizDone, {
        criteria: /^\[STATUE\] Oruo the Omniscient\: I bestow upon you all the power of a hundred years\!$/,
        registerWhen() {
            return WorldState.inDungeons() && enteredRoom && config.triviaQuizSolver
        }
    })
    .AddEvent("tick", checkArmorStand, {
        registerWhen() {
            return WorldState.inDungeons() && enteredRoom && config.triviaQuizSolver
        }
    })
    .AddEvent("renderWorld", () => {
        // Just in case to not spam console
        if (!currentBlock) return

        RenderHelper.filledBlock(currentBlock, 0, 1, 0, 80 / 255, false)
    }, {
        registerWhen() {
            return WorldState.inDungeons() && enteredRoom && config.triviaQuizSolver && currentBlock
        }
    })
    .AddEvent("worldunload", reset, {
        registerWhen() {
            return true
        }
    })