import { WorldState } from "../../../Atomx/skyblock/World"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { TextHelper } from "../../shared/Text"
import Party from "../../../Atomx/skyblock/Party"
import config from "../../config"

// Constant variables
const partyRegex = /^Party > \[?(?:MVP|VIP)?\+?\]? ?(.{1,16})\: \?(.+)$/
const feature = new Feature("PartyCommands", "Misc", "")
const dungeonFloors = ["catacombs_floor_one", "catacombs_floor_two", "catacombs_floor_three", "catacombs_floor_four", "catacombs_floor_five", "catacombs_floor_six", "catacombs_floor_seven"]
const kuudraTiers = ["normal", "hot", "burning", "fiery", "infernal"]

// Changeable variables
let commandCooldown = null

// Functions
const sendCommand = (command, clientSide = false) => {
    if (commandCooldown && (Date.now() - commandCooldown) <= 1000) return ChatLib.chat(`${TextHelper.PREFIX} &cCommands currently in cooldown`)

    ChatLib.command(command, clientSide)
    commandCooldown = Date.now()
}

const commands = {
    "pt": {
        description: "Transfer the party to the player that sent the message",
        fn: (name) => {
            if (Party.getLeader().toLowerCase() !== Player.getName().toLowerCase()) return
            sendCommand(`p transfer ${name}`)
        }
    },
    "allinv": {
        description: "Enables allinvites for the party",
        fn: () => {
            if (Party.getLeader().toLowerCase() !== Player.getName().toLowerCase()) return
            sendCommand("p settings allinvite")
        }
    },
    "warp": {
        description: "Warps the party",
        fn: () => {
            if (Party.getLeader().toLowerCase() !== Player.getName().toLowerCase()) return
            sendCommand("p warp")
        }
    },
    "private": {
        description: "Sends the party private games command",
        fn: () => {
            if (Party.getLeader().toLowerCase() !== Player.getName().toLowerCase()) return
            sendCommand(`p private`)
        }
    },
    "mute": {
        description: "Sends the party mute command",
        fn: () => {
            if (Party.getLeader().toLowerCase() !== Player.getName().toLowerCase()) return
            sendCommand(`p mute`)
        }
    },
    "ko": {
        description: "Sends the party kickoffline command",
        fn: () => {
            if (Party.getLeader().toLowerCase() !== Player.getName().toLowerCase()) return
            sendCommand(`p kickoffline`)
        }
    },
    "j": {
        description: "Sends the join catacombs commands",
        fn: (name, msg, num) => {
            if (Party.getLeader().toLowerCase() !== Player.getName().toLowerCase()) return
            sendCommand(`joindungeon ${dungeonFloors[parseInt(num) - 1]}`)
        }
    },
    "m": {
        description: "Sends the join master catacombs commands",
        fn: (name, msg, num) => {
            if (Party.getLeader().toLowerCase() !== Player.getName().toLowerCase()) return
            sendCommand(`joindungeon master_${dungeonFloors[parseInt(num) - 1]}`)
        }
    },
    "k": {
        description: "Sends the join kuudra command",
        fn: (name, msg, num) => {
            if (Party.getLeader().toLowerCase() !== Player.getName().toLowerCase()) return
            sendCommand(`joininstance kuudra_${kuudraTiers[parseInt(num) - 1]}`)
        }
    },
    "coord": {
        description: "Sends your current coords",
        fn: () => sendCommand(`pc x: ${Math.floor(Player.getX())}, y: ${Math.floor(Player.getY())}, z: ${Math.floor(Player.getZ())} `)
    },
    "fps": {
        description: "Sends your current fps",
        fn: () => sendCommand(`pc ${Client.getFPS()}fps`)
    },
    "where": {
        description: "Sends your current location. you can also specify the player otherwise it defaults to yourself",
        fn: (name, msg, playerName) => {
            if (!playerName) playerName = Player.getName()
            if (playerName.toLowerCase() !== Player.getName().toLowerCase()) return

            sendCommand(`pc ${WorldState.getCurrentWorld()} - ${WorldState.getCurrentArea()}`)
        }
    },
    "help": {
        description: "Sends this message help to the player",
        fn: () => {
            ChatLib.chat(`${TextHelper.PREFIX} &bParty Commands &6Help`)
            Object.keys(commands).forEach(cmdName => ChatLib.chat(`&b?${cmdName} &f- &7${this.commands[cmdName].description}`))
        }
    }
}

// Logic
const handleChat = (name, msg) => {
    if (!Party.inParty() || !config.partyCommands) return

    const messages = msg.split(" ")
    if (!(messages[0] in commands)) return

    commands[messages[0]].fn(name, ...messages)
}

// Events
new Event(feature, "onChatPacket", handleChat, () => World.isLoaded() && config.partyCommands, partyRegex)

// Starting events
feature.start()