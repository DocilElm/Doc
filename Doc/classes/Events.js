import { S02PacketChat, S3EPacketTeams } from "../utils/Utils"

const chatEvents = new Set()
const actionBarEvents = new Set()
const scoreboardEvents = new Set()

// big thank bloom

class ChatPacketEvent {
    constructor(func, eventType = "chat"){
        this.func = func
        this.criteria = null
        this.eventType = eventType
    }

    setCriteria(criteria){
        if(!criteria) return this.criteria = null

        this.criteria = criteria
        return this
    }

    trigger(msg, event, formatted) {
        if (!this.criteria) {
            this.func(msg, event, formatted)
            return
        }

        if (this.criteria instanceof RegExp) {
            const match = msg.match(this.criteria)
            if (!match) return
    
            this.func(...match.slice(1), event, formatted)
        }

        if (typeof(this.criteria) == "string") {
            if (msg !== this.criteria) return
            this.func(msg, event, formatted)
        }
    }

    register(){
        if(this.eventType === "chat") chatEvents.add(this)
        else if(this.eventType === "actionbar") actionBarEvents.add(this)
        else if(this.eventType === "scoreboard") scoreboardEvents.add(this)
        return this
    }

    unregister(){
        if(this.eventType === "chat") chatEvents.delete(this)
        else if(this.eventType === "actionbar") actionBarEvents.delete(this)
        else if(this.eventType === "scoreboard") scoreboardEvents.delete(this)
        return this
    }
}

const getCurrentMsg = () => Client.getChatGUI()?.field_146252_h?.[0]?.func_151461_a()?.func_150254_d()?.removeFormatting()
export const onClientChatMsg = (func) => new ChatPacketEvent(func).register()
export const onChatPacket = (func) => new ChatPacketEvent(func).register()
export const onActionBarPacket = (func) => new ChatPacketEvent(func, "actionbar").register()
export const onScoreboardPacket = (fn) => new ChatPacketEvent(fn, "scoreboard").register()

let packetChatMsg = null

register("packetReceived", (packet, event) => {
    const chatComponent = packet.func_148915_c()
    const formatted = chatComponent?.func_150254_d()
    const unformatted = formatted?.removeFormatting()

    if(packet.func_148916_d()) return actionBarEvents.forEach(trigger => {
        trigger.trigger(unformatted, event)
    })

    packetChatMsg = unformatted

    chatEvents.forEach(trigger => {
        trigger.trigger(unformatted, event, formatted)
    })
}).setFilteredClass(S02PacketChat)

register("packetReceived", (packet, event) => {
    const channel = packet.func_149307_h()
    if (channel !== 2) return

    const teamStr = packet.func_149312_c()
    const teamMatch = teamStr.match(/^team_(\d+)$/)
    if (!teamMatch) return

    const line = parseInt(teamMatch[1])
    const message = packet.func_149311_e().concat(packet.func_149309_f())
    const unformatted = message.removeFormatting()

    scoreboardEvents.forEach(trigger => {
        trigger.trigger(unformatted, event)
    })
}).setFilteredClass(S3EPacketTeams)

register("tick", () => {
    if(!Client.getChatGUI() || packetChatMsg === getCurrentMsg()) return

    chatEvents.forEach(trigger => {
        trigger.trigger(getCurrentMsg())
    })
})