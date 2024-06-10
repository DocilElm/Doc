import { TextHelper } from "../../shared/Text"
import renderBeaconBeam from "../../../BeaconBeam"
import config from "../../config"
import { Feature } from "../../core/Feature"
import { Command, Event } from "../../core/Events"
import { Persistence } from "../../shared/Persistence"

// Constant variables
const feature = new Feature("ChatWaypoint", "Misc", "")
const chatRegex = /^(Co-op|Party)?(?: > )?(?:\[\d+\] .? ?)?(?:\[[\w\+]+\] )?(\w{1,16})\: x\: (.{1,4}), y\: (.{1,4}), z\: (.{1,4})$/
const blocks = new Map()

// Logic
const manhattanDistance = (x, y, x1, y1) => Math.abs(x - x1) + Math.abs(y - y1)

const onChatPacket = (type, name, x1, y1, z1) => {
    if (!config().chatWaypoint) return
    if (Persistence.data.chatWaypointNames.some(it => it === name.toLowerCase())) return
    if (!type && !config().chatWaypointAll) return
    if (type === "Co-op" && !config().chatWaypointCoop) return
    if (type === "Party" && !config().chatWaypointParty) return

    const [ x, y, z ] = [ parseFloat(x1), parseFloat(y1), parseFloat(z1) ]
    const arrstr = [x, y, z].toString()

    if (blocks.has(arrstr)) return

    blocks.set(arrstr, [x, y, z])
    ChatLib.chat(`${TextHelper.PREFIX} &aSet waypoint at &b${x}, ${y}, ${z}`)
}

const renderWorld = () => {
    if (!blocks.size || !World.isLoaded()) return

    blocks.forEach((it, key) => {
        const distance = manhattanDistance(Player.getX(), Player.getZ(), it[0], it[2])

        // Remove the waypoint if the player already went near it
        if (distance <= 10) return blocks.delete(key)

        Tessellator.drawString(
            `${Math.trunc(distance)}m`,
            it[0] + .5,
            it[1] + 5,
            it[2] + .5,
            Renderer.AQUA,
            true
            )
        renderBeaconBeam(it[0], it[1], it[2], 0, 1, 0, 1, true)
    })
}

// Events
new Event(feature, "onChatPacket", onChatPacket, () => config().chatWaypoint, chatRegex)
new Event(feature, "renderWorld", renderWorld, () => blocks.size && World.isLoaded())
new Event(feature, "worldUnload", () => blocks.clear())
new Command(feature, "chatwaypoint", (type, name) => {
    if (!type) {
        ChatLib.chat(`${TextHelper.PREFIX} &cMakes sure to add a type &7(types: add, remove, clear)&c and a username.&7(clear does not require a username)`)

        return
    }
    if (type.toLowerCase() === "add") {
        Persistence.data.chatWaypointNames.push(name.toLowerCase())
        Persistence.data.save()
        
        ChatLib.chat(`${TextHelper.PREFIX} &c${name.toLowerCase()} &aWas added to the blacklist`)

        return
    }

    if (type.toLowerCase() === "clear") {
        blocks.clear()
        ChatLib.chat(`${TextHelper.PREFIX} &aAll waypoints have been deleted`)

        return
    }
    if (type.toLowerCase() !== "remove") return

    const idx = Persistence.data.chatWaypointNames.indexOf(name.toLowerCase())
    Persistence.data.chatWaypointNames.splice(idx, 1)
    Persistence.data.save()

    ChatLib.chat(`${TextHelper.PREFIX} &b${name.toLowerCase()} &aWas removed from the blacklist`)
})

// Starting events
feature.start()