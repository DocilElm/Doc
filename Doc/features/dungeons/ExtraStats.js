import { addEvent } from "../../FeatureBase"
import { S02PacketChat, isInTab } from "../../utils/Utils"

addEvent("showExtraStats", "Dungeon", register("packetReceived", (packet, event) => {
    if(!isInTab("Catacombs")) return

    const currentMessage = new Message(packet.func_148915_c()).getFormattedText().removeFormatting()

    if(currentMessage !== "                             > EXTRA STATS <") return

    ChatLib.command("showextrastats")
}).setFilteredClass(S02PacketChat), null, [], "Catacombs")