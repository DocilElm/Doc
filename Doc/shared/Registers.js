import FeatureManager from "../core/FeatureManager"
import { TextHelper } from "./Text"

// Constant used to get the packet's ENUMS
// and also filter the class in packetRecieved event
const S38PacketPlayerListItem = net.minecraft.network.play.server.S38PacketPlayerListItem

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
    .createCustomEvent("chat", (fn, criteria) => 
        register("chat", fn).setCriteria(criteria)
    )
    .createCustomEvent("onChatPacket", (fn, criteria) => 
        register("packetReceived", (packet, event) => {
            // Check if the packet is for the actionbar
            if (packet.func_148916_d()) return

            const chatComponent = packet.func_148915_c()        
            const formatted = chatComponent?.func_150254_d()
            const unformatted = formatted?.removeFormatting()
        
            if (!unformatted) return
            
            TextHelper.matchesCriteria(fn, criteria, unformatted, event, formatted)
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
            
            TextHelper.matchesCriteria(fn, criteria, unformatted, event, formatted)
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
            
            TextHelper.matchesCriteria(fn, criteria, unformatted, event, formatted)
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

                TextHelper.matchesCriteria(fn, criteria, unformatted, event, formatted)
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

                TextHelper.matchesCriteria(fn, criteria, unformatted, event, formatted)
            })
        }).setFilteredClass(S38PacketPlayerListItem).unregister()
    )
    .createCustomEvent("onBlessingsChange", (fn, decodeRomanNumeral = false) => 
        register("packetReceived", (packet, _) => {
            let blessingsArray = []

            packet.func_179701_b()?.func_150253_a()?.forEach(chatComponent => {
                const chatComponentText = chatComponent.func_150254_d()?.removeFormatting()

                if (!/^Blessing of (.+)$/.test(chatComponentText)) return
                if (!decodeRomanNumeral) blessingsArray.push(chatComponentText.match(/^Blessing of (.+)$/)?.[1])
                
                
                const romanNumeral = chatComponentText.match(/^Blessing of [\w\d]+ ([IVXLCDM]+)$/)?.[1]

                blessingsArray.push(chatComponentText.replace(romanNumeral, TextHelper.decodeNumeral(romanNumeral)))
            })

            fn(blessingsArray)
            blessingsArray = null
        }).setFilteredClass(net.minecraft.network.play.server.S47PacketPlayerListHeaderFooter).unregister()
    )
    .createCustomEvent("onWindowItemsPacket", (fn) => 
        register("packetReceived", (packet, _) => {
            fn(packet.func_148910_d())
        }).setFilteredClass(net.minecraft.network.play.server.S30PacketWindowItems).unregister()
    )
    .createCustomEvent("onOpenWindowPacket", (fn) => 
        register("packetReceived", (packet, _) => {
            const windowTitle = packet.func_179840_c().func_150254_d().removeFormatting()
            const windowID = packet.func_148901_c()
            const hasSlots = packet.func_148900_g()
            const slotCount = packet.func_148898_f()
            const guiID = packet.func_148902_e()
            const entityID = packet.func_148897_h()
        
            fn(windowTitle, windowID, hasSlots, slotCount, guiID, entityID)
        }).setFilteredClass(net.minecraft.network.play.server.S2DPacketOpenWindow).unregister()
    )
    .createCustomEvent("onPlayerBlockPlacement", (fn) => 
        register("packetSent", (packet, _) => {
            const position = packet.func_179724_a()
            const blockPosition = new BlockPos(position)
        
            const [ x, y, z ] = [blockPosition.x, blockPosition.y, blockPosition.z]
            const ctBlock = World.getBlockAt(x, y, z)

            fn(ctBlock, [x, y, z], blockPosition)
        }).setFilteredClass(net.minecraft.network.play.client.C08PacketPlayerBlockPlacement)
    )
    .createCustomEvent("onClickWindowPacket", (fn) => 
        register("packetSent", (packet, _) => {
            // Container name, Slot clicked
            fn(Player.getContainer().getName(), packet.func_149544_d())
        }).setFilteredClass(net.minecraft.network.play.client.C0EPacketClickWindow)
    )
    .createCustomEvent("onPuzzleRotation", (fn) => {
        let lastDungeonsIdx = null
        let timesScanned = 0
        let hasRotation = false

        return register("tick", () => {
            const currentIdx = TextHelper.getDungeonsPosIndex()

            // Reset variables if the player leaves the room
            if (lastDungeonsIdx && currentIdx !== lastDungeonsIdx) {
                lastDungeonsIdx = null
                timesScanned = 0
                hasRotation = false

                return
            }

            if (currentIdx === lastDungeonsIdx && timesScanned >= 30 || hasRotation) return

            lastDungeonsIdx = currentIdx
            timesScanned++

            const rotation = TextHelper.getPuzzleRotation()
            if (rotation == null) return

            hasRotation = true
            fn(rotation, currentIdx)
        }).unregister()
    })
    .createCustomEvent("onPacketPlayerPosLook", (fn) =>
        register("packetReceived", (packet) => {
            const [ x, y, z ] = [ packet.func_148932_c(), packet.func_148928_d(), packet.func_148933_e() ]
            const [ yaw, pitch ] = [ packet.func_148931_f(), packet.func_148930_g() ]

            fn([x, y, z], yaw, pitch)
        }).setFilteredClass(net.minecraft.network.play.server.S08PacketPlayerPosLook).unregister()
    )