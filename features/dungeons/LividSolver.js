import { scheduleTask } from "../../core/CustomRegisters"
import { Event } from "../../core/Event"
import EventEnums from "../../core/EventEnums"
import Feature from "../../core/Feature"
import { RenderHelper } from "../../shared/Render"
import { TextHelper } from "../../shared/TextHelper"

// Credits: https://github.com/UnclaimedBloom6/BloomModule/blob/main/features/LividSolver.js

const livids = [
    [0, "Vendetta", "§f"],
    [2, "Crossed", "§d"],
    [4, "Arcade", "§e"],
    [5, "Smile", "§a"],
    [7, "Doctor", "§7"],
    [10, "Purple", "§5"],
    [11, "Scream", "§9"],
    [13, "Frog", "§2"],
    [14,  "Hockey", "§c"]
]

let livid = null
let lividData = null
let inf5 = false

const getIdFromBlock = (blockIn) => {
    return net.minecraft.block.Block./* getIdFromBlock */func_149682_b(blockIn)
}

const feat = new Feature("lividSolver", "catacombs")
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, () => {
            inf5 = true
            feat.update()
        }, /^\[BOSS\] Livid\: Welcome\, you\'ve arrived right on time\. I am Livid, the Master of Shadows\.$/)
    )
    .addEvent(
        new Event(EventEnums.PACKET.SERVER.CHAT, () => {
            // If livid data is not set whenever the livids spawn
            // we default to red color livid
            scheduleTask(() => {
                if (livid) return

                lividData = livids[8]
                feat.update()
            }, 2)
        }, /^\[BOSS\] Livid\: I respect you for making it to here\, but I\'ll be your undoing\.$/)
    )
    .addSubEvent(
        new Event(EventEnums.PACKET.SERVER.MULTIBLOCKCHANGE, (mcBlocks) => {
            mcBlocks.forEach((it) => {
                const pos = it./* getPos */func_180090_a()
                const [ x, y, z ] = [
                    pos./* getX */func_177958_n(),
                    pos./* getY */func_177956_o(),
                    pos./* getZ */func_177952_p()
                ]
        
                if (x !== 5 || y !== 108 || z !== 43) return
        
                const blockState = it./* getBlockState */func_180088_c()
                const blockIn = blockState./* getBlock */func_177230_c()
                const blockId = getIdFromBlock(blockIn)
                if (blockId !== 35) return livid = null
        
                const metadata = blockIn./* getMetaFromState */func_176201_c(blockState)
                lividData = livids.find(a => a[0] == metadata)
                ChatLib.chat(`${TextHelper.PREFIX} &bLivid Solver&f: ${lividData[2]}${lividData[1]} Livid`)
            })
            feat.update()
        }),
        () => inf5
    )
    .addSubEvent(
        new Event(EventEnums.FORGE.ENTITYJOIN, (mcEntity) => {
            scheduleTask(() => {
                const name = mcEntity./* getName */func_70005_c_()
                if (name !== `${lividData?.[1]} Livid`) return
        
                livid = mcEntity
                feat.update()
            })
        }, net.minecraft.client.entity.EntityOtherPlayerMP),
        () => lividData
    )
    .addSubEvent(
        new Event("renderWorld", () => {
            RenderHelper.drawEntityBox(
                livid./* posX */field_70165_t,
                livid./* posY */field_70163_u,
                livid./* posZ */field_70161_v,
                0.6,
                1.8,
                0, 255, 255, 255, 2, false
            )
        }),
        () => livid
    )
    .onUnregister(() => {
        livid = null
        lividData = null
        inf5 = false
    })