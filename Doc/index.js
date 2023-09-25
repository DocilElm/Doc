/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />
import config from "./config"

// Dungeons
import "./features/dungeons/MobESP"

register("command", () => config.openGUI()).setName("doc")