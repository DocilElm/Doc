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