import Settings from "../Amaterasu/core/Settings"
import DefaultConfig from "../Amaterasu/core/DefaultConfig"
const config = new DefaultConfig("Doc", "data/settings.json")

config
.addSwitch({
    category: "Dungeons",
    configName: "mobESP",
    title: "Box Star Mobs",
    description: "Draws a box in starred mob (not see through walls)",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "showSecretsClicked",
    title: "Show Secrets Clicked",
    description: "Draws a box in the clicked chest/wither essence/redstone skull",
    subcategory: "Dungeons"
})
.addColorPicker({
    category: "Dungeons",
    configName: "showSecretsClickedColor",
    title: "Secrets Click Color",
    description: "Changes the highlight color of the secret when you click it",
    value: [255, 255, 255, 255],
    subcategory: "Dungeons",
    shouldShow(data) {
        return data.showSecretsClicked
    }
})
.addSwitch({
    category: "Dungeons",
    configName: "dungeonRunSplits",
    title: "Run Splits",
    description: "Displays your current dungeon run's splits",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "dungeonProfitDisplay",
    title: "Chest Profit",
    description: "Displays the current chest's profit (only works in dungeons)",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "showCroesusClicks",
    title: "Show Croesus Clicks",
    description: "Highlights the chests you've clicked, the list resets once you lobby swap",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "croesusProfitDisplay",
    title: "Croesus Profit",
    description: "Displays the current chest's profit inside of croesus",
    subcategory: "Dungeons"
})
.addDropDown({
    category: "Dungeons",
    configName: "croesusProfitMode",
    title: "Croesus Profit Mode",
    description: "Changes the mode for the display",
    options: ["Normal Mode","Compacted Mode"],
    value: 0,
    subcategory: "Dungeons",
    shouldShow(data) {
        return data.croesusProfitDisplay
    }
})
.addSwitch({
    category: "Dungeons",
    configName: "showExtraStats",
    title: "Show Extra Stats",
    description: "Automatically sends the /showextrastats command at the end of a run",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "dungeonBossSplits",
    title: "Boss Splits",
    description: "Displays your current dungeon boss's splits",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "blessingsDisplay",
    title: "Blessings Display",
    description: "Displays your current dungeon blessings",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "secretsSound",
    title: "Secrets Sound",
    description: "Plays a sound whenever you get a dungeon secret (might not be 100% accurate on the pick up items)",
    subcategory: "Dungeons"
})
.addDropDown({
    category: "Dungeons",
    configName: "secretsSoundType",
    title: "Secrets Sound Type",
    description: "The type of sound to play whenever you get a secret",
    options: ["mob.blaze.hit","fire.ignite","random.orb","random.break","mob.guardian.land.hit"],
    value: 0,
    subcategory: "Dungeons",
    shouldShow(data) {
        return data.secretsSound
    }
})
.addSwitch({
    category: "Dungeons",
    configName: "blazeSolver",
    title: "Blaze Solver",
    description: "Draws a box at the correct blaze",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "blazeSolverDone",
    title: "Blaze Done",
    description: "Automatically says &bBlaze Done&r in party chat",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "blazeSolverLine",
    title: "Blaze Solver Line",
    description: "Draws a line at the next blaze to kill (this is independent from blaze solver)",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "waterBoardSolver",
    title: "Water Board Solver",
    description: "One flow water board solver &4The scanner might break sometimes",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "waterBoardSolverDisplay",
    title: "Water Board Solver Display",
    description: "Displays the current solution &c(e.g QUARTZ: 5.5s, EMERALD: Click now, GOLD: 5.5s) &7these are sorted from closest to least &c(e.g 0 will always go top before 1)",
    subcategory: "Dungeons",
    shouldShow(data) {
        return data.waterBoardSolver
    }
})
.addDropDown({
    category: "Dungeons",
    configName: "waterBoardChannelMode",
    title: "Water Board Solution Channel",
    description: "Changes the solution channel of Water Board Solver. &aThis is where the module gets the solutions from",
    options: ["Desco1 & Recorded","Desco1","Recorded","Other"],
    value: 0,
    subcategory: "Dungeons",
    shouldShow(data) {
        return data.waterBoardSolver
    }
})
.addTextInput({
    category: "Dungeons",
    configName: "waterBoardChannelURL",
    title: "Water Board Solution Custom",
    description: "If the [other] option is enabled in [Water Board Solution Channel] you can input the url of your solutions here",
    value: "https://raw.githubusercontent.com/Desco1/WaterSolver/master/src/main/resources/watertimes.json",
    placeHolder: "https://raw.githubusercontent.com/Desco1/WaterSolver/master/src/main/resources/watertimes.json",
    subcategory: "Dungeons",
    shouldShow(data) {
        return data.waterBoardSolver
    }
})
.addSwitch({
    category: "Dungeons",
    configName: "boulderSolver",
    title: "Boulder Solver",
    description: "Boulder solver with optimized solutions &4The scanner might break sometimes",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "tictactoeSolver",
    title: "Tic Tac Toe Solver",
    description: "Tic Tac Toe solver &4The scanner might break sometimes",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "creeperBeamsSolver",
    title: "Creeper Beams Solver",
    description: "Creeper Beams solver &4The scanner might break sometimes",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "creeperBeamsSolverLine",
    title: "Creeper Beams Solver Line",
    description: "Adds lines to the blocks the solver tells you to hit",
    subcategory: "Dungeons",
    shouldShow(data) {
        return data.creeperBeamsSolver
    }
})
.addSwitch({
    category: "Dungeons",
    configName: "icePathSolver",
    title: "Ice Path Solver",
    description: "Ice Path solver &eThis is just a simple static solver it does not try to find the best path so be aware &4The scanner might break sometimes",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "teleportPadSolver",
    title: "Teleport Maze Solver",
    description: "Teleport Maze solver &bAdds &cRed &bcolor to the pads you have been through also highlights &aGreen &bthe right one &4The scanner might break sometimes",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "cryptsDisplay",
    title: "Crypts Display",
    description: "Display the total amount of crypts in the current dungeons",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "milestoneDisplay",
    title: "Milestone Display",
    description: "Display your current milestone in dungeons",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "triviaQuizSolver",
    title: "Trivia Solver",
    description: "Trivia solver changes the color of the answer to &aGreen&r and the incorrect answer to &cRed&r &4This will make it so you cannot click on the chat message",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "puzzlesDisplay",
    title: "Puzzles Display",
    description: "Display the current amount of puzzles in the dungeon",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "deathsDisplay",
    title: "Deaths Display",
    description: "Display the current amount of deaths in the dungeon",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "threeWeirdosSolver",
    title: "Three Weirdos Solver",
    description: "Three Weirdos solver highlights the correct chest in &aGreen&r and also the correct answer in chat",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "bloodHelper",
    title: "Blood Camp Helper",
    description: "Draws a prediction box, time and line to where the blood mob should spawn useful for blood campers (&cYou might notice that these are sometimes not accurate this is intentional since it was hard to make&r)",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "removeDamageTag",
    title: "Remove Damage Tag",
    description: "Removes every damage tag from rendering",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "puzzleNamesDisplay",
    title: "Puzzle Names Display",
    description: "Display the current status and names of the puzzles in tablist",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "sendMimicDead",
    title: "Send Mimic Dead",
    description: "Sends the set Mimic Dead message whenever mimic dies",
    subcategory: "Dungeons"
})
.addTextInput({
    category: "Dungeons",
    configName: "mimicDeadMessage",
    title: "Mimic Dead Message",
    description: "",
    value: "Mimic Killed!",
    placeHolder: "Mimic Killed!",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Dungeons",
    configName: "hideNoneStarredTags",
    title: "Hide None Star Nametag",
    description: "Hides none starred mobs name tags",
    subcategory: "Dungeons"
})
.addSwitch({
    category: "Mining",
    configName: "emissaryWaypoints",
    title: "Emissary Waypoints",
    description: "Waypoints every emissary in the dwarven mines",
    subcategory: "Mining"
})
.addSwitch({
    category: "Mining",
    configName: "gemstonesProfit",
    title: "Gemstone Mining Profit",
    description: "Makes an overlay that tells you how much you've made mining gemstones this session",
    subcategory: "Mining"
})
.addSwitch({
    category: "Mining",
    configName: "comissionDisplay",
    title: "Comissions Display",
    description: "Displays your current comissions with their progress",
    subcategory: "Mining"
})
.addSwitch({
    category: "Mining",
    configName: "powderDisplay",
    title: "Powder Display",
    description: "Displays your current mining powders",
    subcategory: "Mining"
})
.addSwitch({
    category: "Fishing",
    configName: "bossBarFishing",
    title: "Boss Bar",
    description: "Adds a boss bar with hp/max hp of loot sharing mobs",
    subcategory: "Fishing"
})
.addSwitch({
    category: "Fishing",
    configName: "timerTitleFishing",
    title: "Timer Title",
    description: "Adds the fishing timer entity from hypixel to your screen",
    subcategory: "Fishing"
})
.addSwitch({
    category: "Fishing",
    configName: "rgbTitleFishing",
    title: "Rgb Timer Title",
    description: "Adds the rgb format to the timer entity",
    subcategory: "Fishing",
    shouldShow(data) {
        return data.timerTitleFishing
    }
})
.addSwitch({
    category: "Garden",
    configName: "visitorProfitDisplay",
    title: "Visitor Profit Display",
    description: "Displays most of the visitor's lore data and also the profit with copper and rare item. Neu visitor features breaks this feature",
    subcategory: "Garden"
})
.addSwitch({
    category: "Garden",
    configName: "gardenDisplay",
    title: "Garden Display",
    description: "Displays most of the player's tab stuff for the garden",
    subcategory: "Garden"
})
.addSwitch({
    category: "Garden",
    configName: "pestsDisplay",
    title: "Pests Display",
    description: "Displays the player's tab stuff for pests",
    subcategory: "Garden"
})
.addSwitch({
    category: "Garden",
    configName: "visitorBazaarButton",
    title: "Visitor Bazaar Button",
    description: "Displays a button that you can click whenever inside a visitor gui to go to the required item in bazaar",
    subcategory: "Garden"
})
.addSwitch({
    category: "Garden",
    configName: "renderInfestedPlots",
    title: "Render Infested Plots",
    description: "Draws a box around the whole plot that has pests in it",
    subcategory: "Garden"
})
.addSwitch({
    category: "Slayer",
    configName: "bossSlainTimer",
    title: "Boss Slain Timer",
    description: "Sends a chat msg with the time it took to kill the slayer (also uses scoreboard for checks)",
    subcategory: "Slayer"
})
.addSwitch({
    category: "Slayer",
    configName: "slayerDisplay",
    title: "Slayer Display",
    description: "Displays your current boss's hp and time",
    subcategory: "Slayer"
})
.addSwitch({
    category: "Slayer",
    configName: "slayerDisplayBox",
    title: "Slayer Box",
    description: "Displays a box at the boss",
    subcategory: "Slayer"
})
.addSwitch({
    category: "Slayer",
    configName: "boxMiniboss",
    title: "Box Miniboss",
    description: "Renders a box where the miniboss is located",
    subcategory: "Slayer"
})
.addSwitch({
    category: "Slayer",
    configName: "slayerArmorDisplay",
    title: "Slayer Armor Display",
    description: "Displays your current slayer armor with its stats/kills/needed kills",
    subcategory: "Slayer"
})
.addSwitch({
    category: "Tracker",
    configName: "ghostTracker",
    title: "Ghost Tracker",
    description: "Displays stuff from your current ghost grinding session e.g total profit drops and current mf (scavenger profit isnt take into account since it's not accurate) §4Kills counter is not 100% accurate",
    subcategory: "Tracker"
})
.addSwitch({
    category: "Tracker",
    configName: "trophyFishingTracker",
    title: "Trophy Fishing Tracker",
    description: "Displays stuff from your current trophy fishing session §4Might not be 100% accurate",
    subcategory: "Tracker"
})
.addSwitch({
    category: "Tracker",
    configName: "powderMiningTracker",
    title: "Powder Mining Tracker",
    description: "Displays stuff from your current powder mining session",
    subcategory: "Tracker"
})
.addSwitch({
    category: "Kuudra",
    configName: "cratesWaypoints",
    title: "Crates Waypoints",
    description: "Draws a beacon beam like waypoint for every kuudra crate",
    subcategory: "Kuudra"
})
.addSwitch({
    category: "Kuudra",
    configName: "kuudraSplits",
    title: "Kuudra Splits",
    description: "Displays the current kuudra splits",
    subcategory: "Kuudra"
})
.addSwitch({
    category: "Misc",
    configName: "ragnarokAxeTimer",
    title: "Ragnarok Axe Cooldown Timer",
    description: "Accurate timer for the ragnarok axe cooldown (Useful for slayers/dungeons)",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "RngMeter",
    title: "RngMeter",
    description: "Displays your current RNG Meter dungeons or slayers automatically detecting them",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "blockOverlay",
    title: "Block Overlay",
    description: "Draws a block overlay at the block you're currently looking at",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "blockOverlayFill",
    title: "Block Overlay Filled",
    description: "Makes the block overlay fill the block it's currently overlaying",
    subcategory: "Misc",
    shouldShow(data) {
        return data.blockOverlay
    }
})
.addColorPicker({
    category: "Misc",
    configName: "blockOverlayColor",
    title: "Block Overlay Color",
    description: "Changes the highlight color of the block overlay",
    value: [255, 255, 255, 255],
    subcategory: "Misc",
    shouldShow(data) {
        return data.blockOverlay
    }
})
.addSwitch({
    category: "Misc",
    configName: "bonzoMaskInvincibilityTimer",
    title: "Bonzo Mask Invincibility Timer",
    description: "Displays a timer with the current invincibility for the bonzo mask",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "phoenixInvincibilityTimer",
    title: "Phoenix Pet Invincibility Timer",
    description: "Displays a timer with the current invincibility for the phoenix pet",
    subcategory: "Misc"
})
.addDropDown({
    category: "Misc",
    configName: "phoenixPetTime",
    title: "Phoenix Pet Time",
    description: "The amount of time to use as invincibility timer (this is here because for some reason it's 3s sometimes and others it's 4s)",
    options: ["4 seconds","3 seconds"],
    value: 0,
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "statsDisplay",
    title: "Stats Display",
    description: "Displays your current stats that are in tab",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "searchBar",
    title: "Search Bar",
    description: "Displays a search bar that can let you well... search! item lore or item name",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "championxpDisplay",
    title: "Champion Xp Display",
    description: "Displays your currently held item champion's xp and level",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "petDisplay",
    title: "Pet Display",
    description: "Displays your currently equipped pet",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "skyblockLevelDisplay",
    title: "Skyblock Level Display",
    description: "Displays your skyblock level",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "copyChat",
    title: "Copy Chat",
    description: "Allows you to copy any chat message by &bRigh Clicking&r the text in chat &cIf you hold &bControl&r &cit'll copy the formatted message&r",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "inventoryButtons",
    title: "Inventory Buttons",
    description: "Allows you to make inventory buttons that can run specific commands. customize them with: &a/addbutton &rand &c/deletebutton",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "partyCommands",
    title: "Party Commands",
    description: "Enables party commands &f(in party chat do ?help)",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "partyCommandsList",
    title: "Party Commands List",
    description: "Enables the list mode only, this will make it so it checks for the user to be in the list before being able to send party leader commands",
    subcategory: "Misc",
    shouldShow(data) {
        return data.partyCommands
    }
})
.addSwitch({
    category: "Misc",
    configName: "deployableDisplay",
    title: "Deployables Display",
    description: "Displays the stats and time remaining of deployables &f(plasmaflux, sos flare etc...)",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "deployableDisplayStats",
    title: "Deployables Display Stats",
    description: "Enables the stats text being displayed for Deployables Display feature",
    subcategory: "Misc",
    shouldShow(data) {
        return data.deployableDisplay
    }
})
.addSwitch({
    category: "Misc",
    configName: "auctionOverlay",
    title: "Auction Overlay",
    description: "Enables a custom Auction house search gui whenever you click on the sign",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "auctionOverlayReset",
    title: "Auction Overlay Reset",
    description: "When enabled the text in the search will reset along with the results after leaving the gui making the click history visible next time this is opened",
    subcategory: "Misc",
    shouldShow(data) {
        return data.auctionOverlay
    }
})
.addSwitch({
    category: "Misc",
    configName: "auctionOverlayKeybind",
    title: "Auction Overlay Keybind",
    description: "When enabled and pressing CTRL + F inside auction house it'll open up the gui &4&lThis requires you to have a &b&lBooster Cookie &4&lactive",
    subcategory: "Misc",
    shouldShow(data) {
        return data.auctionOverlay
    }
})
.addSwitch({
    category: "Misc",
    configName: "bazaarOverlay",
    title: "Bazaar Overlay",
    description: "Enables a custom Bazaar search gui whenever you click on the sign",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "bazaarOverlayReset",
    title: "Bazaar Overlay Reset",
    description: "When enabled the text in the search will reset along with the results after leaving the gui making the click history visible next time this is opened",
    subcategory: "Misc",
    shouldShow(data) {
        return data.bazaarOverlay
    }
})
.addSwitch({
    category: "Misc",
    configName: "bazaarOverlayKeybind",
    title: "Bazaar Overlay Keybind",
    description: "When enabled and pressing CTRL + F inside bazaar it'll open up the gui &4&lThis requires you to have a &b&lBooster Cookie &4&lactive",
    subcategory: "Misc",
    shouldShow(data) {
        return data.bazaarOverlay
    }
})
.addSwitch({
    category: "Misc",
    configName: "etherwarpOverlay",
    title: "Etherwarp Overlay",
    description: "Shows where your etherwarp will be at when holding aotv and shifting &bHuge thanks to unclaimedbloom6",
    subcategory: "Misc"
})
.addColorPicker({
    category: "Misc",
    configName: "etherwarpOverlayColor",
    title: "Etherwarp Overlay Color",
    description: "Changes the highlight color of the block",
    value: [255, 255, 255, 255],
    subcategory: "Misc",
    shouldShow(data) {
        return data.etherwarpOverlay
    }
})
.addSwitch({
    category: "Misc",
    configName: "middleClickGui",
    title: "Middle Click Guis",
    description: "This cancels your left click and turns it into a middle click on certain guis",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "renderItemRarity",
    title: "Render Item Rarity",
    description: "This renders the set shape behind every item that has a rarity whenever inside a gui",
    subcategory: "Misc"
})
.addDropDown({
    category: "Misc",
    configName: "renderItemRarityShape",
    title: "Render Item Rarity Shape",
    description: "Changes the shape of Render Item Rarity",
    options: ["Box","Hexagon","Rounded"],
    value: 0,
    subcategory: "Misc",
    shouldShow(data) {
        return data.renderItemRarity
    }
})
.addSlider({
    categories: "Misc",
    configName: "renderItemRarityOpacity",
    title: "Render Item Rarity Opacity",
    description: "Changes the opacity of Render Item Rarity",
    options: [0.1, 1],
    value: 0.8,
    subcategory: "Misc",
    shouldShow(data) {
        return data.renderItemRarity
    }
})
.addSwitch({
    category: "Misc",
    configName: "chatWaypoint",
    title: "Chat Waypoint",
    description: "Creates a waypoint whenever a recieved chat message matches &bx: 1, y: 1, z: 1",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "chatWaypointParty",
    title: "Chat Waypoint Party",
    description: "Allow Chat Waypoint feature to work with party chat",
    subcategory: "Misc",
    shouldShow(data) {
        return data.chatWaypoint
    }
})
.addSwitch({
    category: "Misc",
    configName: "chatWaypointCoop",
    title: "Chat Waypoint Coop",
    description: "Allow Chat Waypoint feature to work with coop chat",
    subcategory: "Misc",
    shouldShow(data) {
        return data.chatWaypoint
    }
})
.addSwitch({
    category: "Misc",
    configName: "chatWaypointAll",
    title: "Chat Waypoint All",
    description: "Allow Chat Waypoint feature to work with all chat",
    subcategory: "Misc",
    shouldShow(data) {
        return data.chatWaypoint
    }
})
.addSwitch({
    category: "Misc",
    configName: "slotLocking",
    title: "Slot Locking",
    description: "Allow you to lock slots and bind them with the set keybind",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "slotLockingDisplay",
    title: "Slot Locking Display",
    description: "Adds a darker rectangle display to the locked slot and a line to the binded slots whenever shifting over them",
    subcategory: "Misc",
    shouldShow(data) {
        return data.slotLocking
    }
})
.addSwitch({
    category: "Misc",
    configName: "slotLockingSB",
    title: "Slot Locking SB Only",
    description: "Makes this feature only work in skyblock",
    subcategory: "Misc",
    shouldShow(data) {
        return data.slotLocking
    }
})
.addSwitch({
    category: "Misc",
    configName: "noCursorReset",
    title: "No Cursor Reset",
    description: "Avoids resetting your cursor when you change gui &c(this only works with chest guis)",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "equipmentsDisplay",
    title: "Equipment Display",
    description: "Displays your current equipments at the side of your armor &c(this is scanned everytime you open your equipments)",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "armorDisplay",
    title: "Armor Display",
    description: "Displays your current equipped armor",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "armorDisplayBackground",
    title: "Armor Display Background",
    description: "Adds a slot like background to this display",
    subcategory: "Misc",
    shouldShow(data) {
        return data.armorDisplay
    }
})
.addSwitch({
    category: "Misc",
    configName: "armorDisplayBarrier",
    title: "Armor Display Barrier",
    description: "Displays a barrier whenever the slot has no item in it instead of not displaying the slot",
    subcategory: "Misc",
    shouldShow(data) {
        return data.armorDisplay
    }
})
.addSwitch({
    category: "Misc",
    configName: "systemTimeDisplay",
    title: "System Time Display",
    description: "Displays your current time",
    subcategory: "Misc"
})
.addDropDown({
    category: "Misc",
    configName: "systemTimeDisplayColor",
    title: "System Time Display Color",
    description: "Changes the color for this display",
    options: ["§4Dark Red","§cRed","§6Gold","§eYellow","§2Dark Green","§aGreen","§bAqua","§3Dark Aqua","§1Dark Blue","§9Blue","§dLight Purple","§5Dark Purple","§fWhite","§7Gray","§8Dark Gray","§0Black"],
    value: 0,
    subcategory: "Misc",
    shouldShow(data) {
        return data.systemTimeDisplay
    }
})
.addSwitch({
    category: "Misc",
    configName: "toggleSprintDisplay",
    title: "Toggle Sprint Display",
    description: "Displays the assigned text whenever ToggleSprint is enabled &b(take a look at your keybinds if you don't know how to toggle it)",
    subcategory: "Misc"
})
.addTextInput({
    category: "Misc",
    configName: "toggleSprintText",
    title: "Toggle Sprint Display Text",
    description: "The text that ToggleSprint feature will display",
    value: "&bToggle Sprint&f: &aEnabled",
    placeHolder: "&bToggle Sprint&f: &aEnabled",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "noDeathAnimation",
    title: "No Death Animation",
    description: "Avoids rendering the death animation on entities &bCredits to unclaimedbloom6",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "noLightning",
    title: "No Lightning",
    description: "Avoids rendering lightning &bCredits to unclaimedbloom6",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "removeFrontView",
    title: "Remove Front View",
    description: "Removes the front view from F5",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "otterDisplay",
    title: "Otter Display",
    description: "Displays otters. why ? why not.",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "worldAgeDisplay",
    title: "World Age Display",
    description: "Displays the current world age",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "partyFinderOverlay",
    title: "Party Finder Overlay",
    description: "Currently only displays dungeon finder first letter classes missing and cata requirement",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "rabbitHelper",
    title: "Rabbit Helper",
    description: "Tells you the most efficient rabbit to upgrade in your &bChocolate Factory",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "enchantedBookLevel",
    title: "Enchanted Book Level",
    description: "Displays the level of an enchanted book above it",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "enchantedBookAbbreviation",
    title: "Enchanted Book Name",
    description: "Displays the abbreviation of an enchanted name above it",
    subcategory: "Misc",
    shouldShow(data) {
        return data.enchantedBookLevel
    }
})
.addSwitch({
    category: "Misc",
    configName: "enchantedBookAbbreviationColor",
    title: "Enchanted Book Name Color",
    description: "Whether to display colors for enchants that are not ultimate enchants or not",
    subcategory: "Misc",
    shouldShow(data) {
        return data.enchantedBookLevel
    }
})
.addSwitch({
    category: "Misc",
    configName: "attributeShardLevel",
    title: "Attribute Shard Level",
    description: "Displays the level of a attribute shard above it",
    subcategory: "Misc"
})
.addSwitch({
    category: "Misc",
    configName: "attributeShardAbbreviation",
    title: "Attribute Shard Name",
    description: "Displays the abbreviation of a attribute shard name above it",
    subcategory: "Misc",
    shouldShow(data) {
        return data.attributeShardLevel
    }
})
.addSwitch({
    category: "Misc",
    configName: "attributeShardAbbreviationColor",
    title: "Attribute Shard Name Color",
    description: "Whether to display colors for attribute shards or not",
    subcategory: "Misc",
    shouldShow(data) {
        return data.attributeShardLevel
    }
})
.addSwitch({
    category: "Rift",
    configName: "mushroomTimer",
    title: "Mushroom Timer",
    description: "Renders the amount of time in a countdown required to look at the mushroom in dreadfarm &c(this might not be accurate for all mushrooms)",
    subcategory: "Rift"
})
.addSwitch({
    category: "Rift",
    configName: "woodenButtons",
    title: "Wooden Buttons",
    description: "Renders a text and waypoint where the buttons should be clicked &b/resetbuttons &ato reset the clicked button list",
    subcategory: "Rift"
})
.addSwitch({
    category: "Rift",
    configName: "boxBerberis",
    title: "Box Berberis",
    description: "Renders a box where the berberis particles are currently at &c(this has a 20 block scan distance)",
    subcategory: "Rift"
})
.addSwitch({
    category: "Rift",
    configName: "glyphRender",
    title: "Glyph Render",
    description: "Renders a text in each of the glyph locations",
    subcategory: "Rift"
})
.addSwitch({
    category: "Rift",
    configName: "lavaMazeRender",
    title: "Lava Maze Render",
    description: "Renders filled blocks where you should step to avoid the lava &c(this is the second checkpoint in mirrorverse)",
    subcategory: "Rift"
})
.addSwitch({
    category: "Rift",
    configName: "tubulatorRender",
    title: "Tubulator Render",
    description: "Renders filled blocks where you should step",
    subcategory: "Rift"
})
.addSwitch({
    category: "Rift",
    configName: "boxSplatterHearts",
    title: "Box Splatter Hearts",
    description: "Renders a box where the heart particles are in &4Stillgore Chteau &cthis breaks whenever you're close to a vampire slayer",
    subcategory: "Rift"
})
.addSwitch({
    category: "Rift",
    configName: "effigiesWaypoint",
    title: "EffigiesWaypoint",
    description: "Renders a waypoint like on the inactive effigies spot",
    subcategory: "Rift"
})
.addSwitch({
    category: "Updater",
    configName: "autoUpdater",
    title: "Auto Updater",
    description: "Enables this module's auto updater &c(fetches data every 30mins)",
    subcategory: "Updater"
})
.addTextParagraph({
    category: "General",
    configName: "CreatorText",
    title: "Creator: DocilElm",
    description: "Module made by DocilElm with very much pain!",
    centered: true
})
.addButton({
    category: "General",
    configName: "MyDiscord",
    title: "Discord Server",
    description: "Join if you want to report a bug or want to make a suggestion",
    subcategory: "General",
    onClick() {
        java.awt.Desktop.getDesktop().browse(new java.net.URI("https://discord.gg/SK9UDzquEN"))
    }
})
.addButton({
    category: "General",
    configName: "mainEditGui",
    title: "Edit Guis",
    description: "Changes the display location for all the guis",
    subcategory: "General",
    onClick() {
        ChatLib.command("docguis", true)
    }
})
.addButton({
    category: "Dungeons",
    configName: "changewaterboardtutorial",
    title: "Water Board Recording Tutorial",
    description: "Sends the tutorial for recording your own solutions to your chat &c(you can also just /recordingtutorial)",
    subcategory: "Dungeons",
    onClick() {
        ChatLib.command("recordingtutorial", true)
        Client.currentGui.close()
    }
})

const categories = ["General", "Dungeons", "Mining", "Fishing", "Garden", "Slayer", "Tracker", "Kuudra", "Rift", "Misc", "Updater"]
const setting = new Settings("Doc", config, "data/ColorScheme.json")
    .setCommand("doc")
    .setCategorySort((a, b) => categories.indexOf(a.category) - categories.indexOf(b.category))
    .apply() // apply the sorting changes

export default () => setting.settings