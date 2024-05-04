import AtomxApi from "../../../Atomx/AtomxApi"
import request from "../../../requestV2"
import config from "../../config"
import { TextHelper } from "../../shared/Text"

const currentVersion = JSON.parse(FileLib.read("Doc", "metadata.json")).version

let shouldUpdate = false
let lastCheck = null

const File = Java.type("java.io.File")
const URL = Java.type("java.net.URL")
const PrintStream = Java.type("java.io.PrintStream")
const Byte = Java.type("java.lang.Byte")
const destination = `${Config.modulesFolder}/Doc/Doc.zip`
const normalDestination = `${Config.modulesFolder}/Doc`

const update = (url) => {
    // https://github.com/Soopyboo32/SoopyV2UpdateButtonPatcher/blob/master/index.js#L143
    try {
        const dir = new File(destination)
        dir.getParentFile().mkdirs()

        const connection = new URL(url).openConnection()

        connection.setDoOutput(true)
        connection.setConnectTimeout(10000)
        connection.setReadTimeout(10000)
        connection.setRequestMethod("GET")
        connection.connect()

        if (connection.getResponseCode() !== 200) {
            ChatLib.chat(`${TextHelper.PREFIX} &cThe connection was not successful`)
            connection.disconnect()

            return
        }

        const IS = connection.getInputStream()
        const FilePS = new PrintStream(dir)

        let buf = new Packages.java.lang.reflect.Array.newInstance(Byte.TYPE, 65536)
        let len;

        while ((len = IS.read(buf)) > 0) {
            FilePS.write(buf, 0, len)
        }

        IS.close()
        FilePS.close()
        connection.disconnect()

        if (!dir.exists()) return

        shouldUpdate = true

    } catch (error) {
        print(`${TextHelper.PREFIX}: ${error}`)
        ChatLib.chat(`${TextHelper.PREFIX} &cError while attempting to update: ${error}`)
    }
}

register("step", () => {
    if (!World.isLoaded()) return

    if (shouldUpdate) {
        shouldUpdate = false
        
        FileLib.unzip(destination, normalDestination)
        FileLib.deleteDirectory(destination)
        ChatLib.command("ct load", true)

        return
    }

    if (lastCheck && Date.now() - lastCheck < 30000 || !config.autoUpdater) return

    request({
        url: "https://api.github.com/repos/DocilElm/Doc/releases/latest",
        json: true
    })
    .then(data => {
        const newVersion = data.tag_name?.replace("v", "")
        const apiVersion = parseInt(newVersion.replace(/\./g, ""))
        const localVersion = parseInt(currentVersion.replace(/\./g, ""))

        if (apiVersion === localVersion) return

        ChatLib.command("docupdate", true)
    })
    .catch(error => ChatLib.chat(`${prefix} &cError while checking for update: ${error}`))

    lastCheck = Date.now()
}).setFps(1)

register("command", () => {
    request({
        url: "https://api.github.com/repos/DocilElm/Doc/releases/latest",
        json: true
    })
    .then(data => {
        const newVersion = data.tag_name?.replace("v", "")
        const apiVersion = parseInt(newVersion.replace(/\./g, ""))
        const localVersion = parseInt(currentVersion.replace(/\./g, ""))

        if (apiVersion === localVersion || localVersion > apiVersion) return ChatLib.chat(`${TextHelper.PREFIX} &aAlready up to date`)

        const changelogs = data.body.replace(/(`+(?:diff)?)/g, "").trim().split("\r\n")

        AtomxApi.sendChangelog(TextHelper.PREFIX, `&bDoc v${newVersion}`, changelogs, "&a-")
        update(data.assets[0].browser_download_url)
    })
    .catch(error => ChatLib.chat(`${TextHelper.PREFIX} &cError while checking for update: ${error}`))
}).setName("docupdate")