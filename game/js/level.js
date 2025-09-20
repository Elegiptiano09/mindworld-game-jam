/**
 * Mindworld - Sistema di livelli
 * 
 * Questo file contiene la classe Level che gestisce i livelli di gioco,
 * inclusi caricamento, rendering e transizioni.
 */

class Level {
    constructor(config) {
        // Proprietà di base
        this.id = config.id || "";
        this.name = config.name || "Unnamed Level";
        this.description = config.description || "";
        this.type = config.type || "default";
        
        // Dimensioni
        this.width = config.width || 50;
        this.height = config.height || 30;
        this.tileSize = config.tileSize || 32;
        
        // Posizione iniziale del giocatore
        this.startX = config.startX || 0;
        this.startY = config.startY || 0;
        
        // Risorse
        this.backgroundImage = null;
        this.backgroundId = config.background || "";
        this.tilesetImage = null;
        this.tilesetId = config.tileset || "";
        this.musicId = config.music || "";
        
        // Mappa
        this.tileMap = [];
        this.collisionMap = [];
        
        // Entità
        this.npcs = [];
        this.objects = [];
        this.enemies = [];
        
        // Connessioni ad altri livelli
        this.connections = config.connections || [];
        
        // Stato del livello
        this.isLoaded = false;
        this.isActive = false;
    }
    
    /**
     * Carica il livello
     * @param {World} world - Riferimento al mondo di gioco
     */
    load(world) {
        // Carica le risorse
        this.backgroundImage = Assets.getImage(this.backgroundId);
        this.tilesetImage = Assets.getImage(this.tilesetId);
        
        // Carica la mappa
        this.loadMap();
        
        // Carica le entità
        this.loadEntities(world);
        
        // Imposta lo stato
        this.isLoaded = true;
    }
    
    /**
     * Carica la mappa del livello
     */
    loadMap() {
        // In una versione completa, qui si caricherebbe la mappa da un file
        // Per ora, generiamo una mappa semplice
        this.tileMap = [];
        this.collisionMap = [];
        
        for (let y = 0; y < this.height; y++) {
            this.tileMap[y] = [];
            this.collisionMap[y] = [];
            
            for (let x = 0; x < this.width; x++) {
                // Bordi della mappa sono solidi
                if (x === 0 || y === 0 || x === this.width - 1 || y === this.height - 1) {
                    this.tileMap[y][x] = 1; // Tile solido
                    this.collisionMap[y][x] = 1; // Collisione
                } else {
                    this.tileMap[y][x] = 0; // Tile vuoto
                    this.collisionMap[y][x] = 0; // No collisione
                }
                
                // Aggiungi alcune piattaforme e ostacoli casuali
                if (Math.random() < 0.05 && x > 1 && y > 1 && x < this.width - 2 && y < this.height - 2) {
                    this.tileMap[y][x] = 2; // Tile di piattaforma
                    this.collisionMap[y][x] = 1; // Collisione
                }
            }
        }
        
        // Assicurati che ci sia un percorso praticabile per il giocatore
        this.ensurePathExists();
        
        // Aggiungi le connessioni ad altri livelli
        this.addConnectionTiles();
    }
    
    /**
     * Assicura che esista un percorso praticabile nella mappa
     */
    ensurePathExists() {
        // Implementazione semplificata: crea un percorso centrale
        const centerX = Math.floor(this.width / 2);
        const centerY = Math.floor(this.height / 2);
        
        // Crea un percorso orizzontale
        for (let x = 1; x < this.width - 1; x++) {
            this.tileMap[centerY][x] = 0;
            this.collisionMap[centerY][x] = 0;
        }
        
        // Crea un percorso verticale
        for (let y = 1; y < this.height - 1; y++) {
            this.tileMap[y][centerX] = 0;
            this.collisionMap[y][centerX] = 0;
        }
    }
    
    /**
     * Aggiunge tile speciali per le connessioni ad altri livelli
     */
    addConnectionTiles() {
        for (const connection of this.connections) {
            const x = connection.x;
            const y = connection.y;
            
            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                this.tileMap[y][x] = 3; // Tile di connessione
                this.collisionMap[y][x] = 0; // No collisione
            }
        }
    }
    
    /**
     * Carica le entità del livello
     * @param {World} world - Riferimento al mondo di gioco
     */
    loadEntities(world) {
        // Carica gli NPC
        if (world.levelData && world.levelData.levels) {
            const levelData = world.levelData.levels.find(level => level.id === this.id);
            
            if (levelData) {
                // Carica gli NPC
                if (levelData.npcs) {
                    for (const npcData of levelData.npcs) {
                        const npc = this.createNPC(npcData);
                        if (npc) {
                            this.npcs.push(npc);
                        }
                    }
                }
                
                // Carica gli oggetti
                if (levelData.objects) {
                    for (const objectData of levelData.objects) {
                        const object = this.createObject(objectData);
                        if (object) {
                            this.objects.push(object);
                        }
                    }
                }
                
                // Carica i nemici
                if (levelData.enemies) {
                    for (const enemyData of levelData.enemies) {
                        const enemy = this.createEnemy(enemyData);
                        if (enemy) {
                            this.enemies.push(enemy);
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Crea un NPC
     * @param {Object} npcData - Dati dell'NPC
     * @returns {Character} Istanza dell'NPC
     */
    createNPC(npcData) {
        const sprite = Assets.getImage(npcData.sprite);
        
        return new Character({
            id: npcData.id,
            name: npcData.name,
            type: "npc",
            x: npcData.x * this.tileSize,
            y: npcData.y * this.tileSize,
            width: 32,
            height: 48,
            sprite: sprite,
            dialogueTree: npcData.dialogueId,
            aiType: "static"
        });
    }
    
    /**
     * Crea un oggetto
     * @param {Object} objectData - Dati dell'oggetto
     * @returns {Object} Istanza dell'oggetto
     */
    createObject(objectData) {
        // Implementazione base, da espandere in base ai tipi di oggetti
        return {
            id: objectData.id,
            type: objectData.type,
            x: objectData.x * this.tileSize,
            y: objectData.y * this.tileSize,
            width: 32,
            height: 32,
            contents: objectData.contents || [],
            
            draw: function(ctx, offsetX, offsetY) {
                const screenX = this.x - offsetX;
                const screenY = this.y - offsetY;
                
                // Disegna l'oggetto in base al tipo
                switch (this.type) {
                    case "chest":
                        ctx.fillStyle = "#8B4513";
                        ctx.fillRect(screenX - this.width / 2, screenY - this.height / 2, this.width, this.height);
                        ctx.strokeStyle = "#4A2511";
                        ctx.lineWidth = 2;
                        ctx.strokeRect(screenX - this.width / 2, screenY - this.height / 2, this.width, this.height);
                        break;
                        
                    case "save_point":
                        ctx.fillStyle = "#3498db";
                        ctx.beginPath();
                        ctx.arc(screenX, screenY, this.width / 2, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.strokeStyle = "#2980b9";
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        break;
                        
                    default:
                        ctx.fillStyle = "#95a5a6";
                        ctx.fillRect(screenX - this.width / 2, screenY - this.height / 2, this.width, this.height);
                }
            }
        };
    }
    
    /**
     * Crea un nemico
     * @param {Object} enemyData - Dati del nemico
     * @returns {Character} Istanza del nemico
     */
    createEnemy(enemyData) {
        const sprite = Assets.getImage(enemyData.sprite);
        
        return new Character({
            id: enemyData.id,
            name: enemyData.name,
            type: enemyData.type,
            x: enemyData.x * this.tileSize,
            y: enemyData.y * this.tileSize,
            width: 32,
            height: 48,
            sprite: sprite,
            health: enemyData.health,
            maxHealth: enemyData.health,
            aiType: "aggressive"
        });
    }
    
    /**
     * Attiva il livello
     * @param {World} world - Riferimento al mondo di gioco
     */
    activate(world) {
        if (!this.isLoaded) {
            this.load(world);
        }
        
        // Imposta la posizione iniziale del giocatore
        if (world.player) {
            world.player.x = this.startX * this.tileSize;
            world.player.y = this.startY * this.tileSize;
        }
        
        // Imposta lo sfondo del mondo
        world.backgroundImage = this.backgroundImage;
        
        // Aggiunge gli NPC al mondo
        world.npcs = [...this.npcs];
        
        // Aggiunge gli oggetti al mondo
        world.objects = [...this.objects];
        
        // Aggiunge i nemici al mondo
        world.enemies = [...this.enemies];
        
        // Riproduce la musica del livello
        if (this.musicId) {
            Assets.playAudio(this.musicId, true, 0.5);
        }
        
        this.isActive = true;
    }
    
    /**
     * Disattiva il livello
     * @param {World} world - Riferimento al mondo di gioco
     */
    deactivate(world) {
        // Interrompe la musica del livello
        if (this.musicId) {
            Assets.stopAudio(this.musicId);
        }
        
        this.isActive = false;
    }
    
    /**
     * Verifica se il giocatore è su una connessione ad un altro livello
     * @param {Character} player - Riferimento al giocatore
     * @returns {Object|null} Connessione trovata o null
     */
    checkLevelConnection(player) {
        const tileX = Math.floor(player.x / this.tileSize);
        const tileY = Math.floor(player.y / this.tileSize);
        
        for (const connection of this.connections) {
            if (connection.x === tileX && connection.y === tileY) {
                return connection;
            }
        }
        
        return null;
    }
    
    /**
     * Disegna il livello
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     * @param {number} offsetX - Offset X della camera
     * @param {number} offsetY - Offset Y della camera
     */
    draw(ctx, offsetX, offsetY) {
        // Calcola i limiti della vista
        const startX = Math.floor(offsetX / this.tileSize);
        const startY = Math.floor(offsetY / this.tileSize);
        const endX = startX + Math.ceil(ctx.canvas.width / this.tileSize) + 1;
        const endY = startY + Math.ceil(ctx.canvas.height / this.tileSize) + 1;
        
        // Disegna le tile visibili
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                    const tileType = this.tileMap[y][x];
                    const screenX = x * this.tileSize - offsetX;
                    const screenY = y * this.tileSize - offsetY;
                    
                    // Disegna la tile in base al tipo
                    switch (tileType) {
                        case 0: // Tile vuota
                            // Non disegnare nulla (o disegnare una tile di sfondo)
                            break;
                            
                        case 1: // Tile solida
                            ctx.fillStyle = "#2c3e50";
                            ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                            break;
                            
                        case 2: // Tile di piattaforma
                            ctx.fillStyle = "#27ae60";
                            ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                            break;
                            
                        case 3: // Tile di connessione
                            ctx.fillStyle = "#e74c3c";
                            ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                            break;
                            
                        default:
                            ctx.fillStyle = "#95a5a6";
                            ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                    }
                }
            }
        }
    }
    
    /**
     * Verifica se una posizione è in collisione con la mappa
     * @param {number} x - Coordinata X
     * @param {number} y - Coordinata Y
     * @returns {boolean} True se c'è collisione
     */
    checkCollision(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        
        if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
            return true; // Collisione con i bordi della mappa
        }
        
        return this.collisionMap[tileY][tileX] === 1;
    }
}

/**
 * Gestore dei livelli
 */
class LevelManager {
    constructor(world) {
        this.world = world;
        this.levels = {};
        this.currentLevel = null;
    }
    
    /**
     * Carica tutti i livelli
     */
    loadLevels() {
        if (this.world.levelData && this.world.levelData.levels) {
            for (const levelData of this.world.levelData.levels) {
                this.levels[levelData.id] = new Level(levelData);
            }
        }
    }
    
    /**
     * Cambia il livello corrente
     * @param {string} levelId - ID del livello
     * @param {number} targetX - Coordinata X di destinazione
     * @param {number} targetY - Coordinata Y di destinazione
     */
    changeLevel(levelId, targetX = null, targetY = null) {
        // Disattiva il livello corrente
        if (this.currentLevel) {
            this.currentLevel.deactivate(this.world);
        }
        
        // Attiva il nuovo livello
        const newLevel = this.levels[levelId];
        if (newLevel) {
            // Imposta la posizione di destinazione se specificata
            if (targetX !== null && targetY !== null) {
                newLevel.startX = targetX;
                newLevel.startY = targetY;
            }
            
            newLevel.activate(this.world);
            this.currentLevel = newLevel;
            
            // Aggiorna il riferimento nel mondo
            this.world.currentLevel = newLevel;
            
            console.log(`Livello cambiato: ${newLevel.name}`);
        } else {
            console.error(`Livello non trovato: ${levelId}`);
        }
    }
    
    /**
     * Aggiorna lo stato del gestore dei livelli
     */
    update() {
        if (this.currentLevel && this.world.player) {
            // Verifica se il giocatore è su una connessione ad un altro livello
            const connection = this.currentLevel.checkLevelConnection(this.world.player);
            if (connection) {
                this.changeLevel(connection.levelId, connection.targetX, connection.targetY);
            }
        }
    }
}
