import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { WorldState } from "../../shared/World"
import renderBeaconBeam from "../../../BeaconBeam"
import config from "../../config"

// TODO: make this feature work with scoreboard packet
// instead of scanning the scoreboard every second

// Constant variables
const feature = new Feature("EffigiesWaypoint", "Rift", "")
const effigiesCoords = [
    [ 150, 73, 95 ],
    [ 193, 87, 119 ],
    [ 235, 103, 147 ],
    [ 293, 90, 134 ],
    [ 262, 93, 94 ],
    [ 240, 123, 118 ]
]
const list = new Map()

// Logic
const manhattanDistance = (x, y, x1, y1) => Math.abs(x - x1) + Math.abs(y - y1)

const renderWorld = () => {
    if (!list.size || !config.effigiesWaypoint) return

    list.forEach(it => {
        const distance = manhattanDistance(Player.getX(), Player.getZ(), it[0], it[2])

        Tessellator.drawString(
            `${Math.trunc(distance)}m`,
            it[0] + 0.5,
            it[1] + 5,
            it[2] + 0.5,
            Renderer.AQUA,
            true
            )
        renderBeaconBeam(it[0], it[1], it[2], 0, 1, 0, 1, true)
    })
}

const scanScoreboard = () => {
    if (WorldState.getCurrentArea() !== "Stillgore Chteau") return

    const findEffigies = WorldState.getScoreboard(false, false).find(it => it.includes("Effigies: "))
    if (!findEffigies) return

    const effigies = findEffigies.replace(/^Effigies: /, "")
    const arr = effigies.split("")

    arr.forEach((it, idx) => {
        if (it !== "7" && list.has(idx)) return list.delete(idx)
        if (it !== "7") return

        list.set(idx, effigiesCoords[idx])
    })
}

// Events
new Event(feature, "step", scanScoreboard, () => WorldState.getCurrentWorld() === "The Rift" && WorldState.getCurrentArea() === "Stillgore Chteau" && config.effigiesWaypoint, 1)
new Event(feature, "renderWorld", renderWorld, () => WorldState.getCurrentWorld() === "The Rift" && WorldState.getCurrentArea() === "Stillgore Chteau" && list.size && config.effigiesWaypoint)

// Starting events
feature.start()