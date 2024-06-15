import FeatureManager from "../core/FeatureManager"
import { TextHelper } from "./Text"

// Constant used to get the packet's ENUMS
// and also filter the class in packetRecieved event
const S38PacketPlayerListItem = net.minecraft.network.play.server.S38PacketPlayerListItem
const EnumParticleTypes = net.minecraft.util.EnumParticleTypes

// Just for auto completion
export const ParticleEnums = {
    BARRIER: EnumParticleTypes.BARRIER,
    BLOCK_CRACK: EnumParticleTypes.BLOCK_CRACK,
    BLOCK_DUST: EnumParticleTypes.BLOCK_DUST,
    CLOUD: EnumParticleTypes.CLOUD,
    CRIT: EnumParticleTypes.CRIT,
    CRIT_MAGIC: EnumParticleTypes.CRIT_MAGIC,
    DRIP_LAVA: EnumParticleTypes.DRIP_LAVA,
    DRIP_WATER: EnumParticleTypes.DRIP_WATER,
    ENCHANTMENT_TABLE: EnumParticleTypes.ENCHANTMENT_TABLE,
    EXPLOSION_HUGE: EnumParticleTypes.EXPLOSION_HUGE,
    EXPLOSION_LARGE: EnumParticleTypes.EXPLOSION_LARGE,
    EXPLOSION_NORMAL: EnumParticleTypes.EXPLOSION_NORMAL,
    FIREWORKS_SPARK: EnumParticleTypes.FIREWORKS_SPARK,
    FLAME: EnumParticleTypes.FLAME,
    FOOTSTEP: EnumParticleTypes.FOOTSTEP,
    HEART: EnumParticleTypes.HEART,
    ITEM_CRACK: EnumParticleTypes.ITEM_CRACK,
    ITEM_TAKE: EnumParticleTypes.ITEM_TAKE,
    LAVA: EnumParticleTypes.LAVA,
    MOB_APPEARANCE: EnumParticleTypes.MOB_APPEARANCE,
    NOTE: EnumParticleTypes.NOTE,
    PORTAL: EnumParticleTypes.PORTAL,
    REDSTONE: EnumParticleTypes.REDSTONE,
    SLIME: EnumParticleTypes.SLIME,
    SMOKE_LARGE: EnumParticleTypes.SMOKE_LARGE,
    SMOKE_NORMAL: EnumParticleTypes.SMOKE_NORMAL,
    SNOW_SHOVEL: EnumParticleTypes.SNOW_SHOVEL,
    SNOWBALL: EnumParticleTypes.SNOWBALL,
    SPELL: EnumParticleTypes.SPELL,
    SPELL_INSTANT: EnumParticleTypes.SPELL_INSTANT,
    SPELL_MOB: EnumParticleTypes.SPELL_MOB,
    SPELL_MOB_AMBIENT: EnumParticleTypes.SPELL_MOB_AMBIENT,
    SPELL_WITCH: EnumParticleTypes.SPELL_WITCH,
    SUSPENDED: EnumParticleTypes.SUSPENDED,
    SUSPENDED_DEPTH: EnumParticleTypes.SUSPENDED_DEPTH,
    TOWN_AURA: EnumParticleTypes.TOWN_AURA,
    VILLAGER_ANGRY: EnumParticleTypes.VILLAGER_ANGRY,
    VILLAGER_HAPPY: EnumParticleTypes.VILLAGER_HAPPY,
    WATER_BUBBLE: EnumParticleTypes.WATER_BUBBLE,
    WATER_DROP: EnumParticleTypes.WATER_DROP,
    WATER_SPLASH: EnumParticleTypes.WATER_SPLASH,
    WATER_WAKE: EnumParticleTypes.WATER_WAKE,
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
        }).setFilteredClass(net.minecraft.network.play.client.C08PacketPlayerBlockPlacement).unregister()
    )
    .createCustomEvent("onClickWindowPacket", (fn) => 
        register("packetSent", (packet, _) => {
            // Container name, Slot clicked
            fn(Player.getContainer().getName(), packet.func_149544_d())
        }).setFilteredClass(net.minecraft.network.play.client.C0EPacketClickWindow).unregister()
    )
    .createCustomEvent("onPacketPlayerPosLook", (fn) =>
        register("packetReceived", (packet) => {
            const [ x, y, z ] = [ packet.func_148932_c(), packet.func_148928_d(), packet.func_148933_e() ]
            const [ yaw, pitch ] = [ packet.func_148931_f(), packet.func_148930_g() ]

            fn([x, y, z], yaw, pitch)
        }).setFilteredClass(net.minecraft.network.play.server.S08PacketPlayerPosLook).unregister()
    )
    .createCustomEvent("onCollectItem", (fn) =>
        register("packetReceived", (packet) => {
            const entityID = packet.func_149354_c()
            
            fn(entityID)
        }).setFilteredClass(net.minecraft.network.play.server.S0DPacketCollectItem).unregister()
    )
    .createCustomEvent("forgeEntityJoin", (fn, clazz) => {
        // Credits: https://github.com/BetterMap/BetterMap/blob/main/Extra/Events/SecretTracker.js
        return register(net.minecraftforge.event.entity.EntityJoinWorldEvent, (event) => {
            if (!(event.entity instanceof clazz)) return
        
            fn(event.entity, event.entity.func_145782_y())
        }).unregister()
    })
    .createCustomEvent("onPacketLookMove", (fn) => register("packetReceived", (packet) => {
        fn(packet.func_149065_a(World.getWorld()), [packet.func_149062_c(), packet.func_149061_d(), packet.func_149064_e()])
    }).setFilteredClass(net.minecraft.network.play.server.S14PacketEntity$S17PacketEntityLookMove).unregister())
    .createCustomEvent("onPlayerDigging", (fn) => register("packetSent", (packet, event) => {
        fn(packet.func_180762_c()?.toString(), event)
    }).setFilteredClass(net.minecraft.network.play.client.C07PacketPlayerDigging).unregister())
    .createCustomEvent("clientCloseWindow", (fn) => register("packetSent", () => {
        fn()
    }).setFilteredClass(net.minecraft.network.play.client.C0DPacketCloseWindow).unregister())
    .createCustomEvent("onSpawnParticle", (fn) => register("packetReceived", (packet, event) => {
        // 
        const particleType = packet.func_179749_a()
        const [ x, y, z ] = [
            packet.func_149220_d(), // getXCoordinate
            packet.func_149226_e(), // func_149226_e
            packet.func_149225_f() // func_149225_f
        ]

        fn(particleType, [x, y, z], event)
    }).setFilteredClass(net.minecraft.network.play.server.S2APacketParticles).unregister())
    .createCustomEvent("onWindowClosedPacket", (fn) => register("packetReceived", fn).setFilteredClass(net.minecraft.network.play.server.S2EPacketCloseWindow).unregister())