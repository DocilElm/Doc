/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />
import config from "./config"

// Dungeons
import "./features/dungeons/MobESP"
import "./features/dungeons/SecretsClickedESP"
// Mining
import "./features/mining/EmissaryWaypoints"
import "./features/mining/GemstoneProfit"
// Commands
import "./features/commands/Ping"
// Fishing
import "./features/fishing/BossBar"
import "./features/fishing/TimerTitle"

register("command", () => config.openGUI()).setName("doc")