import { decodeNumeral } from "../../BloomCore/utils/Utils"
import FeatureManager from "../core/FeatureManager"

// Constant used to get the packet's ENUMS
// and also filter the class in packetRecieved event
const S38PacketPlayerListItem = net.minecraft.network.play.server.S38PacketPlayerListItem

// making this function since it's used more than once
// to not be constantly repeating code but it's up for changes
const criteriaHandler = (fn, criteria, [unformatted, event, formatted]) => {
    // Check if the criteria is a regex or a string
    // Regex is way more intensive so only use that if needed

    // If it's empty give back the current message
    if(!criteria) return fn(unformatted, event, formatted)
    
    else if (typeof(criteria) === "string") {
        if (unformatted !== criteria) return

        return fn(unformatted, event, formatted)
    }
    else if (criteria instanceof RegExp) {
        const match = unformatted.match(criteria)
        if (!match) return
        
        // Call the eventFunction with parameters being the
        // matched groups as different params, ending with
        // the packet even and formatted message
        return fn(...match.slice(1), event, formatted)
    }
}

FeatureManager
    .createCustomEvent("command", (fn, commandName) =>  
        register("command", fn).setName(commandName).unregister()
    )
    .createCustomEvent("renderSpecificEntity", (fn, entityType) => 
        register("renderEntity", (entity, position, partialTicks, event) => {
            if(entity.entity instanceof entityType) return fn(entity, position, partialTicks, event)
        }).unregister()
    )
    .createCustomEvent("step", (fn, stepAmount) => 
        register("step", fn).setFps(stepAmount).unregister()
    )
    .createCustomEvent("onChatPacket", (fn, criteria) => 
        register("packetReceived", (packet, event) => {
            // Check if the packet is for the actionbar
            if (packet.func_148916_d()) return

            const chatComponent = packet.func_148915_c()        
            const formatted = chatComponent?.func_150254_d()
            const unformatted = formatted?.removeFormatting()
        
            if (!unformatted) return
            
            criteriaHandler(fn, criteria, [unformatted, event, formatted])
        }).setFilteredClass(net.minecraft.network.play.server.S02PacketChat).unregister()
    )
    .createCustomEvent("onActionBarPacket", (fn, criteria) => 
        register("packetReceived", (packet, event) => {
            // Check if the packet is for the actionbar
            if (!packet.func_148916_d()) return

            const chatComponent = packet.func_148915_c()        
            const formatted = chatComponent?.func_150254_d()
            const unformatted = formatted?.removeFormatting()
            
            if (!unformatted) return
            
            criteriaHandler(fn, criteria, [unformatted, event, formatted])
        }).setFilteredClass(net.minecraft.network.play.server.S02PacketChat).unregister()
    )
    .createCustomEvent("soundPlay", (fn, criteria) => 
        register("soundPlay", fn).setCriteria(criteria).unregister()
    )
    .createCustomEvent("onScoreboardPacket", (fn, criteria) => 
        register("packetReceived", (packet, event) => {
            const channel = packet.func_149307_h()
            if (channel !== 2) return

            const teamStr = packet.func_149312_c()
            const teamMatch = teamStr.match(/^team_(\d+)$/)
            if (!teamMatch) return

            const formatted = packet.func_149311_e().concat(packet.func_149309_f())
            const unformatted = formatted.removeFormatting()

            if (!unformatted) return
            
            criteriaHandler(fn, criteria, [unformatted, event, formatted])
        }).setFilteredClass(net.minecraft.network.play.server.S3EPacketTeams).unregister()
    )
    .createCustomEvent("onTabUpdatePacket", (fn, criteria) => 
        register("packetReceived", (packet, event) => {
            const players = packet.func_179767_a() // .getPlayers()
            const action = packet.func_179768_b() // .getAction()

            if (action !== S38PacketPlayerListItem.Action.UPDATE_DISPLAY_NAME) return

            players.forEach(addPlayerData => {
                const name = addPlayerData.func_179961_d() // .getDisplayName()
                
                if (!name) return

                const formatted = name.func_150254_d() // .getFormattedText()
                const unformatted = formatted.removeFormatting()
            
                if (action !== S38PacketPlayerListItem.Action.UPDATE_DISPLAY_NAME) return

                criteriaHandler(fn, criteria, [unformatted, event, formatted])
            })
        }).setFilteredClass(S38PacketPlayerListItem).unregister()
    )
    .createCustomEvent("onTabAddPacket", (fn, criteria) => 
        register("packetReceived", (packet, event) => {
            const players = packet.func_179767_a() // .getPlayers()
            const action = packet.func_179768_b() // .getAction()

            if (action !== S38PacketPlayerListItem.Action.ADD_PLAYER) return

            players.forEach(addPlayerData => {
                const name = addPlayerData.func_179961_d() // .getDisplayName()
                
                if (!name) return

                const formatted = name.func_150254_d() // .getFormattedText()
                const unformatted = formatted.removeFormatting()
            
                if (action !== S38PacketPlayerListItem.Action.ADD_PLAYER) return

                criteriaHandler(fn, criteria, [unformatted, event, formatted])
            })
        }).setFilteredClass(S38PacketPlayerListItem).unregister()
    )
    .createCustomEvent("onBlessingsChange", (fn, decodeNumb = false) => 
        register("packetReceived", (packet, event) => {
            let blessingsArray = []

            packet.func_179701_b()?.func_150253_a()?.forEach(chatComponent => {
                const chatComponentText = chatComponent.func_150254_d()?.removeFormatting()

                if(!/^Blessing of (.+)$/.test(chatComponentText)) return
                if(decodeNumb) {
                    const [ ar, blessingName, romanNumber ] = chatComponentText.match(/^Blessing of ([\w\d]+) ([IVXLCDM]+)$/)

                    blessingsArray.push(chatComponentText.replace(romanNumber, decodeNumeral(romanNumber)))
                    return
                }
                blessingsArray.push(chatComponentText.match(/^Blessing of (.+)$/)?.[1])
            })

            fn(blessingsArray)
        }).setFilteredClass(net.minecraft.network.play.server.S47PacketPlayerListHeaderFooter).unregister()
    )