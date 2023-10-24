export class WorldManager {
    static getCurrentWorld() {
        if(!World.isLoaded()) return
        
        let worldName = null

        TabList.getNames()?.forEach(names => {
            if(!!worldName) return
            worldName = names.removeFormatting()?.match(/^Area|Dungeon: ([\w\d ]+)$/)?.[1]
        })

        return worldName
    }
}