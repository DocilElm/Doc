import { S02PacketChat, S38PacketPlayerListItem, S3EPacketTeams } from "../utils/Utils"

const chatEvents = new Set()
const actionBarEvents = new Set()
const scoreboardEvents = new Set()
const tabListLineUpdateEvents = new Set()
const tabListLineAddEvents = new Set()

// big thank bloom

/**
 * - handles all the events that have Texts
 * and can be set to a pre defined criteria
 */
class TextEventHandler {
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
        if(!msg) return

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

    // one day i will clean this mess up
    register(){
        if(this.eventType === "chat") chatEvents.add(this)
        else if(this.eventType === "actionbar") actionBarEvents.add(this)
        else if(this.eventType === "scoreboard") scoreboardEvents.add(this)
        else if(this.eventType === "tabupdate") tabListLineUpdateEvents.add(this)
        else if(this.eventType === "tabadd") tabListLineAddEvents.add(this)
        return this
    }

    unregister(){
        if(this.eventType === "chat") chatEvents.delete(this)
        else if(this.eventType === "actionbar") actionBarEvents.delete(this)
        else if(this.eventType === "scoreboard") scoreboardEvents.delete(this)
        else if(this.eventType === "tabupdate") tabListLineUpdateEvents.delete(this)
        else if(this.eventType === "tabadd") tabListLineAddEvents.delete(this)
        return this
    }
}

/**
 * @returns the current chat message only used for onClientChatMsg
 */
const getCurrentMsg = () => Client.getChatGUI()?.field_146252_h?.[0]?.func_151461_a()?.func_150254_d()?.removeFormatting()

/**
 * - Triggers everytime there's a new Client Chat Message
 * - This may or may not be 100% accurate
 * @param {Function} fn - The callback function
 * @returns
 */
export const onClientChatMsg = (fn) => new TextEventHandler(fn).register()

/**
 * - Triggers everytime there's a new Packet Chat Message
 * - This is very useful for chat messages that are
 * getting cancelled by other mods
 * @param {Function} fn The callback function
 * @returns 
 */
export const onChatPacket = (fn) => new TextEventHandler(fn).register()

/**
 * - Triggers everytime there's a new Action Bar Packet
 * - This is very useful for actionBars that are
 * getting cancelled by other mods
 * @param {Function} fn The callback function
 * @returns 
 */
export const onActionBarPacket = (fn) => new TextEventHandler(fn, "actionbar").register()

/**
 * - Triggers everytime there's a new Scoreboard Packet
 * @param {Function} fn The callback function
 * @returns 
 */
export const onScoreboardPacket = (fn) => new TextEventHandler(fn, "scoreboard").register()

/**
 * - Triggers everytime there's a new Tab UPDATE_DISPLAY_NAME Packet
 * @param {Function} fn The callback function
 * @returns 
 */
export const onTabUpdatePacket = (fn) => new TextEventHandler(fn, "tabupdate").register()

/**
 * - Triggers everytime there's a new Tab ADD_PLAYER Packet
 * @param {Function} fn The callback function
 * @returns 
 */
export const onTabAddPacket = (fn) => new TextEventHandler(fn, "tabadd").register()

let packetChatMsg = null

register("packetReceived", (packet, event) => {
    const chatComponent = packet.func_148915_c()
    const formatted = chatComponent?.func_150254_d()
    const unformatted = formatted?.removeFormatting()

    if(packet.func_148916_d()) return actionBarEvents.forEach(trigger => trigger.trigger(unformatted, event))

    // this is set so that the onClientChatMsg event
    // can use this to check for current Client Chat Msg
    packetChatMsg = unformatted

    chatEvents.forEach(trigger => trigger.trigger(unformatted, event, formatted))
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

    scoreboardEvents.forEach(trigger => trigger.trigger(unformatted, event))
}).setFilteredClass(S3EPacketTeams)

register("packetReceived", (packet) => {
    const players = packet.func_179767_a() // .getPlayers()
    const action = packet.func_179768_b() // .getAction()

    if (action !== S38PacketPlayerListItem.Action.UPDATE_DISPLAY_NAME && action !== S38PacketPlayerListItem.Action.ADD_PLAYER) return
    
    players.forEach(addPlayerData => {
        const name = addPlayerData.func_179961_d() // .getDisplayName()
        if (!name) return
        const text = name.func_150254_d() // .getFormattedText()

        if (action == S38PacketPlayerListItem.Action.UPDATE_DISPLAY_NAME) tabListLineUpdateEvents.forEach(event => event.trigger(text.removeFormatting()))
        if (action == S38PacketPlayerListItem.Action.ADD_PLAYER) tabListLineAddEvents.forEach(event => event.trigger(text.removeFormatting()))
    })
}).setFilteredClass(S38PacketPlayerListItem)

register("tick", () => {
    if(!World.isLoaded()) return
    if(!Client.getChatGUI() || packetChatMsg === getCurrentMsg()) return

    chatEvents.forEach(trigger => {
        trigger.trigger(getCurrentMsg())
    })
})