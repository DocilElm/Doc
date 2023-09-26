/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />
import config from "./config"

// Dungeons
import "./features/dungeons/MobESP"
import "./features/dungeons/SecretsClickedESP"
// Mining
import "./features/mining/EmissaryWaypoints"
// Commands
import "./features/commands/Ping"

register("command", () => config.openGUI()).setName("doc")