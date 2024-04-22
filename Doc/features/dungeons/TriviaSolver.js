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

register("chat", (event) => {
    if (!WorldState.inDungeons() || !config.triviaQuizSolver) return

    const evMsg = ChatLib.getChatMessage(event)
    const msg = evMsg?.removeFormatting()

    if (/^\[STATUE\] Oruo the Omniscient\: .+$/.test(msg) && !enteredRoom) return quizStarted()

    const match = msg.match(/^ +(.+)\?$/)
    if (match) return handleQuestion(match[1], event, evMsg)

    const answerMatch = msg.match(/^ +[ⓐ|ⓑ|ⓒ] (.+)$/)
    if (answerMatch) return handleAnswer(answerMatch[1], event, evMsg)

    const questionNumberMatch = msg.match(/^ +Question \#(\d+)$/)
    if (questionNumberMatch) return handleQuestionNumber(null, event, evMsg)

    if (
        /^\[STATUE\] Oruo the Omniscient\: I bestow upon you all the power of a hundred years\!$/.test(msg) ||
        /^\[STATUE\] Oruo the Omniscient\: Yikes/.test(msg)
        ) return quizDone()
})

register("worldUnload", () => reset())