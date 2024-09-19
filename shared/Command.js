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
    if (!args) return config().getConfig().openGui()

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
})
    .setTabCompletions((arg) => {
        if (arg.length > 1) return []
        const allCommands = Object.keys(commands)
        if (!arg[0]) return allCommands

        const curr = allCommands.find(it => it.toLowerCase().startsWith(arg[0]?.toLowerCase()))
        if (!curr) return []

        return [curr]
    })
    .setName("doc")