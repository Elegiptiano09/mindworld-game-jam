/**
 * Mindworld - Classe del giocatore (Aurora)
 * 
 * Questo file contiene la classe del personaggio giocabile, che estende la classe Character.
 */

class Player extends Character {
    constructor(config) {
        super({
            ...config,
            type: "player",
            name: config.name || "Aurora",
            width: 32,
            height: 48,
            speed: 4
        });
        
        // Proprietà specifiche del giocatore
        this.experience = config.experience || 0;
        this.level = config.level || 1;
        this.experienceToNextLevel = 100 * this.level;
        this.skillPoints = config.skillPoints || 0;
        
        // Energia elementale
        this.fahEnergy = config.fahEnergy || 100;
        this.brihEnergy = config.brihEnergy || 100;
        this.maxFahEnergy = config.maxFahEnergy || 100;
        this.maxBrihEnergy = config.maxBrihEnergy || 100;
        this.energyRegenRate = config.energyRegenRate || 10; // Per secondo
        
        // Attacchi
        this.attacks = {
            fah: ["fireDart"],
            brih: ["waterLance"],
            combined: []
        };
        this.cooldowns = {};
        
        // Inventario
        this.inventory = config.inventory || [];
        this.equippedItems = config.equippedItems || {
            bracelet: null,
            module1: null,
            module2: null,
            module3: null,
            amulet: null
        };
        
        // Missioni
        this.activeQuests = [];
        this.completedQuests = [];
        
        // Reputazione
        this.reputation = {
            fah: 0,
            brih: 0,
            council: 0,
            merchants: 0
        };
        
        // Controlli
        this.canJump = true;
        this.isJumping = false;
        this.jumpVelocity = 0;
        this.gravity = 0.5;
        
        // Camera
        this.cameraOffsetX = 0;
        this.cameraOffsetY = 0;
    }
    
    /**
     * Aggiorna lo stato del giocatore
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     * @param {World} world - Riferimento al mondo di gioco
     * @param {InputManager} input - Riferimento al gestore dell'input
     */
    update(deltaTime, world, input) {
        // Aggiorna gli effetti di stato
        super.updateStatusEffects(deltaTime);
        
        // Gestisci l'input
        if (input) {
            this.handleInput(deltaTime, input, world);
        }
        
        // Aggiorna la posizione
        if (this.isMoving) {
            const newX = this.x + this.velocityX * this.speed;
            const newY = this.y + this.velocityY * this.speed;
            
            // Verifica collisioni con il mondo
            if (!world.checkCollision(newX, this.y, this.collisionRadius)) {
                this.x = newX;
            }
            
            if (!world.checkCollision(this.x, newY, this.collisionRadius)) {
                this.y = newY;
            }
            
            // Aggiorna la collision box
            this.updateCollisionBox();
        }
        
        // Gestisci il salto
        if (this.isJumping) {
            this.y += this.jumpVelocity;
            this.jumpVelocity += this.gravity;
            
            // Verifica collisioni con il suolo
            if (world.checkCollision(this.x, this.y + this.height / 2, 1)) {
                this.isJumping = false;
                this.canJump = true;
                this.jumpVelocity = 0;
                
                // Allinea il giocatore al suolo
                this.y = Math.floor(this.y / world.tileSize) * world.tileSize;
            }
            
            // Aggiorna la collision box
            this.updateCollisionBox();
        }
        
        // Rigenera energia
        this.fahEnergy = Math.min(this.maxFahEnergy, this.fahEnergy + this.energyRegenRate * deltaTime);
        this.brihEnergy = Math.min(this.maxBrihEnergy, this.brihEnergy + this.energyRegenRate * deltaTime);
        
        // Aggiorna i cooldown
        for (const attack in this.cooldowns) {
            if (this.cooldowns[attack] > 0) {
                this.cooldowns[attack] -= deltaTime;
                if (this.cooldowns[attack] < 0) {
                    this.cooldowns[attack] = 0;
                }
            }
        }
        
        // Aggiorna l'animazione
        this.updateAnimation(deltaTime);
        
        // Aggiorna la camera
        this.updateCamera(world);
    }
    
    /**
     * Gestisce l'input del giocatore
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     * @param {InputManager} input - Riferimento al gestore dell'input
     * @param {World} world - Riferimento al mondo di gioco
     */
    handleInput(deltaTime, input, world) {
        // Movimento
        const movement = input.getMovementVector();
        this.move(movement.x, movement.y);
        
        // Salto
        if (input.isActionActive("jump") && this.canJump && !this.isJumping) {
            this.jump();
        }
        
        // Interazione
        if (input.isActionActive("interact")) {
            this.interact(world);
        }
        
        // Attacchi Fah
        if (input.isActionActive("fahAttack1")) {
            this.executeAttack("fireDart", world);
        } else if (input.isActionActive("fahAttack2")) {
            this.executeAttack("heatWave", world);
        } else if (input.isActionActive("fahAttack3")) {
            this.executeAttack("burningShield", world);
        } else if (input.isActionActive("fahAttack4")) {
            this.executeAttack("crimsonExplosion", world);
        }
        
        // Attacchi Brih
        if (input.isActionActive("brihAttack1")) {
            this.executeAttack("waterLance", world);
        } else if (input.isActionActive("brihAttack2")) {
            this.executeAttack("frostMist", world);
        } else if (input.isActionActive("brihAttack3")) {
            this.executeAttack("crystalBarrier", world);
        } else if (input.isActionActive("brihAttack4")) {
            this.executeAttack("iceStorm", world);
        }
    }
    
    /**
     * Fa saltare il giocatore
     */
    jump() {
        this.isJumping = true;
        this.canJump = false;
        this.jumpVelocity = -10;
        
        // Riproduci suono del salto
        Assets.playAudio("sfx_jump", false, 0.5);
    }
    
    /**
     * Interagisce con il mondo
     * @param {World} world - Riferimento al mondo di gioco
     */
    interact(world) {
        // Cerca il personaggio più vicino con cui interagire
        const interactableNPC = world.findNearestInteractableNPC(this.x, this.y, this.interactionRadius);
        
        if (interactableNPC) {
            // Avvia il dialogo
            const dialogNode = interactableNPC.startDialogue();
            if (dialogNode) {
                world.startDialogue(interactableNPC, dialogNode);
            }
        } else {
            // Cerca oggetti interagibili
            const interactableObject = world.findNearestInteractableObject(this.x, this.y, this.interactionRadius);
            
            if (interactableObject) {
                interactableObject.interact(this);
            }
        }
    }
    
    /**
     * Esegue un attacco
     * @param {string} attackName - Nome dell'attacco
     * @param {World} world - Riferimento al mondo di gioco
     */
    executeAttack(attackName, world) {
        // Verifica se l'attacco è disponibile
        let attackType = null;
        if (this.attacks.fah.includes(attackName)) {
            attackType = "fah";
        } else if (this.attacks.brih.includes(attackName)) {
            attackType = "brih";
        } else if (this.attacks.combined.includes(attackName)) {
            attackType = "combined";
        }
        
        if (!attackType) {
            console.log(`Attacco ${attackName} non disponibile`);
            return;
        }
        
        // Verifica se l'attacco è in cooldown
        if (this.cooldowns[attackName] && this.cooldowns[attackName] > 0) {
            console.log(`Attacco ${attackName} in cooldown per altri ${this.cooldowns[attackName].toFixed(1)} secondi`);
            return;
        }
        
        // Ottieni i dati dell'attacco
        const attackData = ATTACKS_DATABASE[attackName];
        if (!attackData) {
            console.error(`Attacco ${attackName} non trovato nel database`);
            return;
        }
        
        // Verifica se c'è abbastanza energia
        if (attackType === "fah" && this.fahEnergy < attackData.energyCost) {
            console.log("Energia Fah insufficiente per questo attacco");
            return;
        } else if (attackType === "brih" && this.brihEnergy < attackData.energyCost) {
            console.log("Energia Brih insufficiente per questo attacco");
            return;
        } else if (attackType === "combined" && 
                  (this.fahEnergy < attackData.energyCost / 2 || 
                   this.brihEnergy < attackData.energyCost / 2)) {
            console.log("Energia insufficiente per questo attacco combinato");
            return;
        }
        
        // Consuma l'energia
        if (attackType === "fah") {
            this.fahEnergy -= attackData.energyCost;
        } else if (attackType === "brih") {
            this.brihEnergy -= attackData.energyCost;
        } else if (attackType === "combined") {
            this.fahEnergy -= attackData.energyCost / 2;
            this.brihEnergy -= attackData.energyCost / 2;
        }
        
        // Imposta il cooldown
        this.cooldowns[attackName] = attackData.cooldown;
        
        // Crea l'attacco
        const attack = {
            name: attackName,
            type: attackType,
            damage: attackData.damage * (1 + (this.level - 1) * 0.1),
            range: attackData.range,
            duration: attackData.duration,
            effects: attackData.effects || [],
            x: this.x,
            y: this.y,
            direction: this.direction,
            owner: this
        };
        
        // Aggiungi l'attacco al mondo
        world.addAttack(attack);
        
        // Riproduci suono dell'attacco
        if (attackType === "fah") {
            Assets.playAudio("sfx_attack_fah", false, 0.5);
        } else if (attackType === "brih") {
            Assets.playAudio("sfx_attack_brih", false, 0.5);
        } else if (attackType === "combined") {
            Assets.playAudio("sfx_attack_combined", false, 0.5);
        }
    }
    
    /**
     * Aggiorna la camera
     * @param {World} world - Riferimento al mondo di gioco
     */
    updateCamera(world) {
        // La camera segue il giocatore
        this.cameraOffsetX = this.x - world.canvasWidth / 2;
        this.cameraOffsetY = this.y - world.canvasHeight / 2;
        
        // Limita la camera ai bordi del mondo
        this.cameraOffsetX = Math.max(0, Math.min(this.cameraOffsetX, world.width - world.canvasWidth));
        this.cameraOffsetY = Math.max(0, Math.min(this.cameraOffsetY, world.height - world.canvasHeight));
    }
    
    /**
     * Aggiunge esperienza e gestisce il level up
     * @param {number} amount - Quantità di esperienza da aggiungere
     * @returns {boolean} true se è avvenuto un level up
     */
    addExperience(amount) {
        this.experience += amount;
        
        // Verifica se è avvenuto un level up
        if (this.experience >= this.experienceToNextLevel) {
            this.levelUp();
            return true;
        }
        
        return false;
    }
    
    /**
     * Gestisce il level up
     */
    levelUp() {
        this.level++;
        this.experience -= this.experienceToNextLevel;
        this.experienceToNextLevel = 100 * this.level;
        
        // Aumenta le statistiche
        this.maxHealth += 20;
        this.health = this.maxHealth;
        this.maxFahEnergy += 10;
        this.maxBrihEnergy += 10;
        this.fahEnergy = this.maxFahEnergy;
        this.brihEnergy = this.maxBrihEnergy;
        this.energyRegenRate += 1;
        
        // Aggiungi punti abilità
        this.skillPoints += 1;
        
        // Sblocca nuovi attacchi in base al livello
        if (this.level === 2) {
            this.attacks.fah.push("heatWave");
        } else if (this.level === 3) {
            this.attacks.brih.push("frostMist");
        } else if (this.level === 4) {
            this.attacks.fah.push("burningShield");
        } else if (this.level === 5) {
            this.attacks.brih.push("crystalBarrier");
        } else if (this.level === 7) {
            this.attacks.fah.push("crimsonExplosion");
        } else if (this.level === 8) {
            this.attacks.brih.push("iceStorm");
        } else if (this.level === 10) {
            this.attacks.combined.push("elementalSpiral");
        }
        
        // Verifica se c'è un altro level up
        if (this.experience >= this.experienceToNextLevel) {
            this.levelUp();
        }
    }
    
    /**
     * Cambia la reputazione con una fazione
     * @param {string} faction - Nome della fazione
     * @param {number} amount - Quantità di reputazione da aggiungere
     * @returns {number} Nuova reputazione
     */
    changeReputation(faction, amount) {
        if (this.reputation[faction] !== undefined) {
            this.reputation[faction] += amount;
            // Limita la reputazione tra -100 e 100
            this.reputation[faction] = Math.max(-100, Math.min(100, this.reputation[faction]));
            return this.reputation[faction];
        }
        return null;
    }
    
    /**
     * Aggiunge una missione
     * @param {Object} quest - Missione da aggiungere
     * @returns {boolean} true se la missione è stata aggiunta
     */
    addQuest(quest) {
        // Verifica se la missione è già attiva o completata
        if (!this.activeQuests.some(q => q.id === quest.id) && 
            !this.completedQuests.some(q => q.id === quest.id)) {
            this.activeQuests.push(quest);
            return true;
        }
        return false;
    }
    
    /**
     * Completa una missione
     * @param {string} questId - ID della missione
     * @returns {boolean} true se la missione è stata completata
     */
    completeQuest(questId) {
        const questIndex = this.activeQuests.findIndex(q => q.id === questId);
        if (questIndex !== -1) {
            const quest = this.activeQuests[questIndex];
            this.activeQuests.splice(questIndex, 1);
            this.completedQuests.push(quest);
            
            // Applica le ricompense della missione
            if (quest.rewards) {
                if (quest.rewards.experience) this.addExperience(quest.rewards.experience);
                if (quest.rewards.reputation) {
                    for (const faction in quest.rewards.reputation) {
                        this.changeReputation(faction, quest.rewards.reputation[faction]);
                    }
                }
                // Altre ricompense...
            }
            
            return true;
        }
        return false;
    }
}

// Database degli attacchi
const ATTACKS_DATABASE = {
    // Attacchi Fah (Rossi)
    "fireDart": {
        name: "Dardo Infuocato",
        type: "fah",
        damage: 15,
        range: 10,
        duration: 1.5,
        energyCost: 10,
        cooldown: 0.5,
        effects: [
            { type: "burn", duration: 2, damagePerSecond: 3 }
        ]
    },
    "heatWave": {
        name: "Onda di Calore",
        type: "fah",
        damage: 25,
        range: 8,
        duration: 2,
        energyCost: 30,
        cooldown: 8,
        effects: [
            { type: "burn", duration: 3, damagePerSecond: 5 }
        ]
    },
    "burningShield": {
        name: "Scudo Ardente",
        type: "fah",
        damage: 10,
        range: 3,
        duration: 5,
        energyCost: 25,
        cooldown: 12,
        effects: [
            { type: "reflect", reflectPercentage: 50 }
        ]
    },
    "crimsonExplosion": {
        name: "Esplosione Cremisi",
        type: "fah",
        damage: 80,
        range: 12,
        duration: 3,
        energyCost: 60,
        cooldown: 30,
        effects: [
            { type: "burn", duration: 5, damagePerSecond: 8 },
            { type: "knockback", force: 10 }
        ]
    },

    // Attacchi Brih (Blu)
    "waterLance": {
        name: "Lancia d'Acqua",
        type: "brih",
        damage: 12,
        range: 15,
        duration: 1,
        energyCost: 8,
        cooldown: 0.5,
        effects: []
    },
    "frostMist": {
        name: "Nebbia Gelida",
        type: "brih",
        damage: 5,
        range: 10,
        duration: 4,
        energyCost: 25,
        cooldown: 10,
        effects: [
            { type: "freeze", duration: 4, slowPercentage: 40 }
        ]
    },
    "crystalBarrier": {
        name: "Barriera Cristallina",
        type: "brih",
        damage: 0,
        range: 3,
        duration: 8,
        energyCost: 30,
        cooldown: 15,
        effects: [
            { type: "shield", absorptionAmount: 50 }
        ]
    },
    "iceStorm": {
        name: "Tempesta di Ghiaccio",
        type: "brih",
        damage: 70,
        range: 15,
        duration: 5,
        energyCost: 60,
        cooldown: 30,
        effects: [
            { type: "freeze", duration: 3, slowPercentage: 70 },
            { type: "areaEffect", radius: 8 }
        ]
    },

    // Attacchi Combinati (Viola)
    "elementalSpiral": {
        name: "Spirale Elementale",
        type: "combined",
        damage: 45,
        range: 12,
        duration: 3,
        energyCost: 40,
        cooldown: 15,
        effects: [
            { type: "burn", duration: 2, damagePerSecond: 5 },
            { type: "freeze", duration: 2, slowPercentage: 30 }
        ]
    },
    "balancedAura": {
        name: "Aura Equilibrata",
        type: "combined",
        damage: 5,
        range: 5,
        duration: 10,
        energyCost: 50,
        cooldown: 25,
        effects: [
            { type: "damageReduction", percentage: 40, duration: 10 },
            { type: "regeneration", amountPerSecond: 5, duration: 10 }
        ]
    },
    "chromaticNova": {
        name: "Nova Cromatica",
        type: "combined",
        damage: 150,
        range: 20,
        duration: 5,
        energyCost: 100,
        cooldown: 60,
        effects: [
            { type: "burn", duration: 8, damagePerSecond: 10 },
            { type: "freeze", duration: 4, slowPercentage: 80 },
            { type: "stun", duration: 2 },
            { type: "areaEffect", radius: 15 }
        ]
    }
};

// Esporta la classe
window.Player = Player;
window.ATTACKS_DATABASE = ATTACKS_DATABASE;
