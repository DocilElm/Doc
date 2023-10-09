import { S02PacketChat } from "../utils/Utils"

const chatEvents = new Set()

// big thank bloom

class ChatPacketEvent {
    constructor(func){
        this.func = func
        this.criteria = null
    }

    setCriteria(criteria){
        if(!criteria) return this.criteria = null

        this.criteria = criteria
        return this
    }

    trigger(msg, event) {
        if (!this.criteria) {
            this.func(msg, event)
            return
        }

        if (this.criteria instanceof RegExp) {
            const match = msg.match(this.criteria)
            if (!match) return
    
            this.func(...match.slice(1), event)
        }

        if (typeof(this.criteria) == "string") {
            if (msg !== this.criteria) return
            this.func(msg, event)
        }
    }

    register(){
        chatEvents.add(this)
        return this
    }

    unregister(){
        chatEvents.delete(this)
        return this
    }
}

export const onChatPacket = (func) => new ChatPacketEvent(func).register()

register("packetReceived", (packet, event) => {
    if (packet.func_148916_d()) return

    const chatComponent = packet.func_148915_c()
    const formatted = chatComponent.func_150254_d()
    const unformatted = formatted.removeFormatting()

    chatEvents.forEach(trigger => {
        trigger.trigger(unformatted, event)
    })
}).setFilteredClass(S02PacketChat)