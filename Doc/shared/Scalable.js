import { Persistence } from "./Persistence"

// big thank bloom

export default class ScalableGui {
    constructor(featureName){
        this.featureName = featureName
        this.gui = new Gui()

        this.gui.registerScrolled((mx, my, dir) => {
            if (dir == 1) Persistence.data[this.featureName].scale += 0.02
            else Persistence.data[this.featureName].scale -= 0.02
            Persistence.data.save()
        })

        this.gui.registerMouseDragged((mx, my, btn, lastClick) => {
            Persistence.data[this.featureName].x = mx
            Persistence.data[this.featureName].y = my
            Persistence.data.save()
        })
    }

    setCommand(commandName) {
        register("command", () => {
            this.open()
        }).setName(commandName)
        
        return this
    }

    onRender(func){
        this.gui.registerDraw(func)
    }

    getX(){
        return Persistence.data[this.featureName].x ?? 0
    }

    getY(){
        return Persistence.data[this.featureName].y ?? 0
    }

    getScale(){
        return Persistence.data[this.featureName].scale ?? 1
    }

    open(){
        this.gui.open()
    }

    close(){
        this.gui.close()
    }
}