import { Persistence } from "../shared/Persistence"
import FeatureManager from "./FeatureManager"

export class Feature {
    constructor(name, category, description) {
        FeatureManager.features.push(this)
        
        this.name = name
        this.category = category
        this.description = description

        this.config = Persistence.getDataFromFile(`${this.name.replaceAll(" ", "")}.json`)

        this.events = []
    }

    start() {
        FeatureManager.conditionalTriggers.set(this.name, [])

        // Register it under this feature otherwise it's considered internal
        this.events.forEach(event => event.start(this.name))

        return this
    }

    stop() {
        // Removes the conditional triggers from still being checked
        FeatureManager.conditionalTriggers.delete(this.name)

        // Unregister all the events
        this.events.forEach(event => event.stop(false))

        return this
    }

    getConfig() {
        return this.config
    }

    save() {
        Persistence.saveDataToFile(`${this.name.replaceAll(" ", "")}.json`, this.config)
        return this
    }
}