export class WorldState {
    static getTablist() {
        return TabList.getNames()?.map(name => name.removeFormatting())
    }

    static getScoreboard(descending = false) {
        return Scoreboard.getLines(descending).map(line => line.getName()?.removeFormatting()?.replace(/[^\u0000-\u007F]/g, ""))
    }

    static inTab(str) {
        return this.getTablist()?.find(name => name.match(/^(Area|Dungeon): ([\w\d ]+)$/))?.includes(str)
    }

    static inDungeons() {
        return this.inTab("Catacombs")
    }

    static getCurrentWorld() {
        if (!World.isLoaded()) return

        for (tabName of this.getTablist()) {
            let worldName = tabName.match(/^(Area|Dungeon): ([\w\d ]+)$/)?.[2]

            if (!worldName) continue
            return worldName
        }
    }

    static getCurrentArea() {
        if (!World.isLoaded()) return

        for (score of this.getScoreboard()) {
            let areaName = score.match(/^  (.+)$/)?.[1]

            if (!areaName) continue
            return areaName
        }
    }
}