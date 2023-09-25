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
}

export default new Settings()