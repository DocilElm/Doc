let idx = 0

const EnumParticleTypes = net.minecraft.util.EnumParticleTypes

// Just for auto completion
export const ParticleEnums = {
    BARRIER: EnumParticleTypes.BARRIER,
    BLOCK_CRACK: EnumParticleTypes.BLOCK_CRACK,
    BLOCK_DUST: EnumParticleTypes.BLOCK_DUST,
    CLOUD: EnumParticleTypes.CLOUD,
    CRIT: EnumParticleTypes.CRIT,
    CRIT_MAGIC: EnumParticleTypes.CRIT_MAGIC,
    DRIP_LAVA: EnumParticleTypes.DRIP_LAVA,
    DRIP_WATER: EnumParticleTypes.DRIP_WATER,
    ENCHANTMENT_TABLE: EnumParticleTypes.ENCHANTMENT_TABLE,
    EXPLOSION_HUGE: EnumParticleTypes.EXPLOSION_HUGE,
    EXPLOSION_LARGE: EnumParticleTypes.EXPLOSION_LARGE,
    EXPLOSION_NORMAL: EnumParticleTypes.EXPLOSION_NORMAL,
    FIREWORKS_SPARK: EnumParticleTypes.FIREWORKS_SPARK,
    FLAME: EnumParticleTypes.FLAME,
    FOOTSTEP: EnumParticleTypes.FOOTSTEP,
    HEART: EnumParticleTypes.HEART,
    ITEM_CRACK: EnumParticleTypes.ITEM_CRACK,
    ITEM_TAKE: EnumParticleTypes.ITEM_TAKE,
    LAVA: EnumParticleTypes.LAVA,
    MOB_APPEARANCE: EnumParticleTypes.MOB_APPEARANCE,
    NOTE: EnumParticleTypes.NOTE,
    PORTAL: EnumParticleTypes.PORTAL,
    REDSTONE: EnumParticleTypes.REDSTONE,
    SLIME: EnumParticleTypes.SLIME,
    SMOKE_LARGE: EnumParticleTypes.SMOKE_LARGE,
    SMOKE_NORMAL: EnumParticleTypes.SMOKE_NORMAL,
    SNOW_SHOVEL: EnumParticleTypes.SNOW_SHOVEL,
    SNOWBALL: EnumParticleTypes.SNOWBALL,
    SPELL: EnumParticleTypes.SPELL,
    SPELL_INSTANT: EnumParticleTypes.SPELL_INSTANT,
    SPELL_MOB: EnumParticleTypes.SPELL_MOB,
    SPELL_MOB_AMBIENT: EnumParticleTypes.SPELL_MOB_AMBIENT,
    SPELL_WITCH: EnumParticleTypes.SPELL_WITCH,
    SUSPENDED: EnumParticleTypes.SUSPENDED,
    SUSPENDED_DEPTH: EnumParticleTypes.SUSPENDED_DEPTH,
    TOWN_AURA: EnumParticleTypes.TOWN_AURA,
    VILLAGER_ANGRY: EnumParticleTypes.VILLAGER_ANGRY,
    VILLAGER_HAPPY: EnumParticleTypes.VILLAGER_HAPPY,
    WATER_BUBBLE: EnumParticleTypes.WATER_BUBBLE,
    WATER_DROP: EnumParticleTypes.WATER_DROP,
    WATER_SPLASH: EnumParticleTypes.WATER_SPLASH,
    WATER_WAKE: EnumParticleTypes.WATER_WAKE,
}

export default {
    STEP: idx++,
    CHAT: idx++,
    SOUNDPLAY: idx++,
    COMMAND: idx++,
    RENDERENTITY: idx++,
    POSTRENDERENTITY: idx++,
    ENTITYDEATH: idx++,
    PACKET: {
        CLIENT: {
            BLOCKPLACEMENT: idx++,
            WINDOWCLICK: idx++,
            DIGGING: idx++,
            WINDOWCLOSE: idx++,
            HELDITEMCHANGE: idx++
        },
        SERVER: {
            CHAT: idx++,
            ACTIONBAR: idx++,
            SCOREBOARD: idx++,
            TABUPDATE: idx++,
            TABADD: idx++,
            TABHEADERFOOTER: idx++,
            WINDOWITEMS: idx++,
            WINDOWOPEN: idx++,
            WINDOWCLOSE: idx++,
            PLAYERPOSLOOK: idx++,
            COLLECTITEM: idx++,
            ENTITYLOOKMOVE: idx++,
            SPAWNPARTICLE: idx++,
            SPAWNMOB: idx++,
            BLOCKCHANGE: idx++
        },
        CUSTOM: {
            BLESSINGCHANGE: idx++,
            WINDOWCLOSE: idx++,
            TICK: idx++,
            OPENEDCHEST: idx++,
            MULTIBLOCKCHANGE: idx++
        }
    },
    FORGE: {
        ENTITYJOIN: idx++
    }
}