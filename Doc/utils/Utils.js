import request from "../../requestV2"
import Promise from "../../PromiseV2"
import PogObject from "PogData"

export const PREFIX = "&0[&4Doc&0]&r"

export const data = new PogObject("Doc", {
    settings: {
        keybinds: {}
    },
    ragaxecd: {x: 10, y: 10},
    miningProfit: {x: 10, y: 10, scale: 1},
    apiCheckTime: null
}, "data/.data.json")

export const chat = (msg) => ChatLib.chat(msg)
export const chatid = (msg, id) => new Message(msg).setChatLineId(id).chat()
export const hover = (msg, value) => new TextComponent(msg).setHoverValue(value).chat()
export const breakchat = () => ChatLib.chat(ChatLib.getChatBreak(" "))
export const addCommas = (num) => num?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ',') ?? num
export const mathTrunc = (num) => addCommas(Math.trunc((Math.round(num * 100) / 100)))

// bloom core probably has this so i'll just credit bloom for it ig
export const getScoreboard = (descending = false) => Scoreboard.getLines(descending)?.map(line => line?.getName()?.removeFormatting()?.replace(/[^\u0000-\u007F]/g, ""))

export const isInScoreboard = (str) => getScoreboard().some(a => a.includes(str))
export const isInTab = (str) => TabList.getNames()?.find(names => names.removeFormatting()?.match(/^Area|Dungeon: ([\w\d ]+)$/))?.includes(str)
export const checkConfig = (category, name) => data.settings[category][name]
export const getTime = (oldDate) => {
    const seconds = Math.round((Date.now() - oldDate) / 1000 % 60)
    const mins = Math.floor((Date.now() - oldDate) / 1000 / 60 % 60)
    const hours = Math.floor((Date.now() - oldDate) / 1000 / 60 / 60 % 24)

    return `${hours}:${mins}:${seconds}`
}
export const isBetween = (number, [min, max]) => (number-min) * (number-max) <= 0

// mc classes
export const EntityArmorStand = Java.type("net.minecraft.entity.item.EntityArmorStand")
export const BlockPosMc = Java.type("net.minecraft.util.BlockPos")
export const C08PacketPlayerBlockPlacement = Java.type("net.minecraft.network.play.client.C08PacketPlayerBlockPlacement")
export const S02PacketChat = Java.type("net.minecraft.network.play.server.S02PacketChat")

// api stuff

export const makeRequest = (url) => request({url: url, headers: { 'User-Agent': ' Mozilla/5.0', 'Content-Type': 'application/json' }, json: true})
export const printError = (error) => hover(`${PREFIX} &cError Getting Data`, JSON.stringify(error))

/**
 * 
 * @param {string} dir The directory where the file is going to be saved
 * @param {string} fileName The file name
 * @param {object} dataToSave The object to be saved as json format
 * @param {boolean} recursive Whether to create folders to the file location if they don't exist
 */
const saveToFile = (fileName, dataToSave = {}, recursive = true) => {
    FileLib.write("Doc", fileName, JSON.stringify(dataToSave), recursive)
}

export const getJsonDataFromFile = (fileName) => JSON.parse(FileLib.read("Doc", fileName)) ?? {}

const refreshLbApi = () => {
    if(!!data.apiCheckTime && Date.now()-data.apiCheckTime <= (1000*60)*5) return

    Promise.all([
        makeRequest("https://moulberry.codes/lowestbin.json"),
        makeRequest("https://api.hypixel.net/skyblock/bazaar")
    ]).then(apiData => {
        saveToFile("data/LowestBin.json", apiData[0])
        saveToFile("data/Bazaar.json", apiData[1])
        data.apiCheckTime = Date.now()
        data.save()
    }).catch(e => {
        print(e)
        print(JSON.stringify(e))
    })
    
}

register("step", () => refreshLbApi()).setDelay(60*5)
register("gameLoad", () => refreshLbApi())