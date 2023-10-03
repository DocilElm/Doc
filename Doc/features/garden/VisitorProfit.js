import { addEvent } from "../../FeatureBase"
import { PREFIX, chat, copperToCoinsItem, data, getJsonDataFromFile, isInTab, mathTrunc, rareGardenItems, sbNameToIdGarden } from "../../utils/Utils"

const editGui = new Gui()

let bazaarApi = getJsonDataFromFile("data/Bazaar.json")
let lowestBinApi = getJsonDataFromFile("data/LowestBin.json")
let itemsRequired = {}

// i gave up mid way doing this code

addEvent("visitorProfitDisplay", "Garden", register("step", () => {
    if(!World.isLoaded() || !Player.getContainer()?.getName()) return

    const container = Player.getContainer()
    const containerName = container.getName()
    const visitorHead = container.getItems()?.[13]?.getLore()?.[4]

    if(!visitorHead || !/^Offers Accepted: [\d]+$/.test(visitorHead.removeFormatting())) return

    const acceptVisitorBtn = container.getItems()?.[29]
    if(!acceptVisitorBtn || acceptVisitorBtn.getName().removeFormatting() !== "Accept Offer") return

    if(!!itemsRequired[containerName]) return

    acceptVisitorBtn.getLore()?.forEach(lore => {
        const unformattedLore = lore.removeFormatting()

        if(/^ ([\w ]+) x([\d,]+)$/.test(unformattedLore)) {
            const [ ar, item, amount ] = unformattedLore.match(/^ ([\w ]+) x([\d,]+)$/)
            const itemPrice = bazaarApi?.products?.[sbNameToIdGarden[item.toUpperCase().replace(/ /g, "_")]]?.quick_status?.sellPrice
            const price = itemPrice * amount.replace(/,/g, "")

            if(itemsRequired[containerName]) return itemsRequired[containerName].item.push([`\n${lore}`]), itemsRequired[containerName].totalPrice += price

            itemsRequired[containerName] = {
                item: [`\n${lore}`],
                copper: 0,
                specialItem: null,
                totalPrice: price,
                profit: 0
            }
        }

        if(!itemsRequired[containerName]) return

        if(/^ \+([\d,]+) Copper$/.test(unformattedLore)){
            const [ ar, copper ] = unformattedLore.match(/^ \+([\d,]+) Copper$/)

            itemsRequired[containerName].copper += parseInt(copper)
        }

        if(Object.keys(rareGardenItems).some(rItems => unformattedLore.includes(rItems))) {
            itemsRequired[containerName].specialItem = rareGardenItems[unformattedLore.replace(/^ /, "")]
        }
    })

    if(!itemsRequired[containerName]) return chat(`${PREFIX} &cFailed to create visitor's profit display`)

    const itemPrice = itemsRequired[containerName].totalPrice
    const copperProfit = (bazaarApi?.products?.[copperToCoinsItem]?.quick_status?.sellPrice / 1500) * itemsRequired[containerName].copper
    itemsRequired[containerName].profit = (copperProfit-itemPrice)

    const specialItemObj = itemsRequired[containerName].specialItem

    if(!specialItemObj) return

    const specialItemProfit = !bazaarApi?.products?.[specialItemObj]
        ? lowestBinApi[specialItemObj]
        : bazaarApi?.products?.[specialItemObj]?.quick_status?.sellPrice

    itemsRequired[containerName].profit = (specialItemProfit - (itemsRequired[containerName].profit <= 0 ? -itemsRequired[containerName].profit : +itemsRequired[containerName].profit))
}).setFps(1), null, [
    register("renderOverlay", () => {
        if(editGui.isOpen()){
            Renderer.translate(data.visitorProfit.x, data.visitorProfit.y)
            Renderer.scale(data.visitorProfit.scale ?? 1)
            Renderer.drawStringWithShadow(`&aNPC&f: &bDocilElm\n&aItems Required&f: \n&aEnchanted Life &8x1\n&cCopper&f: &60\n&9Special Item&f: &6None\n&aTotal Profit&f: &60`, -10, -5)
            return
        }
        if(!World.isLoaded() || Object.keys(itemsRequired).length <= 0) return
    
        Object.keys(itemsRequired).forEach((visitor, index) => {
            const visitorItem = `${itemsRequired[visitor].item.toString()}`
            const visitorCopper = itemsRequired[visitor].copper
            const visitorProfit = mathTrunc(itemsRequired[visitor].profit)
            const visitorSpecialItem = itemsRequired[visitor].specialItem
    
            Renderer.translate(data.visitorProfit.x, data.visitorProfit.y)
            Renderer.scale(data.visitorProfit.scale ?? 1)
            Renderer.drawStringWithShadow(`&aNPC&f: &b${visitor}\n&aItems Required&f: &b${visitorItem}\n&cCopper&f: &6${visitorCopper}\n&9Special Item&f: &6${visitorSpecialItem ?? "None"}\n&aTotal Profit&f: &6${visitorProfit}`, -10, index === 0 ? -5 : -5+(60*index))
        })
    }),
    
    register("step", () => {
        bazaarApi = getJsonDataFromFile("data/Bazaar.json")
        lowestBinApi = getJsonDataFromFile("data/LowestBin.json")
    }).setDelay(60*20),
    
    // me when lazy
    // ^\[NPC\] ([\w ]+): ([\w\d ]+)$
    register("chat", (npcName, npcMsg) => {
        if(!itemsRequired[npcName]) return
    
        delete itemsRequired[npcName]
    }).setCriteria(/^\[NPC\] ([\w ]+): (.+)$/)
], "Garden")

register("command", () => {
    if(!isInTab("Garden")) return chat(`${PREFIX} &cYou're not in the Garden`), Client.currentGui.close()

    editGui.open()
}).setName("visitorProfitDisplay")

register("dragged", (dx, dy, x, y) => {
    if (!editGui.isOpen()) return

    data.visitorProfit.x = x
    data.visitorProfit.y = y
    data.save()
})

register("scrolled", (mx, mr, num) => {
    if (!editGui.isOpen()) return

    if(num === 1) data.visitorProfit.scale += 0.1
    else data.visitorProfit.scale -= 0.1

    data.save()
})

register("worldUnload", () => itemsRequired = {})