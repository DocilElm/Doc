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
        const categories = ["General"]
        return categories.indexOf(a.name) - categories.indexOf(b.name)
    }
})

class Settings {
    constructor() {
        this.initialize(this)
    }
    
    @SwitchProperty({
        name: "Test",
        description: "",
        category: "General",
        subcategory: "General"
    })
    testconfig = false;
}

export default new Settings()