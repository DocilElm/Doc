import { addEvent } from "../../FeatureBase"
import { PREFIX, S02PacketChat, S3EPacketTeams } from "../../utils/Utils"

let bossSpawned = null
let bossSlainPacket = null

// from bloom core
addEvent("bossSlainTimer", "Slayers", register("packetReceived", (packet) => {
    const channel = packet.func_149307_h()
    if (channel !== 2) return

    const teamStr = packet.func_149312_c()
    const teamMatch = teamStr.match(/^team_(\d+)$/)
    if (!teamMatch) return

    const line = parseInt(teamMatch[1])
    const message = packet.func_149311_e().concat(packet.func_149309_f())
    
    if(message.removeFormatting() === "Slay the boss!") return bossSpawned = Date.now()
    if(message.removeFormatting() !== "Boss slain!" || !bossSpawned) return

    bossSlainPacket = Date.now()
}).setFilteredClass(S3EPacketTeams), null, [
    register("packetReceived", (packet, event) => {
        if(!bossSpawned) return

        const currentMessage = new Message(packet.func_148915_c()).getFormattedText().removeFormatting()

        if(currentMessage !== "  SLAYER QUEST COMPLETE!") return

        const timeFromKill = !bossSlainPacket ? Date.now() : bossSlainPacket

        ChatLib.chat(`${PREFIX} &aBoss Slain: &6${((timeFromKill-bossSpawned)/1000).toFixed(2)}`)

        bossSpawned = null
        bossSlainPacket = null
    }).setFilteredClass(S02PacketChat)

])
register("worldUnload", () => bossSpawned = null, bossSlainPacket = null)
