import ScalableGui from "../shared/Scalable"
import { Persistence } from "../shared/Persistence"
import ThePlayer from "../../Atomx/skyblock/ThePlayer"
import config from "../config"

const DeployableData = Persistence.getDataFromFileOrLink("DeployablesData.json", "https://raw.githubusercontent.com/DocilElm/Doc/main/JsonData/DeployablesData.json")
export const flaresTextures = DeployableData.flaresTextures
export const editGui = new ScalableGui("deployableDisplay", "&b+15.5 ✎/s\n&4+10 ♨ &f+10 ❂\n&c+10 ⫽ &e+5% ⚔").setCommand("editDeployableDisplay")
export const orbStats = DeployableData.orbStats
// Used by the priority system
const orbStatsArray = Object.keys(orbStats)
const baseFlareTime = 180_000
export const orbRegex = /^([A-z ]+) (\d+s)$/
const flaresStats = DeployableData.flaresStats
export const DeployablesList = new Map()
const placeholderItem = new Item("minecraft:skull")
const placeholderString = `&b+15.5 ✎/s\n&4+10 ♨ &f+10 ❂\n&c+10 ⫽ &e+5% ⚔`

// Default render
editGui.onRender(() => {
    Renderer.translate(editGui.getX(), editGui.getY())
    placeholderItem.draw(0, 0, 1.5)

    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow("&a180s", 1, 24)

    if (!config.deployableDisplayStats) return Renderer.finishDraw()
    
    Renderer.translate(editGui.getX(), editGui.getY())
    Renderer.scale(editGui.getScale())
    Renderer.drawStringWithShadow(placeholderString, 28, 5)
    Renderer.finishDraw()
})

export class Deployable {
    constructor(item, entity, texture = null, entityUUID = null) {
        this.item = item
        this.entity = entity
        this.texture = texture
        this.entityUUID = entityUUID
        this.range = 0

        // Priority stuff0
        this.priority = 0
        this.deployableObj = null
        this.timeLeft = null

        this._init()
    }

    /**
     * - Gets the data required for this deployable
     * @returns 
     */
    _init() {
        const idx = flaresTextures.indexOf(this.texture)

        if (idx !== -1) {
            this.priority = idx
            this.deployableObj = flaresStats[this.priority]
            this.range = 40

            return
        }

        const [ _, orbName ] = this.entity.getName()?.removeFormatting()?.match(orbRegex)
        
        this.priority = orbStatsArray.indexOf(orbName)
        this.deployableObj = orbStats[orbName]
        this.range = this.deployableObj.range
    }

    /**
     * - Checks whether the entity is still alive or far away from the player
     * - if this is the case remove it from the list
     * @returns 
     */
    _checkEntity() {
        if (this.entity.isDead()) return DeployablesList.delete(this.entityUUID)
        if (this.inRadious(this.entity.distanceTo(Player.getPlayer()))) return

        DeployablesList.delete(this.entityUUID)
    }

    /**
     * - Draws the stats and item for a flare deployable
     */
    _drawFlare(internal = false) {
        this._checkEntity()

        const entityTime = this.entity.entity.field_70173_aa * 50
        this.timeLeft = (baseFlareTime - entityTime)

        const seconds = (this.timeLeft / 1000)
        const time = `&a${seconds.toFixed(0)}s`
        const baseManaRegen = (ThePlayer.getMaxMana() / 50)
        const manaRegenerated = this.deployableObj.manaRegen === 0 ? baseManaRegen : baseManaRegen + (ThePlayer.getMaxMana() * this.deployableObj.manaRegen) / 50
        const string = `&b+${manaRegenerated.toFixed(1)} ✎/s\n&4+${this.deployableObj.vitality} ♨ &f+${this.deployableObj.trueDefense} ❂\n&c+${this.deployableObj.ferocity} ⫽ &e+${this.deployableObj.attackSpeed}% ⚔`

        if (!internal) this._draw(`&a${time}`, string)
    }

    /**
     * - Draws the stats and item for a orb deployable
     */
    _drawOrb(internal = false) {
        this._checkEntity()

        const [ _, __, time ] = this.entity.getName()?.removeFormatting()?.match(orbRegex)
        this.timeLeft = parseInt(time.replace(/s/g, ""))

        const baseManaRegen = (ThePlayer.getMaxMana() / 50)
        const manaRegenerated = this.deployableObj.manaRegen === 0 ? baseManaRegen : baseManaRegen + (ThePlayer.getMaxMana() * this.deployableObj.manaRegen) / 50
        const healthRegenerated = ThePlayer.getMaxHealth() * this.deployableObj.healthRegen
        const string = `&b+${manaRegenerated.toFixed(1)} ✎/s\n&c+${healthRegenerated.toFixed(1)} ❤/s\n&4+${this.deployableObj.vitality} ♨ &a+${this.deployableObj.mending} ☄ &c+${this.deployableObj.strength} ❁`

        if (!internal) this._draw(`&a${time}`, string)
    }
    
    /**
     * - Renders the specified [time] and [string] with the current [Deployable] item
     * @param {String} time 
     * @param {String} string 
     */
    _draw(time, string) {
        // yeah...
        const x = time.removeFormatting().length === 4
            ? 1
            : time.removeFormatting().length === 2
                ? Renderer.getStringWidth(time.removeFormatting()) / 2
                : Renderer.getStringWidth(time.removeFormatting()) / 4

        Renderer.translate(editGui.getX(), editGui.getY())
        this.item.draw(0, 0, 1.5)

        Renderer.translate(editGui.getX(), editGui.getY())
        Renderer.scale(editGui.getScale())
        Renderer.drawStringWithShadow(time, x, 24)
        
        if (!config.deployableDisplayStats) return Renderer.finishDraw()

        Renderer.translate(editGui.getX(), editGui.getY())
        Renderer.scale(editGui.getScale())
        Renderer.drawStringWithShadow(string, 28, 5)
        Renderer.finishDraw()
    }

    /**
     * - Calls the correct draw method for this [Deployable]'s deployable
     * @returns 
     */
    draw(internal = false) {
        if (flaresTextures.indexOf(this.texture) !== -1) return this._drawFlare(internal)

        this._drawOrb(internal)
    }

    /**
     * - Checks whether the number is close to this [Deployable]'s range
     * @param {Number} dist 
     * @returns {Boolean}
     */
    inRadious(dist) {
        return dist <= this.range
    }

    /**
     * - Gets this [Deployable]'s priority
     * - adds +1 to any flare due to flux having 1 more than flares
     * @returns {Number}
     */
    getPriority() {
        if (flaresTextures.indexOf(this.texture) !== -1) return this.priority + 1

        return this.priority
    }

    /**
     * - Gets this [Deployable]'s time left
     * @returns {Number}
     */
    getTimeLeft() {
        return this.timeLeft
    }
}
