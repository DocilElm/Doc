/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />
import { PREFIX, chat, data } from "./utils/Utils"
import config from "./config"

// Dungeons
import "./features/dungeons/MobESP"
import "./features/dungeons/SecretsClickedESP"
import "./features/dungeons/RunSplits"
import "./features/dungeons/ChestProfit"
import "./features/dungeons/CroesusClicks"
import "./features/dungeons/CroesusProfit"
// Mining
import "./features/mining/EmissaryWaypoints"
import "./features/mining/GemstoneProfit"
// Commands
import "./features/commands/Ping"
// Fishing
import "./features/fishing/BossBar"
import "./features/fishing/TimerTitle"
// Garden
import "./features/garden/VisitorProfit"
//Misc
import "./features/misc/RagAxeTimer.js"

register("command", () => config.openGUI()).setName("doc")

if(data.firstTime){
    chat(`${PREFIX} &aUse /doc for config menu`)
    data.firstTime = false
    data.save()
}