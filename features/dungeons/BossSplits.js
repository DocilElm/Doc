import AtomxApi from "../../../Atomx/AtomxApi"
import { scheduleTask } from "../../core/CustomRegisters"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import CustomSplits from "../../shared/CustomSplits"
import DraggableGui from "../../shared/DraggableGui"
import Location from "../../shared/Location"
import { Persistence } from "../../shared/Persistence"

const editGui = new DraggableGui("bossSplits").setCommandName("editbosssplits")
const dungeonFloorRegex = AtomxApi.getRegexData().Dungeons.Floor
const bossSplits = Persistence.getDataFromFileOrLink("BossSplits.json", "https://raw.githubusercontent.com/DocilElm/Doc-Data/refs/heads/main/dungeons/BossSplits.json")
const defaultString = [
    `&dTerracotta&f: &a10s`,
    `&bGiants&f: &a10s`,
    `&aSadan&f: &a10s`,
].join("\n")

let previousFloor = null
let split = null

const onFloor = (floor, feat) => {
    if (floor === previousFloor) return

    const floorNum = parseInt(floor.replace(/F|M/, ""))
    const floorName = floorNum < 7 ? `F${floorNum}` : floor

    previousFloor = floor
    split = new CustomSplits(bossSplits[floorName], () => true)
    split.onTimeUpdate = () => scheduleTask(() => feat.update())
    split.getEvents().forEach(it => feat.addSubEvent(it, () => Location.inWorld("catacombs")))
    feat.update()
}

editGui.onDraw(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(defaultString, 0, 0)
    Renderer.finishDraw()
})

const feat = new Feature("dungeonBossSplits", "catacombs")
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.SCOREBOARD, (floor) => {
            onFloor(floor, feat)
        }, dungeonFloorRegex)
    )
    .addSubEvent(
        new Event("renderOverlay", () => {
            Renderer.retainTransforms(true)
            Renderer.translate(editGui.getX(), editGui.getY())
            Renderer.scale(editGui.getScale())
            Renderer.drawStringWithShadow("&bBoss Splits", 0, 0)

            Renderer.drawStringWithShadow(split.buildStr(), 0, 10)

            Renderer.retainTransforms(false)
            Renderer.finishDraw()
        }),
        () => split !== null && split?.timers?.[0]?.timer !== null
    )
    .onUnregister(() => {
        // References BE GONE!
        if (split) {
            const events = split.events
            for (let idx = events.length - 1; idx >= 0; idx--) {
                events[idx].unregister()
                events.splice(idx, 1)
            }

            const subevents = feat.subevents
            for (let idx = subevents.length - 1; idx >= 0; idx--) {
                // "renderOverlay" event _should_ always be the first sub event so we ignore it
                if (idx === 0) continue

                subevents.splice(idx, 1)
            }
            split.onTimeUpdate = null
        }
        split = null
        previousFloor = null
    })