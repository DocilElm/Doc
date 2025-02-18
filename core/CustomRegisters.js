import { TextHelper } from "../shared/TextHelper"
import EventEnums from "./EventEnums"

export const customTriggers = new Map()

const createCustomEvent = (id, invokeFn) => customTriggers.set(id, invokeFn)

// Constant used to get the packet's ENUMS
// and also filter the class in packetRecieved event
const S38PacketPlayerListItem = net.minecraft.network.play.server.S38PacketPlayerListItem

// Normal
createCustomEvent(EventEnums.COMMAND, (fn, commandName) =>  register("command", fn).setName(commandName).unregister())

createCustomEvent(EventEnums.RENDERENTITY, (fn, entityType) => 
    register("renderEntity", (entity, position, partialTicks, event) => {
        fn(entity, position, partialTicks, event)
    }).setFilteredClass(entityType).unregister()
)

createCustomEvent(EventEnums.STEP, (fn, stepAmount) => register("step", fn).setFps(stepAmount).unregister())

createCustomEvent(EventEnums.CHAT, (fn, criteria) => register("chat", fn).setCriteria(criteria))

createCustomEvent(EventEnums.SOUNDPLAY, (fn, criteria) => register("soundPlay", fn).setCriteria(criteria).unregister())

createCustomEvent(EventEnums.POSTRENDERENTITY, (fn, clazz) => register("postRenderEntity", fn).setFilteredClass(clazz).unregister())

createCustomEvent(EventEnums.ENTITYDEATH, (fn, clazz) => register("entityDeath", (entity) => {
    if (!(entity.entity instanceof clazz)) return

    fn(entity)
}).unregister())

// Server Packets
createCustomEvent(EventEnums.PACKET.SERVER.CHAT, (fn, criteria) => 
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

createCustomEvent(EventEnums.PACKET.SERVER.ACTIONBAR, (fn, criteria) => 
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

createCustomEvent(EventEnums.PACKET.SERVER.SCOREBOARD, (fn, criteria) => 
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

createCustomEvent(EventEnums.PACKET.SERVER.TABUPDATE, (fn, criteria) => 
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

createCustomEvent(EventEnums.PACKET.SERVER.TABADD, (fn, criteria) => 
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

createCustomEvent(EventEnums.PACKET.SERVER.WINDOWITEMS, (fn) => 
    register("packetReceived", (packet) => {
        fn(packet.func_148910_d())
    }).setFilteredClass(net.minecraft.network.play.server.S30PacketWindowItems).unregister()
)

createCustomEvent(EventEnums.PACKET.SERVER.WINDOWOPEN, (fn) => 
    register("packetReceived", (packet) => {
        const windowTitle = packet.func_179840_c().func_150254_d().removeFormatting()
        const windowID = packet.func_148901_c()
        const hasSlots = packet.func_148900_g()
        const slotCount = packet.func_148898_f()
        const guiID = packet.func_148902_e()
        const entityID = packet.func_148897_h()
    
        fn(windowTitle, windowID, hasSlots, slotCount, guiID, entityID)
    }).setFilteredClass(net.minecraft.network.play.server.S2DPacketOpenWindow).unregister()
)

createCustomEvent(EventEnums.PACKET.SERVER.PLAYERPOSLOOK, (fn) =>
    register("packetReceived", (packet) => {
        const [ x, y, z ] = [ packet.func_148932_c(), packet.func_148928_d(), packet.func_148933_e() ]
        const [ yaw, pitch ] = [ packet.func_148931_f(), packet.func_148930_g() ]

        fn([x, y, z], yaw, pitch)
    }).setFilteredClass(net.minecraft.network.play.server.S08PacketPlayerPosLook).unregister()
)

createCustomEvent(EventEnums.PACKET.SERVER.COLLECTITEM, (fn) =>
    register("packetReceived", (packet) => {
        const entityID = packet.func_149354_c()
        
        fn(entityID)
    }).setFilteredClass(net.minecraft.network.play.server.S0DPacketCollectItem).unregister()
)

createCustomEvent(EventEnums.PACKET.SERVER.ENTITYLOOKMOVE, (fn) => register("packetReceived", (packet) => {
    fn(packet.func_149065_a(World.getWorld()), [packet.func_149062_c(), packet.func_149061_d(), packet.func_149064_e()])
}).setFilteredClass(net.minecraft.network.play.server.S14PacketEntity$S17PacketEntityLookMove).unregister())

createCustomEvent(EventEnums.PACKET.SERVER.SPAWNPARTICLE, (fn) => register("packetReceived", (packet, event) => {
    const particleType = packet.func_179749_a()
    const [ x, y, z ] = [
        packet.func_149220_d(), // getXCoordinate
        packet.func_149226_e(), // getYCoordinate
        packet.func_149225_f() // getZCoordinate
    ]

    fn(particleType, [x, y, z], event)
}).setFilteredClass(net.minecraft.network.play.server.S2APacketParticles).unregister())

createCustomEvent(EventEnums.PACKET.SERVER.WINDOWCLOSE, (fn) => register("packetReceived", fn).setFilteredClass(net.minecraft.network.play.server.S2EPacketCloseWindow).unregister())

createCustomEvent(EventEnums.PACKET.SERVER.SPAWNMOB, (fn) => register("packetReceived", (packet) => {
    scheduleTask(() => {
        fn(packet.func_149024_d())
    })
}).setFilteredClass(net.minecraft.network.play.server.S0FPacketSpawnMob).unregister())

createCustomEvent(EventEnums.PACKET.SERVER.BLOCKCHANGE, (fn) => register("packetReceived", (packet) => {
    const pos = new BlockPos(packet.func_179827_b())
    const block = World.getBlockAt(pos.x, pos.y, pos.z)
    const packetBlock = packet.func_180728_a().func_177230_c()

    fn(block, pos, packetBlock)
}).setFilteredClass(net.minecraft.network.play.server.S23PacketBlockChange).unregister())

// Custom Server Packets
createCustomEvent(EventEnums.PACKET.CUSTOM.BLESSINGCHANGE, (fn, decodeRomanNumeral = false) => 
    register("packetReceived", (packet) => {
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

createCustomEvent(EventEnums.PACKET.CUSTOM.WINDOWCLOSE, (fn) => {
    return [
        register("packetReceived", fn).setFilteredClass(net.minecraft.network.play.server.S2EPacketCloseWindow).unregister(),
        register("packetSent", fn).setFilteredClass(net.minecraft.network.play.client.C0DPacketCloseWindow).unregister()
    ]
})

createCustomEvent(EventEnums.PACKET.CUSTOM.TICK, (fn) => register("packetReceived", (packet) => {
    if (packet.func_148890_d() > 0) return

    fn()
}).setFilteredClass(net.minecraft.network.play.server.S32PacketConfirmTransaction))

createCustomEvent(EventEnums.PACKET.CUSTOM.MULTIBLOCKCHANGE, (fn) => register("packetReceived", (packet) => {
    const list = packet.func_179844_a()

    for (let v of list) {
        let pos = new BlockPos(v.func_180090_a())
        let packetBlock = v.func_180088_c().func_177230_c()
        let block = World.getBlockAt(pos.x, pos.y, pos.z)

        fn(block, pos, packetBlock)
    }
}).setFilteredClass(net.minecraft.network.play.server.S22PacketMultiBlockChange).unregister())

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/features/WaterBoardTimer.js
createCustomEvent(EventEnums.PACKET.CUSTOM.OPENEDCHEST, (fn) => {
    let time = null

    return [
        register("packetSent", (packet) => {
            const position = packet.func_179724_a()

            const [ x, y, z ] = [
                position.func_177958_n(), // getX()
                position.func_177956_o(), // getY()
                position.func_177952_p() // getZ()
            ]
            const ctBlock = World.getBlockAt(x, y, z)
            if (!(ctBlock.type.mcBlock instanceof net.minecraft.block.BlockChest)) return

            time = Date.now()
        }).setFilteredClass(net.minecraft.network.play.client.C08PacketPlayerBlockPlacement).unregister(),

        register("packetReceived", (packet) => {
            if (!time || time && Date.now() - time > 300) return

            const block = packet.func_148868_c()
            if (!(block instanceof net.minecraft.block.BlockChest)) return

            fn()
            time = null
        }).setFilteredClass(net.minecraft.network.play.server.S24PacketBlockAction).unregister()
    ]
})

// Client Packets
createCustomEvent(EventEnums.PACKET.CLIENT.BLOCKPLACEMENT, (fn, wrapBP = true) => 
    register("packetSent", (packet) => {
        const position = packet.func_179724_a()
    
        const [ x, y, z ] = [
            position.func_177958_n(), // getX()
            position.func_177956_o(), // getY()
            position.func_177952_p() // getZ()
        ]
        const ctBlock = World.getBlockAt(x, y, z)

        fn(ctBlock, [x, y, z], wrapBP ? new BlockPos(position) : position)
    }).setFilteredClass(net.minecraft.network.play.client.C08PacketPlayerBlockPlacement).unregister()
)

createCustomEvent(EventEnums.PACKET.CLIENT.WINDOWCLICK, (fn) => 
    register("packetSent", (packet) => {
        // Container name, Slot clicked
        fn(Player.getContainer().getName(), packet.func_149544_d())
    }).setFilteredClass(net.minecraft.network.play.client.C0EPacketClickWindow).unregister()
)

createCustomEvent(EventEnums.PACKET.CLIENT.DIGGING, (fn) => register("packetSent", (packet, event) => {
    fn(packet.func_180762_c()?.toString(), event)
}).setFilteredClass(net.minecraft.network.play.client.C07PacketPlayerDigging).unregister())

createCustomEvent(EventEnums.PACKET.CLIENT.WINDOWCLOSE, (fn) => register("packetSent", () => {
    fn()
}).setFilteredClass(net.minecraft.network.play.client.C0DPacketCloseWindow).unregister())

createCustomEvent(EventEnums.PACKET.CLIENT.HELDITEMCHANGE, (fn) => register("packetSent", (packet) => {
    fn(packet.func_149614_c())
}).setFilteredClass(net.minecraft.network.play.client.C09PacketHeldItemChange).unregister())

// Forge Events
createCustomEvent(EventEnums.FORGE.ENTITYJOIN, (fn, clazz) => {
    // Credits: https://github.com/BetterMap/BetterMap/blob/main/Extra/Events/SecretTracker.js
    return register(net.minecraftforge.event.entity.EntityJoinWorldEvent, (event) => {
        if (clazz && !(event.entity instanceof clazz)) return
    
        fn(event.entity, event.entity.func_145782_y())
    }).unregister()
})

// Custom functions that require events
let _scheduleTaskList = []
/**
 * - Runs the given function after the delay is done
 * - NOTE: These are server ticks not client ticks for that use ct's one
 * @param {() => void} fn The function to be ran
 * @param {number?} delay The delay in ticks
 */
export const scheduleTask = (fn, delay = 1) => _scheduleTaskList.push([fn, delay])

register("packetReceived", (packet) => {
    if (packet.func_148890_d() > 0) return

    for (let idx = _scheduleTaskList.length - 1; idx >= 0; idx--) {
        let task = _scheduleTaskList[idx]
        if (!task) continue
        let delay = task[1]--

        if (delay !== 0) continue

        let fn = task[0]
        fn()

        _scheduleTaskList.splice(idx, 1)
    }
}).setFilteredClass(net.minecraft.network.play.server.S32PacketConfirmTransaction)