import { Keybind } from "../../../KeybindFix"
import { WorldState } from "../../../Atomx/skyblock/World"
import ThePlayer from "../../../Atomx/skyblock/ThePlayer"
import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { Persistence } from "../../shared/Persistence"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/Text"

// Constant variables
const feature = new Feature("SlotLocking", "Misc", "")
const lockKeybind = new Keybind("§fLock Slot", Keyboard.KEY_NONE, "Doc")
const bindingKeybind = new Keybind("§fBind Slots", Keyboard.KEY_NONE, "Doc")
const dropKey = Client.getKeyBindFromDescription("key.drop")

// Changeable variables
let previousSlot = null

// Functions
const handleShiftClick = (slotClicked) => {
    const container = Player.getContainer()
    const hotbarSlot = Persistence.data.lockedSlots[slotClicked] % 36
    if (hotbarSlot == null || hotbarSlot >= 9) return

    Client.getMinecraft().field_71442_b.func_78753_a(
        container.getWindowId(),
        slotClicked,
        hotbarSlot,
        2,
        Player.getPlayer()
    )
}

const handleBinding = (slotNumber, event) => {
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

    cancel(event)
    Persistence.data.lockedSlots[previousSlot] = slotNumber
    Persistence.data.save()

    ChatLib.chat(`${TextHelper.PREFIX} &aSaved binding&r: &6${previousSlot} &b-> &6${slotNumber}`)
    previousSlot = null
}

const getActualSlot = (slot) => {
    if (slot == null) return

    const size = Player.getContainer()?.getSize()
    const realSlot = slot
    const slotNumber = size === 45 ? realSlot : realSlot - (size - 45)
    const minimumSlots = size === 45 ? 5 : 9

    if (!slotNumber || slotNumber < minimumSlots || slotNumber >= 45) return

    return slotNumber
}

const isHotbarKey = () => Client.settings.getSettings().field_151456_ac.some((mcBind, idx) => Client.settings.getSettings().func_100015_a(mcBind) && (36 + idx) in Persistence.data.lockedSlots)

const isHotbarKeyDown = () => Client.settings.getSettings().field_151456_ac.some(mcBind => Client.settings.getSettings().func_100015_a(mcBind))

// Logic
const onGuiKey = (_, keycode, gui, event) => {
    if (!(gui instanceof net.minecraft.client.gui.inventory.GuiChest || gui instanceof net.minecraft.client.gui.inventory.GuiInventory)) return
    if (config.slotLockingSB && !ThePlayer.inSkyblock()) return

    if (isHotbarKey() && gui.getSlotUnderMouse()?.field_75222_d) {
        ChatLib.chat(`${TextHelper.PREFIX} &bWow! maybe don't bind that slot`)
        cancel(event)

        return
    }

    const slotNumber = getActualSlot(gui.getSlotUnderMouse()?.field_75222_d)
    if (!slotNumber) return

    if (isHotbarKeyDown() && slotNumber in Persistence.data.lockedSlots) {
        ChatLib.chat(`${TextHelper.PREFIX} &bWow! maybe don't bind that slot`)
        cancel(event)

        return
    }

    if ((keycode === dropKey.getKeyCode() || isHotbarKeyDown()) && slotNumber in Persistence.data.lockedSlots) {
        ChatLib.chat(`${TextHelper.PREFIX} &bWow! maybe don't throw that`)
        cancel(event)

        return
    }

    if (keycode !== lockKeybind.getKeyCode()) return

    cancel(event)

    if (slotNumber in Persistence.data.lockedSlots) {
        delete Persistence.data.lockedSlots[slotNumber]
        Persistence.data.save()

        ChatLib.chat(`${TextHelper.PREFIX} &aSlot &c${slotNumber} &aHas been unlocked`)

        return
    }

    Persistence.data.lockedSlots[slotNumber] = null
    Persistence.data.save()

    ChatLib.chat(`${TextHelper.PREFIX} &aSlot &b${slotNumber} &aHas been locked`)
}

const onMouseClick = (_, __, ___, gui, event) => {
    if (!(gui instanceof net.minecraft.client.gui.inventory.GuiChest || gui instanceof net.minecraft.client.gui.inventory.GuiInventory)) return
    if (config.slotLockingSB && !ThePlayer.inSkyblock()) return

    if (isHotbarKey()) {
        ChatLib.chat(`${TextHelper.PREFIX} &bWow! maybe don't bind that slot`)
        cancel(event)

        return
    }

    const slotNumber = getActualSlot(gui.getSlotUnderMouse()?.field_75222_d)
    if (!slotNumber) return

    if (Keyboard.isKeyDown(bindingKeybind.getKeyCode())) {
        handleBinding(slotNumber, event)

        return
    }

    if (!(slotNumber in Persistence.data.lockedSlots)) return

    if (Keyboard.isKeyDown(Keyboard.KEY_LSHIFT) && Persistence.data.lockedSlots[slotNumber] !== null && gui instanceof net.minecraft.client.gui.inventory.GuiInventory) {
        handleShiftClick(slotNumber)

        return
    }
    
    cancel(event)

    ChatLib.chat(`${TextHelper.PREFIX} &bWow! maybe don't click that slot`)
}

const onPlayerDigging = (status, event) => {
    if (config.slotLockingSB && !ThePlayer.inSkyblock()) return
    // Cant drop items in dungeons because of ability
    if (WorldState.inDungeons()) return
    if (!status.includes("DROP")) return

    const slot = Player.getHeldItemIndex() + 36
    if (!(slot in Persistence.data.lockedSlots)) return

    cancel(event)
    ChatLib.chat(`${TextHelper.PREFIX} &bWow! maybe don't throw that`)
}

const onGuiRender = (_, __, gui) => {
    if (!(gui instanceof net.minecraft.client.gui.inventory.GuiInventory)) return
    if (config.slotLockingSB && !ThePlayer.inSkyblock()) return

    const size = Player.getContainer()?.getSize()
    const minimumSlots = size === 45 ? 5 : 9

    Object.keys(Persistence.data.lockedSlots)?.forEach(idx => {
        const slotNumber = size === 45 ? parseInt(idx) : parseInt(idx) + (size - 45)
        if (!slotNumber || slotNumber < minimumSlots || slotNumber >= 45) return

        const [ x, y ] = RenderHelper.getSlotRenderPosition(slotNumber)

        Renderer.drawRect(
            Renderer.color(0, 1, 0, 150),
            x,
            y,
            16,
            16
        )
    })

    if (Keyboard.isKeyDown(Keyboard.KEY_LSHIFT) && Persistence.data.lockedSlots[gui?.getSlotUnderMouse()?.field_75222_d] !== null) {
        const slotUnder = gui.getSlotUnderMouse()?.field_75222_d
        const bindSlot = Persistence.data.lockedSlots[slotUnder]
        if (!slotUnder || !bindSlot) return
        
        const [ x, y ] = RenderHelper.getSlotRenderPosition(slotUnder)
        const [ x1, y1 ] = RenderHelper.getSlotRenderPosition(bindSlot)

        Renderer.translate(0, 0, 300)
        Renderer.drawLine(
            Renderer.DARK_AQUA,
            x + 8,
            y,
            x1 + 8,
            y1,
            1.5
        )
    }
}

// Events
new Event(feature, "guiKey", onGuiKey, () => config.slotLocking)
new Event(feature, "guiMouseClick", onMouseClick, () => config.slotLocking)
new Event(feature, "onPlayerDigging", onPlayerDigging, () => config.slotLocking)
new Event(feature, "guiRender", onGuiRender, () => config.slotLocking && config.slotLockingDisplay)

// Starting events
feature.start()