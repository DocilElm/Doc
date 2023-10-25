export class WorldState {
    static getTablist() {
        return TabList.getNames()?.map(names => names.removeFormatting())
    }

    static getScoreboard(descending = false) {
        return Scoreboard.getLines(descending)?.map(line => line?.getName()?.removeFormatting()?.replace(/[^\u0000-\u007F]/g, ""))
    }

    static inTab(str) {
        return this.getTablist()?.find(names => names.match(/^(Area|Dungeon): ([\w\d ]+)$/))?.includes(str)
    }

    static inDungeons() {
        return this.inTab("Catacombs")
    }

    static getCurrentWorld() {
        if(!World.isLoaded()) return

        let worldName = null

        this.getTablist()?.forEach(names => {
            if(!!worldName) return

            worldName = names?.match(/^(Area|Dungeon): ([\w\d ]+)$/)?.[2]
        })

        return worldName
    }

    static getCurrentArea() {
        if(!World.isLoaded()) return

        let areaName = null

        this.getScoreboard().forEach(names => {
            if (!!areaName) return

            areaName = names.match(/^  (.+)$/)?.[1]
        })

        return areaName
    }

    static getCurrentFloor() {
        if(!this.inDungeons()) return
    }
}