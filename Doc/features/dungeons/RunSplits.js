import { Event } from "../../core/Event"
import Feature from "../../core/Feature"
import CustomSplits from "../../shared/CustomSplits"
import Location from "../../shared/Location"

const obj = [
    {
        title: null,
        criteria: "^\\[NPC\\] Mort: Here, I found this map when I first entered the dungeon\\.$",
        type: 3
    },
    {
        title: "&cBlood Opened&f: &a${1}",
        criteria: "^\\[BOSS\\] The Watcher: (.+)$",
        type: 3
    },
    {
        title: "&cBlood Done&f: &a${1} &7(${c1}&7)",
        criteria: "^\\[BOSS\\] The Watcher: You have proven yourself\\. You may pass\\.$",
        type: 3,
        children: [
            {
                title: "&cFirst Spawn&f: &a${1}",
                criteria: "^\\[BOSS\\] The Watcher: Let\\'s see how you can handle this\\.$",
                useTimerAt: 1,
                type: 3
            }
        ]
    },
    {
        title: "&bBoss Entry&f: &a${1}",
        criteria: [
            "[BOSS] Bonzo: Gratz for making it this far, but I'm basically unbeatable.",
            "[BOSS] Scarf: This is where the journey ends for you, Adventurers.",
            "[BOSS] The Professor: I was burdened with terrible news recently...",
            "[BOSS] Thorn: Welcome Adventurers! I am Thorn, the Spirit! And host of the Vegan Trials!",
            "[BOSS] Livid: Welcome, you've arrived right on time. I am Livid, the Master of Shadows.",
            "[BOSS] Sadan: So you made it all the way here... Now you wish to defy me? Sadan?!",
            "[BOSS] Maxor: WELL! WELL! WELL! LOOK WHO'S HERE!"
        ],
        useTimerAt: 0,
        type: 4
    }
]

const split = new CustomSplits(obj, () => Location.inWorld("catacombs"))

const feat = new Feature("dungeonRunSplits", "catacombs")
    .addEvent(
        new Event("renderOverlay", () => {
            Renderer.retainTransforms(true)
            Renderer.translate(10, 10)
            Renderer.drawString("&aRun Splits", 0, 0)

            Renderer.drawStringWithShadow(split.buildStr(), 0, 10)

            Renderer.retainTransforms(false)
            Renderer.finishDraw()
        })
    )
    .onUnregister(() => {
        split.reset()
        ChatLib.chat("unreg")
    })

split.getEvents().forEach(it => feat.addEvent(it))