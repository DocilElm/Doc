import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"
import ScalableGui from "../../shared/Scalable"
import SplitsMaker from "../../shared/Splits"
import { WorldState } from "../../shared/World"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/Bloom/features/RunSplits.js

// Constant variables
const feature = new Feature("dungeonBossSplits", "Dungeons", "")
const defaultString = [
    `&dTerracotta&f: &610s`,
    `&bGiants&f: &610s`,
    `&aSadan&f: &610s`,
].join("\n")
const editGui = new ScalableGui("bossSplits", defaultString).setCommand("bossSplitsDisplay")
const bossSplits = Persistence.getDataFromURL("https://raw.githubusercontent.com/DocilElm/Doc/main/JsonData/BossSplits.json")
const splits = new SplitsMaker(editGui, bossSplits, () => WorldState.inDungeons() && config.dungeonBossSplits)

// Logic
const checkBossMessage = (bossName, _, __, formatted) => {
    const currentMessage = formatted.removeFormatting()

    // If the class hasn't been created we create it
    if (Persistence.dungeonBossEntryMessage.has(currentMessage) && !splits.objectCreated) {
        splits.setName(bossName).create()
        splits.entryTime = Date.now()
        
        return
    }

    // Check if the current boss's msg is in the split object
    // or if the split has already been created
    if (!bossSplits[splits.tempName]?.[currentMessage] || splits.splits[bossSplits[splits.tempName]?.[currentMessage]]) return
    
    // Add current time to the current splits basing it off of the chat msg
    splits.splits[bossSplits[splits.tempName]?.[currentMessage]] = Date.now()
}

// Default display
editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(defaultString, 0, 0)
    Renderer.finishDraw()
})

// Events
new Event(feature, "onChatPacket", checkBossMessage, null, /^\[BOSS\] ([\w ]+): (.+)$/)
new Event(feature, "onChatPacket", () => splits.splits[bossSplits[splits.tempName].Cleared] = Date.now(), () => bossSplits[splits.tempName], /                             > EXTRA STATS </)
new Event(feature, "onChatPacket", () => splits.splits[bossSplits[splits.tempName].Terms] = Date.now(), () => bossSplits[splits.tempName], "The Core entrance is opening!")
new Event(feature, "worldUnload", () => splits.reset())

// Starting events
feature.start()