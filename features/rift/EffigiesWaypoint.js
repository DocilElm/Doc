import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import Location from "../../shared/Location"
import { RenderHelper } from "../../shared/Render"

const effigiesCoords = [
    [ 150, 73, 95 ],
    [ 193, 87, 119 ],
    [ 235, 103, 147 ],
    [ 293, 90, 134 ],
    [ 262, 93, 94 ],
    [ 240, 123, 118 ]
]

let waypoints = []

const feat = new Feature("effigiesWaypoint", "the rift")
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.SCOREBOARD, (_, format) => {
            const m = format.match(/§(\w)⧯/g)

            for (let idx = 0; idx < m.length; idx++) {
                let it = m[idx]?.[1]
                if (!it) continue

                if (it === "c" && waypoints[idx]) {
                    waypoints.splice(idx, 1)
                    feat.update()
                    continue
                }
                if (it === "c") continue

                waypoints[idx] = effigiesCoords[idx]
            }

            feat.update()
        }, /^Effigies: ⧯⧯⧯⧯⧯⧯$/)
    )
    .addSubEvent(
        new Event("renderWorld", () => {
            for (let coord of waypoints) {
                if (!coord) continue
                let distance = Math.hypot(Player.getX() - coord[0], Player.getZ() - coord[2])
                RenderHelper.renderWaypoint(
                    `${distance.toFixed(2)}m`,
                    coord[0],
                    coord[1],
                    coord[2],
                    0, 255, 255, 255
                )
            }
        }),
        () => waypoints.length
    )
    .onUnregister(() => {
        waypoints = []
    })

Location.onAreaChange((areaName) => {
    if (areaName?.includes("stillgore")) return

    waypoints = []
    feat.update()
})