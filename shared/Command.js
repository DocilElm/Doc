import config from "../config"
import { TextHelper } from "./TextHelper"

const commands = {}

export const addCommand = (name, description, fn) => {
    const component = new TextComponent(`&a- ${name} &b${description}`)
        .setHover("show_text", `Click to run /doc ${name}`)
        .setClick("run_command", `/doc ${name}`)

    commands[name] = {
        description,
        chat: () => component.chat(),
        fn
    }
}

addCommand("help", "Shows this list")

register("command", (...args) => {
    if (!args[0]) return config().getConfig().openGui()

    if (args[0].toLowerCase() === "help") {
        ChatLib.chat(`${TextHelper.PREFIX} &aCommand List`)
        Object.keys(commands).forEach(k => {
            commands[k].chat()
        })

        return
    }

    const cmd = commands[args[0]]
    if (!cmd) return ChatLib.chat(`${TextHelper.PREFIX} &cInvalid command.`)

    cmd.fn?.(...args.slice(1))
}).setName("doc")