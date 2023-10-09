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
        const categories = ["General", "Dungeons", "Mining", "Fishing", "Garden","Slayer" , "Misc"]
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
        this.addDependency("Move Timer", "Ragnarok Axe Cooldown Timer")
        this.addDependency("Run Splits Location", "Run Splits")
        this.addDependency("Chest Profit Location", "Chest Profit")
        this.addDependency("Croesus Profit Location", "Croesus Profit")
        this.addDependency("Boss Splits Location", "Boss Splits")
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
        name: "Box Star Mobs",
        description: "Draws a box in starred mob (not see through walls)",
        category: "Dungeons",
        subcategory: "Dungeons"
    })
    mobESP = false;

    @SwitchProperty({
        name: "Show Secrets Clicked",
        description: "Draws a box in the clicked chest/wither essence/redstone skull",
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

    @SwitchProperty({
        name: "Run Splits",
        description: "Displays your current dungeon run's splits",
        category: "Dungeons",
        subcategory: "Dungeons"
    })
    dungeonRunSplits = false;

    @ButtonProperty({
        name: "Run Splits Location",
        description: "Changes The Display Location",
        category: "Dungeons",
        subcategory: "Dungeons",
        placeholder: "Change"
    })
    changeRunSplitsDisplay() {
        ChatLib.command("runSplitsDisplay", true);
    }

    @SwitchProperty({
        name: "Chest Profit",
        description: "Displays the current chest's profit (only works in dungeons)",
        category: "Dungeons",
        subcategory: "Dungeons"
    })
    dungeonProfitDisplay = false;

    @ButtonProperty({
        name: "Chest Profit Location",
        description: "Changes The Display Location",
        category: "Dungeons",
        subcategory: "Dungeons",
        placeholder: "Change"
    })
    changedungeonProfitDisplay() {
        ChatLib.command("dungeonProfitDisplay", true);
    }

    @SwitchProperty({
        name: "Show Croesus Clicks",
        description: "Highlights the chests you've clicked, the list resets once you lobby swap",
        category: "Dungeons",
        subcategory: "Dungeons"
    })
    showCroesusClicks = false;

    @SelectorProperty({
        name: "Croesus Clicks Mode",
        description: "Overlay renderer option only works with some texture packs",
        category: "Dungeons",
        subcategory: "Dungeons",
        options: ["Gui Renderer", "Overlay Renderer"]
    })
    croesusClicksMode = 0;

    @SwitchProperty({
        name: "Croesus Profit",
        description: "Displays the current chest's profit inside of croesus",
        category: "Dungeons",
        subcategory: "Dungeons"
    })
    croesusProfitDisplay = false;

    @SelectorProperty({
        name: "Croesus Profit Modue",
        description: "Changes the mode for the display",
        category: "Dungeons",
        subcategory: "Dungeons",
        options: ["Normal Mode", "Compacted Mode"]
    })
    croesusProfitMode = 0;

    @ButtonProperty({
        name: "Croesus Profit Location",
        description: "Changes The Display Location",
        category: "Dungeons",
        subcategory: "Dungeons",
        placeholder: "Change"
    })
    changecroesusProfitDisplay() {
        ChatLib.command("croesusProfitDisplay", true);
    }

    @SwitchProperty({
        name: "Show Extra Stats",
        description: "Automatically sends the /showextrastats command at the end of a run",
        category: "Dungeons",
        subcategory: "Dungeons"
    })
    showExtraStats = false;

    @SwitchProperty({
        name: "Boss Splits",
        description: "Displays your current dungeon boss's splits",
        category: "Dungeons",
        subcategory: "Dungeons"
    })
    dungeonBossSplits = false;

    @ButtonProperty({
        name: "Boss Splits Location",
        description: "Changes The Display Location",
        category: "Dungeons",
        subcategory: "Dungeons",
        placeholder: "Change"
    })
    changebossSplitsDisplay() {
        ChatLib.command("bossSplitsDisplay", true);
    }

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

    // Slayer
    @SwitchProperty({
        name: "Boss Slain Timer",
        description: "Sends a chat msg with the time it took to kill the slayer (also uses scoreboard for checks)",
        category: "Slayer",
        subcategory: "Sayer"
    })
    bossSlainTimer = false;


    //Misc
    @SwitchProperty({
        name: "Ragnarok Axe Cooldown Timer",
        description: "Accurate timer for the ragnarok axe cooldown (Useful for slayers/dungeons)",
        category: "Misc",
        subcategory: "Misc"
    })
    ragnarokAxeTimer = false;

    @ButtonProperty({
        name: "Move Timer",
        description: "Moves and size the Ragnarok Axe timer display",
        category: "Misc",
        subcategory: "Misc",
        placeholder: "Move"
    })
    action() {
        ChatLib.command("ragnarokAxeDisplay", true)

    }
}

export default new Settings()