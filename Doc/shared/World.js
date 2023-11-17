export class WorldState {
    static getTablist() {
        // Add the default return so we always get an array returned
        if (!World.isLoaded()) return []

        return TabList.getNames().map(name => name.removeFormatting())
    }

    static getScoreboard(descending = false) {
        return Scoreboard.getLines(descending).map(line => line.getName()?.removeFormatting()?.replace(/[^\u0000-\u007F]/g, ""))
    }

    static inTab(string) {
        return this.getTablist().find(name => name.match(/^(Area|Dungeon): ([\w\d ]+)$/))?.includes(string)
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