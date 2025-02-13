import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"

const triviaAnswers = Persistence.getDataFromFileOrLink("TriviaAnswers.json", "https://raw.githubusercontent.com/DocilElm/Doc-Data/refs/heads/main/dungeons/TriviaSolutions.json")
const Blocks = net.minecraft.init.Blocks
const BlockGlowstone = Blocks.field_150426_aN
const BlockGold = Blocks.field_150340_R
const relativeCoords = {
    glowstone: [ 0, 85, -2 ],
    gold: [ 0, 84, -2 ],
    "ⓐ": [ -5, 70, 9 ],
    "ⓑ": [ 0, 70, 6 ],
    "ⓒ": [ 5, 70, 9 ]
}
const solutions = new Map()
// Make the data into solutions
Object.keys(triviaAnswers)?.forEach(key => {
    const value = triviaAnswers[key]

    // Adding the solutions to the question in the map
    solutions.set(key, value)
})

let currentQuestion = null
let currentSymbol = null
let chat = []
let currentSolutions = []
let answers = []

const reset = () => {
    currentQuestion = null
    currentSymbol = null
    chat = []
    currentSolutions = []
    answers = []
    // enteredRoom = null
    // currentQuestion = null
    // currSolutions = []
    // chat = []
    // answers = []
    // currentBlock = null
    // currentRotation = null
}

/** @param {string} msg */
const centerMsg = (msg) => {
    const scale = Client.getSettings().chat.getScale()
    const strWidth = Renderer.getStringWidth(msg.addColor()) * scale
    const chatWidth = ChatLib.getChatWidth()
    if (strWidth >= chatWidth) return msg

    const margin = (chatWidth - strWidth) / 2
    const count = margin / (Renderer.getStringWidth(" ") * scale)

    return " ".repeat(count) + msg
}

const inSolutions = (question, answer) => {
    if (question === "What SkyBlock year is it?") {
        const year = Math.floor((Date.now() / 1000 - 1560276000) / 446400 + 1)

        return answer === `Year ${year}`
    }
    
    return solutions.get(question)?.some(a => a === answer)
}

const sendChat = () => {
    chat.forEach(msg => ChatLib.chat(centerMsg(msg.trim())))
    ChatLib.chat(`&b&m${ChatLib.getChatBreak()}`)
    answers.forEach(msg => ChatLib.chat(centerMsg(msg.trim())))
    ChatLib.chat(`&b&m${ChatLib.getChatBreak()}`)
}

const feat = new Feature("triviaQuizSolver", "catacombs")
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, (unformatted, event) => {
            const match = unformatted.match(/^ +(.+\?)$/)
            if (match) {
                cancel(event)
                currentQuestion = match[1]
                // too lazy
                if (match[1].trim() === "glass?")
                    currentQuestion = "What is the name of the vendor in the Hub who sells stained glass?"
                chat.push(`&b&l${unformatted}`)

                return
            }

            const answerMatch = unformatted.match(/^ +(ⓐ|ⓑ|ⓒ) (.+)$/)
            if (answerMatch) {
                cancel(event)
                const isSolution = inSolutions(currentQuestion, answerMatch[2])
                if (isSolution) {
                    currentSolutions.push(answerMatch[2])
                    currentSymbol = answerMatch[1]
                }

                const toDisplay = isSolution
                    ? `&a&l${unformatted.replace(/^( +)/, "")}`
                    : `&c${unformatted.replace(/^( +)/, "")}`
                answers.push(toDisplay)

                if (unformatted.includes("ⓒ")) Client.scheduleTask(2, () => sendChat())

                return
            }

            if (/^ +Question \#\d+$/.test(unformatted)) {
                cancel(event)

                chat = []
                answers = []
                chat.push(`&b&l${unformatted.replace(/^( +)/, "")}`)

                return
            }

            if (
                /^\[STATUE\] Oruo the Omniscient\: I bestow upon you all the power of a hundred years\!$/.test(unformatted) ||
                /^\[STATUE\] Oruo the Omniscient\: Yikes/.test(unformatted)
            ) {
                // TODO: post time taken
                reset()
            }
        })
    )
    .onUnregister(() => {
        reset()
    })