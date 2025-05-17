class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridInfo = document.getElementById('currentGrid');
        
        // Add gold counter
        this.gold = 2500;
        this.goldElement = document.createElement('div');
        this.goldElement.style.position = 'fixed';
        this.goldElement.style.top = '10px';
        this.goldElement.style.right = '10px';
        this.goldElement.style.color = '#ffd700';
        this.goldElement.style.fontFamily = 'Arial';
        this.goldElement.style.fontSize = '24px';
        this.goldElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.goldElement.style.padding = '10px';
        this.goldElement.style.borderRadius = '5px';
        this.goldElement.style.zIndex = '1000';
        this.updateGoldDisplay();
        document.body.appendChild(this.goldElement);
        
        // Map dimensions
        this.mapWidth = 10980;
        this.mapHeight = 10980;
        
        // Grid system (A-Z horizontally, 1-26 vertically)
        this.gridSize = 26;
        
        // Camera/viewport
        this.camera = {
            x: 0,
            y: 0,
            scale: 1
        };
        
        // Calculate cell dimensions
        this.cellWidth = this.mapWidth / this.gridSize;
        this.cellHeight = this.mapHeight / this.gridSize;
        
        // Player position and rotation - spawn at Ancient Spire Outpost (P17)
        const ancientSpireGrid = "P17";
        const gridX = ancientSpireGrid.charCodeAt(0) - 65; // Convert P to 15
        const gridY = parseInt(ancientSpireGrid.substring(1)) - 1; // Convert 17 to 16
        this.player = {
            x: (gridX + 0.5) * this.cellWidth,
            y: (gridY + 0.5) * this.cellHeight,
            speed: 0,
            rotation: 0,
            width: 128,
            height: 128,
            maxSpeed: 8,
            acceleration: 0.2,
            deceleration: 0.98,
            rotationSpeed: 0.05
        };
        
        // Add collision detection properties
        this.backgroundData = null;
        this.backgroundImageLoaded = false;
        
        // Load images
        this.mapImage = new Image();
        this.mapImage.src = './assets/background.png';
        this.mapImage.onload = () => {
            // Create a temporary canvas to get image data
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.mapImage.width;
            tempCanvas.height = this.mapImage.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(this.mapImage, 0, 0);
            this.backgroundData = tempCtx.getImageData(0, 0, this.mapImage.width, this.mapImage.height).data;
            this.backgroundImageLoaded = true;
            
            // Scan for islands and map them to grid positions
            this.scanForIslands();
            console.log('Background image loaded and islands mapped');
        };
        this.mapImage.onerror = (e) => {
            console.error('Failed to load background image:', e);
            console.log('Attempted to load from:', this.mapImage.src);
            this.showNotification('Failed to load background image. Please refresh the page.');
        };
        
        this.boatImage = new Image();
        this.boatImage.src = './assets/boat.png';
        this.boatImage.onerror = (e) => {
            console.error('Failed to load boat image:', e);
            console.log('Attempted to load from:', this.boatImage.src);
            this.showNotification('Failed to load boat image. Please refresh the page.');
        };
        
        // Movement keys
        this.keys = {
            w: false,
            a: false,
            d: false
        };
        
        // Wave animation
        this.waveOffset = 0;
        this.waveSpeed = 0.02;
        this.waveHeight = 5;
        this.waveLength = 50;
        this.waveGridSize = 200; // Size of wave grid cells
        
        // Update outposts list
        this.outposts = [
            "Sanctuary Outpost",
            "Port Merrick",
            "Plunder Outpost",
            "Ancient Spire Outpost",
            "Galleon's Grave Outpost",
            "Dagger Tooth Outpost",
            "Morrow's Peak Outpost"
        ];

        // Add seaposts list
        this.seaposts = [
            "The Spoils of Plenty Store",
            "The North Star Seapost",
            "The Finest Trading Post",
            "Stephen's Spoils",
            "Three Paces East Seapost",
            "The Wild Treasures Store",
            "Brian's Bazaar",
            "Roaring Traders"
        ];

        // Add fortresses list
        this.fortresses = [
            "Keel Haul Fort",
            "Hidden Spring Keep",
            "Sailor's Knot Stronghold",
            "Lost Gold Fort",
            "Fort of the Damned",
            "The Crow's Nest Fortress",
            "Skull Keep",
            "Kraken Watchtower",
            "Shark Fin Camp",
            "Molten Sands Fortress"
        ];

        // Island data organized by type and region
        this.islands = [
            // Outposts
            { name: "Sanctuary Outpost", grid: "F7", type: "outpost", region: "The Shores of Plenty" },
            { name: "Port Merrick", grid: "D10", type: "outpost", region: "The Shores of Plenty" },
            { name: "Plunder Outpost", grid: "J18", type: "outpost", region: "The Ancient Isles" },
            { name: "Ancient Spire Outpost", grid: "Q17", type: "outpost", region: "The Ancient Isles" },
            { name: "Galleon's Grave Outpost", grid: "R8", type: "outpost", region: "The Wilds" },
            { name: "Dagger Tooth Outpost", grid: "M8", type: "outpost", region: "The Wilds" },
            { name: "Morrow's Peak Outpost", grid: "V17", type: "outpost", region: "The Devil's Roar" },

            // Seaposts
            { name: "The Spoils of Plenty Store", grid: "B7", type: "seapost", region: "The Shores of Plenty" },
            { name: "The North Star Seapost", grid: "H11", type: "seapost", region: "The Shores of Plenty" },
            { name: "The Finest Trading Post", grid: "F17", type: "seapost", region: "The Ancient Isles" },
            { name: "Stephen's Spoils", grid: "K16", type: "seapost", region: "The Ancient Isles" },
            { name: "Three Paces East Seapost", grid: "S10", type: "seapost", region: "The Wilds" },
            { name: "The Wild Treasures Store", grid: "O5", type: "seapost", region: "The Wilds" },
            { name: "Brian's Bazaar", grid: "X12", type: "seapost", region: "The Devil's Roar" },
            { name: "Roaring Traders", grid: "T20", type: "seapost", region: "The Devil's Roar" },

            // Fortresses
            { name: "Keel Haul Fort", grid: "C6", type: "fortress", region: "The Shores of Plenty" },
            { name: "Hidden Spring Keep", grid: "I8", type: "fortress", region: "The Shores of Plenty" },
            { name: "Sailor's Knot Stronghold", grid: "E14", type: "fortress", region: "The Shores of Plenty" },
            { name: "Lost Gold Fort", grid: "H17", type: "fortress", region: "The Ancient Isles" },
            { name: "Fort of the Damned", grid: "L14", type: "fortress", region: "The Ancient Isles" },
            { name: "The Crow's Nest Fortress", grid: "O17", type: "fortress", region: "The Ancient Isles" },
            { name: "Skull Keep", grid: "P9", type: "fortress", region: "The Wilds" },
            { name: "Kraken Watchtower", grid: "L6", type: "fortress", region: "The Wilds" },
            { name: "Shark Fin Camp", grid: "P5", type: "fortress", region: "The Wilds" },
            { name: "Molten Sands Fortress", grid: "Z11", type: "fortress", region: "The Devil's Roar" },

            // Small Islands
            { name: "Barnacle Cay", grid: "O15", type: "small", region: "The Ancient Isles" },
            { name: "Black Sand Atoll", grid: "O3", type: "small", region: "The Wilds" },
            { name: "Black Water Enclave", grid: "R5", type: "small", region: "The Wilds" },
            { name: "Blind Man's Lagoon", grid: "N6", type: "small", region: "The Wilds" },
            { name: "Booty Isle", grid: "J21", type: "small", region: "The Ancient Isles" },
            { name: "Boulder Cay", grid: "G5", type: "small", region: "The Shores of Plenty" },
            { name: "Brimstone Rock", grid: "X18", type: "small", region: "The Devil's Roar" },
            { name: "Castaway Isle", grid: "K14", type: "small", region: "The Ancient Isles" },
            { name: "Chicken Isle", grid: "I16", type: "small", region: "The Ancient Isles" },
            { name: "Cinder Islet", grid: "U14", type: "small", region: "The Devil's Roar" },
            { name: "Cursewater Shores", grid: "X13", type: "small", region: "The Devil's Roar" },
            { name: "Cutlass Cay", grid: "M18", type: "small", region: "The Ancient Isles" },
            { name: "Flame's End", grid: "V20", type: "small", region: "The Devil's Roar" },
            { name: "Fools Lagoon", grid: "I14", type: "small", region: "The Ancient Isles" },
            { name: "Forsaken Brink", grid: "U16", type: "small", region: "The Devil's Roar" },
            { name: "Glowstone Cay", grid: "Z18", type: "small", region: "The Devil's Roar" },
            { name: "Isle of Last Words", grid: "O9", type: "small", region: "The Wilds" },
            { name: "Lagoon of Whispers", grid: "D12", type: "small", region: "The Shores of Plenty" },
            { name: "Liar's Backbone", grid: "S11", type: "small", region: "The Wilds" },
            { name: "Lonely Isle", grid: "G8", type: "small", region: "The Shores of Plenty" },
            { name: "Lookout Point", grid: "I20", type: "small", region: "The Ancient Isles" },
            { name: "Magma's Tide", grid: "Y20", type: "small", region: "The Devil's Roar" },
            { name: "Mutineer Rock", grid: "N19", type: "small", region: "The Ancient Isles" },
            { name: "Old Salts Atoll", grid: "F18", type: "small", region: "The Ancient Isles" },
            { name: "Paradise Spring", grid: "L17", type: "small", region: "The Ancient Isles" },
            { name: "Picaroon Palms", grid: "I4", type: "small", region: "The Shores of Plenty" },
            { name: "Plunderer's Plight", grid: "Q6", type: "small", region: "The Wilds" },
            { name: "Rapier Cay", grid: "D8", type: "small", region: "The Shores of Plenty" },
            { name: "Roaring Sands", grid: "U21", type: "small", region: "The Devil's Roar" },
            { name: "Rum Runner Isle", grid: "H9", type: "small", region: "The Shores of Plenty" },
            { name: "Salty Sands", grid: "G3", type: "small", region: "The Shores of Plenty" },
            { name: "Sandy Shallows", grid: "D5", type: "small", region: "The Shores of Plenty" },
            { name: "Scorched Pass", grid: "X11", type: "small", region: "The Devil's Roar" },
            { name: "Scurvy Isley", grid: "K4", type: "small", region: "The Wilds" },
            { name: "Sea Dog's Rest", grid: "C11", type: "small", region: "The Shores of Plenty" },
            { name: "Shark Tooth Key", grid: "P13", type: "small", region: "The Wilds" },
            { name: "Shiver Retreat", grid: "Q11", type: "small", region: "The Wilds" },
            { name: "Tri-Rock Isle", grid: "R10", type: "small", region: "The Wilds" },
            { name: "Twin Groves", grid: "G11", type: "small", region: "The Shores of Plenty" },

            // Large Islands
            { name: "Ashen Reaches", grid: "V23", type: "large", region: "The Devil's Roar" },
            { name: "Cannon Cove", grid: "F10", type: "large", region: "The Shores of Plenty" },
            { name: "Crescent Isle", grid: "B9", type: "large", region: "The Shores of Plenty" },
            { name: "Crook's Hollow", grid: "M16", type: "large", region: "The Ancient Isles" },
            { name: "Devil's Ridge", grid: "P19", type: "large", region: "The Ancient Isles" },
            { name: "Discovery Ridge", grid: "E17", type: "large", region: "The Ancient Isles" },
            { name: "Fetcher's Rest", grid: "V12", type: "large", region: "The Devil's Roar" },
            { name: "Flintlock Peninsula", grid: "W14", type: "large", region: "The Devil's Roar" },
            { name: "Kraken's Fall", grid: "R13", type: "large", region: "The Wilds" },
            { name: "Lone Cove", grid: "H6", type: "large", region: "The Shores of Plenty" },
            { name: "Marauder's Arch", grid: "Q3", type: "large", region: "The Wilds" },
            { name: "Mermaid's Hideaway", grid: "B13", type: "large", region: "The Shores of Plenty" },
            { name: "Old Faithful Isle", grid: "M4", type: "large", region: "The Wilds" },
            { name: "Plunder Valley", grid: "G16", type: "large", region: "The Ancient Isles" },
            { name: "Ruby's Fall", grid: "Y16", type: "large", region: "The Devil's Roar" },
            { name: "Sailor's Bounty", grid: "C4", type: "large", region: "The Shores of Plenty" },
            { name: "Shark Bait Cove", grid: "H19", type: "large", region: "The Ancient Isles" },
            { name: "Shipwreck Bay", grid: "M10", type: "large", region: "The Wilds" },
            { name: "Smugglers' Bay", grid: "F3", type: "large", region: "The Shores of Plenty" },
            { name: "Snake Island", grid: "J16", type: "large", region: "The Ancient Isles" },
            { name: "The Crooked Masts", grid: "O11", type: "large", region: "The Wilds" },
            { name: "The Devil's Thirst", grid: "W21", type: "large", region: "The Devil's Roar" },
            { name: "The Reaper's Hideout", grid: "I12", type: "large", region: "No Man's Sea" },
            { name: "The Sunken Grove", grid: "P7", type: "large", region: "The Wilds" },
            { name: "Thieves' Haven", grid: "L20", type: "large", region: "The Ancient Isles" },
            { name: "Wanderers Refuge", grid: "F12", type: "large", region: "The Shores of Plenty" }
        ];

        // Convert grid coordinates to x,y coordinates
        this.islands.forEach(island => {
            const gridX = island.grid.charCodeAt(0) - 65; // Convert A-Z to 0-25
            const gridY = parseInt(island.grid.substring(1)) - 1; // Convert 1-26 to 0-25
            island.x = (gridX + 0.5) * this.cellWidth;
            island.y = (gridY + 0.5) * this.cellHeight;
        });
        
        // Add text offset properties
        this.textOffsets = {
            "Ancient Spire Outpost": { x: -31.557075464730588, y: -118.41960288481005 },
            "Barnacle Cay": { x: 9.8521812563813, y: -105.42422386203452 },
            "The Crow's Nest Fortress": { x: -13.898611606555278, y: -41.591150775588176 },
            "Crook's Hollow": { x: -5.321279801120909, y: -153.19185969997488 },
            "Stephen's Spoils": { x: 1.6353590091130172, y: -52.38618283243886 },
            "Paradise Spring": { x: 12.235671711208852, y: -80.33247278275485 },
            "Cutlass Cay": { x: -5.332684103794236, y: -78.62752685994565 },
            "Devil's Ridge": { x: -5.746675847305596, y: -162.30052921644256 },
            "Mutineer Rock": { x: -0.24485280866701942, y: -73.11634326990225 },
            "Thieves' Haven": { x: -13.146354283190703, y: -165.31194784694344 },
            "Plunder Outpost": { x: 4.768030669992186, y: -105.9831239006453 },
            "Lookout Point": { x: -10.258465259281365, y: -80.65943820457778 },
            "Shark Bait Cove": { x: -98.09613400544913, y: -104.40445130754506 },
            "Lost Gold Fort": { x: -67.16143268232918, y: -33.738154395681704 },
            "Plunder Valley": { x: -105.45706739904017, y: -172.425981460834 },
            "Chicken Isle": { x: 21.627144484829387, y: -75.6394003900059 },
            "Snake Island": { x: 135.53217126735308, y: -81.33796468320088 },
            "The Finest Trading Post": { x: -0.4175732303215227, y: -63.97659746899808 },
            "Discovery Ridge": { x: -130.0085341729275, y: -159.02987840912647 },
            "Sailor's Knot Stronghold": { x: -1.842130039455924, y: -112.06808279678353 },
            "Wanderers Refuge": { x: 9.52937337455569, y: -224.87992439063146 },
            "The Reaper's Hideout": { x: -20.137504151206485, y: -178.40171402714623 },
            "Twin Groves": { x: 2.0107562843454616, y: -54.820987119720485 },
            "The North Star Seapost": { x: 0.7432093615561826, y: -53.95127119663994 },
            "Rum Runner Isle": { x: -23.20540755032698, y: -53.83981392507167 },
            "Cannon Cove": { x: -28.910929142798068, y: -209.66971035102915 },
            "Port Merrick": { x: 26.97114402632087, y: -139.22104170240073 },
            "Rapier Cay": { x: 21.053375552559828, y: -56.99341566617204 },
            "Sanctuary Outpost": { x: -5.759397254519627, y: -54.80667686535571 },
            "Hidden Spring Keep": { x: -0.5394179936238288, y: -119.82374444847528 },
            "Lone Cove": { x: 3.522262455753662, y: -165.13369558595969 },
            "Boulder Cay": { x: 15.020638156101995, y: -57.21527592787902 },
            "Sandy Shallows": { x: -0.9348940887830395, y: -58.30943981130122 },
            "Keel Haul Fort": { x: -12.045813586097893, y: -58.09946229384059 },
            "The Spoils of Plenty Store": { x: 9.970227245108731, y: -58.19895987346308 },
            "Sailor's Bounty": { x: -170.67991250455702, y: -61.2793102769017 },
            "Smugglers' Bay": { x: 0.18714675049795915, y: -217.32354014367547 },
            "Salty Sands": { x: 7.059951996057407, y: -67.87177289875501 },
            "Picaroon Palms": { x: 0.6968881044172122, y: -77.96468860093614 },
            "Scurvy Isley": { x: 5.303583228027492, y: -76.98891313721765 },
            "Kraken Watchtower": { x: -10.502266015784699, y: -110.58631545429625 },
            "Old Faithful Isle": { x: -7.314626213254087, y: -66.55420699210595 },
            "Blind Man's Lagoon": { x: 25.261948060219765, y: -71.4017591118668 },
            "Shark Fin Camp": { x: 7.485748606607558, y: -84.75387979348284 },
            "The Wild Treasures Store": { x: -0.14849436253098247, y: -52.13733050447172 },
            "Black Sand Atoll": { x: -1.4081944496219876, y: -66.29939115458728 },
            "Marauder's Arch": { x: 18.302057031482946, y: -124.38695226709092 },
            "Black Water Enclave": { x: -31.882680812115723, y: -98.73949943098637 },
            "Plunderer's Plight": { x: 13.13474962949931, y: -92.49461707845239 },
            "The Sunken Grove": { x: -51.25171553526798, y: -66.29813192478377 },
            "Dagger Tooth Outpost": { x: -62.71514200312231, y: -210.7602690977301 },
            "Galleon's Grave Outpost": { x: 13.734707356523359, y: -98.25123776490591 },
            "Isle of Last Words": { x: -2.439193979110314, y: -73.39395179402709 },
            "Skull Keep": { x: -20.19709147092908, y: -77.935169321986 },
            "Tri-Rock Isle": { x: 11.380871804546587, y: -82.16076633588318 },
            "Three Paces East Seapost": { x: -0.5074732982757268, y: -54.10010889241585 },
            "Liar's Backbone": { x: 2.6210262451650124, y: -74.12975950552391 },
            "Shiver Retreat": { x: -4.883721752403289, y: -81.63868178394205 },
            "The Crooked Masts": { x: -56.20406337401619, y: -68.03212803875158 },
            "Shipwreck Bay": { x: -46.937781210925095, y: -111.59229619505186 },
            "Fools Lagoon": { x: 13.379508438414632, y: -60.348380176189494 },
            "Castaway Isle": { x: -1.9073856414361217, y: -97.93167264610929 },
            "Fort of the Damned": { x: 14.624655576536497, y: -100.89812769775472 },
            "Booty Isle": { x: 17.71468759877189, y: -69.97503301936558 },
            "Old Salts Atoll": { x: -27.255523817862013, y: -112.82524199600721 },
            "Roaring Traders": { x: -1.4156097280756512, y: -59.809111970008416 },
            "Flame's End": { x: -2.1411220321915607, y: -73.3736088637379 },
            "Roaring Sands": { x: -23.118774193166246, y: -67.2214001998891 },
            "The Devil's Thirst": { x: -95.31952683768031, y: -200.65195125116043 },
            "Ashen Reaches": { x: -86.98667786948317, y: -199.06059545727294 },
            "Magma's Tide": { x: 3.372827804108965, y: -85.99842637474558 },
            "Brimstone Rock": { x: 22.423745291043815, y: -62.240197876062666 },
            "Glowstone Cay": { x: -15.678089682829523, y: -73.39836013467357 },
            "Morrow's Peak Outpost": { x: -46.22189859786704, y: -56.25886051717407 },
            "Ruby's Fall": { x: -50.086741529461506, y: -118.40059364432818 },
            "Flintlock Peninsula": { x: 1.2823382278347708, y: -136.983008548219 },
            "Forsaken Brink": { x: -5.248376429832206, y: -94.21991948574032 },
            "Cinder Islet": { x: -25.658657165162367, y: -95.9851083198655 },
            "Cursewater Shores": { x: 10.563251913961722, y: -84.00920835395482 },
            "Brian's Bazaar": { x: -5.744926479523201, y: -63.12446779987749 },
            "Molten Sands Fortress": { x: -33.46882974845175, y: -68.93799865484834 },
            "Scorched Pass": { x: -1.297241463118553, y: -80.79999976392264 },
            "Fetcher's Rest": { x: -75.8700935715151, y: -68.71713126418217 },
            "Kraken's Fall": { x: -113.19655346948548, y: -270.45732063023934 },
            "Shark Tooth Key": { x: -13.02129358714592, y: -62.66777966484733 },
            "Lonely Isle": { x: 4.568673940413191, y: -103.22752503582342 },
            "Crescent Isle": { x: 20.348158950054653, y: -156.83061171450527 },
            "Sea Dog's Rest": { x: 8.710049823793952, y: -75.61279194017334 },
            "Lagoon of Whispers": { x: -13.305991007412786, y: -64.10802860134208 },
            "Mermaid's Hideaway": { x: 12.935350589379027, y: -80.60486940139617 }
        };
        
        // Remove localStorage loading since we're using hardcoded values
        // const savedOffsets = JSON.parse(localStorage.getItem('islandOffsets')) || {};
        // this.textOffsets = { ...this.textOffsets, ...savedOffsets };
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initial resize
        this.handleResize();
        
        // Add mouse position tracking
        this.mousePosition = { x: 0, y: 0 };
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePosition = {
                x: Math.round((e.clientX - rect.left) / this.camera.scale + this.camera.x),
                y: Math.round((e.clientY - rect.top) / this.camera.scale + this.camera.y)
            };
        });
        
        // Add wind system
        this.wind = {
            direction: Math.random() * Math.PI * 2, // Random initial direction in radians
            speed: 1.5, // Base wind speed multiplier
            changeTimer: 0,
            changeInterval: 1200, // Time between wind changes
            targetDirection: Math.random() * Math.PI * 2 // Target direction for smooth transitions
        };
        
        this.nearOutpost = false;
        this.currentOutpost = null;
        this.showMenu = false;
        
        // Add merchant quest system properties
        this.merchantQuests = {
            commodities: [
                { name: "Sugar", basePrice: 100, weight: 1 },
                { name: "Tea", basePrice: 150, weight: 1 },
                { name: "Spices", basePrice: 200, weight: 1 },
                { name: "Silk", basePrice: 250, weight: 1 },
                { name: "Rum", basePrice: 300, weight: 1 }
            ],
            activeQuests: [],
            completedQuests: [],
            outpostQuests: {} // Store quests for each outpost
        };

        // Add cargo system
        this.cargo = {
            items: [],
            maxWeight: 10,
            currentWeight: 0
        };

        // Menu navigation state
        this.menuState = {
            currentMenu: 'main',
            selectedIndex: 0,
            quests: []
        };

        // Create menu overlay
        this.menuOverlay = document.createElement('div');
        this.menuOverlay.style.position = 'fixed';
        this.menuOverlay.style.top = '0';
        this.menuOverlay.style.left = '0';
        this.menuOverlay.style.width = '100%';
        this.menuOverlay.style.height = '100%';
        this.menuOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.menuOverlay.style.display = 'none';
        this.menuOverlay.style.zIndex = '9998';
        document.body.appendChild(this.menuOverlay);

        // Create main menu element
        this.menuElement = document.createElement('div');
        this.menuElement.style.position = 'fixed';
        this.menuElement.style.top = '50%';
        this.menuElement.style.left = '50%';
        this.menuElement.style.transform = 'translate(-50%, -50%)';
        this.menuElement.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        this.menuElement.style.padding = '20px';
        this.menuElement.style.borderRadius = '10px';
        this.menuElement.style.color = 'white';
        this.menuElement.style.fontFamily = 'Arial';
        this.menuElement.style.display = 'none';
        this.menuElement.style.zIndex = '9999';
        this.menuElement.style.maxHeight = '80vh';
        this.menuElement.style.overflowY = 'auto';
        this.menuElement.style.minWidth = '400px';
        document.body.appendChild(this.menuElement);

        // Create quest menu element
        this.questMenuElement = document.createElement('div');
        this.questMenuElement.style.position = 'fixed';
        this.questMenuElement.style.top = '50%';
        this.questMenuElement.style.left = '50%';
        this.questMenuElement.style.transform = 'translate(-50%, -50%)';
        this.questMenuElement.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        this.questMenuElement.style.padding = '20px';
        this.questMenuElement.style.borderRadius = '10px';
        this.questMenuElement.style.color = 'white';
        this.questMenuElement.style.fontFamily = 'Arial';
        this.questMenuElement.style.display = 'none';
        this.questMenuElement.style.zIndex = '9999';
        this.questMenuElement.style.maxHeight = '80vh';
        this.questMenuElement.style.overflowY = 'auto';
        this.questMenuElement.style.minWidth = '400px';
        document.body.appendChild(this.questMenuElement);

        // Add notification element
        this.notificationElement = document.createElement('div');
        this.notificationElement.style.position = 'fixed';
        this.notificationElement.style.top = '10px';
        this.notificationElement.style.left = '50%';
        this.notificationElement.style.transform = 'translateX(-50%)';
        this.notificationElement.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        this.notificationElement.style.color = '#ffd700';
        this.notificationElement.style.padding = '10px 20px';
        this.notificationElement.style.borderRadius = '5px';
        this.notificationElement.style.fontFamily = 'Arial';
        this.notificationElement.style.display = 'none';
        this.notificationElement.style.zIndex = '10000';
        this.notificationElement.style.textAlign = 'center';
        document.body.appendChild(this.notificationElement);

        // Add quest display element
        this.questDisplayElement = document.createElement('div');
        this.questDisplayElement.style.position = 'fixed';
        this.questDisplayElement.style.top = '80px'; // Moved down to avoid gold counter
        this.questDisplayElement.style.right = '10px';
        this.questDisplayElement.style.color = '#ffd700';
        this.questDisplayElement.style.fontFamily = 'Arial';
        this.questDisplayElement.style.fontSize = '16px';
        this.questDisplayElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.questDisplayElement.style.padding = '10px';
        this.questDisplayElement.style.borderRadius = '5px';
        this.questDisplayElement.style.zIndex = '1000';
        this.questDisplayElement.style.maxWidth = '300px';
        this.questDisplayElement.style.maxHeight = '40vh'; // Limit height to 40% of viewport
        this.questDisplayElement.style.overflowY = 'auto'; // Add scrolling if content is too long
        document.body.appendChild(this.questDisplayElement);

        // Add cargo display element
        this.cargoElement = document.createElement('div');
        this.cargoElement.style.position = 'fixed';
        this.cargoElement.style.right = '10px';
        this.cargoElement.style.color = '#ffd700';
        this.cargoElement.style.fontFamily = 'Arial';
        this.cargoElement.style.fontSize = '16px';
        this.cargoElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.cargoElement.style.padding = '10px';
        this.cargoElement.style.borderRadius = '5px';
        this.cargoElement.style.zIndex = '1000';
        this.cargoElement.style.maxWidth = '300px';
        this.cargoElement.style.maxHeight = '40vh'; // Limit height to 40% of viewport
        this.cargoElement.style.overflowY = 'auto'; // Add scrolling if content is too long
        document.body.appendChild(this.cargoElement);
        
        // Add tooltip element
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.style.position = 'fixed';
        this.tooltipElement.style.bottom = '20px';
        this.tooltipElement.style.left = '50%';
        this.tooltipElement.style.transform = 'translateX(-50%)';
        this.tooltipElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.tooltipElement.style.color = 'white';
        this.tooltipElement.style.padding = '10px 20px';
        this.tooltipElement.style.borderRadius = '5px';
        this.tooltipElement.style.fontFamily = 'Arial';
        this.tooltipElement.style.display = 'none';
        this.tooltipElement.style.zIndex = '1000';
        document.body.appendChild(this.tooltipElement);

        // Add event listener for 'E' key
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'e' && this.nearOutpost) {
                this.showMenu = true;
                this.menuOverlay.style.display = 'block';
                this.menuElement.style.display = 'block';
                this.questMenuElement.style.display = 'none';
                this.menuState.currentMenu = 'main';
                this.menuState.selectedIndex = 0;
                this.updateMainMenu();
            }
        });

        // Add keyboard navigation
        window.addEventListener('keydown', (e) => {
            if (!this.showMenu) return;

            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.menuState.selectedIndex = Math.max(0, this.menuState.selectedIndex - 1);
                    this.updateCurrentMenu();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (this.menuState.currentMenu === 'main') {
                        this.menuState.selectedIndex = Math.min(1, this.menuState.selectedIndex + 1);
                    } else {
                        this.menuState.selectedIndex = Math.min(this.menuState.quests.length, this.menuState.selectedIndex + 1);
                    }
                    this.updateCurrentMenu();
                    break;
                case 'Enter':
                    e.preventDefault();
                    this.handleMenuSelection();
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.closeMenu();
                    break;
            }
        });

        // Add click handler to overlay to close menu
        this.menuOverlay.addEventListener('click', (e) => {
            if (e.target === this.menuOverlay) {
                this.closeMenu();
            }
        });
        
        // Disable canvas pointer events when menu is open
        this.canvas.style.pointerEvents = 'auto';
        
        // Add quest ID counter
        this.questIdCounter = 0;

        // Create a wrapper div to maintain fixed positioning
        this.cargoDropWrapper = document.createElement('div');
        this.cargoDropWrapper.style.position = 'fixed';
        this.cargoDropWrapper.style.right = '10px';
        this.cargoDropWrapper.style.zIndex = '1000';
        this.cargoDropWrapper.style.width = '200px';
        document.body.appendChild(this.cargoDropWrapper);

        // Add cargo drop button
        this.cargoDropButton = document.createElement('button');
        this.cargoDropButton.style.position = 'relative';
        this.cargoDropButton.style.width = '100%';
        this.cargoDropButton.style.color = '#ffd700';
        this.cargoDropButton.style.fontFamily = 'Arial';
        this.cargoDropButton.style.fontSize = '16px';
        this.cargoDropButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.cargoDropButton.style.padding = '10px';
        this.cargoDropButton.style.borderRadius = '5px';
        this.cargoDropButton.style.border = '1px solid #ffd700';
        this.cargoDropButton.style.cursor = 'pointer';
        this.cargoDropButton.style.textAlign = 'center';
        this.cargoDropButton.textContent = 'Hold G to Drop Cargo';
        this.cargoDropButton.style.display = 'none';
        
        this.cargoDropWrapper.appendChild(this.cargoDropButton);

        // Add cargo drop state
        this.cargoDropState = {
            isHolding: false,
            holdStartTime: 0,
            holdDuration: 2000 // 2 seconds to drop
        };

        // Add event listeners for cargo dropping
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'g' && this.cargo.items.length > 0 && !this.cargoDropState.isHolding) {
                this.cargoDropState.isHolding = true;
                this.cargoDropState.holdStartTime = Date.now();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key.toLowerCase() === 'g') {
                this.cargoDropState.isHolding = false;
            }
        });

        // Add debug mode properties
        //this.islandOffsets = JSON.parse(localStorage.getItem('islandOffsets')) || {};
        
        // Debug: Log current island positions
        // console.log('Current Island Text Positions:', JSON.stringify(this.islandOffsets, null, 2));
        
        // Start game loop
        this.gameLoop();

        // Add leaderboard properties
        this.leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        this.playerName = localStorage.getItem('playerName') || '';
        this.isAdmin = localStorage.getItem('isAdmin') === 'true';
        this.adminPassword = 'admin123';
        this.leaderboardUrl = 'https://raw.githubusercontent.com/sirsyorrz/sea-of-thieves-leaderboard/main/leaderboard.json';
        this.leaderboardUpdateInterval = null;
        this.lastSyncTime = localStorage.getItem('lastLeaderboardSync') || 0;
        this.localLeaderboard = JSON.parse(localStorage.getItem('localLeaderboard')) || { entries: [], lastUpdate: '' };
        this.leaderboardState = {
            selectedIndex: 0,
            isNameInput: false,
            isAdminLogin: false
        };

        // Create leaderboard overlay
        this.leaderboardOverlay = document.createElement('div');
        this.leaderboardOverlay.style.position = 'fixed';
        this.leaderboardOverlay.style.top = '0';
        this.leaderboardOverlay.style.left = '0';
        this.leaderboardOverlay.style.width = '100%';
        this.leaderboardOverlay.style.height = '100%';
        this.leaderboardOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.leaderboardOverlay.style.display = 'none';
        this.leaderboardOverlay.style.zIndex = '9999';
        document.body.appendChild(this.leaderboardOverlay);

        // Create leaderboard element
        this.leaderboardElement = document.createElement('div');
        this.leaderboardElement.style.position = 'fixed';
        this.leaderboardElement.style.top = '50%';
        this.leaderboardElement.style.left = '50%';
        this.leaderboardElement.style.transform = 'translate(-50%, -50%)';
        this.leaderboardElement.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        this.leaderboardElement.style.padding = '20px';
        this.leaderboardElement.style.borderRadius = '10px';
        this.leaderboardElement.style.color = 'white';
        this.leaderboardElement.style.fontFamily = 'Arial';
        this.leaderboardElement.style.display = 'none';
        this.leaderboardElement.style.zIndex = '10000';
        this.leaderboardElement.style.minWidth = '400px';
        document.body.appendChild(this.leaderboardElement);

        // Add event listener for 'L' key
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'l') {
                this.toggleLeaderboard();
            }
        });

        // Load initial leaderboard data and start update timer
        this.loadLeaderboard();
        this.startLeaderboardUpdates();

        // Add keyboard navigation for leaderboard
        window.addEventListener('keydown', (e) => {
            if (this.leaderboardOverlay.style.display === 'block') {
                this.handleLeaderboardKeydown(e);
            }
        });
    }

    startLeaderboardUpdates() {
        // Clear any existing interval
        if (this.leaderboardUpdateInterval) {
            clearInterval(this.leaderboardUpdateInterval);
        }

        // Update every 30 seconds (30000 milliseconds)
        this.leaderboardUpdateInterval = setInterval(() => {
            this.syncLeaderboard();
        }, 30000);

        // Initial sync
        this.syncLeaderboard();
    }

    async syncLeaderboard() {
        try {
            // Always fetch from server to get latest data
            const response = await fetch(this.leaderboardUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            const serverData = await response.json();
            
            // Merge server data with local data
            this.mergeLeaderboardData(serverData);
            
            // Update last sync time
            this.lastSyncTime = Date.now();
            localStorage.setItem('lastLeaderboardSync', this.lastSyncTime);

            // Update display
            this.updateLeaderboardDisplay();
        } catch (error) {
            console.error('Error syncing leaderboard:', error);
            // Continue with local data if server sync fails
            this.updateLeaderboardDisplay();
        }
    }

    mergeLeaderboardData(serverData) {
        // Merge server entries with local entries
        const mergedEntries = [...serverData.entries];
        
        // Add local entries that aren't on server
        this.localLeaderboard.entries.forEach(localEntry => {
            const serverEntry = mergedEntries.find(entry => entry.name === localEntry.name);
            if (!serverEntry) {
                mergedEntries.push(localEntry);
            } else {
                // Keep the higher score between server and local
                serverEntry.gold = Math.max(serverEntry.gold, localEntry.gold);
            }
        });

        // Update leaderboard
        this.leaderboard = mergedEntries;
        this.localLeaderboard.entries = mergedEntries;
        this.localLeaderboard.lastUpdate = new Date().toISOString();
        
        // Save to localStorage
        localStorage.setItem('leaderboard', JSON.stringify(this.leaderboard));
        localStorage.setItem('localLeaderboard', JSON.stringify(this.localLeaderboard));
    }

    async updateLeaderboard() {
        if (!this.playerName) return;

        try {
            // Update local entry
            const existingEntry = this.leaderboard.find(entry => entry.name === this.playerName);
            if (existingEntry) {
                // Only update if the new score is higher
                if (this.gold > existingEntry.gold) {
                    existingEntry.gold = this.gold;
                }
            } else {
                this.leaderboard.push({
                    id: Date.now().toString(),
                    name: this.playerName,
                    gold: this.gold
                });
            }

            // Save to localStorage
            localStorage.setItem('leaderboard', JSON.stringify(this.leaderboard));

            // Update local storage
            this.localLeaderboard.entries = this.leaderboard;
            this.localLeaderboard.lastUpdate = new Date().toISOString();
            localStorage.setItem('localLeaderboard', JSON.stringify(this.localLeaderboard));

            // If admin, update server
            if (this.isAdmin && this.githubToken) {
                try {
                    const response = await fetch(this.leaderboardUrl, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json'
                        }
                    });
                    const serverData = await response.json();
                    
                    // Update server data with new entry
                    const serverEntry = serverData.entries.find(entry => entry.name === this.playerName);
                    if (serverEntry) {
                        serverEntry.gold = Math.max(serverEntry.gold, this.gold);
                    } else {
                        serverData.entries.push({
                            id: Date.now().toString(),
                            name: this.playerName,
                            gold: this.gold
                        });
                    }
                    
                    // Update server
                    const updateResponse = await fetch(this.leaderboardUrl, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `token ${this.githubToken}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/vnd.github.v3+json'
                        },
                        body: JSON.stringify({
                            message: 'Update leaderboard',
                            content: btoa(JSON.stringify(serverData, null, 2)),
                            sha: response.headers.get('etag')
                        })
                    });
                    
                    if (!updateResponse.ok) {
                        throw new Error('Failed to update server');
                    }
                } catch (error) {
                    console.error('Error updating server:', error);
                    this.showNotification('Failed to update server leaderboard');
                }
            }

            // Update display
            this.updateLeaderboardDisplay();

            // Force a sync with server
            this.syncLeaderboard();
        } catch (error) {
            console.error('Error updating leaderboard:', error);
            this.showNotification('Error updating leaderboard');
        }
    }

    async removeFromLeaderboard(id) {
        if (!this.isAdmin) return;

        // Remove from leaderboard
        this.leaderboard = this.leaderboard.filter(entry => entry.id !== id);
        
        // Save to localStorage
        localStorage.setItem('leaderboard', JSON.stringify(this.leaderboard));
        
        // Update local storage
        this.localLeaderboard.entries = this.leaderboard;
        this.localLeaderboard.lastUpdate = new Date().toISOString();
        localStorage.setItem('localLeaderboard', JSON.stringify(this.localLeaderboard));

        // Update display
        this.updateLeaderboardDisplay();
        
        this.showNotification('Entry removed successfully');
    }

    updateLeaderboardDisplay() {
        // Sort leaderboard by gold
        const sortedLeaderboard = [...this.leaderboard].sort((a, b) => b.gold - a.gold);
        
        let html = `
            <h2 style="margin-top: 0; color: #ffd700;">Leaderboard</h2>
            <div style="margin-bottom: 20px;">
        `;

        if (!this.playerName) {
            html += `
                <div style="margin-bottom: 20px;">
                    <input type="text" id="playerNameInput" placeholder="Enter your name" 
                        style="padding: 5px; width: 200px; margin-right: 10px;">
                    <button id="saveNameButton"
                        style="padding: 5px 10px; background: ${this.leaderboardState.selectedIndex === 0 ? '#4CAF50' : '#666'}; border: none; color: white; cursor: pointer;">
                        Save Name
                    </button>
                </div>
            `;
        }

        html += `
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: rgba(255, 215, 0, 0.2);">
                    <th style="padding: 10px; text-align: left;">Rank</th>
                    <th style="padding: 10px; text-align: left;">Name</th>
                    <th style="padding: 10px; text-align: right;">Gold</th>
                    ${this.isAdmin ? '<th style="padding: 10px; text-align: center;">Actions</th>' : ''}
                </tr>
        `;

        sortedLeaderboard.forEach((entry, index) => {
            const isCurrentPlayer = entry.name === this.playerName;
            const isSelected = index + (this.playerName ? 0 : 1) === this.leaderboardState.selectedIndex;
            html += `
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); 
                    ${isCurrentPlayer ? 'background: rgba(76, 175, 80, 0.2);' : ''}
                    ${isSelected ? 'background: rgba(255, 215, 0, 0.2);' : ''}">
                    <td style="padding: 10px;">${index + 1}</td>
                    <td style="padding: 10px;">${entry.name}${isCurrentPlayer ? ' (You)' : ''}</td>
                    <td style="padding: 10px; text-align: right;">${entry.gold}</td>
                    ${this.isAdmin ? `
                        <td style="padding: 10px; text-align: center;">
                            <button onclick="game.removeFromLeaderboard('${entry.id}')"
                                style="padding: 3px 8px; background: #ff4444; border: none; color: white; cursor: pointer; 
                                ${isSelected ? 'border: 2px solid #ffd700;' : ''}">
                                Remove
                            </button>
                        </td>
                    ` : ''}
                </tr>
            `;
        });

        const buttonCount = this.isAdmin ? 1 : 2;
        const closeButtonIndex = sortedLeaderboard.length + (this.playerName ? 0 : 1);
        const adminButtonIndex = closeButtonIndex + 1;

        html += `
            </table>
            <div style="margin-top: 20px; text-align: center;">
                <button id="closeButton"
                    style="padding: 8px 20px; background: ${this.leaderboardState.selectedIndex === closeButtonIndex ? '#4CAF50' : '#666'}; border: none; color: white; cursor: pointer;">
                    Close
                </button>
                ${!this.isAdmin ? `
                    <button id="adminButton"
                        style="padding: 8px 20px; background: ${this.leaderboardState.selectedIndex === adminButtonIndex ? '#4CAF50' : '#444'}; border: none; color: white; cursor: pointer; margin-left: 10px;">
                        Admin Login
                    </button>
                ` : ''}
            </div>
            <div style="margin-top: 10px; text-align: center; color: #888; font-size: 12px;">
                Last updated: ${new Date(this.localLeaderboard.lastUpdate).toLocaleString()}
            </div>
            <div style="margin-top: 10px; text-align: center; color: #888; font-size: 12px;">
                Use ↑↓ arrows to navigate, Enter to select, Esc to close
                ${this.isAdmin ? '<br>As admin: Select an entry and press Enter to remove it' : ''}
            </div>
        `;

        this.leaderboardElement.innerHTML = html;
    }

    handleLeaderboardKeydown(e) {
        if (!this.leaderboardOverlay.style.display === 'block') return;

        const sortedLeaderboard = [...this.leaderboard].sort((a, b) => b.gold - a.gold);
        const maxIndex = sortedLeaderboard.length + (this.isAdmin ? 1 : 2) - (this.playerName ? 0 : 1);

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.leaderboardState.selectedIndex = Math.max(0, this.leaderboardState.selectedIndex - 1);
                this.updateLeaderboardDisplay();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.leaderboardState.selectedIndex = Math.min(maxIndex, this.leaderboardState.selectedIndex + 1);
                this.updateLeaderboardDisplay();
                break;
            case 'Enter':
                e.preventDefault();
                this.handleLeaderboardSelection();
                break;
            case 'Escape':
                e.preventDefault();
                this.toggleLeaderboard();
                break;
        }
    }

    handleLeaderboardSelection() {
        const sortedLeaderboard = [...this.leaderboard].sort((a, b) => b.gold - a.gold);
        const closeButtonIndex = sortedLeaderboard.length + (this.playerName ? 0 : 1);
        const adminButtonIndex = closeButtonIndex + 1;

        if (!this.playerName && this.leaderboardState.selectedIndex === 0) {
            // Save name button selected
            this.setPlayerName();
        } else if (this.leaderboardState.selectedIndex === closeButtonIndex) {
            // Close button selected
            this.toggleLeaderboard();
        } else if (!this.isAdmin && this.leaderboardState.selectedIndex === adminButtonIndex) {
            // Admin login button selected
            this.toggleAdminLogin();
        } else if (this.isAdmin) {
            // Remove entry selected
            const selectedEntry = sortedLeaderboard[this.leaderboardState.selectedIndex - (this.playerName ? 0 : 1)];
            if (selectedEntry) {
                if (confirm(`Are you sure you want to remove ${selectedEntry.name}'s score of ${selectedEntry.gold}?`)) {
                    this.removeFromLeaderboard(selectedEntry.id);
                }
            }
        }
    }

    setPlayerName() {
        const input = document.getElementById('playerNameInput');
        if (input && input.value.trim()) {
            this.playerName = input.value.trim();
            localStorage.setItem('playerName', this.playerName);
            this.leaderboardState.selectedIndex = 0;
            this.updateLeaderboardDisplay();
            this.showNotification('Name saved! Your score will be updated automatically.');
        }
    }

    toggleLeaderboard() {
        const isVisible = this.leaderboardOverlay.style.display === 'block';
        this.leaderboardOverlay.style.display = isVisible ? 'none' : 'block';
        this.leaderboardElement.style.display = isVisible ? 'none' : 'block';
        if (!isVisible) {
            // Reset state when opening
            this.leaderboardState = {
                selectedIndex: 0,
                isNameInput: false,
                isAdminLogin: false
            };
            // Force an immediate update when opening the leaderboard
            this.syncLeaderboard();
        }
    }

    loadLeaderboard() {
        // Sort local leaderboard by gold
        const sortedLocalLeaderboard = [...this.localLeaderboard.entries].sort((a, b) => b.gold - a.gold);
        
        let html = `
            <h2 style="margin-top: 0; color: #ffd700;">Leaderboard</h2>
            <div style="margin-bottom: 20px;">
        `;

        if (!this.playerName) {
            html += `
                <div style="margin-bottom: 20px;">
                    <input type="text" id="playerNameInput" placeholder="Enter your name" 
                        style="padding: 5px; width: 200px; margin-right: 10px;">
                    <button id="saveNameButton"
                        style="padding: 5px 10px; background: ${this.leaderboardState.selectedIndex === 0 ? '#4CAF50' : '#666'}; border: none; color: white; cursor: pointer;">
                        Save Name
                    </button>
                </div>
            `;
        }

        html += `
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: rgba(255, 215, 0, 0.2);">
                    <th style="padding: 10px; text-align: left;">Rank</th>
                    <th style="padding: 10px; text-align: left;">Name</th>
                    <th style="padding: 10px; text-align: right;">Gold</th>
                    ${this.isAdmin ? '<th style="padding: 10px; text-align: center;">Actions</th>' : ''}
                </tr>
        `;

        sortedLocalLeaderboard.forEach((entry, index) => {
            const isCurrentPlayer = entry.name === this.playerName;
            const isSelected = index + (this.playerName ? 0 : 1) === this.leaderboardState.selectedIndex;
            html += `
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); 
                    ${isCurrentPlayer ? 'background: rgba(76, 175, 80, 0.2);' : ''}
                    ${isSelected ? 'background: rgba(255, 215, 0, 0.2);' : ''}">
                    <td style="padding: 10px;">${index + 1}</td>
                    <td style="padding: 10px;">${entry.name}${isCurrentPlayer ? ' (You)' : ''}</td>
                    <td style="padding: 10px; text-align: right;">${entry.gold}</td>
                    ${this.isAdmin ? `
                        <td style="padding: 10px; text-align: center;">
                            <button onclick="game.removeFromLeaderboard('${entry.id}')"
                                style="padding: 3px 8px; background: #ff4444; border: none; color: white; cursor: pointer;">
                                Remove
                            </button>
                        </td>
                    ` : ''}
                </tr>
            `;
        });

        const buttonCount = this.isAdmin ? 1 : 2; // Close button + (Admin Login or Save Name)
        const closeButtonIndex = sortedLocalLeaderboard.length + (this.playerName ? 0 : 1);
        const adminButtonIndex = closeButtonIndex + 1;

        html += `
            </table>
            <div style="margin-top: 20px; text-align: center;">
                <button id="closeButton"
                    style="padding: 8px 20px; background: ${this.leaderboardState.selectedIndex === closeButtonIndex ? '#4CAF50' : '#666'}; border: none; color: white; cursor: pointer;">
                    Close
                </button>
                ${!this.isAdmin ? `
                    <button id="adminButton"
                        style="padding: 8px 20px; background: ${this.leaderboardState.selectedIndex === adminButtonIndex ? '#4CAF50' : '#444'}; border: none; color: white; cursor: pointer; margin-left: 10px;">
                        Admin Login
                    </button>
                ` : ''}
            </div>
            <div style="margin-top: 10px; text-align: center; color: #888; font-size: 12px;">
                Last updated: ${new Date(this.localLeaderboard.lastUpdate).toLocaleString()}
            </div>
            <div style="margin-top: 10px; text-align: center; color: #888; font-size: 12px;">
                Use ↑↓ arrows to navigate, Enter to select, Esc to close
            </div>
        `;

        this.leaderboardElement.innerHTML = html;
    }

    toggleAdminLogin() {
        const password = prompt('Enter admin password:');
        if (password === this.adminPassword) {
            const token = prompt('Enter GitHub token:');
            if (token) {
                this.isAdmin = true;
                this.githubToken = token;
                localStorage.setItem('isAdmin', 'true');
                this.updateLeaderboardDisplay();
                this.showNotification('Admin access granted');
            } else {
                alert('GitHub token required for admin access');
            }
        } else {
            alert('Invalid password');
        }
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (this.keys.hasOwnProperty(e.key.toLowerCase())) {
                this.keys[e.key.toLowerCase()] = true;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if (this.keys.hasOwnProperty(e.key.toLowerCase())) {
                this.keys[e.key.toLowerCase()] = false;
            }
        });

        // Add resize listener
        window.addEventListener('resize', () => this.handleResize());
    }

    handleResize() {
        // Set canvas size to match window size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Calculate scale to make the grid fill the screen, with more zoom out
        this.camera.scale = (this.canvas.width / (this.mapWidth / this.gridSize)) * 0.15;
        
        // Update cell dimensions
        this.cellWidth = this.mapWidth / this.gridSize;
        this.cellHeight = this.mapHeight / this.gridSize;
    }
    
    getGridPosition(x, y) {
        const gridX = Math.floor(x / this.cellWidth);
        const gridY = Math.floor(y / this.cellHeight);
        const letter = String.fromCharCode(65 + gridX); // Convert 0-25 to A-Z
        return `${letter}${gridY + 1}`;
    }
    
    drawWaves() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        
        // Calculate visible area with some padding
        const startX = Math.floor(this.camera.x / this.waveGridSize) * this.waveGridSize;
        const startY = Math.floor(this.camera.y / this.waveGridSize) * this.waveGridSize;
        const endX = startX + (this.canvas.width / this.camera.scale) + this.waveGridSize * 2;
        const endY = startY + (this.canvas.height / this.camera.scale) + this.waveGridSize * 2;
        
        // Draw waves in world space
        for (let y = startY; y < endY; y += this.waveLength) {
            this.ctx.beginPath();
            for (let x = startX; x < endX; x += 5) {
                const waveY = y + Math.sin(x * 0.02 + this.waveOffset) * this.waveHeight;
                if (x === startX) {
                    this.ctx.moveTo(x, waveY);
                } else {
                    this.ctx.lineTo(x, waveY);
                }
            }
            this.ctx.stroke();
        }
        
        // Update wave offset for animation
        this.waveOffset += this.waveSpeed;
    }
    
    // Improved collision detection method
    checkCollision(x, y) {
        if (!this.backgroundImageLoaded) return false;
        
        // Convert world coordinates to image coordinates
        const imageX = Math.floor(x);
        const imageY = Math.floor(y);
        
        // Check if coordinates are within image bounds
        if (imageX < 0 || imageX >= this.mapImage.width || imageY < 0 || imageY >= this.mapImage.height) {
            return true; // Consider out of bounds as collision
        }
        
        // Get pixel index
        const pixelIndex = (imageY * this.mapImage.width + imageX) * 4;
        
        // Check if pixel is not transparent (alpha > 0)
        const alpha = this.backgroundData[pixelIndex + 3];
        return alpha > 128; // Consider pixels with alpha > 128 as solid
    }

    // New method to handle collision response
    handleCollision(newX, newY) {
        const buffer = 20; // Buffer zone in pixels
        const collisionPoints = [
            { x: newX, y: newY }, // Center
            { x: newX + this.player.width/3, y: newY }, // Right
            { x: newX - this.player.width/3, y: newY }, // Left
            { x: newX, y: newY + this.player.height/3 }, // Bottom
            { x: newX, y: newY - this.player.height/3 }, // Top
            { x: newX + this.player.width/3, y: newY + this.player.height/3 }, // Bottom Right
            { x: newX - this.player.width/3, y: newY + this.player.height/3 }, // Bottom Left
            { x: newX + this.player.width/3, y: newY - this.player.height/3 }, // Top Right
            { x: newX - this.player.width/3, y: newY - this.player.height/3 }  // Top Left
        ];

        // Check each point with buffer
        for (const point of collisionPoints) {
            // Check points in a circle around the collision point
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
                const checkX = point.x + Math.cos(angle) * buffer;
                const checkY = point.y + Math.sin(angle) * buffer;
                if (this.checkCollision(checkX, checkY)) {
                    return true;
                }
            }
        }
        return false;
    }

    // New method to find the best sliding angle
    findBestSlidingAngle(currentX, currentY, speed) {
        const testAngles = [];
        // Add even more test angles for smoother sliding
        for (let i = -12; i <= 12; i++) {
            testAngles.push(i * Math.PI / 24); // Test angles in even smaller increments
        }
        
        let bestAngle = null;
        let maxDistance = 0;
        
        for (const angle of testAngles) {
            // Test more distances for each angle
            for (let distance = speed * 1.2; distance >= speed * 0.1; distance *= 0.9) {
                const testX = currentX + Math.cos(this.player.rotation + angle) * distance;
                const testY = currentY + Math.sin(this.player.rotation + angle) * distance;
                
                if (!this.handleCollision(testX, testY)) {
                    if (distance > maxDistance) {
                        maxDistance = distance;
                        bestAngle = angle;
                    }
                }
            }
        }
        
        return { angle: bestAngle, distance: maxDistance };
    }

    scanForIslands() {
        const islandPoints = [];
        const visited = new Set();
        const threshold = 128; // Alpha threshold for non-transparent pixels
        const minIslandSize = 100; // Minimum number of pixels to be considered an island

        // First, create a map of grid cells to help narrow down the search
        const gridCellSize = {
            width: this.mapWidth / this.gridSize,
            height: this.mapHeight / this.gridSize
        };

        // Create a map of grid cells to potential island points
        const gridCellIslands = new Map();

        // Scan the image for non-transparent pixels
        for (let y = 0; y < this.mapImage.height; y += 2) { // Step by 2 for performance
            for (let x = 0; x < this.mapImage.width; x += 2) {
                const idx = (y * this.mapImage.width + x) * 4;
                if (this.backgroundData[idx + 3] > threshold) {
                    // Found a non-transparent pixel, check if it's part of an island
                    const island = this.floodFill(x, y, visited, threshold);
                    if (island.length > minIslandSize) {
                        // Calculate center point of the island
                        const centerX = island.reduce((sum, p) => sum + p.x, 0) / island.length;
                        const centerY = island.reduce((sum, p) => sum + p.y, 0) / island.length;
                        
                        // Determine which grid cell this island belongs to
                        const gridX = Math.floor(centerX / gridCellSize.width);
                        const gridY = Math.floor(centerY / gridCellSize.height);
                        const gridKey = `${gridX},${gridY}`;
                        
                        if (!gridCellIslands.has(gridKey)) {
                            gridCellIslands.set(gridKey, []);
                        }
                        gridCellIslands.get(gridKey).push({
                            x: centerX,
                            y: centerY,
                            size: island.length,
                            points: island
                        });
                    }
                }
            }
        }

        // Map island names to detected positions
        this.mappedIslands = [];
        const usedPositions = new Set();

        // Helper function to find the closest island point in a grid cell
        const findClosestIslandInGrid = (gridX, gridY, targetX, targetY) => {
            const gridKey = `${gridX},${gridY}`;
            const islandsInCell = gridCellIslands.get(gridKey) || [];
            let closestPoint = null;
            let minDistance = Infinity;

            for (const island of islandsInCell) {
                if (usedPositions.has(island)) continue;
                
                const distance = Math.sqrt(
                    Math.pow(island.x - targetX, 2) + 
                    Math.pow(island.y - targetY, 2)
                );
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestPoint = island;
                }
            }

            return closestPoint;
        };

        // First map outposts (they're more important)
        for (const outpostName of this.outposts) {
            const islandData = this.islands.find(i => i.name === outpostName);
            if (islandData) {
                const gridX = islandData.grid.charCodeAt(0) - 65;
                const gridY = parseInt(islandData.grid.substring(1)) - 1;
                
                // Look in the target grid cell and adjacent cells
                let closestPoint = null;
                let minDistance = Infinity;

                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        const point = findClosestIslandInGrid(
                            gridX + dx,
                            gridY + dy,
                            islandData.x,
                            islandData.y
                        );
                        
                        if (point) {
                            const distance = Math.sqrt(
                                Math.pow(point.x - islandData.x, 2) + 
                                Math.pow(point.y - islandData.y, 2)
                            );
                            
                            if (distance < minDistance) {
                                minDistance = distance;
                                closestPoint = point;
                            }
                        }
                    }
                }

                if (closestPoint) {
                    this.mappedIslands.push({
                        name: outpostName,
                        x: closestPoint.x,
                        y: closestPoint.y,
                        isOutpost: true,
                        grid: islandData.grid,
                        type: islandData.type,
                        region: islandData.region
                    });
                    usedPositions.add(closestPoint);
                }
            }
        }

        // Then map regular islands
        for (const islandData of this.islands) {
            if (!this.outposts.includes(islandData.name)) {
                const gridX = islandData.grid.charCodeAt(0) - 65;
                const gridY = parseInt(islandData.grid.substring(1)) - 1;
                
                // Look in the target grid cell and adjacent cells
                let closestPoint = null;
                let minDistance = Infinity;

                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        const point = findClosestIslandInGrid(
                            gridX + dx,
                            gridY + dy,
                            islandData.x,
                            islandData.y
                        );
                        
                        if (point) {
                            const distance = Math.sqrt(
                                Math.pow(point.x - islandData.x, 2) + 
                                Math.pow(point.y - islandData.y, 2)
                            );
                            
                            if (distance < minDistance) {
                                minDistance = distance;
                                closestPoint = point;
                            }
                        }
                    }
                }

                if (closestPoint) {
                    this.mappedIslands.push({
                        name: islandData.name,
                        x: closestPoint.x,
                        y: closestPoint.y,
                        isOutpost: false,
                        grid: islandData.grid,
                        type: islandData.type,
                        region: islandData.region
                    });
                    usedPositions.add(closestPoint);
                }
            }
        }

        console.log('Islands mapped to actual positions:', this.mappedIslands.length);
    }

    floodFill(startX, startY, visited, threshold) {
        const island = [];
        const queue = [{x: startX, y: startY}];
        const key = (x, y) => `${x},${y}`;

        while (queue.length > 0) {
            const {x, y} = queue.shift();
            const currentKey = key(x, y);

            if (visited.has(currentKey)) continue;
            if (x < 0 || x >= this.mapImage.width || y < 0 || y >= this.mapImage.height) continue;

            const idx = (y * this.mapImage.width + x) * 4;
            if (this.backgroundData[idx + 3] <= threshold) continue;

            visited.add(currentKey);
            island.push({x, y});

            // Check adjacent pixels
            queue.push({x: x + 1, y: y});
            queue.push({x: x - 1, y: y});
            queue.push({x: x, y: y + 1});
            queue.push({x: x, y: y - 1});
        }

        return island;
    }

    generateQuestId() {
        return `quest_${Date.now()}_${this.questIdCounter++}`;
    }

    generateMerchantQuest(currentOutpost) {
        // Get a random destination outpost different from current
        const availableOutposts = this.outposts.filter(outpost => outpost !== currentOutpost);
        const destinationOutpost = availableOutposts[Math.floor(Math.random() * availableOutposts.length)];
        
        // Get random commodities for the quest
        const numCommodities = Math.floor(Math.random() * 3) + 1; // 1-3 commodities
        const questCommodities = [];
        let totalWeight = 0;
        
        for (let i = 0; i < numCommodities; i++) {
            const commodity = this.merchantQuests.commodities[Math.floor(Math.random() * this.merchantQuests.commodities.length)];
            const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
            if (totalWeight + (commodity.weight * quantity) <= this.cargo.maxWeight) {
                questCommodities.push({
                    ...commodity,
                    quantity,
                    totalPrice: commodity.basePrice * quantity
                });
                totalWeight += commodity.weight * quantity;
            }
        }

        return {
            id: this.generateQuestId(),
            type: 'merchant',
            startOutpost: currentOutpost,
            destinationOutpost: destinationOutpost,
            commodities: questCommodities,
            reward: questCommodities.reduce((sum, item) => sum + item.totalPrice, 0) * 1.5, // 50% profit
            status: 'available',
            timeLimit: 60, // 1 minute in seconds
            startTime: null // Will be set when quest is accepted
        };
    }

    updateGoldDisplay() {
        this.goldElement.textContent = `${this.gold} Gold`;
        
        // Update leaderboard if player has a name
        if (this.playerName) {
            this.updateLeaderboard();
        }
    }

    updateMainMenu() {
        if (!this.currentOutpost) return;

        const options = ['Merchant Quests', 'Close'];
        this.menuElement.innerHTML = `
            <h2 style="margin-top: 0; color: #ffd700;">${this.currentOutpost}</h2>
            <div style="margin-bottom: 20px;">
                ${options.map((option, index) => `
                    <div style="
                        padding: 10px 20px;
                        margin: 4px 2px;
                        border-radius: 5px;
                        background-color: ${index === this.menuState.selectedIndex ? '#4CAF50' : 'transparent'};
                        cursor: pointer;
                    ">${option}</div>
                `).join('')}
            </div>
            <div style="color: #888; font-size: 12px;">
                Use ↑↓ arrows to navigate, Enter to select, Esc to close
            </div>
        `;
    }

    updateQuestMenu() {
        if (!this.currentOutpost) return;

        // Initialize quests for this outpost if they don't exist
        if (!this.merchantQuests.outpostQuests[this.currentOutpost]) {
            this.merchantQuests.outpostQuests[this.currentOutpost] = [];
            // Generate 3 initial quests for this outpost
            for (let i = 0; i < 3; i++) {
                const newQuest = this.generateMerchantQuest(this.currentOutpost);
                this.merchantQuests.outpostQuests[this.currentOutpost].push(newQuest);
            }
        }

        // Get available quests at this outpost
        const availableQuests = this.merchantQuests.outpostQuests[this.currentOutpost].filter(q => 
            q.status === 'available'
        );

        // Get active quests that need to be delivered to this outpost
        const deliveryQuests = this.merchantQuests.activeQuests.filter(q => 
            q.destinationOutpost === this.currentOutpost && q.status === 'active'
        );

        // Store quests for selection
        this.menuState.quests = [...availableQuests, ...deliveryQuests];
        console.log('Current quests:', this.menuState.quests); // Debug log

        let html = `
            <h2 style="margin-top: 0; color: #ffd700;">Merchant Quests</h2>
            <div style="margin-bottom: 20px;">
        `;

        // Render available quests
        if (availableQuests.length > 0) {
            html += '<h4 style="color: #4CAF50;">Available Quests</h4>';
            html += availableQuests.map((quest, index) => {
                const totalCost = quest.commodities.reduce((sum, item) => sum + item.totalPrice, 0);
                const canAfford = this.gold >= totalCost;
                return `
                    <div style="
                        border: 1px solid #444;
                        padding: 10px;
                        margin-bottom: 10px;
                        border-radius: 5px;
                        background-color: ${index === this.menuState.selectedIndex ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
                    ">
                        <h4 style="margin: 0 0 10px 0; color: #ffd700;">Delivery Quest</h4>
                        <p style="margin: 5px 0;">From: ${quest.startOutpost}</p>
                        <p style="margin: 5px 0;">To: ${quest.destinationOutpost}</p>
                        <p style="margin: 5px 0;">Cargo:</p>
                        <ul style="margin: 5px 0; padding-left: 20px;">
                            ${quest.commodities.map(item => `
                                <li>${item.quantity}x ${item.name} (${item.totalPrice} gold)</li>
                            `).join('')}
                        </ul>
                        <p style="margin: 5px 0;">Cost: ${totalCost} gold</p>
                        <p style="margin: 5px 0;">Reward: ${quest.reward} gold</p>
                        <p style="margin: 5px 0; color: ${canAfford ? '#4CAF50' : '#ff4444'}">
                            ${canAfford ? 'Can afford' : 'Not enough gold!'}
                        </p>
                        <p style="margin: 5px 0; color: #4CAF50;">Press Enter to accept</p>
                    </div>
                `;
            }).join('');
        }

        // Render delivery quests
        if (deliveryQuests.length > 0) {
            html += '<h4 style="color: #ffd700; margin-top: 20px;">Delivery Quests</h4>';
            html += deliveryQuests.map((quest, index) => `
                <div style="
                    border: 1px solid #444;
                    padding: 10px;
                    margin-bottom: 10px;
                    border-radius: 5px;
                    background-color: ${(index + availableQuests.length) === this.menuState.selectedIndex ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
                ">
                    <h4 style="margin: 0 0 10px 0; color: #ffd700;">Delivery Quest</h4>
                    <p style="margin: 5px 0;">From: ${quest.startOutpost}</p>
                    <p style="margin: 5px 0;">To: ${quest.destinationOutpost}</p>
                    <p style="margin: 5px 0;">Cargo:</p>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        ${quest.commodities.map(item => `
                            <li>${item.quantity}x ${item.name} (${item.totalPrice} gold)</li>
                        `).join('')}
                    </ul>
                    <p style="margin: 5px 0;">Reward: ${quest.reward} gold</p>
                    <p style="margin: 5px 0;">Time Remaining: ${this.formatTimeRemaining(quest)}</p>
                    <p style="margin: 5px 0; color: #ffd700;">Press Enter to complete</p>
                </div>
            `).join('');
        }

        html += `
            </div>
            <div style="
                padding: 10px 20px;
                margin: 4px 2px;
                border-radius: 5px;
                background-color: ${this.menuState.selectedIndex === this.menuState.quests.length ? '#4CAF50' : 'transparent'};
                cursor: pointer;
            ">Back to Menu</div>
            <div style="color: #888; font-size: 12px;">
                Use ↑↓ arrows to navigate, Enter to select, Esc to close
            </div>
        `;

        this.questMenuElement.innerHTML = html;
    }

    updateCurrentMenu() {
        if (this.menuState.currentMenu === 'main') {
            this.updateMainMenu();
        } else {
            this.updateQuestMenu();
        }
    }

    handleMenuSelection() {
        if (this.menuState.currentMenu === 'main') {
            if (this.menuState.selectedIndex === 0) {
                // Merchant Quests
                this.menuState.currentMenu = 'quest';
                this.menuState.selectedIndex = 0;
                this.menuElement.style.display = 'none';
                this.questMenuElement.style.display = 'block';
                this.updateQuestMenu();
            } else {
                // Close
                this.closeMenu();
            }
        } else {
            // Quest menu
            if (this.menuState.selectedIndex === this.menuState.quests.length) {
                // Back to Menu
                this.menuState.currentMenu = 'main';
                this.menuState.selectedIndex = 0;
                this.questMenuElement.style.display = 'none';
                this.menuElement.style.display = 'block';
                this.updateMainMenu();
            } else {
                const selectedQuest = this.menuState.quests[this.menuState.selectedIndex];
                console.log('Selected quest:', selectedQuest); // Debug log

                if (!selectedQuest) {
                    console.log('No quest selected'); // Debug log
                    return;
                }

                if (selectedQuest.status === 'available') {
                    console.log('Attempting to accept quest:', selectedQuest.id); // Debug log
                    // Accept quest
                    this.acceptQuest(selectedQuest.id);
                    // Clear quest selection after accepting
                    this.menuState.quests = [];
                    this.menuState.selectedIndex = 0;
                    // Update the quest menu to show new state
                    this.updateQuestMenu();
                } else if (selectedQuest.status === 'active') {
                    console.log('Attempting to complete quest:', selectedQuest.id); // Debug log
                    // Complete quest
                    this.completeQuest(selectedQuest.id);
                    // Clear quest selection after completing
                    this.menuState.quests = [];
                    this.menuState.selectedIndex = 0;
                    // Update the quest menu to show new state
                    this.updateQuestMenu();
                }
            }
        }
    }

    closeMenu() {
        this.showMenu = false;
        this.menuOverlay.style.display = 'none';
        this.menuElement.style.display = 'none';
        this.questMenuElement.style.display = 'none';
        // Clear quest selection when closing menu
        this.menuState.quests = [];
        this.menuState.selectedIndex = 0;
    }

    acceptQuest(questId) {
        console.log('Accepting quest:', questId); // Debug log
        // First try to find the quest in the outpost's available quests
        const outpostQuests = this.merchantQuests.outpostQuests[this.currentOutpost] || [];
        const quest = outpostQuests.find(q => q.id === questId);
        console.log('Found quest:', quest); // Debug log

        if (!quest) {
            console.log('Quest not found'); // Debug log
            return;
        }

        // Calculate total cost of items
        const totalCost = quest.commodities.reduce((sum, item) => sum + item.totalPrice, 0);
        console.log('Total cost:', totalCost); // Debug log

        // Check if player has enough gold
        if (this.gold < totalCost) {
            this.showNotification(`Not enough gold! You need ${totalCost} gold to purchase these items.`);
            return;
        }

        const questWeight = this.calculateQuestWeight(quest);
        console.log('Quest weight:', questWeight); // Debug log

        if (this.cargo.currentWeight + questWeight <= this.cargo.maxWeight) {
            // Deduct gold for items
            this.gold -= totalCost;
            this.updateGoldDisplay();

            // Add items to cargo
            this.cargo.items.push(...quest.commodities);
            this.cargo.currentWeight += questWeight;
            
            // Create a new quest object to avoid reference issues
            const acceptedQuest = {
                ...quest,
                status: 'active',
                startTime: Date.now()
            };
            
            // Remove quest from outpost's available quests
            this.merchantQuests.outpostQuests[this.currentOutpost] = 
                this.merchantQuests.outpostQuests[this.currentOutpost].filter(q => q.id !== questId);
            
            // Add to active quests
            this.merchantQuests.activeQuests.push(acceptedQuest);
            
            // Update displays
            this.updateCargoDisplay();
            this.updateQuestDisplay();
            this.updateQuestMenu();
            
            // Show confirmation
            this.showNotification(`Quest accepted! Purchased items for ${totalCost} gold and added ${questWeight} units to your cargo.`);
        } else {
            this.showNotification('Not enough cargo space!');
        }
    }

    completeQuest(questId) {
        const quest = this.merchantQuests.activeQuests.find(q => q.id === questId);
        if (!quest) return;

        // Check if we have all required items
        const hasAllItems = quest.commodities.every(questItem => {
            const cargoItem = this.cargo.items.find(item => item.name === questItem.name);
            return cargoItem && cargoItem.quantity >= questItem.quantity;
        });

        if (hasAllItems) {
            // Remove items from cargo
            quest.commodities.forEach(questItem => {
                const cargoItem = this.cargo.items.find(item => item.name === questItem.name);
                if (cargoItem) {
                    cargoItem.quantity -= questItem.quantity;
                    if (cargoItem.quantity <= 0) {
                        this.cargo.items = this.cargo.items.filter(item => item.name !== questItem.name);
                    }
                }
            });

            // Update cargo weight
            this.cargo.currentWeight = this.cargo.items.reduce((sum, item) => 
                sum + (item.weight * item.quantity), 0);

            // Add reward to gold
            this.gold += quest.reward;
            this.updateGoldDisplay();

            // Move quest to completed
            this.merchantQuests.activeQuests = this.merchantQuests.activeQuests.filter(q => q.id !== questId);
            this.merchantQuests.completedQuests.push({
                ...quest,
                status: 'completed'
            });

            // Generate a new quest for the outpost if needed
            if (this.merchantQuests.outpostQuests[quest.startOutpost].length < 3) {
                const newQuest = this.generateMerchantQuest(quest.startOutpost);
                this.merchantQuests.outpostQuests[quest.startOutpost].push(newQuest);
                this.merchantQuests.activeQuests.push(newQuest);
            }

            // Update displays
            this.updateQuestMenu();
            this.updateCargoDisplay();
            this.updateQuestDisplay();

            // Show reward message
            this.showNotification(`Quest completed! You received ${quest.reward} gold!`);
        } else {
            this.showNotification('You don\'t have all the required items in your cargo!');
        }
    }

    updateQuestDisplay() {
        const activeQuests = this.merchantQuests.activeQuests.filter(q => q.status === 'active');
        if (activeQuests.length > 0) {
            this.questDisplayElement.style.display = 'block';
            this.questDisplayElement.innerHTML = `
                <h3 style="margin: 0 0 5px 0;">Active Quests</h3>
                ${activeQuests.map(quest => `
                    <div style="margin-bottom: 10px; padding: 5px; border-bottom: 1px solid rgba(255, 215, 0, 0.3);">
                        <p style="margin: 2px 0;">To: ${quest.destinationOutpost}</p>
                        <p style="margin: 2px 0;">Time: ${this.formatTimeRemaining(quest)}</p>
                    </div>
                `).join('')}
            `;

            // Position cargo drop button below quest display
            const questDisplayHeight = this.questDisplayElement.offsetHeight;
            if (this.cargoDropWrapper) {
                this.cargoDropWrapper.style.top = `${80 + questDisplayHeight + 10}px`; // 10px gap
            }
        } else {
            this.questDisplayElement.style.display = 'none';
            // If no quests, position cargo drop button at default position
            if (this.cargoDropWrapper) {
                this.cargoDropWrapper.style.top = '80px';
            }
        }
    }

    updateCargoDisplay() {
        if (this.cargo.items.length > 0) {
            this.cargoElement.style.display = 'block';
            if (this.cargoDropButton) {
                this.cargoDropButton.style.display = 'block';
            }
            // Position cargo display below cargo drop button
            const buttonHeight = this.cargoDropButton ? this.cargoDropButton.offsetHeight : 0;
            const buttonTop = this.cargoDropWrapper ? parseInt(this.cargoDropWrapper.style.top) : 80;
            this.cargoElement.style.top = `${buttonTop + buttonHeight + 10}px`; // 10px gap
            this.cargoElement.innerHTML = `
                <h3 style="margin: 0 0 5px 0;">Cargo Hold</h3>
                <p style="margin: 0;">Weight: ${this.cargo.currentWeight}/${this.cargo.maxWeight}</p>
                <ul style="margin: 5px 0; padding-left: 20px;">
                    ${this.cargo.items.map(item => `
                        <li style="margin: 2px 0;">${item.quantity}x ${item.name}</li>
                    `).join('')}
                </ul>
            `;
        } else {
            this.cargoElement.style.display = 'none';
            if (this.cargoDropButton) {
                this.cargoDropButton.style.display = 'none';
            }
        }
    }

    formatTimeRemaining(quest) {
        if (!quest.startTime) return 'Not started';
        const timeLeft = Math.max(0, (quest.startTime + (quest.timeLimit * 1000)) - Date.now());
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    calculateQuestWeight(quest) {
        return quest.commodities.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
    }
    
    update() {
        // Handle player rotation
        if (this.keys.a) this.player.rotation -= this.player.rotationSpeed;
        if (this.keys.d) this.player.rotation += this.player.rotationSpeed;
        
        // Update wind direction gradually
        this.wind.changeTimer++;
        if (this.wind.changeTimer >= this.wind.changeInterval) {
            this.wind.changeTimer = 0;
            this.wind.targetDirection = Math.random() * Math.PI * 2;
        }
        
        // Smoothly interpolate wind direction
        const angleDiff = this.wind.targetDirection - this.wind.direction;
        this.wind.direction += angleDiff * 0.002; // Slow transition
        
        // Handle acceleration
        if (this.keys.w) {
            // Calculate angle between boat direction and wind direction
            const angleToWind = Math.abs(this.player.rotation - this.wind.direction);
            const windEffect = Math.cos(angleToWind); // 1 when going with wind, -1 when against
            
            // Apply wind effect to acceleration
            const windMultiplier = 1 + (windEffect * 0.5); // 50% boost/reduction
            this.player.speed += this.player.acceleration * windMultiplier;
        }
        
        // Apply deceleration
        this.player.speed *= this.player.deceleration;
        
        // Limit maximum speed
        this.player.speed = Math.min(this.player.speed, this.player.maxSpeed);
        
        // Calculate new position based on speed and rotation
        const newX = this.player.x + Math.cos(this.player.rotation) * this.player.speed;
        const newY = this.player.y + Math.sin(this.player.rotation) * this.player.speed;

        // Check for collisions with improved handling
        if (this.handleCollision(newX, newY)) {
            // Gradually reduce speed when colliding
            this.player.speed *= 0.95; // Even less speed reduction
            
            // Find the best sliding angle
            const slideResult = this.findBestSlidingAngle(this.player.x, this.player.y, this.player.speed);
            
            if (slideResult.angle !== null) {
                // Apply sliding movement with a slight boost
                const slideBoost = 1.1; // Add 10% boost to sliding distance
                this.player.x += Math.cos(this.player.rotation + slideResult.angle) * slideResult.distance * slideBoost;
                this.player.y += Math.sin(this.player.rotation + slideResult.angle) * slideResult.distance * slideBoost;
            } else {
                // If no valid slide found, reduce speed more aggressively
                this.player.speed *= 0.6; // Less aggressive speed reduction
            }
        } else {
            // No collision, update position normally
            this.player.x = newX;
            this.player.y = newY;
        }
        
        // Keep player within map bounds
        this.player.x = Math.max(0, Math.min(this.mapWidth, this.player.x));
        this.player.y = Math.max(0, Math.min(this.mapHeight, this.player.y));
        
        // Update camera to follow player
        this.camera.x = this.player.x - (this.canvas.width / 2 / this.camera.scale);
        this.camera.y = this.player.y - (this.canvas.height / 2 / this.camera.scale);
        
        // Keep camera within map bounds
        this.camera.x = Math.max(0, Math.min(this.mapWidth - (this.canvas.width / this.camera.scale), this.camera.x));
        this.camera.y = Math.max(0, Math.min(this.mapHeight - (this.canvas.height / this.camera.scale), this.camera.y));
        
        // Update grid position display
        this.gridInfo.textContent = `Grid: ${this.getGridPosition(this.player.x, this.player.y)}`;

        // Check if player is near an outpost using mapped positions
        this.nearOutpost = false;
        this.currentOutpost = null;
        
        if (this.mappedIslands) {
            for (const island of this.mappedIslands) {
                if (island.isOutpost) {
                    const distance = Math.sqrt(
                        Math.pow(this.player.x - island.x, 2) + 
                        Math.pow(this.player.y - island.y, 2)
                    );
                    
                    if (distance < 300) {
                        this.nearOutpost = true;
                        this.currentOutpost = island.name;

                        // Check for auto-delivery of quests
                        const deliverableQuests = this.merchantQuests.activeQuests.filter(q => 
                            q.status === 'active' && q.destinationOutpost === island.name
                        );

                        for (const quest of deliverableQuests) {
                            this.completeQuest(quest.id);
                        }

                        break;
                    }
                }
            }
        }
        
        // Update tooltip visibility
        this.tooltipElement.style.display = this.nearOutpost ? 'block' : 'none';
        if (this.nearOutpost) {
            this.tooltipElement.textContent = `Press E to interact with ${this.currentOutpost}`;
        }

        // Update quest timers and displays
        this.merchantQuests.activeQuests = this.merchantQuests.activeQuests.filter(quest => {
            const timeLeft = (quest.startTime + (quest.timeLimit * 1000)) - Date.now();
            if (timeLeft <= 0) {
                // Quest failed
                this.merchantQuests.completedQuests.push({
                    ...quest,
                    status: 'failed'
                });
                return false;
            }
            return true;
        });

        // Update displays
        this.updateQuestDisplay();
        this.updateCargoDisplay();

        // Update menu if open
        if (this.showMenu) {
            if (this.questMenuElement.style.display === 'block') {
                // Only update quest menu if we're at the correct outpost
                const currentQuestOutpost = this.merchantQuests.activeQuests.find(q => 
                    q.status === 'active' && q.destinationOutpost === this.currentOutpost
                )?.destinationOutpost;
                
                if (currentQuestOutpost === this.currentOutpost) {
                    this.updateQuestMenu();
                }
            } else if (this.menuElement.style.display === 'block') {
                this.updateMainMenu();
            }
        }

        // Update cargo drop progress
        if (this.cargoDropState && this.cargoDropState.isHolding && this.cargo.items.length > 0) {
            const holdTime = Date.now() - this.cargoDropState.holdStartTime;

            if (holdTime >= this.cargoDropState.holdDuration) {
                // Drop all cargo
                this.cargo.items = [];
                this.cargo.currentWeight = 0;
                
                // Reset drop state
                this.cargoDropState.isHolding = false;
                
                // Update displays and show notification
                this.updateCargoDisplay();
                this.showNotification('Cargo dropped into the water!');
            }
        }

        // Update leaderboard when gold changes
        if (this.playerName) {
            this.updateLeaderboard();
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw water background
        this.ctx.fillStyle = '#1e90ff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw wind direction indicator
        this.ctx.save();
        this.ctx.translate(this.canvas.width - 50, this.canvas.height - 50);
        this.ctx.rotate(this.wind.direction);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.lineWidth = 2;
        
        // Draw arrow shaft
        this.ctx.beginPath();
        this.ctx.moveTo(-20, 0);
        this.ctx.lineTo(20, 0);
        this.ctx.stroke();
        
        // Draw arrow head
        this.ctx.beginPath();
        this.ctx.moveTo(20, 0);
        this.ctx.lineTo(10, -10);
        this.ctx.lineTo(10, 10);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.restore();
        
        // Save context for map drawing
        this.ctx.save();
        
        // Apply camera transform
        this.ctx.scale(this.camera.scale, this.camera.scale);
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Draw waves first (behind everything)
        this.drawWaves();
        
        // Draw map
        this.ctx.drawImage(this.mapImage, 0, 0, this.mapWidth, this.mapHeight);
        
        // Draw grid lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1 / this.camera.scale;
        
        // Vertical lines (A-Z)
        for (let x = 0; x <= this.gridSize; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.cellWidth, 0);
            this.ctx.lineTo(x * this.cellWidth, this.mapHeight);
            this.ctx.stroke();
            
            // Draw grid letters
            if (x < this.gridSize) {
                this.ctx.fillStyle = 'white';
                this.ctx.font = `${12 / this.camera.scale}px Arial`;
                this.ctx.fillText(String.fromCharCode(65 + x), x * this.cellWidth + 5, 15);
            }
        }
        
        // Horizontal lines (1-26)
        for (let y = 0; y <= this.gridSize; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.cellHeight);
            this.ctx.lineTo(this.mapWidth, y * this.cellHeight);
            this.ctx.stroke();
            
            // Draw grid numbers
            if (y < this.gridSize) {
                this.ctx.fillStyle = 'white';
                this.ctx.font = `${12 / this.camera.scale}px Arial`;
                this.ctx.fillText((y + 1).toString(), 5, y * this.cellHeight + 15);
            }
        }
        
        // Draw player boat
        this.ctx.save();
        this.ctx.translate(this.player.x, this.player.y);
        this.ctx.rotate(this.player.rotation);
        this.ctx.drawImage(
            this.boatImage,
            -this.player.width / 2,
            -this.player.height / 2,
            this.player.width,
            this.player.height
        );
        this.ctx.restore();
        
        // Draw island names using mapped positions
        if (this.mappedIslands) {
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            this.mappedIslands.forEach(island => {
                // Get the offset for this island
                const offset = this.textOffsets[island.name] || { x: 0, y: -50 };
                const displayX = island.x + offset.x;
                const displayY = island.y + offset.y;
            
                // Draw text shadow
                this.ctx.shadowColor = 'black';
                this.ctx.shadowBlur = 4;
                this.ctx.shadowOffsetX = 2;
                this.ctx.shadowOffsetY = 2;
                
                // Draw text with different colors based on type and region
                switch(island.type) {
                    case 'outpost':
                        this.ctx.fillStyle = '#ffd700'; // Gold for outposts
                        break;
                    case 'seapost':
                        this.ctx.fillStyle = '#00ff00'; // Green for seaposts
                        break;
                    case 'fortress':
                        this.ctx.fillStyle = '#ff4500'; // Orange-red for fortresses
                        break;
                    case 'large':
                        this.ctx.fillStyle = '#ffffff'; // White for large islands
                        break;
                    default:
                        this.ctx.fillStyle = '#cccccc'; // Gray for small islands
                }
                
                this.ctx.fillText(island.name, displayX, displayY);
                
                // Reset shadow
                this.ctx.shadowColor = 'transparent';
                this.ctx.shadowBlur = 0;
                this.ctx.shadowOffsetX = 0;
                this.ctx.shadowOffsetY = 0;
            });
        }
        
        // Draw outpost interaction radius when near an outpost (for debugging)
        if (this.nearOutpost) {
            this.ctx.save();
            this.ctx.translate(this.currentOutpost.x, this.currentOutpost.y);
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 300, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.stroke();
            this.ctx.restore();
        }
        
        // Restore context
        this.ctx.restore();
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    showNotification(message, duration = 3000) {
        this.notificationElement.textContent = message;
        this.notificationElement.style.display = 'block';
        setTimeout(() => {
            this.notificationElement.style.display = 'none';
        }, duration);
    }

    // Add new methods for leaderboard functionality
    toggleLeaderboard() {
        const isVisible = this.leaderboardOverlay.style.display === 'block';
        this.leaderboardOverlay.style.display = isVisible ? 'none' : 'block';
        this.leaderboardElement.style.display = isVisible ? 'none' : 'block';
        if (!isVisible) {
            // Reset state when opening
            this.leaderboardState = {
                selectedIndex: 0,
                isNameInput: false,
                isAdminLogin: false
            };
            // Force an immediate update when opening the leaderboard
            this.syncLeaderboard();
        }
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    window.game = new Game();
}); 