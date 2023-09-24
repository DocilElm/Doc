import { data } from "../utils/Utils"

const getKeybindValue = (keybindName, keyCode) => data.settings.keybinds[keybindName] ?? keyCode
const refreshKeyCode = (keybind) => Client.getKeyBindFromDescription(keybind.getDescription())

export default class Keybinds {
    constructor(keybindName, keyCode, category){
        this.keybindName = keybindName
        this.keyCode = keyCode
        this.category = category
        this.keybind = new KeyBind(this.keybindName, getKeybindValue(this.keybindName, this.keyCode), this.category)

        register("worldUnload", () => {
            data.settings.keybinds[this.keybindName] = refreshKeyCode(this.keybind).getKeyCode()
            data.save()
        })
    }

    registerKeyPress(fn){
        return this.keybind.registerKeyPress(fn)
    }

    registerKeyDown(fn){
      return this.keybind.registerKeyDown(fn)
    }

    registerKeyRelease(fn){
      return this.keybind.registerKeyRelease(fn)
    }

    isPressed(){
      return this.keybind.isPressed()
    }
}