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
import "./features/dungeons/ExtraStats"
import "./features/dungeons/BossSplits"
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
// Slayers
import "./features/slayers/BossSlainTimer"
// Trackers
import "./features/trackers/GhostsTracker"
import "./features/trackers/TrophyFishingTracker"
import "./features/trackers/PowderTracker"
// Kuudra
import "./features/kuudra/FatalTempoDisplay"
//Misc
import "./features/misc/RagAxeTimer"
import "./features/misc/RngMeter"
import "./features/misc/RngMeterScanner"

register("command", () => config.openGUI()).setName("doc")

if(data.firstTime){
    chat(`${PREFIX} &aUse /doc for config menu`)
    data.firstTime = false
    data.save()
}

/*
const ftExample = `Fatal Tempo: 0%`;
const ftOverlay = new Overlay("ft", ["all"], () => true, data.ftL, "moveFt", ftExample);

let ftHits = [];
let time = 0
let hits = 1
const ftAddHit = (time) => {
  ftHits.push(time);
};
const ftHitsNum = () => {
  return ftHits.length * hits;
};
const ftPercent = (ftLvl) => {
  let percent = ftHitsNum() * ftLvl * 10;
  return percent <= 200 ? percent : 200;
}

registerWhen(register("actionBar", (msg) => {
  if (getWorld() == "Kuudra") {
    hits = 3
    msg = ChatLib.getChatMessage(msg, false)
    if (msg.includes("10⁑")) hits = 5
  }
  else hits = 1
}).setCriteria("${*}⁑${*}"), () => settings.ft)

let countdown = 0
let percent = 0

registerWhen(register("renderOverlay", () => {
  let color = "&f";
  percent = ftPercent(ftLevel);
  countdown = 3 - (countdown - time) / 1000;
  if (countdown < 0) countdown = 0;
  else if (countdown < 1 && countdown > 0) color = "&c";
  if (percent == 200) {
    let x = (Renderer.screen.getWidth() / 2 - 13 - (settings.ftTimer - 1) * 9) / settings.ftTimer
    let y = (Renderer.screen.getHeight() / 2 - 15 - (settings.ftTimer - 1) * 5.5) / settings.ftTimer
    Renderer.scale(settings.ftTimer)
    Renderer.drawString(`${ color }${ countdown.toFixed(3) }`, x, y);
  }
}), () => settings.ft);

let ftLevel = 0;
registerWhen(register("soundPlay", (pos, name) => {
  if ((getWorld() == "Kuudra" && name.toString() != "random.bow") || (getWorld() != "Kuudra" && name.toString() != "random.successful_hit")) return
  let holding = Player.getHeldItem()?.getNBT()?.getCompoundTag("tag")?.getCompoundTag("ExtraAttributes")
  if (holding?.getString("id") != "TERMINATOR") return
  let ftLvl = holding.getCompoundTag("enchantments").getTag("ultimate_fatal_tempo");
  if (ftLvl) {
    time = new Date().getTime();
    ftLevel = ftLvl;
    ftAddHit(time);
  }
}), () => settings.ft);

registerWhen(register("step", () => {
  if(ftHitsNum() > 0 && new Date().getTime() - ftHits[ftHits.length - 1] >= 3000)ftHits = [];
  countdown = new Date().getTime()
}).setFps(1000), () => settings.ft);*/