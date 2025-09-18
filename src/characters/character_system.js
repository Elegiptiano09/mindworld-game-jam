/**
 * Mindworld - Sistema di Gestione dei Personaggi
 * 
 * Questo file contiene le classi e le funzioni per la gestione dei personaggi
 * del gioco, sia per il protagonista che per i PNG.
 */

// Classe base per tutti i personaggi
class Character {
    constructor(config) {
        this.id = config.id || generateUniqueId();
        this.name = config.name || "Unnamed";
        this.type = config.type || "npc"; // "player", "npc", "fah", "brih"
        this.level = config.level || 1;
        
        // Statistiche base
        this.stats = {
            health: config.stats?.health || 100,
            maxHealth: config.stats?.maxHealth || 100,
            defense: config.stats?.defense || 0,
            speed: config.stats?.speed || 5
        };
        
        // Posizione e movimento
        this.position = config.position || { x: 0, y: 0, z: 0 };
        this.rotation = config.rotation || { x: 0, y: 0, z: 0 };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.isMoving = false;
        
        // Stato
        this.isAlive = true;
        this.statusEffects = [];
        this.faction = config.faction || "neutral"; // "neutral", "fah", "brih", "hostile"
        
        // Dialogo e interazione
        this.dialogueTree = config.dialogueTree || null;
        this.currentDialogueNode = null;
        this.interactionRadius = config.interactionRadius || 3;
        
        // Inventario (se applicabile)
        this.inventory = config.inventory || null;
        
        // Comportamento AI (per PNG)
        this.aiType = config.aiType || "static"; // "static", "patrol", "follow", "aggressive"
        this.aiTarget = null;
        this.aiWaypoints = config.aiWaypoints || [];
        this.currentWaypoint = 0;
    }
    
    // Aggiorna lo stato del personaggio
    update(deltaTime, world) {
        // Aggiorna gli effetti di stato
        this.updateStatusEffects(deltaTime);
        
        // Comportamento AI per PNG
        if (this.type !== "player") {
            this.updateAI(deltaTime, world);
        }
        
        // Aggiorna la posizione in base alla velocità
        if (this.isMoving) {
            this.position.x += this.velocity.x * deltaTime;
            this.position.y += this.velocity.y * deltaTime;
            this.position.z += this.velocity.z * deltaTime;
            
            // Collisione con il mondo (semplificata)
            const collision = world.checkCollision(this.position, this.velocity);
            if (collision) {
                this.handleCollision(collision);
            }
        }
    }
    
    // Gestisce gli effetti di stato (bruciatura, congelamento, ecc.)
    updateStatusEffects(deltaTime) {
        for (let i = this.statusEffects.length - 1; i >= 0; i--) {
            const effect = this.statusEffects[i];
            effect.duration -= deltaTime;
            
            // Applica l'effetto
            switch (effect.type) {
                case "burn":
                    this.takeDamage(effect.damagePerSecond * deltaTime, "fah");
                    break;
                case "freeze":
                    // Rallenta il movimento
                    this.stats.speed = this.stats.speed * (1 - effect.slowPercentage / 100);
                    break;
                case "stun":
                    this.isMoving = false;
                    break;
                // Altri effetti...
            }
            
            // Rimuovi l'effetto se è scaduto
            if (effect.duration <= 0) {
                // Ripristina eventuali modifiche alle statistiche
                if (effect.type === "freeze") {
                    this.stats.speed = this.stats.originalSpeed;
                }
                this.statusEffects.splice(i, 1);
            }
        }
    }
    
    // Applica un nuovo effetto di stato
    applyStatusEffect(type, duration, ...params) {
        // Salva le statistiche originali se necessario
        if (type === "freeze") {
            this.stats.originalSpeed = this.stats.speed;
        }
        
        // Crea l'oggetto effetto
        const effect = { type, duration };
        
        // Aggiungi parametri specifici in base al tipo
        switch (type) {
            case "burn":
                effect.damagePerSecond = params[0] || 5;
                break;
            case "freeze":
                effect.slowPercentage = params[0] || 30;
                break;
            // Altri tipi...
        }
        
        // Aggiungi l'effetto alla lista
        this.statusEffects.push(effect);
    }
    
    // Gestisce il danno ricevuto
    takeDamage(amount, damageType) {
        // Calcola la riduzione del danno in base alla difesa
        const reducedAmount = Math.max(1, amount - this.stats.defense);
        
        // Applica modificatori in base al tipo di danno e alla fazione
        let finalDamage = reducedAmount;
        if (damageType === "fah" && this.faction === "brih") {
            finalDamage *= 1.5; // I Brih sono vulnerabili al fuoco
        } else if (damageType === "brih" && this.faction === "fah") {
            finalDamage *= 1.5; // I Fah sono vulnerabili all'acqua
        }
        
        // Applica il danno
        this.stats.health -= finalDamage;
        
        // Verifica se il personaggio è morto
        if (this.stats.health <= 0) {
            this.die();
        }
        
        return finalDamage;
    }
    
    // Gestisce la morte del personaggio
    die() {
        this.isAlive = false;
        this.isMoving = false;
        // Altre azioni alla morte (animazione, drop di oggetti, ecc.)
    }
    
    // Gestisce le collisioni
    handleCollision(collision) {
        // Semplice rimbalzo
        if (collision.normal.x !== 0) this.velocity.x = -this.velocity.x * 0.5;
        if (collision.normal.y !== 0) this.velocity.y = -this.velocity.y * 0.5;
        if (collision.normal.z !== 0) this.velocity.z = -this.velocity.z * 0.5;
    }
    
    // Gestisce l'AI per i PNG
    updateAI(deltaTime, world) {
        switch (this.aiType) {
            case "static":
                // Non fa nulla, resta fermo
                break;
                
            case "patrol":
                // Pattuglia tra waypoint
                if (this.aiWaypoints.length > 0) {
                    const target = this.aiWaypoints[this.currentWaypoint];
                    const distance = calculateDistance(this.position, target);
                    
                    if (distance < 1) {
                        // Waypoint raggiunto, passa al successivo
                        this.currentWaypoint = (this.currentWaypoint + 1) % this.aiWaypoints.length;
                    } else {
                        // Muovi verso il waypoint
                        this.moveTowards(target, deltaTime);
                    }
                }
                break;
                
            case "follow":
                // Segue un bersaglio (di solito il giocatore)
                if (this.aiTarget) {
                    const distance = calculateDistance(this.position, this.aiTarget.position);
                    
                    if (distance > 2 && distance < 15) {
                        // Segui il bersaglio se è nel raggio corretto
                        this.moveTowards(this.aiTarget.position, deltaTime);
                    } else {
                        this.isMoving = false;
                    }
                }
                break;
                
            case "aggressive":
                // Attacca il bersaglio se è nel raggio
                if (this.aiTarget) {
                    const distance = calculateDistance(this.position, this.aiTarget.position);
                    
                    if (distance < 20) {
                        if (distance > 5) {
                            // Avvicinati al bersaglio
                            this.moveTowards(this.aiTarget.position, deltaTime);
                        } else {
                            // Attacca il bersaglio
                            this.attack(this.aiTarget);
                        }
                    }
                }
                break;
        }
    }
    
    // Muove il personaggio verso una posizione target
    moveTowards(targetPosition, deltaTime) {
        // Calcola la direzione
        const direction = {
            x: targetPosition.x - this.position.x,
            y: targetPosition.y - this.position.y,
            z: targetPosition.z - this.position.z
        };
        
        // Normalizza la direzione
        const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
        direction.x /= length;
        direction.y /= length;
        direction.z /= length;
        
        // Imposta la velocità
        this.velocity.x = direction.x * this.stats.speed;
        this.velocity.y = direction.y * this.stats.speed;
        this.velocity.z = direction.z * this.stats.speed;
        this.isMoving = true;
        
        // Aggiorna la rotazione per guardare nella direzione del movimento
        this.rotation.y = Math.atan2(direction.x, direction.z);
    }
    
    // Attacca un bersaglio
    attack(target) {
        // Implementazione base, da sovrascrivere nelle sottoclassi
        console.log(`${this.name} attacca ${target.name}`);
    }
    
    // Avvia un dialogo con questo personaggio
    startDialogue() {
        if (this.dialogueTree) {
            this.currentDialogueNode = this.dialogueTree.rootNode;
            return this.currentDialogueNode;
        }
        return null;
    }
    
    // Avanza nel dialogo in base alla scelta
    continueDialogue(choiceIndex) {
        if (this.currentDialogueNode && this.currentDialogueNode.choices) {
            const choice = this.currentDialogueNode.choices[choiceIndex];
            if (choice && choice.nextNode) {
                this.currentDialogueNode = choice.nextNode;
                
                // Esegui eventuali azioni associate alla scelta
                if (choice.actions) {
                    choice.actions.forEach(action => this.executeDialogueAction(action));
                }
                
                return this.currentDialogueNode;
            }
        }
        return null;
    }
    
    // Esegue un'azione associata a una scelta di dialogo
    executeDialogueAction(action) {
        switch (action.type) {
            case "giveItem":
                // Implementazione per dare un oggetto al giocatore
                break;
            case "startQuest":
                // Implementazione per iniziare una missione
                break;
            case "changeRelationship":
                // Implementazione per cambiare la relazione con il personaggio
                break;
            // Altre azioni...
        }
    }
}

// Classe per il personaggio del giocatore (Aurora)
class PlayerCharacter extends Character {
    constructor(config) {
        super({
            ...config,
            type: "player"
        });
        
        // Proprietà specifiche del giocatore
        this.techBracelet = config.techBracelet || null;
        this.experience = config.experience || 0;
        this.experienceToNextLevel = 100 * this.level;
        this.skillPoints = config.skillPoints || 0;
        this.skills = config.skills || {
            fah: [],
            brih: [],
            combined: []
        };
        
        // Reputazione con le fazioni
        this.reputation = {
            fah: 0,
            brih: 0,
            council: 0,
            merchants: 0
        };
        
        // Missioni
        this.activeQuests = [];
        this.completedQuests = [];
    }
    
    // Sovrascrive il metodo update per gestire input del giocatore
    update(deltaTime, world, input) {
        // Aggiorna gli effetti di stato
        super.updateStatusEffects(deltaTime);
        
        // Gestisci l'input del giocatore
        if (input) {
            this.handleInput(input, deltaTime);
        }
        
        // Aggiorna il bracciale tecnologico
        if (this.techBracelet) {
            this.techBracelet.update(deltaTime);
        }
        
        // Aggiorna la posizione
        if (this.isMoving) {
            this.position.x += this.velocity.x * deltaTime;
            this.position.y += this.velocity.y * deltaTime;
            this.position.z += this.velocity.z * deltaTime;
            
            // Collisione con il mondo
            const collision = world.checkCollision(this.position, this.velocity);
            if (collision) {
                this.handleCollision(collision);
            }
        }
    }
    
    // Gestisce l'input del giocatore
    handleInput(input, deltaTime) {
        // Movimento
        if (input.movement) {
            // Converti l'input in velocità
            this.velocity.x = input.movement.x * this.stats.speed;
            this.velocity.z = input.movement.z * this.stats.speed;
            this.isMoving = (input.movement.x !== 0 || input.movement.z !== 0);
            
            // Aggiorna la rotazione per guardare nella direzione del movimento
            if (this.isMoving) {
                this.rotation.y = Math.atan2(input.movement.x, input.movement.z);
            }
        }
        
        // Salto
        if (input.jump && this.canJump) {
            this.velocity.y = 10; // Forza del salto
            this.canJump = false;
        }
        
        // Attacchi
        if (input.attack && this.techBracelet) {
            const attackName = input.attack.name;
            const targetPosition = input.attack.target;
            
            // Esegui l'attacco
            const attack = this.techBracelet.executeAttack(attackName, targetPosition);
            if (attack) {
                // L'attacco è stato creato con successo, aggiungerlo al mondo
                return attack;
            }
        }
        
        // Interazione
        if (input.interact) {
            // Trova il personaggio o l'oggetto più vicino con cui interagire
            const interactable = this.findNearestInteractable();
            if (interactable) {
                if (interactable instanceof Character) {
                    return interactable.startDialogue();
                } else {
                    // Altro tipo di interazione
                    return interactable.interact(this);
                }
            }
        }
        
        return null;
    }
    
    // Trova l'oggetto o personaggio interagibile più vicino
    findNearestInteractable() {
        // Implementazione dipendente dal sistema di gestione del mondo
        return null;
    }
    
    // Aggiunge esperienza e gestisce il level up
    addExperience(amount) {
        this.experience += amount;
        
        // Verifica se è avvenuto un level up
        if (this.experience >= this.experienceToNextLevel) {
            this.levelUp();
        }
        
        return this.experience;
    }
    
    // Gestisce il level up
    levelUp() {
        this.level++;
        this.experience -= this.experienceToNextLevel;
        this.experienceToNextLevel = 100 * this.level;
        
        // Aumenta le statistiche
        this.stats.maxHealth += 20;
        this.stats.health = this.stats.maxHealth;
        this.stats.defense += 2;
        
        // Aggiungi punti abilità
        this.skillPoints += 1;
        
        // Evento di level up
        console.log(`${this.name} è salito al livello ${this.level}!`);
        
        // Verifica se c'è un altro level up
        if (this.experience >= this.experienceToNextLevel) {
            this.levelUp();
        }
    }
    
    // Sblocca una nuova abilità
    unlockSkill(skillName, type) {
        if (this.skillPoints > 0 && !this.skills[type].includes(skillName)) {
            this.skills[type].push(skillName);
            this.skillPoints--;
            return true;
        }
        return false;
    }
    
    // Cambia la reputazione con una fazione
    changeReputation(faction, amount) {
        if (this.reputation[faction] !== undefined) {
            this.reputation[faction] += amount;
            // Limita la reputazione tra -100 e 100
            this.reputation[faction] = Math.max(-100, Math.min(100, this.reputation[faction]));
            return this.reputation[faction];
        }
        return null;
    }
    
    // Aggiunge una nuova missione
    addQuest(quest) {
        // Verifica se la missione è già attiva o completata
        if (!this.activeQuests.some(q => q.id === quest.id) && 
            !this.completedQuests.some(q => q.id === quest.id)) {
            this.activeQuests.push(quest);
            return true;
        }
        return false;
    }
    
    // Completa una missione
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

// Classe per i personaggi non giocanti (PNG)
class NonPlayerCharacter extends Character {
    constructor(config) {
        super(config);
        
        // Proprietà specifiche dei PNG
        this.schedule = config.schedule || []; // Programma giornaliero
        this.currentScheduleIndex = 0;
        this.shopInventory = config.shopInventory || null; // Per mercanti
        this.questsOffered = config.questsOffered || []; // Missioni che può offrire
    }
    
    // Sovrascrive il metodo update per gestire il programma giornaliero
    update(deltaTime, world, gameTime) {
        super.update(deltaTime, world);
        
        // Gestisci il programma giornaliero
        if (this.schedule.length > 0) {
            this.updateSchedule(gameTime);
        }
    }
    
    // Aggiorna il comportamento in base al programma giornaliero
    updateSchedule(gameTime) {
        const currentHour = gameTime.hour;
        
        // Trova l'attività corrente in base all'ora
        let newScheduleIndex = -1;
        for (let i = 0; i < this.schedule.length; i++) {
            const activity = this.schedule[i];
            if (currentHour >= activity.startHour && currentHour < activity.endHour) {
                newScheduleIndex = i;
                break;
            }
        }
        
        // Se è cambiata l'attività
        if (newScheduleIndex !== -1 && newScheduleIndex !== this.currentScheduleIndex) {
            this.currentScheduleIndex = newScheduleIndex;
            const activity = this.schedule[this.currentScheduleIndex];
            
            // Aggiorna il comportamento in base all'attività
            this.aiType = activity.aiType || "static";
            this.aiWaypoints = activity.waypoints || [];
            this.currentWaypoint = 0;
            
            // Sposta il personaggio nella posizione iniziale dell'attività
            if (activity.location) {
                this.position = { ...activity.location };
            }
        }
    }
    
    // Offre una missione al giocatore
    offerQuest(player, questId) {
        const quest = this.questsOffered.find(q => q.id === questId);
        if (quest) {
            return player.addQuest(quest);
        }
        return false;
    }
    
    // Apre il negozio (per mercanti)
    openShop() {
        if (this.shopInventory) {
            return this.shopInventory;
        }
        return null;
    }
}

// Funzione di utilità per generare ID unici
function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Funzione di utilità per calcolare la distanza tra due punti
function calculateDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const dz = point2.z - point1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Esporta le classi
export { Character, PlayerCharacter, NonPlayerCharacter };
