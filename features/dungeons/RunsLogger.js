import config from "../../config"
import { TextHelper } from "../../shared/TextHelper"
import Dungeon from "../../../tska/skyblock/dungeon/Dungeon"
import Feature from "../../core/Feature"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import { addCommand } from "../../shared/Command"
import { Persistence } from "../../shared/Persistence"

const extraStatsRegex = /^ *> EXTRA STATS <$/
const floorStatsRegex = /^ *(Master Mode )?The Catacombs - Floor ([VI]+) Stats$/
const teamScoreRegex = /^ *Team Score: (\d+) \((\w\+?)\)$/
const defeatedRegex = /^ *☠ Defeated (?:[\w, ]+) in ([\dms ]+)$/
const deathsRegex = /^ *Deaths: (\d+)$/
const secretsFoundRegex = /^ *Secrets Found: (\d+)$/
const date = new Date()
const todayDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`

let currFloor = null
let hasAdded = false
let currentData = {
    deaths: 0,
    secrets: 0,
    time: null,
    milestone: 0,
    score: 0,
    scoreStr: null,
    taken: null
}

const reset = () => {
    currFloor = null
    currentData = {
        deaths: 0,
        secrets: 0,
        time: null,
        milestone: 0,
        score: 0,
        scoreStr: null,
        taken: null
    }
}

const getArrayData = (k, arr) => {
    if (!arr) return
    let totalSecrets = arr.reduce((a, b) => a + b.secrets, 0)
    let totalRuns = arr.length
    let averageSecrets = totalSecrets / totalRuns
    let sRuns = arr.filter((it) => it.scoreStr === "S").length
    let sPlusRuns = arr.filter((it) => it.scoreStr === "S+").length
    let otherRuns = arr.filter((it) => it.scoreStr !== "S" && it.scoreStr !== "S+").length

    return `&f- &b${k} Stats S &e${sRuns} &bS+ &6${sPlusRuns} &bOther &7${otherRuns} &bSecret Average &a${averageSecrets.toFixed(2)}\n`
}

const getDataFromDate = (date, floor) => {
    if (!floor) {
        let data = Persistence.runsData[date]
        if (!data) return

        let str = ""

        for (let k of Object.keys(data)) {
            let arr = data[k]
            if (!arr) continue

            str += getArrayData(k, arr)
        }

        return str.trim()
    }

    floor = floor.toUpperCase()
    return getArrayData(floor, Persistence.runsData?.[date]?.[floor])?.trim()
}

const feat = new Feature("runslogger", "catacombs")
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, () => {
            if (config().showExtraStats) return
            ChatLib.command("showextrastats")
        }, extraStatsRegex)
    )
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, (mm, roman) => {
            const floor = TextHelper.decodeNumeral(roman)
            currFloor = mm ? `M${floor}` : `F${floor}`
            feat.update()
        }, floorStatsRegex)
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, (score, scoreStr) => {
            currentData.score = +score
            currentData.scoreStr = scoreStr
        }, teamScoreRegex),
        () => currFloor
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, (time) => {
            currentData.time = time
            feat.update()
        }, defeatedRegex),
        () => currFloor
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, (deaths) => {
            currentData.deaths = +deaths
        }, deathsRegex),
        () => currFloor && currentData.time
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, (secrets) => {
            if (hasAdded) return reset()
            currentData.secrets = +secrets
            currentData.milestone = Dungeon.getMilestone(true)
            currentData.taken = Date.now()

            if (!(todayDate in Persistence.runsData)) Persistence.runsData[todayDate] = {}
            if (!(currFloor in Persistence.runsData[todayDate])) Persistence.runsData[todayDate][currFloor] = []

            Persistence.runsData[todayDate][currFloor].push(currentData)

            hasAdded = true
            reset()
        }, secretsFoundRegex),
        () => currFloor && currentData.time
    )
    .onUnregister(() => {
        reset()
        hasAdded = false
    })

addCommand("runs", "&bShows your runs logged data", (date, floor) => {
    new Thread(() => {
        if (!date) {
            const msg = new Message(`${TextHelper.PREFIX} &aRuns Logger Data&f:`)
    
            for (let k of Object.keys(Persistence.runsData)) {
                msg.addTextComponent(
                    new TextComponent(`\n&f- &b${k}`)
                        .setClick("run_command", `/doc runs ${k}`)
                        .setHover("show_text", `&aClick to run /doc runs ${k}`)
                )
            }
    
            msg.chat()
            return
        }

        if (date.toLowerCase() === "today") date = todayDate
        const data = getDataFromDate(date, floor)
        const space = floor ? " " : "\n"
        ChatLib.chat(`${TextHelper.PREFIX} &aRuns Logger Stats&f:${space}${data || "&cNo data found for the specified date"}`)
    }).start()
})