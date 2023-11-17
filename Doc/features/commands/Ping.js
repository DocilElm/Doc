import { Command, Event } from "../../core/Events"
import { TextHelper } from "../../shared/Text"

// https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/commands/PingCommand.js

let time = null
let commandSent = null
let lastPingMsg = null

// Constant variables
const pingRegex = /^Unknown command\. Type "\/help" for help\. \('docisthebest'\)$/

// Events
new Command(null, "ping", () => {
    if (lastPingMsg && Date.now()-lastPingMsg <= 1000)
        return ChatLib.chat(`${TextHelper.PREFIX} &cYou're currently on cooldown`)

    time = Date.now()
    commandSent = true

    ChatLib.command("docisthebest")
}).start()

new Event(null, "chat", (event) => cancel(event), null, pingRegex).start()
new Event(null, "onChatPacket", () => {
    if (!commandSent) return

    const ping = Date.now()-time

    ChatLib.chat(`${TextHelper.PREFIX} &aPing: ${(ping <= 100 ? "&a" : ping <= 200 ? "&e" : "&c") + ping}ms`)

    time = null
    commandSent = false
    lastPingMsg = Date.now()
}, null, pingRegex).start()