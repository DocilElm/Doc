import { Persistence } from "./shared/Persistence"
import { TextHelper } from "./shared/Text"
import { Command } from "./core/Events"
import config from "./config"

// Dungeons
import "./features/dungeons/MobESP"
import "./features/dungeons/SecretsClickedESP"
import "./features/dungeons/RunSplits"
import "./features/dungeons/ChestProfit"
import "./features/dungeons/CroesusClicks"
import "./features/dungeons/CroesusProfit"
import "./features/dungeons/ExtraStats"
import "./features/dungeons/BossSplits"
import "./features/dungeons/BlessingsDisplay"
import "./features/dungeons/SecretsSound"
import "./features/dungeons/BlazeSolver"
// Mining
import "./features/mining/EmissaryWaypoints"
import "./features/mining/GemstoneProfit"
// Commands
import "./features/commands/Ping"
import "./features/commands/InventoryLog"
// Fishing
import "./features/fishing/BossBar"
import "./features/fishing/TimerTitle"
// Garden
import "./features/garden/VisitorProfit"
import "./features/garden/GardenDisplay"
// Slayers
import "./features/slayers/BossSlainTimer"
// Trackers
import "./features/trackers/GhostsTracker"
import "./features/trackers/TrophyFishingTracker"
import "./features/trackers/PowderTracker"
// Kuudra
import "./features/kuudra/FatalTempoDisplay"
import "./features/kuudra/CratesWaypoints"
//Misc
import "./features/misc/CreeperAlert"
import "./features/misc/RagAxeTimer"
import "./features/misc/RngMeter"
import "./features/misc/RngMeterScanner"
import "./features/misc/BlockOverlay"
import "./features/misc/BonzoMaskInvincibility"
import "./features/misc/PhoenixInvincibility"
import "./features/misc/StatsDisplay"
import "./features/misc/SearchBar"

new Command(null, "doc", () => config.openGUI()).start()

if (Persistence.data.firstTime){
    ChatLib.chat(`${TextHelper.PREFIX} &aUse /doc for config menu`)
    Persistence.data.firstTime = false
    Persistence.data.save()
}