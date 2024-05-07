import { WorldState } from "../../../Atomx/skyblock/World"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { RenderHelper } from "../../shared/Render"

// Constant variables
const feature = new Feature("PartyFinderOverlay", "Misc", "")
const partyMembersRegex = /^ \w{1,16}\: (\w+) \((\d+)\)$/
const levelRequiredRegex = /^Dungeon Level Required\: (\d+)$/
const partyData = new Map()
const classNames = [ "&6Archer", "&fTank", "&cBerserk", "&aHealer", "&bMage" ]

// Changeable variables
let shouldScan = false

// Logic
const onOpenWindow = (name) => shouldScan = name === "Party Finder"

const scanItemStack = (mcItemStacks) => {
    if (!shouldScan) return
    partyData.clear()

    mcItemStacks.forEach((mcItem, idx) => {
        if (!mcItem && partyData.has(idx)) return partyData.delete(idx)
        if (!mcItem || idx >= 36) return

        const item = new Item(mcItem)
        if (item.getID() === 160 || item.getID() === 7) return
        if (partyData.has(idx)) partyData.delete(idx)

        const itemLore = item.getLore()

        let classes = []
        let levelRequired = 0

        itemLore.forEach(it => {
            if (levelRequiredRegex.test(it.removeFormatting())) {
                levelRequired = parseInt(it.removeFormatting().match(levelRequiredRegex)[1])

                return
            }

            if (!partyMembersRegex.test(it.removeFormatting())) return

            const [ _, className ] = it.removeFormatting().match(partyMembersRegex)

            classes.push(className)
        })

        // Too lazy and it's late so this happened
        const missingClasses = classNames.filter(name => classes.indexOf(name.removeFormatting()) === -1).map(it => it.slice(0, 3))
        const scale = missingClasses.length >= 3 ? 0.7 : 1
        const missingStr = missingClasses.splice(0, 2).join("")
        const p2 = missingClasses.splice(0, 2).join("")
        const missing = `${missingStr}\n${p2}`

        partyData.set(idx, {
            idx: idx,
            missing: missing,
            levelRequired: levelRequired,
            scale: scale
        })
    })

    shouldScan = false
}

const onGuiRender = () => {
    if (!partyData.size || !config.partyFinderOverlay) return
    if (Player.getContainer().getName() !== "Party Finder") return partyData.clear()

    partyData.forEach(obj => {
        const [ x, y ] = RenderHelper.getSlotRenderPosition(obj.idx)

        Renderer.translate(x, y, 300)
        Renderer.scale(obj.scale)
        Renderer.drawStringWithShadow(obj.missing, -1, 0)
        Renderer.translate(x, y, 300)
        Renderer.drawStringWithShadow(`&c${obj.levelRequired}`, 2, 10)
        Renderer.finishDraw()
    })
}

// Events
new Event(feature, "onOpenWindowPacket", onOpenWindow, () => World.isLoaded() && WorldState.getCurrentWorld() !== "Crimson Isle" && config.partyFinderOverlay)
new Event(feature, "onWindowItemsPacket", scanItemStack, () => WorldState.getCurrentWorld() !== "Crimson Isle" && config.partyFinderOverlay)
new Event(feature, "guiRender", onGuiRender, () => WorldState.getCurrentWorld() !== "Crimson Isle" && partyData.size && config.partyFinderOverlay)

// Starting events
feature.start()