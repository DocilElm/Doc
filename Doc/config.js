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
        const categories = ["General", "Dungeons", "Mining", "Fishing", "Garden"]
        return categories.indexOf(a.name) - categories.indexOf(b.name)
    }
})

class Settings {
    constructor() {
        this.initialize(this)
        this.setCategoryDescription("General", "Author DocilElm")
        // main feature to the right and hidden feature to the left
        this.addDependency("Gemstone Mining Profit Location", "Gemstone Mining Profit")
        this.addDependency("Visitor Profit Display Location", "Visitor Profit Display")
        this.addDependency("Rgb Timer Title", "Timer Title")
        this.addDependency("Secrets Click Color", "Show Secrets Clicked")
    }
    // General
    @ButtonProperty({
        name: "Discord Server",
        description: "Join if you want to report a bug or want to make a suggestion",
        category: "General",
        subcategory: "General",
        placeholder: "Join"
    })
    MyDiscord() {
        java.awt.Desktop.getDesktop().browse(new java.net.URI("https://discord.gg/SK9UDzquEN"))
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

    @ColorProperty({
        name: "Secrets Click Color",
        description: "Changes the highlight color of the secret when you click it",
        category: "Dungeons",
        subcategory: "Dungeons"
    })
    showSecretsClickedColor = Color.GREEN;

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

    // Fishing
    @SwitchProperty({
        name: "Boss Bar",
        description: "Adds a boss bar with hp/max hp of loot sharing mobs",
        category: "Fishing",
        subcategory: "Fishing"
    })
    bossBarFishing = false;

    @SwitchProperty({
        name: "Timer Title",
        description: "Adds the fishing timer entity from hypixel to your screen",
        category: "Fishing",
        subcategory: "Fishing"
    })
    timerTitleFishing = false;

    @SwitchProperty({
        name: "Rgb Timer Title",
        description: "Adds the rgb format to the timer entity",
        category: "Fishing",
        subcategory: "Fishing"
    })
    rgbTitleFishing = false;

    // Garden
    @SwitchProperty({
        name: "Visitor Profit Display",
        description: "Displays most of the visitor's lore data and also the profit with copper and special item",
        category: "Garden",
        subcategory: "Garden"
    })
    visitorProfitDisplay = false;

    @ButtonProperty({
        name: "Visitor Profit Display Location",
        description: "Changes The Display Location",
        category: "Garden",
        subcategory: "Garden",
        placeholder: "Change"
    })
    changeVisitorProfitDisplay() {
        ChatLib.command("visitorProfitDisplay", true);
    }
}

export default new Settings()