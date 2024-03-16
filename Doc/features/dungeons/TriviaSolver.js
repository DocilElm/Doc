import FeatureHandler from "../../../Atomx/events/FeatureHandler"
import config from "../../config"
import { Persistence } from "../../shared/Persistence"
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

class TriviaChat {
    constructor() {
        this.chat = []
        this.answers = []
    }

    addChat(msg) {
        this.chat.push(msg)

        return this
    }

    addAnswer(msg) {
        this.answers.push(msg)

        return this
    }

    send() {
        this.chat.forEach(msg => ChatLib.chat(msg))
        ChatLib.chat(" ")
        this.answers.forEach(msg => ChatLib.chat(`                               ${msg}`))
        ChatLib.chat(" ")
    }

    reset() {
        this.chat = []
        this.answers = []
    }
}

const TriviaChatClass = new TriviaChat()

const reset = () => {
    enteredRoom = null
    currentQuestion = null
    currSolutions = []

    TriviaChatClass.reset()
}

const quizDone = () => {
    ChatLib.chat(`${TextHelper.PREFIX} &aTrivia took&f: &6${((Date.now() - enteredRoom) / 1000).toFixed(2)}s`)
    reset()
}

const inSolutions = (question, answer) => {
    if (question.includes("What SkyBlock year is it?")) {
        const year = Math.floor((Date.now() / 1000 - 1560276000) / 446400 + 1)

        return question === `Year ${year}`
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

    TriviaChatClass.addChat(formatted.replace(/§6/, "§b"))
}

const handleAnswer = (answer, event, formatted) => {
    cancel(event)

    const isSol = inSolutions(currentQuestion, answer)
    if (isSol) currSolutions.push(answer)

    const msg = isSol ? formatted.replace(/§a/, "§a§l").replace(/^( +)/, "") : formatted.replace(/§a/, "§c").replace(/^( +)/, "")

    TriviaChatClass.addAnswer(msg)

    if (formatted.includes("ⓒ")) Client.scheduleTask(2, () => TriviaChatClass.send())
}

const handleQuestionNumber = (_, event, formatted) => {
    cancel(event)

    TriviaChatClass.reset()
    TriviaChatClass.addChat(formatted.replace(/§6/, "§b"))
}

const checkArmorStand = () => {
    // Straight up copy paste
    World.getAllEntitiesOfType(net.minecraft.entity.item.EntityArmorStand)
        .forEach(a => {
            const match = a.getName().removeFormatting().match(/([ⓐⓑⓒ]) ([^.]+)[.+]?/)
            if (!match) return
            let [_, question, answer] = match
            if (currSolutions.some(a => a == answer)) return a.getEntity().func_96094_a(`§6${question} §a§l${answer}`)
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
    .AddEvent("worldunload", reset, {
        registerWhen() {
            return true
        }
    })