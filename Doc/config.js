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
        const categories = ["General", "Dungeons"]
        return categories.indexOf(a.name) - categories.indexOf(b.name)
    }
})

class Settings {
    constructor() {
        this.initialize(this)
    }
    
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
}

export default new Settings()