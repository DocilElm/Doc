import { ChestMenu } from "../../../ChestMenu/index"
import { PREFIX, chat, getJsonDataFromFile } from "../../utils/Utils"

const inventoryLogs = getJsonDataFromFile("data/InventoryLogs.json", [])

const makeInvChest = (invName, rows = 4) => new ChestMenu(`&b&lInventory&f: &6&l${invName}`, rows)
const makeInvObj = () => {
    const res = {}

    Player.getInventory()?.getItems()?.splice(0, 36)?.forEach((invItems, index) => {
        if(!invItems) return

        res[index] = FileLib.encodeBase64(JSON.stringify({
            itemLore: invItems.getLore().join("\\"),
            itemID: invItems.getID()
        }))
    })

    return res
}

register("command", (type, ...args) => {
    if(!type) return chat(`${PREFIX} &cPlease use &6add&c, &6remove &cor &6open`)
    if(!args?.[0]) return chat(`${PREFIX} &cMissing inventory name`)

    const mode = type.toLowerCase()
    const logsObj = inventoryLogs.find(obj => obj.name === args.join(" "))

    if(mode === "open") {
        let invArr = []

        Object.keys(logsObj?.inventory ?? {}).forEach(k => {
            if(!k) return

            const encObj = JSON.parse(FileLib.decodeBase64(logsObj.inventory[k]))
            const itemLore = encObj.itemLore
            const itemID = encObj.itemID
            const index = parseInt(k) <= 8 ? parseInt(k)+27 : parseInt(k)-9

            invArr[index] = new Item(itemID).setName("").setLore(itemLore.split("\\"))
        })

        return makeInvChest(args.join(" "), 4).setItems(invArr).open()
    }
    
    if(mode === "remove") {
        const index = inventoryLogs.findIndex(obj => obj.name === args.join(" "))
        if(index < 0) return chat(`${PREFIX} &cInventory name not found`)

        inventoryLogs.splice(index, 1)

        FileLib.write("Doc", "data/InventoryLogs.json", JSON.stringify(inventoryLogs, null, 4))
        chat(`${PREFIX} &aSuccessfully removed &c${args.join(" ")} &afrom inventory logs`)
        return
    }

    if(mode !== "add") return

    if(!logsObj) inventoryLogs.push({
        name: args.join(" "),
        inventory: makeInvObj()
    })
    else logsObj.inventory = makeInvObj()

    FileLib.write("Doc", "data/InventoryLogs.json", JSON.stringify(inventoryLogs, null, 4))
    chat(`${PREFIX} &aSuccessfully added &6${args.join(" ")} &ato inventory logs`)
}).setName("invlogs")