import { decodeNumeral } from "../../../BloomCore/utils/Utils"
import { onClientChatMsg, onTabUpdatePacket } from "../../classes/Events"
import { PREFIX, S47PacketPlayerListHeaderFooter, chat, isInBoss, isInTab } from "../../utils/Utils"

const dragColors = {
    "ICE": { dragonName: "BLUE", color: "&b" },
    "POWER": { dragonName: "RED", color: "&c" },
    "APEX": { dragonName: "GREEN", color: "&a" },
    "FLAME": { dragonName: "ORANGE", color: "&6" },
    "SOUL": { dragonName: "PURPLE", color: "&5" }
}
const bersTeam = new Set(["Mage", "Berserker"])

let oldDrag = null
let currentClass = null
let currentPowerBlessing = null
let hasTimeBlessing = false
let dragAmount = 0

onClientChatMsg((drag) => {
    ChatLib.chat(`${PREFIX} &aDetected drag spawning msg`)

    if(dragAmount >= 4) return oldDrag = drag, dragAmount = 0
    if(!oldDrag || dragAmount === 0) return oldDrag = drag, dragAmount++
    dragAmount++

    //if(!isInBoss()) return
    if(!currentClass) return chat(`${PREFIX} &cError getting the player's dungeon class`)

    const dragArray = Object.keys(dragColors)

    let bersTeamDrag = bersTeam.has(currentClass) && dragArray.indexOf(drag) <= dragArray.indexOf(oldDrag) ? drag : bersTeam.has(currentClass) ? oldDrag : drag

    let archTeamDrag = dragArray.indexOf(drag) >= dragArray.indexOf(oldDrag) ? drag : oldDrag

    const dragTitle = bersTeam.has(currentClass) ? `${dragColors[bersTeamDrag].color}${dragColors[bersTeamDrag].dragonName}` : `${dragColors[archTeamDrag].color}${dragColors[archTeamDrag].dragonName}`

    Client.showTitle(`${dragTitle} &aIs Spawning!`, PREFIX, 1, 30, 1)
    ChatLib.chat(`pc Bers Team: ${dragColors[bersTeamDrag].dragonName} | Archer Team: ${dragColors[archTeamDrag].dragonName}`)

    oldDrag = null
}).setCriteria(/^The (.+) dragon is spawning!([ \d\(\)]+)?$/)

onTabUpdatePacket((playerName, className, classLevel) => {
    if(playerName !== Player.getName()) return

    currentClass = className
    ChatLib.chat(currentClass)
}).setCriteria(/^\[[\d]+\] ([\w]+) .+ \(([\w]+) ([IVXLCDM]+)\)$/)

register("packetReceived", (packet, event) => {
    if(!isInTab("Catacombs") || !isInBoss()) return

    packet.func_179701_b()?.func_150253_a()?.forEach(chatComponent => {
        const chatComponentText = chatComponent.func_150254_d()?.removeFormatting()

        if(!hasTimeBlessing) hasTimeBlessing = /^Blessing of Time ([IVXLCDM]+)$/.test(chatComponentText)

        if(!/^Blessing of Power ([IVXLCDM]+)$/.test(chatComponentText)) return

        const [ ar, romanNumber ] = chatComponentText.match(/^Blessing of Power ([IVXLCDM]+)$/)

        currentPowerBlessing = decodeNumeral(romanNumber)
    })
}).setFilteredClass(S47PacketPlayerListHeaderFooter)

register("command", () => {
    currentClass = "Mage"
    Object.keys(dragColors).forEach(name => {
        setTimeout(() => {
            ChatLib.chat(`The ${name} dragon is spawning!`)
        }, 1000)
    })
}).setName("dtest")

register("worldUnload", () => {
    oldDrag = null
    currentClass = null
    currentPowerBlessing = null
    hasTimeBlessing = false
    dragAmount = 0
})