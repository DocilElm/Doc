import config from "../../config"
import { Event } from "../../core/Event"
import Feature from "../../core/Feature"
import { InventoryButton } from "../../shared/InventoryButton"
import { onVisitor, onVisitorClose } from "./GardenEvents"

const itemNBT = {
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
const requiredItemsRegex = /^ ([A-z ]+)([\d,]+)?$/
const buttonsCreated = new Set()

const makeItemFromNbt = (nbt) => new Item(net.minecraft.item.ItemStack.func_77949_a(NBT.parse(nbt).rawNBT))

const feat = new Feature("visitorBazaarButton", "garden")
    .addSubEvent(
        new Event("renderOverlay", () => {
            buttonsCreated.forEach(it => it.draw())
        }),
        () => buttonsCreated.size
    )
    .onUnregister(() => {
        buttonsCreated.forEach(it => it.markDirty())
        buttonsCreated.clear()
    })

onVisitor((name, acceptButton) => {
    if (!config().visitorBazaarButton) return

    const acceptLore = acceptButton.getLore()

    for (let idx = 2; idx < 6; idx++) {
        let lore = acceptLore[idx].removeFormatting()

        let requiredItemsMatch = lore.match(requiredItemsRegex)
        if (!requiredItemsMatch) continue

        let requiredName = requiredItemsMatch[1].replace(/ x/, "")
        if (!(requiredName in itemNBT)) continue

        let nbt = itemNBT[requiredName]
        let slot = buttonsCreated.size === 0 ? 44 : 53

        if (typeof(nbt) == "object") {
            buttonsCreated.add(
                new InventoryButton(slot)
                    .setOffset(27)
                    .setItem(makeItemFromNbt(nbt))
                    .setCommand(`bz ${requiredName}`)
                    .setCheckFn(() => config().visitorBazaarButton)
                )

            continue
        }

        buttonsCreated.add(
            new InventoryButton(slot)
                .setOffset(27)
                .createItemByTexture(nbt)
                .setCommand(`bz ${requiredName}`)
                .setCheckFn(() => config().visitorBazaarButton)
            )
    }

    feat.update()
})

onVisitorClose(() => {
    if (!config().visitorBazaarButton) return

    buttonsCreated.forEach(it => it.markDirty())
    buttonsCreated.clear()
    feat.update()
})