import config from "../../config"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"
import { onPuzzleRotationExit, onPuzzleScheduledRotation } from "../../shared/PuzzleRoomScanner"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/TextHelper"

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

let enteredRoom = null
let currentBlock = null
let currentRotation = null
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
    enteredRoom = null
    currentBlock = null
    currentRotation = null
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
            if (/^\[STATUE\] Oruo the Omniscient\: .+$/.test(unformatted) && !enteredRoom)
                return enteredRoom = Date.now()

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
                    feat.update()
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
                ChatLib.chat(`${TextHelper.PREFIX} &aTrivia took&f: &6${((Date.now() - enteredRoom) / 1000).toFixed(2)}s`)
                reset()
            }
        })
    )
    .addSubEvent(
        new Event(EventEnums.STEP, () => {
            World.getAllEntitiesOfType(net.minecraft.entity.item.EntityArmorStand)
                .forEach(entity => {
                    const match = entity.getName()?.removeFormatting()?.match(/([ⓐⓑⓒ]) ([^.]+)[.+]?/)
                    if (!match) return

                    let [ _, question, answer ] = match
                    if (currentSolutions.some(it => it === answer))
                        return entity.entity.func_96094_a(`§6${question} §a§l${answer}`)

                    entity.entity.func_96094_a(`§6${question} §4${answer}`)
                })
        }, 1),
        () => currentRotation !== null
    )
    .addSubEvent(
        new Event("tick", () => {
            currentBlock = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords[currentSymbol], currentRotation))
            currentSymbol = null
            feat.update()
        }),
        () => currentRotation !== null && currentSymbol
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, () => {
            currentBlock = null
            currentSymbol = null
        }, /^\[STATUE\] Oruo the Omniscient\: [\w]+ answered Question #\d correctly\!$/),
        () => currentBlock
    )
    .addSubEvent(
        new Event("renderWorld", () => {
            RenderHelper.filledBlock(currentBlock, 0, 255, 0, 80, false)
        }),
        () => currentBlock
    )
    .onUnregister(() => {
        reset()
    })

onPuzzleScheduledRotation((rotation) => {
    if (currentRotation != null || !config().triviaQuizSolver) return

    const glowstoneBlock = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.glowstone, rotation)).type.mcBlock
    const goldBlock = World.getBlockAt(...TextHelper.getRealCoord(relativeCoords.gold, rotation)).type.mcBlock

    if (glowstoneBlock !== BlockGlowstone || goldBlock !== BlockGold) return

    currentRotation = rotation
    feat.update()
})

onPuzzleRotationExit(() => {
    if (currentRotation == null) return

    reset()
    feat.update()
})