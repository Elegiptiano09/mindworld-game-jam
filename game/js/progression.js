/**
 * Mindworld - Sistema di progressione del personaggio
 * 
 * Questo file contiene le classi e le funzioni per la gestione della progressione del personaggio,
 * inclusi livelli, abilità, statistiche e alberi delle abilità.
 */

class ProgressionSystem {
    constructor(game) {
        // Riferimento al gioco
        this.game = game;
        
        // Livelli di esperienza
        this.experienceLevels = [];
        
        // Abilità sbloccabili
        this.unlockableAbilities = {};
        
        // Alberi delle abilità
        this.skillTrees = {
            fah: {
                name: "Maestria del Fah",
                description: "Padroneggia il potere del fuoco e della passione",
                nodes: {}
            },
            brih: {
                name: "Maestria del Brih",
                description: "Padroneggia il potere del ghiaccio e della calma",
                nodes: {}
            },
            combined: {
                name: "Maestria Combinata",
                description: "Padroneggia l'equilibrio tra Fah e Brih",
                nodes: {}
            },
            physical: {
                name: "Maestria Fisica",
                description: "Migliora le tue capacità fisiche",
                nodes: {}
            }
        };
        
        // Statistiche base del personaggio
        this.baseStats = {
            health: 100,
            energy: 100,
            fahEnergy: 50,
            brihEnergy: 50,
            strength: 10,
            defense: 10,
            speed: 10,
            fahPower: 10,
            brihPower: 10,
            critChance: 5,
            critDamage: 150
        };
        
        // Modificatori delle statistiche
        this.statModifiers = {
            health: 0,
            energy: 0,
            fahEnergy: 0,
            brihEnergy: 0,
            strength: 0,
            defense: 0,
            speed: 0,
            fahPower: 0,
            brihPower: 0,
            critChance: 0,
            critDamage: 0
        };
        
        // Punti abilità disponibili
        this.skillPoints = 0;
        
        // Inizializza il sistema
        this.initialize();
    }
    
    /**
     * Inizializza il sistema di progressione
     */
    initialize() {
        // Inizializza i livelli di esperienza
        this.initExperienceLevels();
        
        // Inizializza le abilità sbloccabili
        this.initUnlockableAbilities();
        
        // Inizializza gli alberi delle abilità
        this.initSkillTrees();
    }
    
    /**
     * Inizializza i livelli di esperienza
     */
    initExperienceLevels() {
        // Formula: exp = baseExp * (level ^ expFactor)
        const baseExp = 100;
        const expFactor = 1.5;
        
        // Livello 1 non richiede esperienza
        this.experienceLevels.push(0);
        
        // Calcola l'esperienza richiesta per ogni livello (fino al livello 50)
        for (let level = 2; level <= 50; level++) {
            const expRequired = Math.floor(baseExp * Math.pow(level, expFactor));
            this.experienceLevels.push(expRequired);
        }
    }
    
    /**
     * Inizializza le abilità sbloccabili
     */
    initUnlockableAbilities() {
        // Abilità Fah
        this.unlockableAbilities.fah = {
            fireball: {
                name: "Palla di Fuoco",
                description: "Lancia una palla di fuoco che infligge danni da fuoco",
                level: 1,
                damage: 20,
                energyCost: 10,
                cooldown: 2,
                unlocked: true
            },
            flameWave: {
                name: "Onda di Fiamme",
                description: "Crea un'onda di fiamme che danneggia tutti i nemici di fronte a te",
                level: 5,
                damage: 30,
                energyCost: 20,
                cooldown: 5,
                unlocked: false
            },
            meteor: {
                name: "Meteora",
                description: "Evoca una meteora che causa danni da fuoco in un'area",
                level: 10,
                damage: 50,
                energyCost: 30,
                cooldown: 10,
                unlocked: false
            },
            fireShield: {
                name: "Scudo di Fuoco",
                description: "Crea uno scudo di fuoco che riflette parte dei danni",
                level: 15,
                damage: 0,
                energyCost: 25,
                cooldown: 15,
                unlocked: false
            }
        };
        
        // Abilità Brih
        this.unlockableAbilities.brih = {
            iceSpike: {
                name: "Spuntone di Ghiaccio",
                description: "Lancia uno spuntone di ghiaccio che infligge danni da ghiaccio",
                level: 1,
                damage: 15,
                energyCost: 8,
                cooldown: 1.5,
                unlocked: true
            },
            frostNova: {
                name: "Nova di Gelo",
                description: "Crea un'esplosione di ghiaccio che danneggia e rallenta i nemici vicini",
                level: 5,
                damage: 25,
                energyCost: 18,
                cooldown: 4,
                unlocked: false
            },
            blizzard: {
                name: "Tormenta",
                description: "Evoca una tormenta di ghiaccio che causa danni continui in un'area",
                level: 10,
                damage: 40,
                energyCost: 28,
                cooldown: 12,
                unlocked: false
            },
            iceArmor: {
                name: "Armatura di Ghiaccio",
                description: "Crea un'armatura di ghiaccio che riduce i danni subiti",
                level: 15,
                damage: 0,
                energyCost: 22,
                cooldown: 18,
                unlocked: false
            }
        };
        
        // Abilità Combinate
        this.unlockableAbilities.combined = {
            elementalBurst: {
                name: "Esplosione Elementale",
                description: "Combina Fah e Brih per creare un'esplosione che infligge danni di entrambi i tipi",
                level: 20,
                damage: 70,
                energyCost: {
                    fah: 20,
                    brih: 20
                },
                cooldown: 15,
                unlocked: false
            },
            elementalHarmony: {
                name: "Armonia Elementale",
                description: "Bilancia i poteri di Fah e Brih per aumentare tutte le statistiche per un breve periodo",
                level: 25,
                damage: 0,
                energyCost: {
                    fah: 25,
                    brih: 25
                },
                cooldown: 30,
                unlocked: false
            }
        };
    }
    
    /**
     * Inizializza gli alberi delle abilità
     */
    initSkillTrees() {
        // Albero Fah
        this.skillTrees.fah.nodes = {
            fahMastery: {
                id: "fahMastery",
                name: "Maestria del Fuoco",
                description: "Aumenta il danno degli attacchi Fah del 10%",
                maxLevel: 5,
                currentLevel: 0,
                cost: 1,
                effect: {
                    stat: "fahPower",
                    value: 1,
                    type: "flat"
                },
                position: { x: 0, y: 0 },
                requirements: []
            },
            fahRegeneration: {
                id: "fahRegeneration",
                name: "Rigenerazione Fah",
                description: "Aumenta la rigenerazione dell'energia Fah del 5% al secondo",
                maxLevel: 3,
                currentLevel: 0,
                cost: 1,
                effect: {
                    stat: "fahRegeneration",
                    value: 0.05,
                    type: "percentage"
                },
                position: { x: -1, y: 1 },
                requirements: ["fahMastery"]
            },
            fahEfficiency: {
                id: "fahEfficiency",
                name: "Efficienza Fah",
                description: "Riduce il costo di energia degli attacchi Fah del 5%",
                maxLevel: 3,
                currentLevel: 0,
                cost: 1,
                effect: {
                    stat: "fahEfficiency",
                    value: 0.05,
                    type: "percentage"
                },
                position: { x: 1, y: 1 },
                requirements: ["fahMastery"]
            },
            fireballMastery: {
                id: "fireballMastery",
                name: "Maestria della Palla di Fuoco",
                description: "Aumenta il danno della Palla di Fuoco del 15%",
                maxLevel: 3,
                currentLevel: 0,
                cost: 2,
                effect: {
                    ability: "fireball",
                    stat: "damage",
                    value: 0.15,
                    type: "percentage"
                },
                position: { x: -2, y: 2 },
                requirements: ["fahRegeneration"]
            },
            flameWaveMastery: {
                id: "flameWaveMastery",
                name: "Maestria dell'Onda di Fiamme",
                description: "Aumenta il danno dell'Onda di Fiamme del 15%",
                maxLevel: 3,
                currentLevel: 0,
                cost: 2,
                effect: {
                    ability: "flameWave",
                    stat: "damage",
                    value: 0.15,
                    type: "percentage"
                },
                position: { x: 0, y: 2 },
                requirements: ["fahEfficiency"]
            },
            meteorMastery: {
                id: "meteorMastery",
                name: "Maestria della Meteora",
                description: "Aumenta il danno della Meteora del 15%",
                maxLevel: 3,
                currentLevel: 0,
                cost: 3,
                effect: {
                    ability: "meteor",
                    stat: "damage",
                    value: 0.15,
                    type: "percentage"
                },
                position: { x: -1, y: 3 },
                requirements: ["fireballMastery", "flameWaveMastery"]
            },
            fireShieldMastery: {
                id: "fireShieldMastery",
                name: "Maestria dello Scudo di Fuoco",
                description: "Aumenta la durata dello Scudo di Fuoco del 20%",
                maxLevel: 3,
                currentLevel: 0,
                cost: 3,
                effect: {
                    ability: "fireShield",
                    stat: "duration",
                    value: 0.2,
                    type: "percentage"
                },
                position: { x: 1, y: 3 },
                requirements: ["flameWaveMastery"]
            },
            fahUltimate: {
                id: "fahUltimate",
                name: "Maestria Suprema del Fah",
                description: "Sblocca l'abilità Inferno, che causa danni massicci a tutti i nemici",
                maxLevel: 1,
                currentLevel: 0,
                cost: 5,
                effect: {
                    ability: "inferno",
                    stat: "unlock",
                    value: true,
                    type: "boolean"
                },
                position: { x: 0, y: 4 },
                requirements: ["meteorMastery", "fireShieldMastery"]
            }
        };
        
        // Albero Brih
        this.skillTrees.brih.nodes = {
            brihMastery: {
                id: "brihMastery",
                name: "Maestria del Ghiaccio",
                description: "Aumenta il danno degli attacchi Brih del 10%",
                maxLevel: 5,
                currentLevel: 0,
                cost: 1,
                effect: {
                    stat: "brihPower",
                    value: 1,
                    type: "flat"
                },
                position: { x: 0, y: 0 },
                requirements: []
            },
            brihRegeneration: {
                id: "brihRegeneration",
                name: "Rigenerazione Brih",
                description: "Aumenta la rigenerazione dell'energia Brih del 5% al secondo",
                maxLevel: 3,
                currentLevel: 0,
                cost: 1,
                effect: {
                    stat: "brihRegeneration",
                    value: 0.05,
                    type: "percentage"
                },
                position: { x: -1, y: 1 },
                requirements: ["brihMastery"]
            },
            brihEfficiency: {
                id: "brihEfficiency",
                name: "Efficienza Brih",
                description: "Riduce il costo di energia degli attacchi Brih del 5%",
                maxLevel: 3,
                currentLevel: 0,
                cost: 1,
                effect: {
                    stat: "brihEfficiency",
                    value: 0.05,
                    type: "percentage"
                },
                position: { x: 1, y: 1 },
                requirements: ["brihMastery"]
            },
            iceSpikeMastery: {
                id: "iceSpikeMastery",
                name: "Maestria dello Spuntone di Ghiaccio",
                description: "Aumenta il danno dello Spuntone di Ghiaccio del 15%",
                maxLevel: 3,
                currentLevel: 0,
                cost: 2,
                effect: {
                    ability: "iceSpike",
                    stat: "damage",
                    value: 0.15,
                    type: "percentage"
                },
                position: { x: -2, y: 2 },
                requirements: ["brihRegeneration"]
            },
            frostNovaMastery: {
                id: "frostNovaMastery",
                name: "Maestria della Nova di Gelo",
                description: "Aumenta il danno della Nova di Gelo del 15%",
                maxLevel: 3,
                currentLevel: 0,
                cost: 2,
                effect: {
                    ability: "frostNova",
                    stat: "damage",
                    value: 0.15,
                    type: "percentage"
                },
                position: { x: 0, y: 2 },
                requirements: ["brihEfficiency"]
            },
            blizzardMastery: {
                id: "blizzardMastery",
                name: "Maestria della Tormenta",
                description: "Aumenta il danno della Tormenta del 15%",
                maxLevel: 3,
                currentLevel: 0,
                cost: 3,
                effect: {
                    ability: "blizzard",
                    stat: "damage",
                    value: 0.15,
                    type: "percentage"
                },
                position: { x: -1, y: 3 },
                requirements: ["iceSpikeMastery", "frostNovaMastery"]
            },
            iceArmorMastery: {
                id: "iceArmorMastery",
                name: "Maestria dell'Armatura di Ghiaccio",
                description: "Aumenta la durata dell'Armatura di Ghiaccio del 20%",
                maxLevel: 3,
                currentLevel: 0,
                cost: 3,
                effect: {
                    ability: "iceArmor",
                    stat: "duration",
                    value: 0.2,
                    type: "percentage"
                },
                position: { x: 1, y: 3 },
                requirements: ["frostNovaMastery"]
            },
            brihUltimate: {
                id: "brihUltimate",
                name: "Maestria Suprema del Brih",
                description: "Sblocca l'abilità Glaciazione, che congela tutti i nemici",
                maxLevel: 1,
                currentLevel: 0,
                cost: 5,
                effect: {
                    ability: "glaciation",
                    stat: "unlock",
                    value: true,
                    type: "boolean"
                },
                position: { x: 0, y: 4 },
                requirements: ["blizzardMastery", "iceArmorMastery"]
            }
        };
        
        // Albero Combinato
        this.skillTrees.combined.nodes = {
            elementalBalance: {
                id: "elementalBalance",
                name: "Equilibrio Elementale",
                description: "Aumenta il danno degli attacchi combinati del 10%",
                maxLevel: 5,
                currentLevel: 0,
                cost: 2,
                effect: {
                    stat: "combinedPower",
                    value: 0.1,
                    type: "percentage"
                },
                position: { x: 0, y: 0 },
                requirements: []
            },
            elementalSynergy: {
                id: "elementalSynergy",
                name: "Sinergia Elementale",
                description: "Riduce il costo di energia degli attacchi combinati del 5%",
                maxLevel: 3,
                currentLevel: 0,
                cost: 2,
                effect: {
                    stat: "combinedEfficiency",
                    value: 0.05,
                    type: "percentage"
                },
                position: { x: -1, y: 1 },
                requirements: ["elementalBalance"]
            },
            elementalFlow: {
                id: "elementalFlow",
                name: "Flusso Elementale",
                description: "Aumenta la rigenerazione di entrambe le energie del 3% al secondo",
                maxLevel: 3,
                currentLevel: 0,
                cost: 2,
                effect: {
                    stat: "energyRegeneration",
                    value: 0.03,
                    type: "percentage"
                },
                position: { x: 1, y: 1 },
                requirements: ["elementalBalance"]
            },
            elementalBurstMastery: {
                id: "elementalBurstMastery",
                name: "Maestria dell'Esplosione Elementale",
                description: "Aumenta il danno dell'Esplosione Elementale del 15%",
                maxLevel: 3,
                currentLevel: 0,
                cost: 3,
                effect: {
                    ability: "elementalBurst",
                    stat: "damage",
                    value: 0.15,
                    type: "percentage"
                },
                position: { x: -1, y: 2 },
                requirements: ["elementalSynergy"]
            },
            elementalHarmonyMastery: {
                id: "elementalHarmonyMastery",
                name: "Maestria dell'Armonia Elementale",
                description: "Aumenta la durata dell'Armonia Elementale del 20%",
                maxLevel: 3,
                currentLevel: 0,
                cost: 3,
                effect: {
                    ability: "elementalHarmony",
                    stat: "duration",
                    value: 0.2,
                    type: "percentage"
                },
                position: { x: 1, y: 2 },
                requirements: ["elementalFlow"]
            },
            combinedUltimate: {
                id: "combinedUltimate",
                name: "Maestria Suprema Combinata",
                description: "Sblocca l'abilità Tempesta Elementale, che causa danni massicci di entrambi i tipi",
                maxLevel: 1,
                currentLevel: 0,
                cost: 5,
                effect: {
                    ability: "elementalStorm",
                    stat: "unlock",
                    value: true,
                    type: "boolean"
                },
                position: { x: 0, y: 3 },
                requirements: ["elementalBurstMastery", "elementalHarmonyMastery"]
            }
        };
        
        // Albero Fisico
        this.skillTrees.physical.nodes = {
            vitality: {
                id: "vitality",
                name: "Vitalità",
                description: "Aumenta la salute massima del 5%",
                maxLevel: 5,
                currentLevel: 0,
                cost: 1,
                effect: {
                    stat: "health",
                    value: 5,
                    type: "flat"
                },
                position: { x: -1, y: 0 },
                requirements: []
            },
            endurance: {
                id: "endurance",
                name: "Resistenza",
                description: "Aumenta l'energia massima del 5%",
                maxLevel: 5,
                currentLevel: 0,
                cost: 1,
                effect: {
                    stat: "energy",
                    value: 5,
                    type: "flat"
                },
                position: { x: 1, y: 0 },
                requirements: []
            },
            strength: {
                id: "strength",
                name: "Forza",
                description: "Aumenta la forza del 5%",
                maxLevel: 5,
                currentLevel: 0,
                cost: 1,
                effect: {
                    stat: "strength",
                    value: 0.5,
                    type: "flat"
                },
                position: { x: -2, y: 1 },
                requirements: ["vitality"]
            },
            defense: {
                id: "defense",
                name: "Difesa",
                description: "Aumenta la difesa del 5%",
                maxLevel: 5,
                currentLevel: 0,
                cost: 1,
                effect: {
                    stat: "defense",
                    value: 0.5,
                    type: "flat"
                },
                position: { x: 0, y: 1 },
                requirements: ["vitality", "endurance"]
            },
            speed: {
                id: "speed",
                name: "Velocità",
                description: "Aumenta la velocità del 5%",
                maxLevel: 5,
                currentLevel: 0,
                cost: 1,
                effect: {
                    stat: "speed",
                    value: 0.5,
                    type: "flat"
                },
                position: { x: 2, y: 1 },
                requirements: ["endurance"]
            },
            criticalStrike: {
                id: "criticalStrike",
                name: "Colpo Critico",
                description: "Aumenta la probabilità di colpo critico del 1%",
                maxLevel: 5,
                currentLevel: 0,
                cost: 2,
                effect: {
                    stat: "critChance",
                    value: 1,
                    type: "flat"
                },
                position: { x: -1, y: 2 },
                requirements: ["strength"]
            },
            criticalDamage: {
                id: "criticalDamage",
                name: "Danno Critico",
                description: "Aumenta il danno critico del 10%",
                maxLevel: 5,
                currentLevel: 0,
                cost: 2,
                effect: {
                    stat: "critDamage",
                    value: 10,
                    type: "flat"
                },
                position: { x: 1, y: 2 },
                requirements: ["speed"]
            },
            physicalUltimate: {
                id: "physicalUltimate",
                name: "Maestria Fisica Suprema",
                description: "Sblocca l'abilità Potenza Interiore, che aumenta tutte le statistiche fisiche",
                maxLevel: 1,
                currentLevel: 0,
                cost: 5,
                effect: {
                    ability: "innerPower",
                    stat: "unlock",
                    value: true,
                    type: "boolean"
                },
                position: { x: 0, y: 3 },
                requirements: ["criticalStrike", "criticalDamage"]
            }
        };
    }
    
    /**
     * Calcola l'esperienza richiesta per salire al livello specificato
     * @param {number} level - Livello di destinazione
     * @returns {number} Esperienza richiesta
     */
    getExperienceForLevel(level) {
        if (level <= 1) return 0;
        if (level > this.experienceLevels.length) return Infinity;
        
        return this.experienceLevels[level - 1];
    }
    
    /**
     * Calcola il livello in base all'esperienza
     * @param {number} experience - Esperienza totale
     * @returns {number} Livello corrispondente
     */
    getLevelFromExperience(experience) {
        let level = 1;
        
        while (level < this.experienceLevels.length && experience >= this.experienceLevels[level]) {
            level++;
        }
        
        return level;
    }
    
    /**
     * Aggiunge esperienza al giocatore
     * @param {number} amount - Quantità di esperienza da aggiungere
     * @returns {Object} Informazioni sul livello (livello attuale, esperienza attuale, esperienza per il prossimo livello)
     */
    addExperience(amount) {
        if (!this.game.player) return null;
        
        const oldLevel = this.getLevelFromExperience(this.game.player.experience);
        const newExperience = this.game.player.experience + amount;
        const newLevel = this.getLevelFromExperience(newExperience);
        
        this.game.player.experience = newExperience;
        
        // Se il giocatore è salito di livello
        if (newLevel > oldLevel) {
            this.levelUp(oldLevel, newLevel);
        }
        
        return {
            level: newLevel,
            experience: newExperience,
            nextLevelExperience: this.getExperienceForLevel(newLevel + 1)
        };
    }
    
    /**
     * Gestisce il salire di livello
     * @param {number} oldLevel - Livello precedente
     * @param {number} newLevel - Nuovo livello
     */
    levelUp(oldLevel, newLevel) {
        // Calcola quanti livelli sono stati guadagnati
        const levelsGained = newLevel - oldLevel;
        
        // Aggiorna il livello del giocatore
        this.game.player.level = newLevel;
        
        // Aggiorna le statistiche base del giocatore
        this.updateBaseStats(newLevel);
        
        // Assegna punti abilità
        this.skillPoints += levelsGained;
        
        // Sblocca nuove abilità in base al livello
        this.unlockAbilitiesByLevel(newLevel);
        
        // Notifica il salire di livello
        console.log(`Salito di livello! Livello ${newLevel}`);
        
        // Aggiungi un messaggio all'interfaccia utente
        if (this.game.ui) {
            this.game.ui.addMessage(`Salito di livello! Livello ${newLevel}`, "success");
        }
    }
    
    /**
     * Aggiorna le statistiche base del giocatore in base al livello
     * @param {number} level - Livello del giocatore
     */
    updateBaseStats(level) {
        // Formula: stat = baseStat + (level - 1) * growthFactor
        const growthFactors = {
            health: 10,
            energy: 5,
            fahEnergy: 2.5,
            brihEnergy: 2.5,
            strength: 1,
            defense: 1,
            speed: 0.5,
            fahPower: 1,
            brihPower: 1,
            critChance: 0.2,
            critDamage: 2
        };
        
        // Aggiorna le statistiche base
        for (const stat in this.baseStats) {
            const baseStat = this.baseStats[stat];
            const growthFactor = growthFactors[stat] || 0;
            
            this.baseStats[stat] = Math.floor(baseStat + (level - 1) * growthFactor);
        }
        
        // Aggiorna le statistiche del giocatore
        this.updatePlayerStats();
    }
    
    /**
     * Aggiorna le statistiche del giocatore in base alle statistiche base e ai modificatori
     */
    updatePlayerStats() {
        if (!this.game.player) return;
        
        // Aggiorna le statistiche del giocatore
        this.game.player.maxHealth = this.baseStats.health + this.statModifiers.health;
        this.game.player.maxEnergy = this.baseStats.energy + this.statModifiers.energy;
        this.game.player.maxFahEnergy = this.baseStats.fahEnergy + this.statModifiers.fahEnergy;
        this.game.player.maxBrihEnergy = this.baseStats.brihEnergy + this.statModifiers.brihEnergy;
        this.game.player.strength = this.baseStats.strength + this.statModifiers.strength;
        this.game.player.defense = this.baseStats.defense + this.statModifiers.defense;
        this.game.player.speed = this.baseStats.speed + this.statModifiers.speed;
        this.game.player.fahPower = this.baseStats.fahPower + this.statModifiers.fahPower;
        this.game.player.brihPower = this.baseStats.brihPower + this.statModifiers.brihPower;
        this.game.player.critChance = this.baseStats.critChance + this.statModifiers.critChance;
        this.game.player.critDamage = this.baseStats.critDamage + this.statModifiers.critDamage;
        
        // Limita la salute e l'energia attuali ai nuovi massimi
        this.game.player.health = Math.min(this.game.player.health, this.game.player.maxHealth);
        this.game.player.energy = Math.min(this.game.player.energy, this.game.player.maxEnergy);
        this.game.player.fahEnergy = Math.min(this.game.player.fahEnergy, this.game.player.maxFahEnergy);
        this.game.player.brihEnergy = Math.min(this.game.player.brihEnergy, this.game.player.maxBrihEnergy);
    }
    
    /**
     * Sblocca abilità in base al livello
     * @param {number} level - Livello del giocatore
     */
    unlockAbilitiesByLevel(level) {
        // Sblocca abilità Fah
        for (const abilityId in this.unlockableAbilities.fah) {
            const ability = this.unlockableAbilities.fah[abilityId];
            
            if (level >= ability.level && !ability.unlocked) {
                ability.unlocked = true;
                
                // Notifica lo sblocco dell'abilità
                console.log(`Abilità sbloccata: ${ability.name}`);
                
                // Aggiungi un messaggio all'interfaccia utente
                if (this.game.ui) {
                    this.game.ui.addMessage(`Abilità sbloccata: ${ability.name}`, "success");
                }
            }
        }
        
        // Sblocca abilità Brih
        for (const abilityId in this.unlockableAbilities.brih) {
            const ability = this.unlockableAbilities.brih[abilityId];
            
            if (level >= ability.level && !ability.unlocked) {
                ability.unlocked = true;
                
                // Notifica lo sblocco dell'abilità
                console.log(`Abilità sbloccata: ${ability.name}`);
                
                // Aggiungi un messaggio all'interfaccia utente
                if (this.game.ui) {
                    this.game.ui.addMessage(`Abilità sbloccata: ${ability.name}`, "success");
                }
            }
        }
        
        // Sblocca abilità Combinate
        for (const abilityId in this.unlockableAbilities.combined) {
            const ability = this.unlockableAbilities.combined[abilityId];
            
            if (level >= ability.level && !ability.unlocked) {
                ability.unlocked = true;
                
                // Notifica lo sblocco dell'abilità
                console.log(`Abilità sbloccata: ${ability.name}`);
                
                // Aggiungi un messaggio all'interfaccia utente
                if (this.game.ui) {
                    this.game.ui.addMessage(`Abilità sbloccata: ${ability.name}`, "success");
                }
            }
        }
    }
    
    /**
     * Verifica se un nodo dell'albero delle abilità può essere sbloccato
     * @param {string} treeId - ID dell'albero delle abilità
     * @param {string} nodeId - ID del nodo
     * @returns {boolean} True se il nodo può essere sbloccato
     */
    canUnlockNode(treeId, nodeId) {
        // Verifica se l'albero delle abilità esiste
        if (!this.skillTrees[treeId]) return false;
        
        // Verifica se il nodo esiste
        if (!this.skillTrees[treeId].nodes[nodeId]) return false;
        
        const node = this.skillTrees[treeId].nodes[nodeId];
        
        // Verifica se il nodo è già al livello massimo
        if (node.currentLevel >= node.maxLevel) return false;
        
        // Verifica se ci sono abbastanza punti abilità
        if (this.skillPoints < node.cost) return false;
        
        // Verifica se i requisiti sono soddisfatti
        for (const reqNodeId of node.requirements) {
            const reqNode = this.skillTrees[treeId].nodes[reqNodeId];
            
            if (!reqNode || reqNode.currentLevel === 0) return false;
        }
        
        return true;
    }
    
    /**
     * Sblocca un nodo dell'albero delle abilità
     * @param {string} treeId - ID dell'albero delle abilità
     * @param {string} nodeId - ID del nodo
     * @returns {boolean} True se il nodo è stato sbloccato con successo
     */
    unlockNode(treeId, nodeId) {
        // Verifica se il nodo può essere sbloccato
        if (!this.canUnlockNode(treeId, nodeId)) return false;
        
        const node = this.skillTrees[treeId].nodes[nodeId];
        
        // Incrementa il livello del nodo
        node.currentLevel++;
        
        // Sottrai i punti abilità
        this.skillPoints -= node.cost;
        
        // Applica l'effetto del nodo
        this.applyNodeEffect(treeId, nodeId);
        
        // Notifica lo sblocco del nodo
        console.log(`Nodo sbloccato: ${node.name} (Livello ${node.currentLevel})`);
        
        // Aggiungi un messaggio all'interfaccia utente
        if (this.game.ui) {
            this.game.ui.addMessage(`Abilità migliorata: ${node.name} (Livello ${node.currentLevel})`, "success");
        }
        
        return true;
    }
    
    /**
     * Applica l'effetto di un nodo dell'albero delle abilità
     * @param {string} treeId - ID dell'albero delle abilità
     * @param {string} nodeId - ID del nodo
     */
    applyNodeEffect(treeId, nodeId) {
        const node = this.skillTrees[treeId].nodes[nodeId];
        const effect = node.effect;
        
        if (!effect) return;
        
        // Applica l'effetto in base al tipo
        if (effect.stat) {
            // Effetto su una statistica
            if (effect.type === "flat") {
                // Effetto additivo
                this.statModifiers[effect.stat] += effect.value;
            } else if (effect.type === "percentage") {
                // Effetto percentuale
                this.statModifiers[effect.stat] += this.baseStats[effect.stat] * effect.value;
            }
        } else if (effect.ability) {
            // Effetto su un'abilità
            if (effect.stat === "unlock") {
                // Sblocca una nuova abilità
                if (effect.value === true) {
                    // Implementazione specifica per sbloccare nuove abilità
                }
            } else {
                // Modifica una statistica di un'abilità
                const abilityType = this.getAbilityType(effect.ability);
                
                if (abilityType && this.unlockableAbilities[abilityType][effect.ability]) {
                    const ability = this.unlockableAbilities[abilityType][effect.ability];
                    
                    if (effect.type === "flat") {
                        // Effetto additivo
                        ability[effect.stat] += effect.value;
                    } else if (effect.type === "percentage") {
                        // Effetto percentuale
                        ability[effect.stat] *= (1 + effect.value);
                    }
                }
            }
        }
        
        // Aggiorna le statistiche del giocatore
        this.updatePlayerStats();
    }
    
    /**
     * Ottiene il tipo di un'abilità
     * @param {string} abilityId - ID dell'abilità
     * @returns {string|null} Tipo dell'abilità (fah, brih, combined) o null se non trovata
     */
    getAbilityType(abilityId) {
        if (this.unlockableAbilities.fah[abilityId]) return "fah";
        if (this.unlockableAbilities.brih[abilityId]) return "brih";
        if (this.unlockableAbilities.combined[abilityId]) return "combined";
        
        return null;
    }
    
    /**
     * Ottiene le statistiche del giocatore
     * @returns {Object} Statistiche del giocatore
     */
    getPlayerStats() {
        if (!this.game.player) return null;
        
        return {
            level: this.game.player.level,
            experience: this.game.player.experience,
            nextLevelExperience: this.getExperienceForLevel(this.game.player.level + 1),
            health: this.game.player.health,
            maxHealth: this.game.player.maxHealth,
            energy: this.game.player.energy,
            maxEnergy: this.game.player.maxEnergy,
            fahEnergy: this.game.player.fahEnergy,
            maxFahEnergy: this.game.player.maxFahEnergy,
            brihEnergy: this.game.player.brihEnergy,
            maxBrihEnergy: this.game.player.maxBrihEnergy,
            strength: this.game.player.strength,
            defense: this.game.player.defense,
            speed: this.game.player.speed,
            fahPower: this.game.player.fahPower,
            brihPower: this.game.player.brihPower,
            critChance: this.game.player.critChance,
            critDamage: this.game.player.critDamage,
            skillPoints: this.skillPoints
        };
    }
    
    /**
     * Ottiene le abilità sbloccate
     * @returns {Object} Abilità sbloccate
     */
    getUnlockedAbilities() {
        const unlockedAbilities = {
            fah: [],
            brih: [],
            combined: []
        };
        
        // Abilità Fah
        for (const abilityId in this.unlockableAbilities.fah) {
            const ability = this.unlockableAbilities.fah[abilityId];
            
            if (ability.unlocked) {
                unlockedAbilities.fah.push({
                    id: abilityId,
                    name: ability.name,
                    description: ability.description,
                    damage: ability.damage,
                    energyCost: ability.energyCost,
                    cooldown: ability.cooldown
                });
            }
        }
        
        // Abilità Brih
        for (const abilityId in this.unlockableAbilities.brih) {
            const ability = this.unlockableAbilities.brih[abilityId];
            
            if (ability.unlocked) {
                unlockedAbilities.brih.push({
                    id: abilityId,
                    name: ability.name,
                    description: ability.description,
                    damage: ability.damage,
                    energyCost: ability.energyCost,
                    cooldown: ability.cooldown
                });
            }
        }
        
        // Abilità Combinate
        for (const abilityId in this.unlockableAbilities.combined) {
            const ability = this.unlockableAbilities.combined[abilityId];
            
            if (ability.unlocked) {
                unlockedAbilities.combined.push({
                    id: abilityId,
                    name: ability.name,
                    description: ability.description,
                    damage: ability.damage,
                    energyCost: ability.energyCost,
                    cooldown: ability.cooldown
                });
            }
        }
        
        return unlockedAbilities;
    }
    
    /**
     * Ottiene gli alberi delle abilità
     * @returns {Object} Alberi delle abilità
     */
    getSkillTrees() {
        return this.skillTrees;
    }
    
    /**
     * Disegna l'interfaccia dell'albero delle abilità
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     * @param {string} treeId - ID dell'albero delle abilità da disegnare
     * @param {number} x - Coordinata X dell'albero
     * @param {number} y - Coordinata Y dell'albero
     * @param {number} width - Larghezza dell'albero
     * @param {number} height - Altezza dell'albero
     */
    drawSkillTree(ctx, treeId, x, y, width, height) {
        // Verifica se l'albero delle abilità esiste
        if (!this.skillTrees[treeId]) return;
        
        const tree = this.skillTrees[treeId];
        const nodes = tree.nodes;
        
        // Disegna lo sfondo dell'albero
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(x, y, width, height);
        
        // Disegna il titolo dell'albero
        ctx.fillStyle = "#f39c12";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(tree.name, x + width / 2, y + 30);
        
        // Disegna la descrizione dell'albero
        ctx.fillStyle = "#bdc3c7";
        ctx.font = "14px Arial";
        ctx.fillText(tree.description, x + width / 2, y + 50);
        
        // Calcola le dimensioni della griglia
        const gridWidth = width - 100;
        const gridHeight = height - 100;
        const gridX = x + 50;
        const gridY = y + 70;
        
        // Disegna le connessioni tra i nodi
        ctx.strokeStyle = "#7f8c8d";
        ctx.lineWidth = 2;
        
        for (const nodeId in nodes) {
            const node = nodes[nodeId];
            
            // Calcola la posizione del nodo
            const nodeX = gridX + (node.position.x + 2) * (gridWidth / 4);
            const nodeY = gridY + node.position.y * (gridHeight / 4);
            
            // Disegna le connessioni ai nodi richiesti
            for (const reqNodeId of node.requirements) {
                const reqNode = nodes[reqNodeId];
                
                if (reqNode) {
                    const reqNodeX = gridX + (reqNode.position.x + 2) * (gridWidth / 4);
                    const reqNodeY = gridY + reqNode.position.y * (gridHeight / 4);
                    
                    ctx.beginPath();
                    ctx.moveTo(reqNodeX, reqNodeY);
                    ctx.lineTo(nodeX, nodeY);
                    ctx.stroke();
                }
            }
        }
        
        // Disegna i nodi
        for (const nodeId in nodes) {
            const node = nodes[nodeId];
            
            // Calcola la posizione del nodo
            const nodeX = gridX + (node.position.x + 2) * (gridWidth / 4);
            const nodeY = gridY + node.position.y * (gridHeight / 4);
            
            // Disegna il nodo
            ctx.beginPath();
            ctx.arc(nodeX, nodeY, 20, 0, Math.PI * 2);
            
            // Colora il nodo in base al livello
            if (node.currentLevel === 0) {
                // Nodo non sbloccato
                ctx.fillStyle = "#34495e";
            } else if (node.currentLevel < node.maxLevel) {
                // Nodo parzialmente sbloccato
                ctx.fillStyle = "#2980b9";
            } else {
                // Nodo completamente sbloccato
                ctx.fillStyle = "#27ae60";
            }
            
            ctx.fill();
            
            // Disegna il bordo del nodo
            ctx.strokeStyle = "#2c3e50";
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Disegna il livello del nodo
            ctx.fillStyle = "#ecf0f1";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.fillText(`${node.currentLevel}/${node.maxLevel}`, nodeX, nodeY);
            
            // Disegna il nome del nodo
            ctx.fillStyle = "#ecf0f1";
            ctx.font = "10px Arial";
            ctx.fillText(node.name, nodeX, nodeY - 30);
        }
    }
    
    /**
     * Aggiorna il sistema di progressione
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    update(deltaTime) {
        // Implementazione base, da espandere con funzionalità aggiuntive
    }
}
