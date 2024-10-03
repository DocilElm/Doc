import config from "../../config"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { addCommand } from "../../shared/Command"
import { Persistence } from "../../shared/Persistence"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/TextHelper"

const chatRegex = /^(Co-op|Party)?(?: > )?(?:\[\d+\] .? ?)?(?:\[[^\]]+\] )?(\w{1,16}): x: (-?\d+), y: (-?\d+), z: (-?\d+)$/
const coords = new Map()

const distanceTo = (x, y, z, x1, y1, z1) => Math.hypot(x - x1, y - y1, z - z1)

const feat = new Feature("chatWaypoint")
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, (type, username, x1, y1, z1) => {
            if (Persistence.data.chatWaypointNames.some(it => it === username.toLowerCase())) return
            if (!type && !config().chatWaypointAll) return
            if (type === "Co-op" && !config().chatWaypointCoop) return
            if (type === "Party" && !config().chatWaypointParty) return

            const coord = [ Math.floor(x1), Math.floor(y1), Math.floor(z1) ]
            if (coords.has(`${coord}`)) return

            coords.set(`${coord}`, coord)
            ChatLib.chat(`${TextHelper.PREFIX} &aSet waypoint at &b${coord[0]}, ${coord[1]}, ${coord[2]}`)

            feat.update()
        }, chatRegex)
    )
    .addSubEvent(
        new Event("renderWorld", () => {
            coords.forEach(it => {
                const [ x, y, z ] = it
                const distance = distanceTo(Player.getX(), Player.getY(), Player.getZ(), x, y, z)

                if (distance < 3) return coords.delete(`${it}`)

                RenderHelper.renderWaypoint(
                    `${distance.toFixed(2)}m`,
                    x, y, z,
                    0, 255, 0, 255
                )
            })
        }),
        () => coords.size
    )
    .onUnregister(() => {
        coords.clear()
    })

// Blacklist command
addCommand("ctw", "&6Chat waypoints Blacklist commands", (mode, name) => {
    if (!mode)
        return ChatLib.chat(`${TextHelper.PREFIX} &cMakes sure to add a mode &7(modes: add, remove, clear)&c and a username.&7(clear does not require a username)`)

    switch (mode.toLowerCase()) {
        case "add":
            Persistence.data.chatWaypointNames.push(name.toLowerCase())
            Persistence.data.save()

            ChatLib.chat(`${TextHelper.PREFIX} &c${name.toLowerCase()} &aWas added to the blacklist`)
            break
        
        case "clear":
            coords.clear()
            ChatLib.chat(`${TextHelper.PREFIX} &aAll waypoints have been deleted`)
            break
        
        case "remove": {
            const idx = Persistence.data.chatWaypointNames.indexOf(name.toLowerCase())
            Persistence.data.chatWaypointNames.splice(idx, 1)
            Persistence.data.save()

            ChatLib.chat(`${TextHelper.PREFIX} &b${name.toLowerCase()} &aWas removed from the blacklist`)
            break
        }

        default:
            ChatLib.chat(`${TextHelper.PREFIX} &cYou did not enter a correct mode.`)
            break
    }
})