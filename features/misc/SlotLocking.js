import { Keybind } from "../../../KeybindFix"
import config from "../../config"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { DGlStateManager } from "../../shared/DGlStateManager"
import Location from "../../shared/Location"
import { Persistence } from "../../shared/Persistence"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/TextHelper"

const lockKeybind = new Keybind("§fLock Slot", Keyboard.KEY_NONE, "Doc")
const bindingKeybind = new Keybind("§fBind Slots", Keyboard.KEY_NONE, "Doc")
const lockImg = Image.fromUrl("https://raw.githubusercontent.com/BiscuitDevelopment/SkyblockAddons/refs/heads/main/src/main/resources/assets/skyblockaddons/lock.png")
const savedSlots = new Map(Object.entries(Persistence.data.lockedSlots))

let hasDungeonStarted = false
let previousSlot = null
let clickedSlot = null
let inGui = false

const getDropKey = () => Client.getKeyBindFromDescription("key.drop")
const isHotbarKey = () => Client.settings.getSettings().field_151456_ac.some((mcBind, idx) => Client.settings.getSettings().func_100015_a(mcBind) && (36 + idx) in Persistence.data.lockedSlots)
const isHotbarKeyDown = () => Client.settings.getSettings().field_151456_ac.some(mcBind => Client.settings.getSettings().func_100015_a(mcBind))

const getActualSlot = (slot) => {
    if (slot == null) return

    const size = Player.getContainer()?.getSize()
    const slotNumber = size === 45 ? slot : slot - (size - 45)
    const minimumSlots = size === 45 ? 5 : 9

    if (!slotNumber || slotNumber < minimumSlots || slotNumber >= 45) return

    return slotNumber
}

const handleShiftClick = (slotClicked) => {
    const container = Player.getContainer()
    const hotbarSlot = Persistence.data.lockedSlots[slotClicked] % 36
    if (hotbarSlot >= 9) return

    Client.getMinecraft().field_71442_b.func_78753_a(
        container.getWindowId(),
        slotClicked,
        hotbarSlot,
        2,
        Player.getPlayer()
    )
}

const handleBinding = (slotNumber, event, feat) => {
    if (!previousSlot) {
        previousSlot = slotNumber
        cancel(event)
        return
    }

    if (previousSlot && (slotNumber < 36 || slotNumber > 44)) {
        previousSlot = null
        ChatLib.chat(`${TextHelper.PREFIX} &cPlease bind this to a hotbar slot`)
        return
    }

    if (previousSlot === slotNumber) return
    if (!(previousSlot in Persistence.data.lockedSlots)) {
        ChatLib.chat(`${TextHelper.PREFIX} &cThe previously clicked slot was not locked`)
        previousSlot = null
        return
    }

    cancel(event)
    Persistence.data.lockedSlots[previousSlot] = slotNumber
    ChatLib.chat(`${TextHelper.PREFIX} &aSaved binding&r: &6${previousSlot} &b-> &6${slotNumber}`)
    savedSlots.set(previousSlot, slotNumber)
    previousSlot = null
    feat.update()
}

let lastGui = null
let guiCloseListener = []
let guiOpenListener = []

const onGuiClose = (cb) => guiCloseListener.push(cb)
const onGuiOpen = (cb) => guiOpenListener.push(cb)

const feat = new Feature("slotLocking")
    .addEvent(
        new Event("tick", () => {
            const currentGui = Client.currentGui.get()

            if (!lastGui && !currentGui) return
            if (lastGui && lastGui === currentGui) return

            if (!lastGui || !currentGui?.equals(lastGui)) guiCloseListener.forEach((it) => it())

            lastGui = currentGui

            if (!lastGui) return
            guiOpenListener.forEach((it) => it(lastGui))
        })
    )
    .addSubEvent(
        new Event("guiKey", (_, keyCode, gui, event) => {
            const idx = gui.getSlotUnderMouse()?.field_75222_d
            if (isHotbarKey() && idx) {
                ChatLib.chat(`${TextHelper.PREFIX} &cThat slot is locked`)
                cancel(event)
                return
            }

            const slotIdx = getActualSlot(idx)
            if (!slotIdx) return

            if ((keyCode === getDropKey().getKeyCode() || isHotbarKeyDown()) && slotIdx in Persistence.data.lockedSlots) {
                ChatLib.chat(`${TextHelper.PREFIX} &cThat slot is locked`)
                cancel(event)
                return
            }

            if (keyCode !== lockKeybind.getKeyCode()) return

            cancel(event)
            if (slotIdx in Persistence.data.lockedSlots) {
                delete Persistence.data.lockedSlots[slotIdx]
                ChatLib.chat(`${TextHelper.PREFIX} &aSlot &c${slotIdx} &aHas been &cunlocked`)
                savedSlots.delete(slotIdx)
                feat.update()
                return
            }

            Persistence.data.lockedSlots[slotIdx] = null
            ChatLib.chat(`${TextHelper.PREFIX} &aSlot &b${slotIdx} &aHas been &blocked`)
            savedSlots.set(slotIdx, null)
            feat.update()
        }),
        () => inGui
    )
    .addSubEvent(
        new Event("guiMouseClick", (_, __, ___, gui, event) => {
            const idx = gui.getSlotUnderMouse()?.field_75222_d
            if (isHotbarKey() && idx) {
                ChatLib.chat(`${TextHelper.PREFIX} &cThat slot is locked`)
                cancel(event)
                return
            }

            const slotIdx = getActualSlot(idx)
            if (!slotIdx) return

            if (Keyboard.isKeyDown(bindingKeybind.getKeyCode()))
                return handleBinding(slotIdx, event, feat)

            if (!(slotIdx in Persistence.data.lockedSlots)) return
            if (
                Keyboard.isKeyDown(Keyboard.KEY_LSHIFT) &&
                Persistence.data.lockedSlots[slotIdx] !== null &&
                gui instanceof net.minecraft.client.gui.inventory.GuiInventory
            ) {
                return handleShiftClick(slotIdx)
            }

            cancel(event)
            ChatLib.chat(`${TextHelper.PREFIX} &cThat slot is locked`)
            clickedSlot = true
            feat.update()
        }),
        () => inGui
    )
    .addSubEvent(
        new Event("guiMouseRelease", (_, __, ___, ____, event) => {
            cancel(event)
            clickedSlot = false
            feat.update()
        }),
        () => clickedSlot && inGui
    )
    .addEvent(
        new Event(EventEnums.PACKET.CLIENT.DIGGING, (status, event) => {
            if (Location.inWorld("catacombs") && hasDungeonStarted) return
            if (!status.includes("DROP")) return

            const slot = Player.getHeldItemIndex() + 36
            if (!(slot in Persistence.data.lockedSlots)) return

            cancel(event)
            ChatLib.chat(`${TextHelper.PREFIX} &cThat slot is locked`)
        })
    )
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.SCOREBOARD, () => {
            hasDungeonStarted = true
        }, /^Time Elapsed\: ([\w ]+)$/)
    )
    .addSubEvent(
        new Event("renderSlot", (slot) => {
            if (!savedSlots.has(slot.getIndex())) return

            // Credits: https://github.com/BiscuitDevelopment/SkyblockAddons/

            DGlStateManager
                .pushMatrix()
                .disableLighting()
                .disableDepth()
                .enableBlend()

            const textureID = lockImg.getTexture().func_110552_b()

            DGlStateManager
                .translate(slot.getDisplayX(), slot.getDisplayY(), 0)
                .scale(16)
                .color(1, 1, 1, config().slotLockingDisplayOpacity)
                .bindTexture(textureID)
            RenderHelper._beginImage(0, 0, 16, 16)

            DGlStateManager
                .enableLighting()
                .enableDepth()
                .disableBlend()
                .popMatrix()
        }),
        () => inGui && Client.currentGui.get() instanceof net.minecraft.client.gui.inventory.GuiInventory && savedSlots.size && config().slotLockingDisplay
    )
    .addSubEvent(
        new Event("renderOverlay", () => {
            const slotIdx = Client.currentGui.get()?.getSlotUnderMouse()?.field_75222_d
            if (!slotIdx) return
            const boundSlot = savedSlots.get(slotIdx)
            if (Keyboard.isKeyDown(Keyboard.KEY_LSHIFT) && boundSlot) {
                const [ x, y ] = RenderHelper.getSlotRenderPosition(slotIdx)
                const [ x2, y2 ] = RenderHelper.getSlotRenderPosition(boundSlot)

                Renderer.drawLine(Renderer.AQUA, x + 8, y, x2 + 8, y2, 1.5)
            }
        }),
        () => inGui && Client.currentGui.get() instanceof net.minecraft.client.gui.inventory.GuiInventory && savedSlots.size && config().slotLockingDisplay
    )
    .onUnregister(() => {
        previousSlot = null
        hasDungeonStarted = false
        clickedSlot = false
        inGui = false
    })

onGuiClose(() => {
    if (!inGui) return

    inGui = false
    feat.update()
})

onGuiOpen((gui) => {
    inGui = (gui instanceof net.minecraft.client.gui.inventory.GuiChest || gui instanceof net.minecraft.client.gui.inventory.GuiInventory)
    feat.update()
})