import { Event } from "../core/Event"
import EventEnums from "../core/EventEnums"
import { TextHelper } from "./TextHelper"

const childRegex = /\$\{c(\d)\}/g
const timerRegex = /\$\{1\}/

const escapeStr = (str) => str.replace(/[.*+?^${}()|[\]/\\]/g, "\\$&")

// TODO: array might cause stackoverflow because of the children
export default class CustomSplits {
    constructor(data, fn) {
        this.data = data
        this.fn = fn

        // 
        this.titles = []
        this.timers = []

        // Events
        this.events = []

        this._init()
    }

    _init() {
        for (let idx = 0; idx < this.data.length; idx++) {
            let obj = this.data[idx]

            this.titles.push(obj.title)
            this.timers.push({ timer: null, child: [] })
            this._makeFromType(obj, idx)
        }
    }

    _makeFromType(obj, idx, parentidx) {
        switch (obj.type) {
            case 0:
                this._startsWith(obj, idx, parentidx)
                break

            case 1:
                this._endsWith(obj, idx, parentidx)
                break

            case 2:
                this._includes(obj, idx, parentidx)
                break

            case 3:
                this._regex(obj, idx, parentidx)
                break

            default:
                this._normal(obj, idx, parentidx)
                break
        }
    }

    _handleChat(idx, parentidx = null) {
        if (parentidx != null) {
            const theobj = this.data[parentidx]?.children?.[idx]
            const chat = theobj?.chat
            if (!chat) return

            const time = ((Date.now() - this.getPreviousTimer(parentidx, idx)) / 1000).toFixed(2)

            if (chat === "^") return ChatLib.chat(`${TextHelper.PREFIX} ${theobj.title.replace(timerRegex, time + "s")}`)

            ChatLib.chat(`${TextHelper.PREFIX} ${theobj.chat.replace(timerRegex, time + "s")}`)

            return
        }

        const theobj = this.data[idx]
        const chat = theobj?.chat
        if (!chat) return

        const time = ((Date.now() - this.getPreviousTimer(idx)) / 1000).toFixed(2)

        if (chat === "^") return ChatLib.chat(`${TextHelper.PREFIX} ${theobj.title.replace(timerRegex, time + "s")}`)
        
        ChatLib.chat(`${TextHelper.PREFIX} ${theobj.chat.replace(timerRegex, time + "s")}`)
    }

    _makeEvent(criteria, obj, idx, parentidx) {
        const parent = Number.isInteger(parentidx)

        this.events.push(
            new Event(EventEnums.PACKET.SERVER.CHAT, () => {
                if (
                    !this.fn() ||
                    (this.timers?.[idx]?.timer && !parent) ||
                    parent && this.timers?.[parentidx]?.child?.[idx]
                    ) return

                this._handleChat(idx, parentidx)

                if (parent) return this.timers[parentidx].child[idx] = Date.now()
                this.timers[idx].timer = Date.now()
            }, criteria)
        )

        if (!("children" in obj) || parent) return

        const children = obj.children

        for (let index = 0; index < children.length; index++) {
            let childobj = children[index]

            this._makeFromType(childobj, index, idx)
        }
    }

    _startsWith(obj, idx, parentidx = null) {
        if (Array.isArray(obj.criteria)) {
            const criterias = obj.criteria
            for (let index = 0; index < criterias.length; index++) {
                let criteria = new RegExp(`^${escapeStr(criterias[index])}`)

                this._makeEvent(criteria, obj, idx, parentidx)
            }
            return
        }

        const criteria = new RegExp(`^${escapeStr(obj.criteria)}`)

        this._makeEvent(criteria, obj, idx, parentidx)
    }

    _endsWith(obj, idx, parentidx = null) {
        if (Array.isArray(obj.criteria)) {
            const criterias = obj.criteria
            for (let index = 0; index < criterias.length; index++) {
                let criteria = new RegExp(`${escapeStr(criterias[index])}$`)

                this._makeEvent(criteria, obj, idx, parentidx)
            }
            return
        }

        const criteria = new RegExp(`${escapeStr(obj.criteria)}$`)

        this._makeEvent(criteria, obj, idx, parentidx)
    }

    _includes(obj, idx, parentidx = null) {
        if (Array.isArray(obj.criteria)) {
            const criterias = obj.criteria
            for (let index = 0; index < criterias.length; index++) {
                let criteria = new RegExp(`${escapeStr(criterias[index])}`)

                this._makeEvent(criteria, obj, idx, parentidx)
            }
            return
        }

        const criteria = new RegExp(`${escapeStr(obj.criteria)}`)

        this._makeEvent(criteria, obj, idx, parentidx)
    }

    _normal(obj, idx, parentidx = null) {
        if (Array.isArray(obj.criteria)) {
            const criterias = obj.criteria
            for (let index = 0; index < criterias.length; index++) {
                let criteria = new RegExp(`^${escapeStr(criterias[index])}$`)

                this._makeEvent(criteria, obj, idx, parentidx)
            }
            return
        }

        const criteria = new RegExp(`^${escapeStr(obj.criteria)}$`)

        this._makeEvent(criteria, obj, idx, parentidx)
    }

    _regex(obj, idx, parentidx = null) {
        if (Array.isArray(obj.criteria)) {
            const criterias = obj.criteria
            for (let index = 0; index < criterias.length; index++) {
                let criteria = new RegExp(criterias[index])

                this._makeEvent(criteria, obj, idx, parentidx)
            }
            return
        }

        const criteria = new RegExp(obj.criteria)

        this._makeEvent(criteria, obj, idx, parentidx)
    }

    buildStr() {
        const array = this.getTitles()
        let str = ""

        for (let idx = 0; idx < array.length; idx++) {
            let title = array[idx]
            if (!title) continue

            if (childRegex.test(title)) {
                let timer = this.getTimerAt(idx)
                let previousTimer = this.getPreviousTimer(idx)

                str += title
                    .replace(timerRegex, `${(Math.max(0, (timer - previousTimer) / 1000)).toFixed(2)}s`)
                    .replace(childRegex, (_, it) => {
                        let childidx = it - 1
                        let ctimer = this.getTimerAt(idx, childidx)
                        let cpreviousTimer = this.getPreviousTimer(idx, childidx)
                        let childtime = `${(Math.max(0, (ctimer - cpreviousTimer) / 1000)).toFixed(2)}s`

                        return this.data[idx].children[childidx].title.replace(timerRegex, childtime)
                    }) + "\n"

                continue
            }

            let timer = this.getTimerAt(idx)
            let previousTimer = this.getPreviousTimer(idx)

            str += `${title.replace(timerRegex, (Math.max(0, (timer - previousTimer) / 1000)).toFixed(2))}s\n`
        }

        return str
    }

    buildExampleStr() {
        const array = this.getTitles()
        let str = ""

        for (let idx = 0; idx < array.length; idx++) {
            let it = array[idx]
            if (!it) continue

            str += `${it.replace(timerRegex, "0.00s").replace(childRegex, (_, id) => this.data[idx].children[id - 1].title.replace(timerRegex, "0.00s"))}\n`
        }

        return str
    }

    getTitles() {
        return this.titles
    }

    getTimers() {
        return this.timers
    }

    getTimerAt(idx, childIdx = null) {
        if (childIdx !== null) return this.timers[idx]?.child?.[childIdx] ?? Date.now()

        return this.timers[idx]?.timer ?? Date.now()
    }

    getPreviousTimer(idx, childIdx = null) {
        if (childIdx !== null) {
            return this.timers[this.data?.[idx]?.children?.[childIdx]?.useTimerAt]?.timer ?? this.timers[idx - 1]?.timer ?? Date.now()
        }

        return this.timers[this.data?.[idx]?.useTimerAt]?.timer ?? this.timers[idx - 1]?.timer ?? Date.now()
    }

    getEvents() {
        return this.events
    }

    reset() {
        this.timers.forEach(it => {
            it.timer = null
            it.child = []
        })
    }
}