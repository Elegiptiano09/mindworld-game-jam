/**
 * Mindworld - Editor di livelli
 * 
 * Questo file contiene le classi e le funzioni per l'editor di livelli,
 * che permette di creare e modificare i livelli del gioco.
 */

class LevelEditor {
    constructor(game) {
        // Riferimento al gioco
        this.game = game;
        
        // Stato dell'editor
        this.active = false;
        
        // Livello corrente
        this.currentLevel = null;
        
        // Modalità di editing
        this.mode = "tile"; // tile, object, enemy, npc, trigger, decoration
        
        // Tile selezionato
        this.selectedTile = null;
        
        // Oggetto selezionato
        this.selectedObject = null;
        
        // Layer selezionato
        this.selectedLayer = "ground"; // ground, walls, decoration, objects
        
        // Posizione del mouse
        this.mouseX = 0;
        this.mouseY = 0;
        
        // Posizione della griglia
        this.gridX = 0;
        this.gridY = 0;
        
        // Dimensione della griglia
        this.gridSize = 32;
        
        // Offset della camera
        this.cameraX = 0;
        this.cameraY = 0;
        
        // Zoom della camera
        this.zoom = 1.0;
        
        // Flag per il trascinamento
        this.dragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        
        // Flag per la selezione multipla
        this.selecting = false;
        this.selectionStartX = 0;
        this.selectionStartY = 0;
        this.selectionEndX = 0;
        this.selectionEndY = 0;
        
        // Elementi selezionati
        this.selectedElements = [];
        
        // Cronologia delle azioni
        this.history = [];
        this.historyIndex = -1;
        
        // Palette di tile
        this.tilePalette = [];
        
        // Palette di oggetti
        this.objectPalette = [];
        
        // Palette di nemici
        this.enemyPalette = [];
        
        // Palette di NPC
        this.npcPalette = [];
        
        // Palette di trigger
        this.triggerPalette = [];
        
        // Palette di decorazioni
        this.decorationPalette = [];
        
        // Inizializza l'editor
        this.initialize();
    }
    
    /**
     * Inizializza l'editor di livelli
     */
    initialize() {
        // Carica le palette
        this.loadPalettes();
        
        // Inizializza gli eventi
        this.initializeEvents();
        
        // Crea l'interfaccia utente
        this.createUI();
    }
    
    /**
     * Carica le palette di elementi
     */
    loadPalettes() {
        // Carica la palette di tile
        this.loadTilePalette();
        
        // Carica la palette di oggetti
        this.loadObjectPalette();
        
        // Carica la palette di nemici
        this.loadEnemyPalette();
        
        // Carica la palette di NPC
        this.loadNpcPalette();
        
        // Carica la palette di trigger
        this.loadTriggerPalette();
        
        // Carica la palette di decorazioni
        this.loadDecorationPalette();
    }
    
    /**
     * Carica la palette di tile
     */
    loadTilePalette() {
        // Implementazione base, da espandere con il caricamento delle tile
        this.tilePalette = [
            {
                id: "grass",
                name: "Erba",
                image: null,
                solid: false,
                layer: "ground"
            },
            {
                id: "dirt",
                name: "Terra",
                image: null,
                solid: false,
                layer: "ground"
            },
            {
                id: "stone",
                name: "Pietra",
                image: null,
                solid: false,
                layer: "ground"
            },
            {
                id: "water",
                name: "Acqua",
                image: null,
                solid: true,
                layer: "ground"
            },
            {
                id: "lava",
                name: "Lava",
                image: null,
                solid: true,
                layer: "ground"
            },
            {
                id: "wall_stone",
                name: "Muro di pietra",
                image: null,
                solid: true,
                layer: "walls"
            },
            {
                id: "wall_brick",
                name: "Muro di mattoni",
                image: null,
                solid: true,
                layer: "walls"
            },
            {
                id: "wall_wood",
                name: "Muro di legno",
                image: null,
                solid: true,
                layer: "walls"
            },
            {
                id: "flower_red",
                name: "Fiore rosso",
                image: null,
                solid: false,
                layer: "decoration"
            },
            {
                id: "flower_blue",
                name: "Fiore blu",
                image: null,
                solid: false,
                layer: "decoration"
            },
            {
                id: "tree",
                name: "Albero",
                image: null,
                solid: true,
                layer: "decoration"
            },
            {
                id: "bush",
                name: "Cespuglio",
                image: null,
                solid: false,
                layer: "decoration"
            }
        ];
    }
    
    /**
     * Carica la palette di oggetti
     */
    loadObjectPalette() {
        // Implementazione base, da espandere con il caricamento degli oggetti
        this.objectPalette = [
            {
                id: "chest",
                name: "Baule",
                image: null,
                solid: true,
                interactable: true,
                properties: {
                    loot: []
                }
            },
            {
                id: "door",
                name: "Porta",
                image: null,
                solid: true,
                interactable: true,
                properties: {
                    locked: false,
                    keyId: null,
                    targetLevel: null,
                    targetX: 0,
                    targetY: 0
                }
            },
            {
                id: "lever",
                name: "Leva",
                image: null,
                solid: false,
                interactable: true,
                properties: {
                    state: false,
                    targetId: null
                }
            },
            {
                id: "pressure_plate",
                name: "Piastra a pressione",
                image: null,
                solid: false,
                interactable: false,
                properties: {
                    state: false,
                    targetId: null
                }
            },
            {
                id: "sign",
                name: "Cartello",
                image: null,
                solid: false,
                interactable: true,
                properties: {
                    text: ""
                }
            },
            {
                id: "torch",
                name: "Torcia",
                image: null,
                solid: false,
                interactable: false,
                properties: {
                    lightRadius: 5,
                    lightColor: { r: 255, g: 200, b: 100 }
                }
            },
            {
                id: "crystal",
                name: "Cristallo",
                image: null,
                solid: false,
                interactable: true,
                properties: {
                    type: "fah", // fah, brih
                    power: 10
                }
            }
        ];
    }
    
    /**
     * Carica la palette di nemici
     */
    loadEnemyPalette() {
        // Implementazione base, da espandere con il caricamento dei nemici
        this.enemyPalette = [
            {
                id: "slime",
                name: "Slime",
                image: null,
                properties: {
                    health: 20,
                    damage: 5,
                    speed: 50,
                    type: "neutral",
                    drops: [
                        { id: "slime_gel", chance: 0.7 }
                    ]
                }
            },
            {
                id: "fah_elemental",
                name: "Elementale Fah",
                image: null,
                properties: {
                    health: 40,
                    damage: 10,
                    speed: 70,
                    type: "fah",
                    attacks: [
                        { id: "fireball", damage: 8, cooldown: 2 }
                    ],
                    drops: [
                        { id: "fah_essence", chance: 0.5 }
                    ]
                }
            },
            {
                id: "brih_elemental",
                name: "Elementale Brih",
                image: null,
                properties: {
                    health: 40,
                    damage: 10,
                    speed: 70,
                    type: "brih",
                    attacks: [
                        { id: "ice_spike", damage: 8, cooldown: 2 }
                    ],
                    drops: [
                        { id: "brih_essence", chance: 0.5 }
                    ]
                }
            },
            {
                id: "golem",
                name: "Golem",
                image: null,
                properties: {
                    health: 100,
                    damage: 15,
                    speed: 40,
                    type: "neutral",
                    attacks: [
                        { id: "slam", damage: 20, cooldown: 3 }
                    ],
                    drops: [
                        { id: "stone_core", chance: 0.3 }
                    ]
                }
            },
            {
                id: "ghost",
                name: "Fantasma",
                image: null,
                properties: {
                    health: 30,
                    damage: 8,
                    speed: 90,
                    type: "neutral",
                    attacks: [
                        { id: "haunt", damage: 5, cooldown: 1 }
                    ],
                    drops: [
                        { id: "ectoplasm", chance: 0.4 }
                    ]
                }
            }
        ];
    }
    
    /**
     * Carica la palette di NPC
     */
    loadNpcPalette() {
        // Implementazione base, da espandere con il caricamento degli NPC
        this.npcPalette = [
            {
                id: "villager",
                name: "Abitante",
                image: null,
                properties: {
                    dialogues: [
                        { id: "greeting", text: "Ciao, viaggiatore!" },
                        { id: "question", text: "Sei qui per salvare il villaggio?" }
                    ],
                    quests: []
                }
            },
            {
                id: "merchant",
                name: "Mercante",
                image: null,
                properties: {
                    dialogues: [
                        { id: "greeting", text: "Benvenuto nel mio negozio!" },
                        { id: "question", text: "Cosa ti serve oggi?" }
                    ],
                    shop: {
                        items: [
                            { id: "health_potion", price: 10 },
                            { id: "energy_potion", price: 15 }
                        ]
                    }
                }
            },
            {
                id: "blacksmith",
                name: "Fabbro",
                image: null,
                properties: {
                    dialogues: [
                        { id: "greeting", text: "Benvenuto nella mia fucina!" },
                        { id: "question", text: "Vuoi migliorare le tue armi?" }
                    ],
                    shop: {
                        items: [
                            { id: "sword", price: 50 },
                            { id: "shield", price: 40 }
                        ]
                    },
                    upgrades: {
                        items: [
                            { id: "sword", materials: [{ id: "iron", count: 5 }], price: 20 }
                        ]
                    }
                }
            },
            {
                id: "wizard",
                name: "Mago",
                image: null,
                properties: {
                    dialogues: [
                        { id: "greeting", text: "Ah, un altro cercatore di conoscenza!" },
                        { id: "question", text: "Vuoi imparare nuovi incantesimi?" }
                    ],
                    shop: {
                        items: [
                            { id: "fah_scroll", price: 30 },
                            { id: "brih_scroll", price: 30 }
                        ]
                    },
                    quests: [
                        { id: "elemental_balance", title: "Equilibrio Elementale", description: "Trova 5 essenze Fah e 5 essenze Brih." }
                    ]
                }
            },
            {
                id: "elder",
                name: "Anziano",
                image: null,
                properties: {
                    dialogues: [
                        { id: "greeting", text: "Benvenuto, giovane avventuriero." },
                        { id: "story", text: "Lascia che ti racconti la storia del nostro villaggio..." }
                    ],
                    quests: [
                        { id: "village_history", title: "Storia del Villaggio", description: "Trova gli antichi manoscritti sparsi per il villaggio." }
                    ]
                }
            }
        ];
    }
    
    /**
     * Carica la palette di trigger
     */
    loadTriggerPalette() {
        // Implementazione base, da espandere con il caricamento dei trigger
        this.triggerPalette = [
            {
                id: "level_transition",
                name: "Transizione di livello",
                image: null,
                properties: {
                    targetLevel: null,
                    targetX: 0,
                    targetY: 0
                }
            },
            {
                id: "cutscene",
                name: "Cutscene",
                image: null,
                properties: {
                    cutsceneId: null,
                    oneTime: true
                }
            },
            {
                id: "spawn_enemies",
                name: "Spawn nemici",
                image: null,
                properties: {
                    enemies: [],
                    count: 1,
                    radius: 5,
                    oneTime: false,
                    cooldown: 60
                }
            },
            {
                id: "activate_object",
                name: "Attiva oggetto",
                image: null,
                properties: {
                    targetId: null,
                    oneTime: true
                }
            },
            {
                id: "damage_area",
                name: "Area di danno",
                image: null,
                properties: {
                    damage: 5,
                    interval: 1,
                    type: "neutral" // neutral, fah, brih
                }
            },
            {
                id: "heal_area",
                name: "Area di cura",
                image: null,
                properties: {
                    heal: 5,
                    interval: 1
                }
            },
            {
                id: "checkpoint",
                name: "Checkpoint",
                image: null,
                properties: {
                    id: null
                }
            }
        ];
    }
    
    /**
     * Carica la palette di decorazioni
     */
    loadDecorationPalette() {
        // Implementazione base, da espandere con il caricamento delle decorazioni
        this.decorationPalette = [
            {
                id: "grass_tuft",
                name: "Ciuffo d'erba",
                image: null,
                layer: "decoration"
            },
            {
                id: "rock",
                name: "Roccia",
                image: null,
                layer: "decoration"
            },
            {
                id: "mushroom",
                name: "Fungo",
                image: null,
                layer: "decoration"
            },
            {
                id: "flower_patch",
                name: "Aiuola di fiori",
                image: null,
                layer: "decoration"
            },
            {
                id: "fallen_log",
                name: "Tronco caduto",
                image: null,
                layer: "decoration"
            },
            {
                id: "stump",
                name: "Ceppo",
                image: null,
                layer: "decoration"
            },
            {
                id: "vines",
                name: "Rampicanti",
                image: null,
                layer: "decoration"
            },
            {
                id: "crystals",
                name: "Cristalli",
                image: null,
                layer: "decoration"
            }
        ];
    }
    
    /**
     * Inizializza gli eventi dell'editor
     */
    initializeEvents() {
        // Implementazione base, da espandere con la gestione degli eventi
        // In una versione completa, qui si gestirebbero gli eventi del mouse e della tastiera
    }
    
    /**
     * Crea l'interfaccia utente dell'editor
     */
    createUI() {
        // Implementazione base, da espandere con la creazione dell'interfaccia utente
        // In una versione completa, qui si creerebbe l'interfaccia utente dell'editor
    }
    
    /**
     * Attiva l'editor di livelli
     */
    activate() {
        this.active = true;
        
        // Se non c'è un livello corrente, creane uno nuovo
        if (!this.currentLevel) {
            this.newLevel();
        }
    }
    
    /**
     * Disattiva l'editor di livelli
     */
    deactivate() {
        this.active = false;
    }
    
    /**
     * Crea un nuovo livello
     * @param {Object} options - Opzioni per il nuovo livello
     * @returns {Object} Nuovo livello creato
     */
    newLevel(options = {}) {
        // Opzioni predefinite
        const defaults = {
            name: "Nuovo Livello",
            width: 50,
            height: 50,
            tileSize: 32,
            background: "black"
        };
        
        // Unisci le opzioni con i valori predefiniti
        const settings = { ...defaults, ...options };
        
        // Crea il nuovo livello
        const level = {
            name: settings.name,
            width: settings.width,
            height: settings.height,
            tileSize: settings.tileSize,
            background: settings.background,
            layers: {
                ground: this.createEmptyLayer(settings.width, settings.height),
                walls: this.createEmptyLayer(settings.width, settings.height),
                decoration: this.createEmptyLayer(settings.width, settings.height),
                objects: []
            },
            properties: {
                music: null,
                ambience: null,
                weather: null,
                lighting: {
                    ambient: { r: 255, g: 255, b: 255 },
                    directional: { r: 255, g: 255, b: 255, direction: 0 }
                }
            }
        };
        
        // Imposta il livello corrente
        this.currentLevel = level;
        
        // Resetta la cronologia
        this.history = [];
        this.historyIndex = -1;
        
        // Aggiungi l'azione alla cronologia
        this.addToHistory({
            type: "new_level",
            level: this.cloneLevel(level)
        });
        
        return level;
    }
    
    /**
     * Crea un layer vuoto
     * @param {number} width - Larghezza del layer
     * @param {number} height - Altezza del layer
     * @returns {Array} Layer vuoto
     */
    createEmptyLayer(width, height) {
        // Crea un array bidimensionale vuoto
        const layer = new Array(height);
        
        for (let y = 0; y < height; y++) {
            layer[y] = new Array(width).fill(null);
        }
        
        return layer;
    }
    
    /**
     * Carica un livello
     * @param {Object} level - Livello da caricare
     */
    loadLevel(level) {
        // Clona il livello
        this.currentLevel = this.cloneLevel(level);
        
        // Resetta la cronologia
        this.history = [];
        this.historyIndex = -1;
        
        // Aggiungi l'azione alla cronologia
        this.addToHistory({
            type: "load_level",
            level: this.cloneLevel(level)
        });
    }
    
    /**
     * Salva il livello corrente
     * @returns {Object} Livello salvato
     */
    saveLevel() {
        // Clona il livello
        const level = this.cloneLevel(this.currentLevel);
        
        // Aggiungi l'azione alla cronologia
        this.addToHistory({
            type: "save_level",
            level: this.cloneLevel(level)
        });
        
        return level;
    }
    
    /**
     * Clona un livello
     * @param {Object} level - Livello da clonare
     * @returns {Object} Livello clonato
     */
    cloneLevel(level) {
        // Clona il livello usando JSON
        return JSON.parse(JSON.stringify(level));
    }
    
    /**
     * Imposta una tile nel livello corrente
     * @param {number} x - Coordinata X della tile
     * @param {number} y - Coordinata Y della tile
     * @param {Object} tile - Tile da impostare
     * @param {string} layer - Layer in cui impostare la tile
     */
    setTile(x, y, tile, layer) {
        // Verifica se le coordinate sono valide
        if (x < 0 || x >= this.currentLevel.width || y < 0 || y >= this.currentLevel.height) {
            return;
        }
        
        // Verifica se il layer esiste
        if (!this.currentLevel.layers[layer]) {
            return;
        }
        
        // Salva la tile precedente
        const oldTile = this.currentLevel.layers[layer][y][x];
        
        // Imposta la nuova tile
        this.currentLevel.layers[layer][y][x] = tile;
        
        // Aggiungi l'azione alla cronologia
        this.addToHistory({
            type: "set_tile",
            x: x,
            y: y,
            layer: layer,
            oldTile: oldTile,
            newTile: tile
        });
    }
    
    /**
     * Ottiene una tile dal livello corrente
     * @param {number} x - Coordinata X della tile
     * @param {number} y - Coordinata Y della tile
     * @param {string} layer - Layer da cui ottenere la tile
     * @returns {Object} Tile ottenuta
     */
    getTile(x, y, layer) {
        // Verifica se le coordinate sono valide
        if (x < 0 || x >= this.currentLevel.width || y < 0 || y >= this.currentLevel.height) {
            return null;
        }
        
        // Verifica se il layer esiste
        if (!this.currentLevel.layers[layer]) {
            return null;
        }
        
        return this.currentLevel.layers[layer][y][x];
    }
    
    /**
     * Aggiunge un oggetto al livello corrente
     * @param {Object} object - Oggetto da aggiungere
     */
    addObject(object) {
        // Clona l'oggetto
        const newObject = { ...object };
        
        // Aggiungi un ID univoco all'oggetto
        newObject.id = this.generateUniqueId();
        
        // Aggiungi l'oggetto al livello
        this.currentLevel.layers.objects.push(newObject);
        
        // Aggiungi l'azione alla cronologia
        this.addToHistory({
            type: "add_object",
            object: { ...newObject }
        });
        
        return newObject;
    }
    
    /**
     * Rimuove un oggetto dal livello corrente
     * @param {string} id - ID dell'oggetto da rimuovere
     */
    removeObject(id) {
        // Trova l'indice dell'oggetto
        const index = this.currentLevel.layers.objects.findIndex(obj => obj.id === id);
        
        // Verifica se l'oggetto esiste
        if (index === -1) {
            return;
        }
        
        // Salva l'oggetto
        const object = { ...this.currentLevel.layers.objects[index] };
        
        // Rimuovi l'oggetto
        this.currentLevel.layers.objects.splice(index, 1);
        
        // Aggiungi l'azione alla cronologia
        this.addToHistory({
            type: "remove_object",
            object: object,
            index: index
        });
    }
    
    /**
     * Modifica un oggetto nel livello corrente
     * @param {string} id - ID dell'oggetto da modificare
     * @param {Object} properties - Nuove proprietà dell'oggetto
     */
    editObject(id, properties) {
        // Trova l'oggetto
        const object = this.currentLevel.layers.objects.find(obj => obj.id === id);
        
        // Verifica se l'oggetto esiste
        if (!object) {
            return;
        }
        
        // Salva le vecchie proprietà
        const oldProperties = { ...object };
        
        // Modifica le proprietà dell'oggetto
        Object.assign(object, properties);
        
        // Aggiungi l'azione alla cronologia
        this.addToHistory({
            type: "edit_object",
            id: id,
            oldProperties: oldProperties,
            newProperties: { ...object }
        });
    }
    
    /**
     * Genera un ID univoco
     * @returns {string} ID univoco
     */
    generateUniqueId() {
        return Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Aggiunge un'azione alla cronologia
     * @param {Object} action - Azione da aggiungere
     */
    addToHistory(action) {
        // Se non siamo alla fine della cronologia, rimuovi le azioni successive
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        // Aggiungi l'azione alla cronologia
        this.history.push(action);
        
        // Aggiorna l'indice
        this.historyIndex = this.history.length - 1;
    }
    
    /**
     * Annulla l'ultima azione
     */
    undo() {
        // Verifica se ci sono azioni da annullare
        if (this.historyIndex < 0) {
            return;
        }
        
        // Ottieni l'azione da annullare
        const action = this.history[this.historyIndex];
        
        // Annulla l'azione in base al tipo
        switch (action.type) {
            case "set_tile":
                this.currentLevel.layers[action.layer][action.y][action.x] = action.oldTile;
                break;
            case "add_object":
                this.currentLevel.layers.objects = this.currentLevel.layers.objects.filter(obj => obj.id !== action.object.id);
                break;
            case "remove_object":
                this.currentLevel.layers.objects.splice(action.index, 0, action.object);
                break;
            case "edit_object":
                const object = this.currentLevel.layers.objects.find(obj => obj.id === action.id);
                if (object) {
                    Object.assign(object, action.oldProperties);
                }
                break;
            case "new_level":
            case "load_level":
                // Ripristina il livello precedente se disponibile
                if (this.historyIndex > 0) {
                    const prevAction = this.history[this.historyIndex - 1];
                    if (prevAction.type === "new_level" || prevAction.type === "load_level" || prevAction.type === "save_level") {
                        this.currentLevel = this.cloneLevel(prevAction.level);
                    }
                }
                break;
        }
        
        // Aggiorna l'indice
        this.historyIndex--;
    }
    
    /**
     * Ripete l'ultima azione annullata
     */
    redo() {
        // Verifica se ci sono azioni da ripetere
        if (this.historyIndex >= this.history.length - 1) {
            return;
        }
        
        // Aggiorna l'indice
        this.historyIndex++;
        
        // Ottieni l'azione da ripetere
        const action = this.history[this.historyIndex];
        
        // Ripeti l'azione in base al tipo
        switch (action.type) {
            case "set_tile":
                this.currentLevel.layers[action.layer][action.y][action.x] = action.newTile;
                break;
            case "add_object":
                this.currentLevel.layers.objects.push(action.object);
                break;
            case "remove_object":
                this.currentLevel.layers.objects = this.currentLevel.layers.objects.filter(obj => obj.id !== action.object.id);
                break;
            case "edit_object":
                const object = this.currentLevel.layers.objects.find(obj => obj.id === action.id);
                if (object) {
                    Object.assign(object, action.newProperties);
                }
                break;
            case "new_level":
            case "load_level":
            case "save_level":
                this.currentLevel = this.cloneLevel(action.level);
                break;
        }
    }
    
    /**
     * Esporta il livello corrente in formato JSON
     * @returns {string} Livello in formato JSON
     */
    exportLevel() {
        return JSON.stringify(this.currentLevel, null, 2);
    }
    
    /**
     * Importa un livello da formato JSON
     * @param {string} json - Livello in formato JSON
     * @returns {Object} Livello importato
     */
    importLevel(json) {
        try {
            // Parsing del JSON
            const level = JSON.parse(json);
            
            // Carica il livello
            this.loadLevel(level);
            
            return level;
        } catch (error) {
            console.error("Errore durante l'importazione del livello:", error);
            return null;
        }
    }
    
    /**
     * Ridimensiona il livello corrente
     * @param {number} width - Nuova larghezza
     * @param {number} height - Nuova altezza
     * @param {string} anchor - Punto di ancoraggio (nw, n, ne, w, c, e, sw, s, se)
     */
    resizeLevel(width, height, anchor = "nw") {
        // Verifica se le dimensioni sono valide
        if (width <= 0 || height <= 0) {
            return;
        }
        
        // Calcola gli offset in base all'ancoraggio
        let offsetX = 0;
        let offsetY = 0;
        
        switch (anchor) {
            case "nw":
                offsetX = 0;
                offsetY = 0;
                break;
            case "n":
                offsetX = Math.floor((width - this.currentLevel.width) / 2);
                offsetY = 0;
                break;
            case "ne":
                offsetX = width - this.currentLevel.width;
                offsetY = 0;
                break;
            case "w":
                offsetX = 0;
                offsetY = Math.floor((height - this.currentLevel.height) / 2);
                break;
            case "c":
                offsetX = Math.floor((width - this.currentLevel.width) / 2);
                offsetY = Math.floor((height - this.currentLevel.height) / 2);
                break;
            case "e":
                offsetX = width - this.currentLevel.width;
                offsetY = Math.floor((height - this.currentLevel.height) / 2);
                break;
            case "sw":
                offsetX = 0;
                offsetY = height - this.currentLevel.height;
                break;
            case "s":
                offsetX = Math.floor((width - this.currentLevel.width) / 2);
                offsetY = height - this.currentLevel.height;
                break;
            case "se":
                offsetX = width - this.currentLevel.width;
                offsetY = height - this.currentLevel.height;
                break;
        }
        
        // Salva il vecchio livello
        const oldLevel = this.cloneLevel(this.currentLevel);
        
        // Crea nuovi layer
        const newLayers = {
            ground: this.createEmptyLayer(width, height),
            walls: this.createEmptyLayer(width, height),
            decoration: this.createEmptyLayer(width, height),
            objects: []
        };
        
        // Copia i dati dai vecchi layer
        for (let y = 0; y < this.currentLevel.height; y++) {
            for (let x = 0; x < this.currentLevel.width; x++) {
                // Calcola le nuove coordinate
                const newX = x + offsetX;
                const newY = y + offsetY;
                
                // Verifica se le nuove coordinate sono valide
                if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                    // Copia le tile
                    newLayers.ground[newY][newX] = this.currentLevel.layers.ground[y][x];
                    newLayers.walls[newY][newX] = this.currentLevel.layers.walls[y][x];
                    newLayers.decoration[newY][newX] = this.currentLevel.layers.decoration[y][x];
                }
            }
        }
        
        // Copia gli oggetti
        for (const object of this.currentLevel.layers.objects) {
            // Calcola le nuove coordinate
            const newX = object.x + offsetX * this.currentLevel.tileSize;
            const newY = object.y + offsetY * this.currentLevel.tileSize;
            
            // Verifica se le nuove coordinate sono valide
            if (newX >= 0 && newX < width * this.currentLevel.tileSize && newY >= 0 && newY < height * this.currentLevel.tileSize) {
                // Copia l'oggetto
                newLayers.objects.push({
                    ...object,
                    x: newX,
                    y: newY
                });
            }
        }
        
        // Aggiorna il livello
        this.currentLevel.width = width;
        this.currentLevel.height = height;
        this.currentLevel.layers = newLayers;
        
        // Aggiungi l'azione alla cronologia
        this.addToHistory({
            type: "resize_level",
            oldLevel: oldLevel,
            newLevel: this.cloneLevel(this.currentLevel)
        });
    }
    
    /**
     * Riempie un'area con una tile
     * @param {number} startX - Coordinata X iniziale
     * @param {number} startY - Coordinata Y iniziale
     * @param {number} endX - Coordinata X finale
     * @param {number} endY - Coordinata Y finale
     * @param {Object} tile - Tile da utilizzare
     * @param {string} layer - Layer in cui riempire
     */
    fillArea(startX, startY, endX, endY, tile, layer) {
        // Normalizza le coordinate
        const x1 = Math.min(startX, endX);
        const y1 = Math.min(startY, endY);
        const x2 = Math.max(startX, endX);
        const y2 = Math.max(startY, endY);
        
        // Salva le vecchie tile
        const oldTiles = [];
        
        // Riempi l'area
        for (let y = y1; y <= y2; y++) {
            for (let x = x1; x <= x2; x++) {
                // Verifica se le coordinate sono valide
                if (x >= 0 && x < this.currentLevel.width && y >= 0 && y < this.currentLevel.height) {
                    // Salva la vecchia tile
                    oldTiles.push({
                        x: x,
                        y: y,
                        tile: this.currentLevel.layers[layer][y][x]
                    });
                    
                    // Imposta la nuova tile
                    this.currentLevel.layers[layer][y][x] = tile;
                }
            }
        }
        
        // Aggiungi l'azione alla cronologia
        this.addToHistory({
            type: "fill_area",
            layer: layer,
            oldTiles: oldTiles,
            newTile: tile
        });
    }
    
    /**
     * Riempie un'area con un algoritmo di riempimento
     * @param {number} x - Coordinata X iniziale
     * @param {number} y - Coordinata Y iniziale
     * @param {Object} tile - Tile da utilizzare
     * @param {string} layer - Layer in cui riempire
     */
    floodFill(x, y, tile, layer) {
        // Verifica se le coordinate sono valide
        if (x < 0 || x >= this.currentLevel.width || y < 0 || y >= this.currentLevel.height) {
            return;
        }
        
        // Ottieni la tile target
        const targetTile = this.currentLevel.layers[layer][y][x];
        
        // Verifica se la tile target è uguale alla nuova tile
        if (JSON.stringify(targetTile) === JSON.stringify(tile)) {
            return;
        }
        
        // Salva le vecchie tile
        const oldTiles = [];
        
        // Esegui l'algoritmo di riempimento
        this.floodFillRecursive(x, y, targetTile, tile, layer, oldTiles);
        
        // Aggiungi l'azione alla cronologia
        this.addToHistory({
            type: "flood_fill",
            layer: layer,
            oldTiles: oldTiles,
            newTile: tile
        });
    }
    
    /**
     * Funzione ricorsiva per l'algoritmo di riempimento
     * @param {number} x - Coordinata X
     * @param {number} y - Coordinata Y
     * @param {Object} targetTile - Tile target
     * @param {Object} replacementTile - Tile sostitutiva
     * @param {string} layer - Layer in cui riempire
     * @param {Array} oldTiles - Array delle vecchie tile
     */
    floodFillRecursive(x, y, targetTile, replacementTile, layer, oldTiles) {
        // Verifica se le coordinate sono valide
        if (x < 0 || x >= this.currentLevel.width || y < 0 || y >= this.currentLevel.height) {
            return;
        }
        
        // Ottieni la tile corrente
        const currentTile = this.currentLevel.layers[layer][y][x];
        
        // Verifica se la tile corrente è uguale alla tile target
        if (JSON.stringify(currentTile) !== JSON.stringify(targetTile)) {
            return;
        }
        
        // Salva la vecchia tile
        oldTiles.push({
            x: x,
            y: y,
            tile: currentTile
        });
        
        // Imposta la nuova tile
        this.currentLevel.layers[layer][y][x] = replacementTile;
        
        // Riempi le tile adiacenti
        this.floodFillRecursive(x + 1, y, targetTile, replacementTile, layer, oldTiles);
        this.floodFillRecursive(x - 1, y, targetTile, replacementTile, layer, oldTiles);
        this.floodFillRecursive(x, y + 1, targetTile, replacementTile, layer, oldTiles);
        this.floodFillRecursive(x, y - 1, targetTile, replacementTile, layer, oldTiles);
    }
    
    /**
     * Disegna l'editor di livelli
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    draw(ctx) {
        // Verifica se l'editor è attivo
        if (!this.active) {
            return;
        }
        
        // Verifica se c'è un livello corrente
        if (!this.currentLevel) {
            return;
        }
        
        // Salva il contesto
        ctx.save();
        
        // Applica lo zoom e l'offset della camera
        ctx.translate(this.cameraX, this.cameraY);
        ctx.scale(this.zoom, this.zoom);
        
        // Disegna lo sfondo
        ctx.fillStyle = this.currentLevel.background;
        ctx.fillRect(0, 0, this.currentLevel.width * this.currentLevel.tileSize, this.currentLevel.height * this.currentLevel.tileSize);
        
        // Disegna i layer
        this.drawLayer(ctx, "ground");
        this.drawLayer(ctx, "walls");
        this.drawLayer(ctx, "decoration");
        this.drawObjects(ctx);
        
        // Disegna la griglia
        this.drawGrid(ctx);
        
        // Disegna l'elemento selezionato
        this.drawSelectedElement(ctx);
        
        // Disegna la selezione
        if (this.selecting) {
            this.drawSelection(ctx);
        }
        
        // Ripristina il contesto
        ctx.restore();
        
        // Disegna l'interfaccia utente
        this.drawUI(ctx);
    }
    
    /**
     * Disegna un layer
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     * @param {string} layerName - Nome del layer
     */
    drawLayer(ctx, layerName) {
        // Ottieni il layer
        const layer = this.currentLevel.layers[layerName];
        
        // Verifica se il layer esiste
        if (!layer) {
            return;
        }
        
        // Disegna le tile
        for (let y = 0; y < this.currentLevel.height; y++) {
            for (let x = 0; x < this.currentLevel.width; x++) {
                // Ottieni la tile
                const tile = layer[y][x];
                
                // Verifica se la tile esiste
                if (!tile) {
                    continue;
                }
                
                // Calcola la posizione
                const posX = x * this.currentLevel.tileSize;
                const posY = y * this.currentLevel.tileSize;
                
                // Disegna la tile
                if (tile.image) {
                    // Disegna l'immagine
                    ctx.drawImage(tile.image, posX, posY, this.currentLevel.tileSize, this.currentLevel.tileSize);
                } else {
                    // Disegna un rettangolo colorato
                    ctx.fillStyle = tile.color || "#888";
                    ctx.fillRect(posX, posY, this.currentLevel.tileSize, this.currentLevel.tileSize);
                    
                    // Disegna il nome della tile
                    ctx.fillStyle = "#fff";
                    ctx.font = "10px Arial";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(tile.name || tile.id, posX + this.currentLevel.tileSize / 2, posY + this.currentLevel.tileSize / 2);
                }
            }
        }
    }
    
    /**
     * Disegna gli oggetti
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawObjects(ctx) {
        // Ottieni gli oggetti
        const objects = this.currentLevel.layers.objects;
        
        // Disegna gli oggetti
        for (const object of objects) {
            // Calcola la posizione
            const posX = object.x;
            const posY = object.y;
            
            // Disegna l'oggetto
            if (object.image) {
                // Disegna l'immagine
                ctx.drawImage(object.image, posX, posY, object.width || this.currentLevel.tileSize, object.height || this.currentLevel.tileSize);
            } else {
                // Disegna un rettangolo colorato
                ctx.fillStyle = object.color || "#f00";
                ctx.fillRect(posX, posY, object.width || this.currentLevel.tileSize, object.height || this.currentLevel.tileSize);
                
                // Disegna il nome dell'oggetto
                ctx.fillStyle = "#fff";
                ctx.font = "10px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(object.name || object.id, posX + (object.width || this.currentLevel.tileSize) / 2, posY + (object.height || this.currentLevel.tileSize) / 2);
            }
        }
    }
    
    /**
     * Disegna la griglia
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawGrid(ctx) {
        // Imposta lo stile della griglia
        ctx.strokeStyle = "#888";
        ctx.lineWidth = 0.5;
        
        // Disegna le linee verticali
        for (let x = 0; x <= this.currentLevel.width; x++) {
            ctx.beginPath();
            ctx.moveTo(x * this.currentLevel.tileSize, 0);
            ctx.lineTo(x * this.currentLevel.tileSize, this.currentLevel.height * this.currentLevel.tileSize);
            ctx.stroke();
        }
        
        // Disegna le linee orizzontali
        for (let y = 0; y <= this.currentLevel.height; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * this.currentLevel.tileSize);
            ctx.lineTo(this.currentLevel.width * this.currentLevel.tileSize, y * this.currentLevel.tileSize);
            ctx.stroke();
        }
    }
    
    /**
     * Disegna l'elemento selezionato
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawSelectedElement(ctx) {
        // Verifica se c'è un elemento selezionato
        if (this.mode === "tile" && this.selectedTile) {
            // Calcola la posizione
            const posX = this.gridX * this.currentLevel.tileSize;
            const posY = this.gridY * this.currentLevel.tileSize;
            
            // Disegna la tile selezionata
            if (this.selectedTile.image) {
                // Disegna l'immagine
                ctx.globalAlpha = 0.5;
                ctx.drawImage(this.selectedTile.image, posX, posY, this.currentLevel.tileSize, this.currentLevel.tileSize);
                ctx.globalAlpha = 1.0;
            } else {
                // Disegna un rettangolo colorato
                ctx.fillStyle = this.selectedTile.color || "#888";
                ctx.globalAlpha = 0.5;
                ctx.fillRect(posX, posY, this.currentLevel.tileSize, this.currentLevel.tileSize);
                ctx.globalAlpha = 1.0;
                
                // Disegna il nome della tile
                ctx.fillStyle = "#fff";
                ctx.font = "10px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(this.selectedTile.name || this.selectedTile.id, posX + this.currentLevel.tileSize / 2, posY + this.currentLevel.tileSize / 2);
            }
        } else if (this.mode !== "tile" && this.selectedObject) {
            // Calcola la posizione
            const posX = this.mouseX;
            const posY = this.mouseY;
            
            // Disegna l'oggetto selezionato
            if (this.selectedObject.image) {
                // Disegna l'immagine
                ctx.globalAlpha = 0.5;
                ctx.drawImage(this.selectedObject.image, posX, posY, this.selectedObject.width || this.currentLevel.tileSize, this.selectedObject.height || this.currentLevel.tileSize);
                ctx.globalAlpha = 1.0;
            } else {
                // Disegna un rettangolo colorato
                ctx.fillStyle = this.selectedObject.color || "#f00";
                ctx.globalAlpha = 0.5;
                ctx.fillRect(posX, posY, this.selectedObject.width || this.currentLevel.tileSize, this.selectedObject.height || this.currentLevel.tileSize);
                ctx.globalAlpha = 1.0;
                
                // Disegna il nome dell'oggetto
                ctx.fillStyle = "#fff";
                ctx.font = "10px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(this.selectedObject.name || this.selectedObject.id, posX + (this.selectedObject.width || this.currentLevel.tileSize) / 2, posY + (this.selectedObject.height || this.currentLevel.tileSize) / 2);
            }
        }
    }
    
    /**
     * Disegna la selezione
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawSelection(ctx) {
        // Calcola le coordinate
        const x = Math.min(this.selectionStartX, this.selectionEndX);
        const y = Math.min(this.selectionStartY, this.selectionEndY);
        const width = Math.abs(this.selectionEndX - this.selectionStartX);
        const height = Math.abs(this.selectionEndY - this.selectionStartY);
        
        // Disegna la selezione
        ctx.strokeStyle = "#00f";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Disegna lo sfondo della selezione
        ctx.fillStyle = "rgba(0, 0, 255, 0.2)";
        ctx.fillRect(x, y, width, height);
    }
    
    /**
     * Disegna l'interfaccia utente
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawUI(ctx) {
        // Implementazione base, da espandere con il disegno dell'interfaccia utente
        // In una versione completa, qui si disegnerebbe l'interfaccia utente dell'editor
    }
    
    /**
     * Aggiorna l'editor di livelli
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    update(deltaTime) {
        // Verifica se l'editor è attivo
        if (!this.active) {
            return;
        }
        
        // Implementazione base, da espandere con l'aggiornamento dell'editor
        // In una versione completa, qui si aggiornerebbe lo stato dell'editor
    }
}
