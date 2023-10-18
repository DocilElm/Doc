import { onChatPacket } from "../../classes/Events"
import { C0DPacketCloseWindow, convertToRoman, createDungeonsMeter, createSlayersMeter, setDungeonsMeter, setSlayersMeter, slayerGuiNames } from "../../utils/Utils"

// some day im coming back and recoding this horrible thing

const guiScanned = new Set()

onChatPacket((floorName) => {
    setDungeonsMeter(floorName, null)
}).setCriteria(/^You reset your selected drop for your Catacombs \(([\w\d]{1,2})\) RNG Meter\!$/)

onChatPacket((floorName, selectedDrop) => {
    setDungeonsMeter(floorName, selectedDrop)
}).setCriteria(/^You set your Catacombs \(([\w\d]{1,2})\) RNG Meter to drop ([\w\d\(\)' ]+)\!$/)

onChatPacket((slayerName) => {
    setSlayersMeter(slayerName, null)
}).setCriteria(/^You reset your selected drop for your ([\w ]+) RNG Meter!$/)

onChatPacket((slayerName, selectedDrop, event, formatted) => {
    if(selectedDrop === "Enchanted Book Bundle") print(formatted)

    setSlayersMeter(slayerName, selectedDrop)
}).setCriteria(/^You set your ([\w ]+) RNG Meter to drop ([\w\d\(\)'◆ ]+)\!$/)

register("step", () => {
    if(!World.isLoaded()) return

    const container = Player.getContainer()

    const slayer = slayerGuiNames.has(container.getName())
    const itemIndex = slayer ? 14 : 17
    const scoreIndex = slayer ? 17 : 20

    if(slayer && !guiScanned.has(container.getName())){
        const item = container.getItems()?.[35]?.getName()?.removeFormatting() !== "RNG Meter" && container.getItems()?.[34]?.getName()?.removeFormatting() === "RNG Meter"
            ? container.getItems()?.[34]
            : container.getItems()?.[35]

        if(!item || item.getID() === 160) return

        const slayerName = item.getLore()?.[1]?.removeFormatting()
        if(!item.getLore().join(",").removeFormatting().includes("Selected Drop")) return createSlayersMeter(slayerName, null, null)

        const score = parseFloat(item.getLore()?.[scoreIndex]?.removeFormatting()?.match(/^ +([\d,]+)\/([\d,]+)/)?.[1]?.replace(/,/g, ""))
        let selectedDrop = item.getLore()?.[itemIndex]?.removeFormatting()

        if(selectedDrop.includes("Enchanted Book") || selectedDrop.includes(" Rune ")){
            const num = selectedDrop.match(/([\d]+)/)?.[1]
            selectedDrop = selectedDrop.replace(num, convertToRoman(num))
        }

        if(selectedDrop === "Enchanted Book Bundle" && item.getLore()?.[itemIndex] === "§5§o§6Enchanted Book Bundle" ) selectedDrop = "The One Bundle"
        else if(selectedDrop === "Enchanted Book Bundle" && item.getLore()?.[itemIndex] === "§5§o§aEnchanted Book Bundle" ) selectedDrop = "Quantum Bundle"

        createSlayersMeter(slayerName, score, selectedDrop)
        guiScanned.add(container.getName())
        return
    }

    if(container.getName() !== "Catacombs RNG Meter" || guiScanned.has(container.getName())) return
    
    const guiItems = container.getItems()?.splice(8, 36)

    guiItems.forEach(item => {
        if(!item || item.getID() === 160 || item.getName().removeFormatting() !== "RNG Meter") return

        const floorName = item.getLore()?.[1]?.removeFormatting()?.match(/^Catacombs \(([\w\d]+)\)$/)?.[1]
        if(!item.getLore().join(",").removeFormatting().includes("Selected Drop")) return createDungeonsMeter(floorName, null, null)

        const score = parseFloat(item.getLore()?.[scoreIndex]?.removeFormatting()?.match(/^ +([\d,]+)\/([\d,]+)/)?.[1]?.replace(/,/g, ""))
        let selectedDrop = item.getLore()?.[itemIndex]?.removeFormatting()

        if(selectedDrop.includes("Enchanted Book")){
            const num = selectedDrop.match(/([\d]+)/)?.[1]
            selectedDrop = selectedDrop.replace(num, convertToRoman(num))
        }

        createDungeonsMeter(floorName, score, selectedDrop)
    })

    guiScanned.add(container.getName())
}).setFps(1)

register("packetSent", (packet, event) => {
    guiScanned.clear()
}).setFilteredClass(C0DPacketCloseWindow)