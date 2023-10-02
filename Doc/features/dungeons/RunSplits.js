import { addEvent } from "../../FeatureBase"
import { PREFIX, S02PacketChat, data, entryMessages, getSeconds, isInTab, chat } from "../../utils/Utils"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/RunOverview.js
const editGui = new Gui()

const defaultSplits = [
    `&a&lRun Splits`,
    `&cBlood Opened&f: &a0s`,
    `&cBlood Done&f: &a0s`,
    `&5Portal Entry&f: &a0s`,
    `&bBoss Entry&f: &a0s`,
].join("\n")

let splits = null
let runStarted = null
let bloodOpened = null
let bloodDone = null
let bossEntry = null

addEvent("dungeonRunSplits", "Dungeons", register("packetReceived", (packet, event) => {
    if(!isInTab("Catacombs")) return

    const currentMessage = new Message(packet.func_148915_c()).getFormattedText().removeFormatting()

    if(!/^\[(BOSS|NPC)\] ([\w ]+): (.+)$/.test(currentMessage)) return

    if(currentMessage === "[NPC] Mort: Here, I found this map when I first entered the dungeon.") return runStarted = Date.now()
    if(currentMessage.startsWith("[BOSS] The Watcher:") && !bloodOpened) return bloodOpened = Date.now()
    if(currentMessage === "[BOSS] The Watcher: You have proven yourself. You may pass.") return bloodDone = Date.now()
    if(entryMessages.some(msg => msg === currentMessage)) return bossEntry = Date.now()
}).setFilteredClass(S02PacketChat), null, [
    register("tick", () => {
        if(!World.isLoaded() || !isInTab("Catacombs")) return

        const bloodOpenedStr = !bloodOpened && runStarted ? getSeconds(Date.now(), runStarted) : getSeconds(bloodOpened, runStarted)
        const bloodDoneStr = !bloodDone && bloodOpened ? getSeconds(Date.now(), bloodOpened) : getSeconds(bloodDone, bloodOpened)
        const portalEntryStr = !bossEntry && bloodDone ? getSeconds(Date.now(), bloodDone) : getSeconds(bossEntry, bloodDone)
        const bossEntryStr = !bossEntry && bloodDone ? getSeconds(Date.now(), runStarted) : getSeconds(bossEntry, runStarted)

        splits = [
            `&a&lRun Splits`,
            `&cBlood Opened&f: &a${bloodOpenedStr}`,
            `&cBlood Done&f: &a${bloodDoneStr}`,
            `&5Portal Entry&f: &a${portalEntryStr}`,
            `&bBoss Entry&f: &a${bossEntryStr}`,
        ].join("\n")
    }),
    register("renderOverlay", () => {
        if(editGui.isOpen()){
            Renderer.translate(data.runSplits.x, data.runSplits.y)
            Renderer.scale(data.runSplits.scale ?? 1)
            Renderer.drawStringWithShadow(`${defaultSplits}`, -10, -5)
            return
        }
        if(!World.isLoaded() || !isInTab("Catacombs") || !splits) return
    
        Renderer.translate(data.runSplits.x, data.runSplits.y)
        Renderer.scale(data.runSplits.scale ?? 1)
        Renderer.drawStringWithShadow(`${splits}`, -10, -5)
    })
], "Catacombs")

register("worldUnload", () => {
    splits = null
    runStarted = null
    bloodOpened = null
    bloodDone = null
    bossEntry = null
})

register("command", () => {
    if(!isInTab("Catacombs")) return chat(`${PREFIX} &cYou're not in the Catacombs`), Client.currentGui.close()

    editGui.open()
}).setName("runSplitsDisplay")

register("dragged", (dx, dy, x, y) => {
    if(!editGui.isOpen()) return

    data.runSplits.x = x
    data.runSplits.y = y
    data.save()
})

register("scrolled", (mx, mr, num) => {
    if(!editGui.isOpen()) return

    if(num === 1) data.runSplits.scale += 0.1
    else data.runSplits.scale -= 0.1

    data.save()
})