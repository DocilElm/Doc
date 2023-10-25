import FeatureManager from "../core/FeatureManager";

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
    .createCustomEvent("onChatPacket", (fn, criteria) => {
        register("packetReceived", (packet, event) => {
            // Check if the packet is for the actionbar
            if (packet.func_148916_d()) return

            const chatComponent = packet.func_148915_c()        
            const formatted = chatComponent?.func_150254_d()
            const unformatted = formatted?.removeFormatting()
        
            if (!unformatted) return
            
            // Check if the criteria is a regex or a string
            // Regex is way more intensive so only use that if needed
            if (typeof(criteria) === "string") {
                if (unformatted !== criteria) return

                fn(unformatted, event, formatted)
            } else if (criteria instanceof RegExp) {
                const match = unformatted.match(criteria)
                if (!match) return
                
                // Call the eventFunction with parameters being the
                // matched groups as different params, ending with
                // the packet even and formatted message
                fn(...match.slice(1), event, formatted)
            }
        }).setFilteredClass(net.minecraft.network.play.server.S02PacketChat)
    })

/*
export const CustomEvents = {
    "command": (fn, [commandName]) =>  register("command", fn).setName(commandName),
    "renderSpecificEntity": (fn, [EntityType]) => register("renderEntity", (entity, position, partialTicks, event) => {
        if(entity.entity instanceof EntityType) return fn(entity, position, partialTicks, event);
    }),
    "step": (fn, [stepAmount]) => register("step", fn).setFps(stepAmount),
    "onChatPacket": (fn, criteria) => onChatPacket(fn).setCriteria(criteria),
    "onActionBarPacket": (fn, criteria) => onActionBarPacket(fn).setCriteria(criteria),
    "soundPlay": (fn, criteria) => register("soundPlay", fn).setCriteria(criteria)
}
*/