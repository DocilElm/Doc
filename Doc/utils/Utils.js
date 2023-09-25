import PogObject from "PogData"

export const PREFIX = "&0[&4Doc&0]&r"

export const data = new PogObject("Doc", {
    settings: {
        keybinds: {}
    }
}, ".data.json")

export const chat = (msg) => ChatLib.chat(msg)
export const chatid = (msg, id) => new Message(msg).setChatLineId(id).chat()
export const hover = (msg, value) => new TextComponent(msg).setHoverValue(value).chat()
export const breakchat = () => ChatLib.chat(ChatLib.getChatBreak(" "))
export const addCommas = (num) => num?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ',') ?? num

// bloom core probably has this so i'll just credit bloom for it ig
export const getScoreboard = (descending = false) => Scoreboard.getLines(descending)?.map(line => line?.getName()?.removeFormatting()?.replace(/[^\u0000-\u007F]/g, ""))
export const isInScoreboard = (str) => getScoreboard().some(a => a.includes(str))
export const isInTab = (str) => TabList.getNames()?.find(names => names.removeFormatting()?.match(/^Area|Dungeon: ([\w\d ]+)$/))?.includes(str)
export const checkConfig = (category, name) => data.settings[category][name]

// mc classes
export const EntityArmorStand = Java.type("net.minecraft.entity.item.EntityArmorStand")