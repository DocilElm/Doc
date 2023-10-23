export class WorldManager {
    static getCurrentWorld() {
        return TabList.getNames()?.find(names => names.removeFormatting()?.match(/^Area|Dungeon: ([\w\d ]+)$/));
    }
}