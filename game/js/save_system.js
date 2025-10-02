/**
 * Mindworld - Sistema di Salvataggio
 * 
 * Questo file gestisce il salvataggio e il caricamento dei dati di gioco.
 */

class SaveSystem {
    /**
     * Crea un nuovo sistema di salvataggio
     * @param {Object} options - Opzioni per il sistema di salvataggio
     * @param {World} options.world - Riferimento al mondo di gioco
     * @param {string} options.gameId - ID univoco del gioco
     */
    constructor(options = {}) {
        // Riferimenti
        this.world = options.world || null;
        
        // ID del gioco
        this.gameId = options.gameId || "mindworld";
        
        // Prefisso per le chiavi di salvataggio
        this.saveKeyPrefix = `${this.gameId}_save_`;
        
        // Slot di salvataggio
        this.maxSlots = 3;
        
        // Dati di salvataggio correnti
        this.currentSaveData = null;
        this.currentSlot = -1;
    }
    
    /**
     * Salva il gioco nello slot specificato
     * @param {number} slot - Slot di salvataggio (1-3)
     * @returns {boolean} - True se il salvataggio è riuscito
     */
    saveGame(slot) {
        // Controlla se lo slot è valido
        if (slot < 1 || slot > this.maxSlots) {
            console.error(`Slot di salvataggio non valido: ${slot}`);
            return false;
        }
        
        // Controlla se il mondo esiste
        if (!this.world) {
            console.error("Mondo non disponibile per il salvataggio");
            return false;
        }
        
        try {
            // Crea i dati di salvataggio
            const saveData = this.createSaveData();
            
            // Aggiungi metadati
            saveData.metadata = {
                slot: slot,
                timestamp: Date.now(),
                version: "1.0.0",
                gameId: this.gameId
            };
            
            // Converti in JSON
            const saveJson = JSON.stringify(saveData);
            
            // Salva nel localStorage
            localStorage.setItem(this.getSaveKey(slot), saveJson);
            
            // Aggiorna i dati correnti
            this.currentSaveData = saveData;
            this.currentSlot = slot;
            
            console.log(`Gioco salvato nello slot ${slot}`);
            return true;
        } catch (error) {
            console.error("Errore durante il salvataggio:", error);
            return false;
        }
    }
    
    /**
     * Carica il gioco dallo slot specificato
     * @param {number} slot - Slot di salvataggio (1-3)
     * @returns {boolean} - True se il caricamento è riuscito
     */
    loadGame(slot) {
        // Controlla se lo slot è valido
        if (slot < 1 || slot > this.maxSlots) {
            console.error(`Slot di salvataggio non valido: ${slot}`);
            return false;
        }
        
        // Controlla se il mondo esiste
        if (!this.world) {
            console.error("Mondo non disponibile per il caricamento");
            return false;
        }
        
        try {
            // Carica i dati dal localStorage
            const saveJson = localStorage.getItem(this.getSaveKey(slot));
            
            // Controlla se i dati esistono
            if (!saveJson) {
                console.error(`Nessun salvataggio trovato nello slot ${slot}`);
                return false;
            }
            
            // Converti da JSON
            const saveData = JSON.parse(saveJson);
            
            // Controlla la versione
            if (saveData.metadata.version !== "1.0.0") {
                console.warn(`Versione del salvataggio diversa: ${saveData.metadata.version}`);
            }
            
            // Applica i dati al mondo
            this.applySaveData(saveData);
            
            // Aggiorna i dati correnti
            this.currentSaveData = saveData;
            this.currentSlot = slot;
            
            console.log(`Gioco caricato dallo slot ${slot}`);
            return true;
        } catch (error) {
            console.error("Errore durante il caricamento:", error);
            return false;
        }
    }
    
    /**
     * Elimina il salvataggio dallo slot specificato
     * @param {number} slot - Slot di salvataggio (1-3)
     * @returns {boolean} - True se l'eliminazione è riuscita
     */
    deleteSave(slot) {
        // Controlla se lo slot è valido
        if (slot < 1 || slot > this.maxSlots) {
            console.error(`Slot di salvataggio non valido: ${slot}`);
            return false;
        }
        
        try {
            // Elimina i dati dal localStorage
            localStorage.removeItem(this.getSaveKey(slot));
            
            // Se era lo slot corrente, resetta i dati correnti
            if (slot === this.currentSlot) {
                this.currentSaveData = null;
                this.currentSlot = -1;
            }
            
            console.log(`Salvataggio eliminato dallo slot ${slot}`);
            return true;
        } catch (error) {
            console.error("Errore durante l'eliminazione:", error);
            return false;
        }
    }
    
    /**
     * Ottiene le informazioni sui salvataggi disponibili
     * @returns {Array} - Array di oggetti con le informazioni sui salvataggi
     */
    getSaveInfo() {
        const saveInfo = [];
        
        // Controlla ogni slot
        for (let slot = 1; slot <= this.maxSlots; slot++) {
            try {
                // Carica i dati dal localStorage
                const saveJson = localStorage.getItem(this.getSaveKey(slot));
                
                // Se i dati esistono, estrai le informazioni
                if (saveJson) {
                    const saveData = JSON.parse(saveJson);
                    
                    saveInfo.push({
                        slot: slot,
                        timestamp: saveData.metadata.timestamp,
                        date: new Date(saveData.metadata.timestamp).toLocaleString(),
                        level: saveData.player.level,
                        location: saveData.world.currentLevel,
                        playTime: saveData.player.playTime
                    });
                } else {
                    // Slot vuoto
                    saveInfo.push({
                        slot: slot,
                        empty: true
                    });
                }
            } catch (error) {
                // Errore nel caricamento delle informazioni
                console.error(`Errore nel caricamento delle informazioni per lo slot ${slot}:`, error);
                
                saveInfo.push({
                    slot: slot,
                    error: true
                });
            }
        }
        
        return saveInfo;
    }
    
    /**
     * Crea un salvataggio automatico
     * @returns {boolean} - True se il salvataggio è riuscito
     */
    createAutoSave() {
        // Usa lo slot 0 per il salvataggio automatico
        const autoSaveSlot = 0;
        
        try {
            // Crea i dati di salvataggio
            const saveData = this.createSaveData();
            
            // Aggiungi metadati
            saveData.metadata = {
                slot: autoSaveSlot,
                timestamp: Date.now(),
                version: "1.0.0",
                gameId: this.gameId,
                isAutoSave: true
            };
            
            // Converti in JSON
            const saveJson = JSON.stringify(saveData);
            
            // Salva nel localStorage
            localStorage.setItem(this.getSaveKey(autoSaveSlot), saveJson);
            
            console.log("Salvataggio automatico creato");
            return true;
        } catch (error) {
            console.error("Errore durante il salvataggio automatico:", error);
            return false;
        }
    }
    
    /**
     * Carica il salvataggio automatico
     * @returns {boolean} - True se il caricamento è riuscito
     */
    loadAutoSave() {
        // Usa lo slot 0 per il salvataggio automatico
        const autoSaveSlot = 0;
        
        try {
            // Carica i dati dal localStorage
            const saveJson = localStorage.getItem(this.getSaveKey(autoSaveSlot));
            
            // Controlla se i dati esistono
            if (!saveJson) {
                console.error("Nessun salvataggio automatico trovato");
                return false;
            }
            
            // Converti da JSON
            const saveData = JSON.parse(saveJson);
            
            // Controlla se è un salvataggio automatico
            if (!saveData.metadata.isAutoSave) {
                console.error("Il salvataggio non è un salvataggio automatico");
                return false;
            }
            
            // Applica i dati al mondo
            this.applySaveData(saveData);
            
            // Aggiorna i dati correnti
            this.currentSaveData = saveData;
            this.currentSlot = autoSaveSlot;
            
            console.log("Salvataggio automatico caricato");
            return true;
        } catch (error) {
            console.error("Errore durante il caricamento del salvataggio automatico:", error);
            return false;
        }
    }
    
    /**
     * Esporta il salvataggio corrente come file
     * @returns {string} - URL del file di salvataggio
     */
    exportSave() {
        try {
            // Controlla se c'è un salvataggio corrente
            if (!this.currentSaveData) {
                console.error("Nessun salvataggio corrente da esportare");
                return null;
            }
            
            // Converti in JSON
            const saveJson = JSON.stringify(this.currentSaveData);
            
            // Crea un blob
            const blob = new Blob([saveJson], { type: "application/json" });
            
            // Crea un URL per il blob
            const url = URL.createObjectURL(blob);
            
            // Crea un elemento di download
            const a = document.createElement("a");
            a.href = url;
            a.download = `${this.gameId}_save_${this.currentSlot}.json`;
            
            // Aggiungi l'elemento al documento
            document.body.appendChild(a);
            
            // Simula un click
            a.click();
            
            // Rimuovi l'elemento
            document.body.removeChild(a);
            
            // Rilascia l'URL
            URL.revokeObjectURL(url);
            
            console.log("Salvataggio esportato");
            return url;
        } catch (error) {
            console.error("Errore durante l'esportazione:", error);
            return null;
        }
    }
    
    /**
     * Importa un salvataggio da un file
     * @param {File} file - File di salvataggio
     * @param {number} slot - Slot di salvataggio (1-3)
     * @returns {Promise<boolean>} - Promise che si risolve in true se l'importazione è riuscita
     */
    importSave(file, slot) {
        return new Promise((resolve, reject) => {
            // Controlla se lo slot è valido
            if (slot < 1 || slot > this.maxSlots) {
                console.error(`Slot di salvataggio non valido: ${slot}`);
                resolve(false);
                return;
            }
            
            // Controlla se il file esiste
            if (!file) {
                console.error("Nessun file fornito");
                resolve(false);
                return;
            }
            
            // Crea un lettore di file
            const reader = new FileReader();
            
            // Gestisci il caricamento
            reader.onload = (event) => {
                try {
                    // Converti da JSON
                    const saveData = JSON.parse(event.target.result);
                    
                    // Controlla se è un salvataggio valido
                    if (!saveData.metadata || saveData.metadata.gameId !== this.gameId) {
                        console.error("File di salvataggio non valido");
                        resolve(false);
                        return;
                    }
                    
                    // Aggiorna lo slot
                    saveData.metadata.slot = slot;
                    
                    // Converti in JSON
                    const saveJson = JSON.stringify(saveData);
                    
                    // Salva nel localStorage
                    localStorage.setItem(this.getSaveKey(slot), saveJson);
                    
                    console.log(`Salvataggio importato nello slot ${slot}`);
                    resolve(true);
                } catch (error) {
                    console.error("Errore durante l'importazione:", error);
                    resolve(false);
                }
            };
            
            // Gestisci gli errori
            reader.onerror = (error) => {
                console.error("Errore durante la lettura del file:", error);
                resolve(false);
            };
            
            // Leggi il file come testo
            reader.readAsText(file);
        });
    }
    
    /**
     * Crea i dati di salvataggio dal mondo corrente
     * @returns {Object} - Dati di salvataggio
     */
    createSaveData() {
        // Controlla se il mondo esiste
        if (!this.world) {
            console.error("Mondo non disponibile per il salvataggio");
            return {};
        }
        
        // Dati del giocatore
        const playerData = {
            name: this.world.player.name,
            x: this.world.player.x,
            y: this.world.player.y,
            health: this.world.player.health,
            maxHealth: this.world.player.maxHealth,
            fahEnergy: this.world.player.fahEnergy,
            brihEnergy: this.world.player.brihEnergy,
            maxFahEnergy: this.world.player.maxFahEnergy,
            maxBrihEnergy: this.world.player.maxBrihEnergy,
            level: this.world.player.level || 1,
            experience: this.world.player.experience || 0,
            playTime: this.world.player.playTime || 0,
            inventory: this.world.player.inventory || [],
            equipment: this.world.player.equipment || {},
            abilities: this.world.player.abilities || []
        };
        
        // Dati del mondo
        const worldData = {
            currentLevel: this.world.currentLevel,
            gameState: this.world.gameState,
            npcs: this.world.npcs.map(npc => ({
                name: npc.name,
                x: npc.x,
                y: npc.y,
                health: npc.health,
                maxHealth: npc.maxHealth,
                currentDialogueIndex: npc.currentDialogueIndex || 0
            })),
            enemies: this.world.enemies.map(enemy => ({
                name: enemy.name,
                x: enemy.x,
                y: enemy.y,
                health: enemy.health,
                maxHealth: enemy.maxHealth,
                type: enemy.type
            })),
            items: this.world.items.map(item => ({
                name: item.name,
                x: item.x,
                y: item.y,
                type: item.type,
                properties: item.properties
            }))
        };
        
        // Dati delle missioni
        const questData = {
            activeQuests: this.world.quests ? this.world.quests.activeQuests.map(quest => ({
                id: quest.id,
                title: quest.title,
                description: quest.description,
                objectives: quest.objectives.map(obj => ({
                    id: obj.id,
                    description: obj.description,
                    completed: obj.completed,
                    progress: obj.progress,
                    target: obj.target
                })),
                completed: quest.completed,
                rewards: quest.rewards
            })) : [],
            completedQuests: this.world.quests ? this.world.quests.completedQuests.map(quest => quest.id) : []
        };
        
        // Dati di progressione
        const progressionData = {
            unlockedAbilities: this.world.progression ? this.world.progression.unlockedAbilities : [],
            skillPoints: this.world.progression ? this.world.progression.skillPoints : 0,
            skillTrees: this.world.progression ? this.world.progression.skillTrees : {}
        };
        
        // Dati di gioco
        const gameData = {
            flags: this.world.flags || {},
            variables: this.world.variables || {},
            achievements: this.world.achievements || {},
            statistics: this.world.statistics || {}
        };
        
        // Combina tutti i dati
        return {
            player: playerData,
            world: worldData,
            quests: questData,
            progression: progressionData,
            game: gameData
        };
    }
    
    /**
     * Applica i dati di salvataggio al mondo
     * @param {Object} saveData - Dati di salvataggio
     */
    applySaveData(saveData) {
        // Controlla se il mondo esiste
        if (!this.world) {
            console.error("Mondo non disponibile per il caricamento");
            return;
        }
        
        // Carica il livello
        this.world.loadLevel(saveData.world.currentLevel);
        
        // Imposta lo stato del gioco
        this.world.gameState = saveData.world.gameState;
        
        // Carica i dati del giocatore
        if (this.world.player) {
            this.world.player.x = saveData.player.x;
            this.world.player.y = saveData.player.y;
            this.world.player.health = saveData.player.health;
            this.world.player.maxHealth = saveData.player.maxHealth;
            this.world.player.fahEnergy = saveData.player.fahEnergy;
            this.world.player.brihEnergy = saveData.player.brihEnergy;
            this.world.player.maxFahEnergy = saveData.player.maxFahEnergy;
            this.world.player.maxBrihEnergy = saveData.player.maxBrihEnergy;
            this.world.player.level = saveData.player.level || 1;
            this.world.player.experience = saveData.player.experience || 0;
            this.world.player.playTime = saveData.player.playTime || 0;
            this.world.player.inventory = saveData.player.inventory || [];
            this.world.player.equipment = saveData.player.equipment || {};
            this.world.player.abilities = saveData.player.abilities || [];
        }
        
        // Carica i dati degli NPC
        this.world.npcs = [];
        for (const npcData of saveData.world.npcs) {
            const npc = new Character({
                name: npcData.name,
                x: npcData.x,
                y: npcData.y,
                type: "npc",
                health: npcData.health,
                maxHealth: npcData.maxHealth
            });
            
            npc.currentDialogueIndex = npcData.currentDialogueIndex || 0;
            
            this.world.npcs.push(npc);
        }
        
        // Carica i dati dei nemici
        this.world.enemies = [];
        for (const enemyData of saveData.world.enemies) {
            const enemy = new Character({
                name: enemyData.name,
                x: enemyData.x,
                y: enemyData.y,
                type: enemyData.type || "enemy",
                health: enemyData.health,
                maxHealth: enemyData.maxHealth
            });
            
            this.world.enemies.push(enemy);
        }
        
        // Carica i dati degli oggetti
        this.world.items = [];
        for (const itemData of saveData.world.items) {
            const item = {
                name: itemData.name,
                x: itemData.x,
                y: itemData.y,
                type: itemData.type,
                properties: itemData.properties
            };
            
            this.world.items.push(item);
        }
        
        // Carica i dati delle missioni
        if (this.world.quests) {
            this.world.quests.activeQuests = [];
            for (const questData of saveData.quests.activeQuests) {
                const quest = {
                    id: questData.id,
                    title: questData.title,
                    description: questData.description,
                    objectives: questData.objectives.map(obj => ({
                        id: obj.id,
                        description: obj.description,
                        completed: obj.completed,
                        progress: obj.progress,
                        target: obj.target
                    })),
                    completed: questData.completed,
                    rewards: questData.rewards
                };
                
                this.world.quests.activeQuests.push(quest);
            }
            
            this.world.quests.completedQuests = saveData.quests.completedQuests || [];
        }
        
        // Carica i dati di progressione
        if (this.world.progression) {
            this.world.progression.unlockedAbilities = saveData.progression.unlockedAbilities || [];
            this.world.progression.skillPoints = saveData.progression.skillPoints || 0;
            this.world.progression.skillTrees = saveData.progression.skillTrees || {};
        }
        
        // Carica i dati di gioco
        this.world.flags = saveData.game.flags || {};
        this.world.variables = saveData.game.variables || {};
        this.world.achievements = saveData.game.achievements || {};
        this.world.statistics = saveData.game.statistics || {};
    }
    
    /**
     * Ottiene la chiave di salvataggio per lo slot specificato
     * @param {number} slot - Slot di salvataggio
     * @returns {string} - Chiave di salvataggio
     */
    getSaveKey(slot) {
        return `${this.saveKeyPrefix}${slot}`;
    }
}

// Esporta la classe
window.SaveSystem = SaveSystem;
