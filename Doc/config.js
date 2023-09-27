import {
    @Vigilant, 
    @TextProperty, 
    @ColorProperty, 
    @ButtonProperty, 
    @SwitchProperty,
    @SelectorProperty,
    Color 
} from 'Vigilance'

@Vigilant("Doc", "Doc", {
    getCategoryComparator: () => (a, b) => {
        const categories = ["General", "Dungeons", "Mining"]
        return categories.indexOf(a.name) - categories.indexOf(b.name)
    }
})

class Settings {
    constructor() {
        this.initialize(this)
        // main feature to the right and hidden feature to the left
        this.addDependency("Gemstone Mining Profit Location", "Gemstone Mining Profit")
    }
    
    // Dungeons
    @SwitchProperty({
        name: "Star Mob Esp",
        description: "Draws a box in starred mob esp (not see through walls)",
        category: "Dungeons",
        subcategory: "Dungeons"
    })
    mobESP = false;

    @SwitchProperty({
        name: "Show Secrets Clicked",
        description: "Draws a box in the clicked chest/wither essence/redstone skull (not see through walls)",
        category: "Dungeons",
        subcategory: "Dungeons"
    })
    showSecretsClicked = false;

    // Mining
    @SwitchProperty({
        name: "Emisarry Waypoints",
        description: "Waypoints every emissary in the dwarven mines",
        category: "Mining",
        subcategory: "Mining"
    })
    emissaryWaypoints = false;

    @SwitchProperty({
        name: "Gemstone Mining Profit",
        description: "Makes an overlay that tells you how much you've made mining gemstones this session",
        category: "Mining",
        subcategory: "Mining"
    })
    gemstonesProfit = false;

    @ButtonProperty({
        name: "Gemstone Mining Profit Location",
        description: "Changes The Display Location",
        category: "Mining",
        subcategory: "Mining",
        placeholder: "Change"
    })
    changeMiningProfitDisplay() {
        ChatLib.command("miningProfitDisplay", true);
    }
}

export default new Settings()