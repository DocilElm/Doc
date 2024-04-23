import config from "../../config"
import { Event } from "../../core/Events"
import { Feature } from "../../core/Feature"
import { createSkull } from "../../shared/InventorySlot"
import { Persistence } from "../../shared/Persistence"
import { RenderHelper } from "../../shared/Render"
import { WorldState } from "../../shared/World"

// Constant variables
const feature = new Feature("VisitorBzButton", "Garden", "")
const requiredWorld = "Garden"
// For now double loading data because visitor profit also does this
// but hopefully soon i get to change this so they can be shared
const GardenVisitors = Persistence.getDataFromURL("https://raw.githubusercontent.com/DocilElm/Atomx/main/api/GardenVisitors.json")
const GardenVisitorsArray = Object.keys(GardenVisitors)
const requiredItemsRegex = /^ ([a-zA-z ]+)(?: x)?([\d,]+)?/
const slotBorderColor = Renderer.color(50, 50, 50, 150)
const slotColor = Renderer.color(100, 100, 100, 150)
const itemIDList = {
    "Mutant Nether Wart": "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvMTExYTNjZWM3YWFmOTA0MjEyY2NmOTNiYjY3YTNjYWYzZDY0OTc4M2JhOTBiOGI2MGJiNjNjNzY4N2ViMzlmIn19fQ==",
    "Fermento": "ewogICJ0aW1lc3RhbXAiIDogMTY2MjUwMjkxNjU1MiwKICAicHJvZmlsZUlkIiA6ICIwOTZkYWUzZWY1MmU0YWU4ODk3ODY2N2EyOGIwZWFhNCIsCiAgInByb2ZpbGVOYW1lIiA6ICJHd0FiaXlCZ2dnIiwKICAic2lnbmF0dXJlUmVxdWlyZWQiIDogdHJ1ZSwKICAidGV4dHVyZXMiIDogewogICAgIlNLSU4iIDogewogICAgICAidXJsIiA6ICJodHRwOi8vdGV4dHVyZXMubWluZWNyYWZ0Lm5ldC90ZXh0dXJlL2NiNDFkYWViNTdkMmFlNjJjNjZlNThlYjZkZWJiMmE3ZDQ0NmUzNDU0MWE3NzEzNTA3MjhjOWRiMTViZWFmYmEiCiAgICB9CiAgfQp9",
    "Polished Pumpkin": "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvOGRiNzExZmY1MmVlZGRhNTljNDM0YmIwMzE2OTc2M2Q3YzQwYjViODkxMjc3NzhmZWFjZDYzYWE5NGRmYyJ9fX0=",
    "Squash": "ewogICJ0aW1lc3RhbXAiIDogMTY2MjUwMjk0ODA3NCwKICAicHJvZmlsZUlkIiA6ICI2ODAwNzFmZTIxOWE0OWNmYmM3MDIxMjc1NTI0NDIwMiIsCiAgInByb2ZpbGVOYW1lIiA6ICJSZXphYm95ODAiLAogICJzaWduYXR1cmVSZXF1aXJlZCIgOiB0cnVlLAogICJ0ZXh0dXJlcyIgOiB7CiAgICAiU0tJTiIgOiB7CiAgICAgICJ1cmwiIDogImh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvMzZhZTA3NjY0OWVmMjJmNjBlODUxMTgzMWM2OGZkMmI2ZWE2M2MzMjE2NGRhYjMzYThhZWJjMThmZjJhNTRjOCIKICAgIH0KICB9Cn0",
    "Cropie": "ewogICJ0aW1lc3RhbXAiIDogMTY2MjUwMjkyOTIyNCwKICAicHJvZmlsZUlkIiA6ICJjOWRlZTM4MDUzYjg0YzI5YjZlZjA5YjJlMDM5OTc0ZiIsCiAgInByb2ZpbGVOYW1lIiA6ICJTQVJfRGVjZW1iZXI1IiwKICAic2lnbmF0dXJlUmVxdWlyZWQiIDogdHJ1ZSwKICAidGV4dHVyZXMiIDogewogICAgIlNLSU4iIDogewogICAgICAidXJsIiA6ICJodHRwOi8vdGV4dHVyZXMubWluZWNyYWZ0Lm5ldC90ZXh0dXJlL2RkMDFjYmEyM2VkZTJjZDI4OTUxMDdmMGMwMjU4ZTk3MWQyNDg1NTM4ZmU5NjQ5ZWYyODUzYmQyNmU2MjMyZGMiCiAgICB9CiAgfQp9",
    "Compost": "ewogICJ0aW1lc3RhbXAiIDogMTY2MjUwMjg5OTMyNiwKICAicHJvZmlsZUlkIiA6ICI5MWYwNGZlOTBmMzY0M2I1OGYyMGUzMzc1Zjg2ZDM5ZSIsCiAgInByb2ZpbGVOYW1lIiA6ICJTdG9ybVN0b3JteSIsCiAgInNpZ25hdHVyZVJlcXVpcmVkIiA6IHRydWUsCiAgInRleHR1cmVzIiA6IHsKICAgICJTS0lOIiA6IHsKICAgICAgInVybCIgOiAiaHR0cDovL3RleHR1cmVzLm1pbmVjcmFmdC5uZXQvdGV4dHVyZS9iYTM5ZGYzNmE2NjY1ZTlkYzMzZjM0MTM3MTdkYWVmYWZkMWY3OGI5N2VlZjI0ZjNjYWU5ZTNiYmUzYzc3YjliIgogICAgfQogIH0KfQ",
    "Enchanted Golden Carrot": {"id":"minecraft:golden_carrot","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§a§lUNCOMMON"],"Name":"§aEnchanted Golden Carrot"},"ExtraAttributes":{"id":"ENCHANTED_GOLDEN_CARROT"}},"Damage":0},
    "Enchanted Hay Bale": {"id":"minecraft:hay_block","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§a§lUNCOMMON"],"Name":"§aEnchanted Hay Bale"},"ExtraAttributes":{"id":"ENCHANTED_HAY_BLOCK"}},"Damage":0},
    "Enchanted Red Mushroom Block": {"id":"minecraft:red_mushroom_block","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§9§lRARE"],"Name":"§9Enchanted Red Mushroom Block"},"ExtraAttributes":{"id":"ENCHANTED_HUGE_MUSHROOM_2"}},"Damage":0},
    "Enchanted Carrot": {"id":"minecraft:carrot","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§a§lUNCOMMON"],"Name":"§aEnchanted Carrot"},"ExtraAttributes":{"id":"ENCHANTED_CARROT"}},"Damage":0},
    "Enchanted Potato": {"id":"minecraft:potato","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§a§lUNCOMMON"],"Name":"§aEnchanted Potato"},"ExtraAttributes":{"id":"ENCHANTED_POTATO"}},"Damage":0},
    "Enchanted Baked Potato": {"id":"minecraft:baked_potato","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§a§lUNCOMMON"],"Name":"§aEnchanted Baked Potato"},"ExtraAttributes":{"id":"ENCHANTED_BAKED_POTATO"}},"Damage":0},
    "Enchanted Pumpkin": {"id":"minecraft:pumpkin","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§a§lUNCOMMON"],"Name":"§aEnchanted Pumpkin"},"ExtraAttributes":{"id":"ENCHANTED_PUMPKIN"}},"Damage":0},
    "Enchanted Melon": {"id":"minecraft:melon","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§7§8Brewing Ingredient","","§a§lUNCOMMON"],"Name":"§aEnchanted Melon"},"ExtraAttributes":{"id":"ENCHANTED_MELON"}},"Damage":0},
    "Enchanted Melon Block": {"id":"minecraft:melon_block","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§9§lRARE"],"Name":"§9Enchanted Melon Block"},"ExtraAttributes":{"id":"ENCHANTED_MELON_BLOCK"}},"Damage":0},
    "Enchanted Red Mushroom": {"id":"minecraft:red_mushroom","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§a§lUNCOMMON"],"Name":"§aEnchanted Red Mushroom"},"ExtraAttributes":{"id":"ENCHANTED_RED_MUSHROOM"}},"Damage":0},
    "Enchanted Brown Mushroom": {"id":"minecraft:brown_mushroom","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§a§lUNCOMMON"],"Name":"§aEnchanted Brown Mushroom"},"ExtraAttributes":{"id":"ENCHANTED_BROWN_MUSHROOM"}},"Damage":0},
    "Enchanted Brown Mushroom Block": {"id":"minecraft:brown_mushroom_block","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§9§lRARE"],"Name":"§9Enchanted Brown Mushroom Block"},"ExtraAttributes":{"id":"ENCHANTED_HUGE_MUSHROOM_1"}},"Damage":0},
    "Enchanted Cocoa Beans": {"id":"minecraft:dye","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§7§8Brewing Ingredient","","§a§lUNCOMMON"],"Name":"§aEnchanted Cocoa Beans"},"ExtraAttributes":{"id":"ENCHANTED_COCOA"}},"Damage":3},
    "Enchanted Cookie": {"id":"minecraft:cookie","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§7§8Brewing Ingredient","","§9§lRARE"],"Name":"§9Enchanted Cookie"},"ExtraAttributes":{"id":"ENCHANTED_COOKIE"}},"Damage":0},
    "Enchanted Cactus Green": {"id":"minecraft:dye","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§7§8Brewing Ingredient","","§a§lUNCOMMON"],"Name":"§aEnchanted Cactus Green"},"ExtraAttributes":{"id":"ENCHANTED_CACTUS_GREEN"}},"Damage":2},
    "Enchanted Cactus": {"id":"minecraft:cactus","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§7§8Brewing Ingredient","","§9§lRARE"],"Name":"§9Enchanted Cactus"},"ExtraAttributes":{"id":"ENCHANTED_CACTUS"}},"Damage":0},
    "Enchanted Sugar": {"id":"minecraft:sugar","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§7§8Brewing Ingredient","","§a§lUNCOMMON"],"Name":"§aEnchanted Sugar"},"ExtraAttributes":{"id":"ENCHANTED_SUGAR"}},"Damage":0},
    "Enchanted Sugar Cane": {"id":"minecraft:reeds","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§7§8Brewing Ingredient","","§9§lRARE"],"Name":"§9Enchanted Sugar Cane"},"ExtraAttributes":{"id":"ENCHANTED_SUGAR_CANE"}},"Damage":0},
    "Enchanted Raw Beef": {"id":"minecraft:beef","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§a§lUNCOMMON"],"Name":"§aEnchanted Raw Beef"},"ExtraAttributes":{"id":"ENCHANTED_RAW_BEEF"}},"Damage":0},
    "Enchanted Pork": {"id":"minecraft:porkchop","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§a§lUNCOMMON"],"Name":"§aEnchanted Pork"},"ExtraAttributes":{"id":"ENCHANTED_PORK"}},"Damage":0},
    "Enchanted Grilled Pork": {"id":"minecraft:cooked_porkchop","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§9§lRARE"],"Name":"§9Enchanted Grilled Pork"},"ExtraAttributes":{"id":"ENCHANTED_GRILLED_PORK"}},"Damage":0},
    "Enchanted Raw Chicken": {"id":"minecraft:chicken","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§a§lUNCOMMON"],"Name":"§aEnchanted Raw Chicken"},"ExtraAttributes":{"id":"ENCHANTED_RAW_CHICKEN"}},"Damage":0},
    "Enchanted Mutton": {"id":"minecraft:mutton","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§7§8Brewing Ingredient","","§a§lUNCOMMON"],"Name":"§aEnchanted Mutton"},"ExtraAttributes":{"id":"ENCHANTED_MUTTON"}},"Damage":0},
    "Enchanted Cooked Mutton": {"id":"minecraft:cooked_mutton","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§7§8Brewing Ingredient","","§9§lRARE"],"Name":"§9Enchanted Cooked Mutton"},"ExtraAttributes":{"id":"ENCHANTED_COOKED_MUTTON"}},"Damage":0},
    "Enchanted Nether Wart": {"id":"minecraft:nether_wart","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§a§lUNCOMMON"],"Name":"§aEnchanted Nether Wart"},"ExtraAttributes":{"id":"ENCHANTED_NETHER_STALK"}},"Damage":0},
    "Enchanted Raw Rabbit": {"id":"minecraft:rabbit","Count":1,"tag":{"ench":[],"HideFlags":254,"display":{"Lore":["§a§lUNCOMMON"],"Name":"§aEnchanted Raw Rabbit"},"ExtraAttributes":{"id":"ENCHANTED_RABBIT"}},"Damage":0}
}

// Changeable variables
let shouldScan = false
let currentItems = []
let currentVisitor = null

// Functions
const makeItemFromNbt = (nbt) => new Item(net.minecraft.item.ItemStack.func_77949_a(NBT.parse(nbt).rawNBT))

// Logic
const registerWhen = () => WorldState.getCurrentWorld() === requiredWorld && config.visitorBazaarButton

const checkWindowName = windowTitle => shouldScan = GardenVisitorsArray.some(name => name === windowTitle)

class InventoryButton {
    constructor(item, slot, itemName) {
        this.item = item
        this.slot = slot
        this.itemName = itemName

        currentItems.push(this)
    }

    getBoundary() {
        if (Player.getContainer().getSize() !== 90) return
        const [ x, y ] = RenderHelper.getSlotRenderPosition(this.slot)

        const coords = [
            x + 27,
            y,
            x + 27 + 16,
            y + 16
        ]
        
        return coords
    }

    draw() {
        this.drawOutline()

        const [ x, y ] = this.getBoundary()
        this.item.draw(x, y)
        Renderer.drawRect(slotColor, x, y, 16, 16)
    }

    drawOutline() {
        const [ x1, y1, x2, y2 ] = this.getBoundary()

        // Top line
        Renderer.drawLine(slotBorderColor, x1, y1, x2, y1, 1)
        
        // Left line
        Renderer.drawLine(slotBorderColor, x1, y1, x1, y2, 1)
        
        // Right line
        Renderer.drawLine(slotBorderColor, x2, y1, x2, y2, 1)
        
        // Bottom line
        Renderer.drawLine(slotBorderColor, x1, y2, x2, y2, 1)
    }

    onMouseClick(mx, my, btn) {
        const [ x, y, x1, y1 ] = this.getBoundary()
        if (!(mx >= x && mx <= x1 && my >= y && my <= y1)) return

        if (btn !== 0) return
        
        ChatLib.command(`bz ${this.itemName}`)
    }
}

const scanItems = (itemStacks) => {
    if (!shouldScan) return currentItems = []

    let hasVisitorHead = false
    // let currentVisitor = null

    itemStacks.forEach((valueStack, index) => {
        if (!valueStack || (index > 13 && !hasVisitorHead)) return

        const ctItem = new Item(valueStack)
        // Check if it's an actual visitor gui
        // since other npc's have the same gui names
        const visitorOffers = index === 13 ? ctItem.getLore()?.[4] : null
        const hasOffers = visitorOffers ? /^Offers Accepted: [\d]+$/.test(visitorOffers.removeFormatting()) : null

        // If it's an actual visitor re-assign these variables for saving data
        if (hasOffers) {
            if (currentVisitor !== ctItem.getName()?.removeFormatting()) currentItems = []

            currentVisitor = ctItem.getName()?.removeFormatting()
            hasVisitorHead = hasOffers
        }

        // Checking for accept visitor button
        if (index !== 29) return

        // If [ctItem] item is the accept button we check for lore stuff
        ctItem.getLore()?.forEach((itemLore, loreIndex) => {
            const lore = itemLore.removeFormatting()

            // Get required items and amount even if the amount is equals to 0
            // Check lore index in case it finds a rare item so we dont add it to the required items
            if (loreIndex <= 5 && requiredItemsRegex.test(lore)) {
                const [ _, requiredItem, requiredAmount ] = lore.match(requiredItemsRegex)
                const actualName = requiredItem.replace(/ x/, "")

                if (!(actualName in itemIDList)) return

                // Add values to the map
                const itemObj = itemIDList[actualName]
                const slot = currentItems.length === 0 ? 44 : 53

                if (typeof(itemObj) == "object") return new InventoryButton(makeItemFromNbt(itemObj), slot, actualName)

                new InventoryButton(createSkull(itemObj), slot, actualName)

                return
            }
        })
    })

    shouldScan = false
}

const renderOverlay = () => {
    if (!currentItems || shouldScan || !currentVisitor) return

    const container = Player.getContainer()
    if (container.getName() !== currentVisitor) return currentItems = []

    currentItems.forEach(it => it.draw())
}

const mouseClick = (mx, my, mbtn) => {
    if (!currentItems || shouldScan || !currentVisitor) return

    const container = Player.getContainer()
    if (container.getName() !== currentVisitor) return

    currentItems.forEach(it => it.onMouseClick(mx, my, mbtn))
}

// Events
new Event(feature, "onOpenWindowPacket", checkWindowName, registerWhen)
new Event(feature, "onWindowItemsPacket", scanItems, registerWhen)
new Event(feature, "renderOverlay", renderOverlay, registerWhen)
new Event(feature, "guiMouseClick", mouseClick, registerWhen)

// Starting events
feature.start()