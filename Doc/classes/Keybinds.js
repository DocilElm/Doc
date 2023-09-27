import { data } from "../utils/Utils"

const getKeybindValue = (keybindName, keyCode) => data.settings.keybinds[keybindName] ?? keyCode
const refreshKeyCode = (keybind) => Client.getKeyBindFromDescription(keybind.getDescription())

let keybindsObj = {}

export default class Keybinds {
    constructor(keybindName, keyCode, category){
        this.keybindName = keybindName
        this.keyCode = keyCode
        this.category = category
        this.keybind = new KeyBind(this.keybindName, getKeybindValue(this.keybindName, this.keyCode), this.category)

        // saves the keybind to the main obj so it can be saved
        // in a world unload everytime
        keybindsObj[this.keybindName] = this.keybind
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

register("worldUnload", () => {
  Object.keys(keybindsObj).forEach(key => {
    data.settings.keybinds[key] = refreshKeyCode(keybindsObj[key]).getKeyCode()
    data.save()
  })
})