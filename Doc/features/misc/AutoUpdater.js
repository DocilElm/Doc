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

/**
 * - Compares two strings that are meant to represent the [current] and [new] versions
 * - of this module (this only checks whether the [current] version is below the [new] version)
 * @param {String} version1 The [current] version
 * @param {String} version2 The [new] version
 * @returns {null|boolean}
 */
const compareTo = (version1, version2) => {
    const ver1 = version1.split(".")
    const ver2 = version2.split(".")
    // Checks which array has a greater length to use in the for-loop
    const len = Math.max(ver1.length, ver2.length)

    for (let i = 0; i < len; i++) {
        let currentVersion = parseInt(ver1[i])
        let newVersion = parseInt(ver2[i])

        // Checks whether the [current] version is less than the [new] version
        // returns true if it is otherwise returns nothing (which is falsy because js)
        if (currentVersion < newVersion) return true
    }
}

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

    if (lastCheck && Date.now() - lastCheck < 30000 || !config().autoUpdater) return

    request({
        url: "https://api.github.com/repos/DocilElm/Doc/releases/latest",
        json: true
    })
    .then(data => {
        const newVersion = data.tag_name?.replace("v", "")

        if (!compareTo(currentVersion, newVersion)) return

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

        if (!compareTo(currentVersion, newVersion)) return ChatLib.chat(`${TextHelper.PREFIX} &aAlready up to date`)

        const changelogs = data.body.replace(/(`+(?:diff)?)/g, "").trim().split("\r\n")

        AtomxApi.sendChangelog(TextHelper.PREFIX, `&bDoc v${newVersion}`, changelogs, "&a-")
        update(data.assets[0].browser_download_url)
    })
    .catch(error => ChatLib.chat(`${TextHelper.PREFIX} &cError while checking for update: ${error}`))
}).setName("docupdate")