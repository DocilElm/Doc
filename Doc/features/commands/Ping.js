import { PREFIX } from "../../utils/Utils"

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

register("chat", (event) => {
    if(!commandSent) return
    cancel(event)

    const ping = Date.now()-time

    ChatLib.chat(`${PREFIX} &aPing: ${(ping <= 100 ? "&a" : ping <= 200 ? "&e" : "&c") + ping}ms`)

    time = null
    commandSent = false
    lastPingMsg = Date.now()
}).setCriteria(/^Unknown command\. Type "\/help" for help\. \('docisthebest'\)$/)