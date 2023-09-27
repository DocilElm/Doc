import { PREFIX, S02PacketChat } from "../../utils/Utils"

// https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/commands/PingCommand.js

let time = null
let commandSent = null
let lastPingMsg = null

register("command", () => {
    if(lastPingMsg !== null && Date.now()-lastPingMsg <= 1000) return ChatLib.chat(`${PREFIX} &cYou're currently on cooldown`)

    time = Date.now()
    commandSent = true

    ChatLib.command("docisthebest")
}).setName("ping")

register("chat", (event) => cancel(event)).setCriteria(/^Unknown command\. Type "\/help" for help\. \('docisthebest'\)$/)

register("packetReceived", (packet, event) => {
    if(!commandSent || !new Message(packet.func_148915_c()).getUnformattedText().includes(`Unknown command. Type "/help" for help. ('docisthebest')`)) return

    const ping = Date.now()-time

    ChatLib.chat(`${PREFIX} &aPing: ${(ping <= 100 ? "&a" : ping <= 200 ? "&e" : "&c") + ping}ms`)

    time = null
    commandSent = false
    lastPingMsg = Date.now()
}).setFilteredClass(S02PacketChat)