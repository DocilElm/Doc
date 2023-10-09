import { data } from "../utils/Utils"

// big thank bloom

export default class ScalableGui {
    constructor(featureName){
        this.featureName = featureName
        this.gui = new Gui()

        this.gui.registerScrolled((mx, my, dir) => {
            if (dir == 1) data[this.featureName].scale += 0.02
            else data[this.featureName].scale -= 0.02
            data.save()
        })

        this.gui.registerMouseDragged((mx, my, btn, lastClick) => {
            data[this.featureName].x = mx
            data[this.featureName].y = my
            data.save()
        })
    }

    setCommand(commandName) {
        register("command", () => {
            this.open()
        }).setName(commandName)
        
        return this
    }

    renderString(str){
        Renderer.translate(this.getX(), this.getY())
        Renderer.scale(this.getScale())
        Renderer.drawStringWithShadow(str, 0, 0)
        Renderer.finishDraw()
    }

    onRender(func){
        this.gui.registerDraw(func)
    }

    getX(){
        return data[this.featureName].x ?? 0
    }

    getY(){
        return data[this.featureName].y ?? 0
    }

    getScale(){
        return data[this.featureName].scale ?? 1
    }

    open(){
        this.gui.open()
    }

    close(){
        this.gui.close()
    }
}