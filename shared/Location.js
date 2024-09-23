const S38PacketPlayerListItem = net.minecraft.network.play.server.S38PacketPlayerListItem

export default new class Location {
    constructor() {
        // Should store all the registers this [class]
        // needs to unregister them on unload
        this.registers = []

        // Location stuff
        this.area = null
        this.subarea = null

        // Listeners
        this.listeners = {
            area: [],
            subarea: []
        }

        // Create registers
        this._createRegisters()

        // Register data
        this.hasRegistered = true
    }

    /**
     * - Internal use.
     * - Creates the required registers for this class
     */
    _createRegisters() {
        // Getting world/area data on `/ct load`
        // trigger the corresponding listeners
        this.registers.push(
            register("gameLoad", () => {
                if (!World.isLoaded()) return

                // Getting the area
                Scoreboard.getLines()
                    ?.map(line => line?.getName()?.removeFormatting()?.replace(/[^\u0000-\u007F]/g, ""))
                    ?.forEach(it => {
                        const match = it?.match(/^  (\w.+)$/)?.[1]
                        if (!match) return

                        this.subarea = match.toLowerCase()
                        this.listeners.subarea.forEach(it => it(this.subarea))
                    })

                // Getting the world
                TabList.getNames()
                    ?.forEach(it => {
                        const match = it?.removeFormatting()?.match(/^(Area|Dungeon): ([\w\d ]+)$/)?.[2]
                        if (!match) return

                        this.area = match.toLowerCase().replace(/(area|dungeon): /, "")
                        this.listeners.area.forEach(it => it(this.area))
                    })
            })
        )

        // Getting scoreboard subarea
        this.registers.push(
            register("packetReceived", (packet) => {
                const channel = packet.func_149307_h()
                if (channel !== 2) return
    
                const teamStr = packet.func_149312_c()
                const teamMatch = teamStr.match(/^team_(\d+)$/)
                if (!teamMatch) return
    
                const formatted = packet.func_149311_e().concat(packet.func_149309_f())
                const unformatted = formatted.removeFormatting()
    
                if (!/^ (⏣|ф)/.test(unformatted)) return

                this.subarea = unformatted.toLowerCase()
                this.listeners.subarea.forEach(it => it(this.subarea))
            }).setFilteredClass(net.minecraft.network.play.server.S3EPacketTeams)
        )

        // Getting tablist area
        this.registers.push(
            register("packetReceived", (packet) => {
                const players = packet.func_179767_a() // .getPlayers()
                const action = packet.func_179768_b() // .getAction()
    
                if (action !== S38PacketPlayerListItem.Action.ADD_PLAYER) return
    
                players.forEach(addPlayerData => {
                    const name = addPlayerData.func_179961_d() // .getDisplayName()
                    
                    if (!name) return
    
                    const formatted = name.func_150254_d() // .getFormattedText()
                    const unformatted = formatted.removeFormatting()

                    if (!/^Area|Dungeon: [\w ]+$/.test(unformatted)) return
                    if (action !== S38PacketPlayerListItem.Action.ADD_PLAYER) return

                    this.area = unformatted.toLowerCase().replace(/(area|dungeon): /, "")
                    this.listeners.area.forEach(it => it(this.area))
                })
            }).setFilteredClass(S38PacketPlayerListItem)
        )

        // Reset both variables
        this.registers.push(
            register("worldUnload", () => {
                this.area = null
                this.subarea = null

                this.listeners.area.forEach(it => it())
                this.listeners.subarea.forEach(it => it())
            })
        )
    }

    /**
     * - Checks whether the player is currently in the given world
     * @param {string} str
     * @returns {boolean}
     */
    inWorld(str) {
        if (!World.isLoaded() || !this.area) return false
        
        return this.area === str.toLowerCase().removeFormatting()
    }

    /**
     * - Checks whether the player is currently in the given area
     * @param {string} str
     * @returns {boolean}
     */
    inArea(str) {
        if (!World.isLoaded() || !this.subarea) return false

        return this.subarea.includes(str.toLowerCase().removeFormatting())
    }

    /**
     * - Runs the given function whenever the World has changed (tablist area)
     * @param {(world: ?string) => void} fn 
     * @returns this for method chaining
     */
    onWorldChange(fn) {
        this.listeners.area.push(fn)

        return this
    }

    /**
     * - Runs the given function whenever the Area has changed (scoreboard area)
     * @param {(area: ?string) => void} fn 
     * @returns this for method chaining
     */
    onAreaChange(fn) {
        this.listeners.subarea.push(fn)

        return this
    }

    /**
     * - Internal use.
     * - Clears the listeners to their default state
     * @returns this for method chaining
     */
    _clearListeners() {
        this.listeners.area = []
        this.listeners.subarea = []

        return this
    }

    /**
     * - Internal use.
     * - Registers the registers required by this class
     * @returns this for method chaining
     */
    _load() {
        if (this.hasRegistered) return this

        this.registers.forEach(it => it.register())
        this.hasRegistered = true
        
        return this
    }

    /**
     * - Internal use.
     * - Unregisters the registers required by this class
     * @returns this for method chaining
     */
    _unload() {
        if (!this.hasRegistered) return this

        this.registers.forEach(it => it.unregister())
        this.hasRegistered = false
        
        return this
    }
}