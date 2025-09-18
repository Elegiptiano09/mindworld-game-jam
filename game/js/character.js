/**
 * Mindworld - Sistema dei personaggi
 * 
 * Questo file contiene la classe base per tutti i personaggi del gioco
 * e le implementazioni specifiche per i diversi tipi di personaggi.
 */

class Character {
    constructor(config) {
        // Proprietà di base
        this.id = config.id || Utils.generateId();
        this.name = config.name || "Unnamed";
        this.type = config.type || "npc"; // "player", "npc", "fah", "brih"
        
        // Posizione e dimensioni
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.width = config.width || 32;
        this.height = config.height || 48;
        this.direction = config.direction || "down"; // "up", "down", "left", "right"
        
        // Movimento
        this.speed = config.speed || 3;
        this.isMoving = false;
        this.velocityX = 0;
        this.velocityY = 0;
        
        // Stato
        this.health = config.health || 100;
        this.maxHealth = config.maxHealth || 100;
        this.isAlive = true;
        this.statusEffects = [];
        
        // Animazione
        this.sprite = config.sprite || null;
        this.currentAnimation = "idle";
        this.animationFrame = 0;
        this.animationSpeed = config.animationSpeed || 0.1;
        this.animationTimer = 0;
        
        // Collisione
        this.collisionRadius = Math.min(this.width, this.height) / 2;
        this.collisionBox = {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
        
        // Dialogo
        this.dialogueTree = config.dialogueTree || null;
        this.currentDialogueNode = null;
        this.interactionRadius = config.interactionRadius || 50;
        
        // Comportamento AI (per PNG)
        this.aiType = config.aiType || "static"; // "static", "patrol", "follow", "aggressive"
        this.aiTarget = null;
        this.aiWaypoints = config.aiWaypoints || [];
        this.currentWaypoint = 0;
        this.aiTimer = 0;
        this.aiUpdateInterval = 0.5; // Secondi
    }
    
    /**
     * Aggiorna lo stato del personaggio
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     * @param {World} world - Riferimento al mondo di gioco
     */
    update(deltaTime, world) {
        // Aggiorna gli effetti di stato
        this.updateStatusEffects(deltaTime);
        
        // Aggiorna l'AI se non è il giocatore
        if (this.type !== "player") {
            this.updateAI(deltaTime, world);
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
        
        // Aggiorna l'animazione
        this.updateAnimation(deltaTime);
    }
    
    /**
     * Aggiorna la collision box in base alla posizione attuale
     */
    updateCollisionBox() {
        this.collisionBox = {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
    
    /**
     * Aggiorna l'animazione del personaggio
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    updateAnimation(deltaTime) {
        // Incrementa il timer dell'animazione
        this.animationTimer += deltaTime;
        
        // Cambia il frame quando necessario
        if (this.animationTimer >= this.animationSpeed) {
            this.animationTimer = 0;
            this.animationFrame++;
            
            // Determina il numero di frame in base all'animazione corrente
            const frameCount = this.getAnimationFrameCount();
            
            // Cicla i frame
            if (this.animationFrame >= frameCount) {
                this.animationFrame = 0;
            }
        }
    }
    
    /**
     * Ottiene il numero di frame per l'animazione corrente
     * @returns {number} Numero di frame
     */
    getAnimationFrameCount() {
        // Implementazione di base, da sovrascrivere nelle sottoclassi
        return 4;
    }
    
    /**
     * Aggiorna gli effetti di stato
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    updateStatusEffects(deltaTime) {
        for (let i = this.statusEffects.length - 1; i >= 0; i--) {
            const effect = this.statusEffects[i];
            effect.duration -= deltaTime;
            
            // Applica l'effetto
            switch (effect.type) {
                case "burn":
                    this.takeDamage(effect.damagePerSecond * deltaTime);
                    break;
                case "freeze":
                    // Rallenta il movimento
                    this.speed = effect.originalSpeed * (1 - effect.slowPercentage / 100);
                    break;
                case "stun":
                    this.isMoving = false;
                    break;
            }
            
            // Rimuovi l'effetto se è scaduto
            if (effect.duration <= 0) {
                // Ripristina eventuali modifiche alle statistiche
                if (effect.type === "freeze") {
                    this.speed = effect.originalSpeed;
                }
                this.statusEffects.splice(i, 1);
            }
        }
    }
    
    /**
     * Applica un effetto di stato al personaggio
     * @param {string} type - Tipo di effetto ("burn", "freeze", "stun", ecc.)
     * @param {number} duration - Durata dell'effetto in secondi
     * @param {Object} params - Parametri aggiuntivi specifici per il tipo di effetto
     */
    applyStatusEffect(type, duration, params = {}) {
        // Crea l'oggetto effetto
        const effect = { type, duration, ...params };
        
        // Salva le statistiche originali se necessario
        if (type === "freeze") {
            effect.originalSpeed = this.speed;
            effect.slowPercentage = params.slowPercentage || 30;
        }
        
        // Aggiungi l'effetto alla lista
        this.statusEffects.push(effect);
    }
    
    /**
     * Infligge danno al personaggio
     * @param {number} amount - Quantità di danno
     * @param {string} type - Tipo di danno ("physical", "fah", "brih", ecc.)
     * @returns {number} Danno effettivamente inflitto
     */
    takeDamage(amount, type = "physical") {
        // Implementazione base, da sovrascrivere nelle sottoclassi per gestire resistenze
        this.health -= amount;
        
        // Verifica se il personaggio è morto
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
        
        return amount;
    }
    
    /**
     * Gestisce la morte del personaggio
     */
    die() {
        this.isAlive = false;
        this.isMoving = false;
        this.currentAnimation = "death";
        this.animationFrame = 0;
        
        // Altre azioni alla morte (da implementare nelle sottoclassi)
    }
    
    /**
     * Muove il personaggio in una direzione
     * @param {number} dirX - Componente X della direzione (-1, 0, 1)
     * @param {number} dirY - Componente Y della direzione (-1, 0, 1)
     */
    move(dirX, dirY) {
        // Normalizza la direzione
        const length = Math.sqrt(dirX * dirX + dirY * dirY);
        if (length > 0) {
            dirX /= length;
            dirY /= length;
        }
        
        // Imposta la velocità
        this.velocityX = dirX;
        this.velocityY = dirY;
        this.isMoving = (dirX !== 0 || dirY !== 0);
        
        // Aggiorna la direzione
        if (Math.abs(dirX) > Math.abs(dirY)) {
            this.direction = dirX > 0 ? "right" : "left";
        } else if (dirY !== 0) {
            this.direction = dirY > 0 ? "down" : "up";
        }
        
        // Aggiorna l'animazione
        this.currentAnimation = this.isMoving ? "walk" : "idle";
    }
    
    /**
     * Aggiorna l'AI del personaggio
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     * @param {World} world - Riferimento al mondo di gioco
     */
    updateAI(deltaTime, world) {
        // Aggiorna solo a intervalli regolari per risparmiare risorse
        this.aiTimer += deltaTime;
        if (this.aiTimer < this.aiUpdateInterval) {
            return;
        }
        this.aiTimer = 0;
        
        // Comportamento in base al tipo di AI
        switch (this.aiType) {
            case "static":
                // Non fa nulla, resta fermo
                this.move(0, 0);
                break;
                
            case "patrol":
                // Pattuglia tra waypoint
                if (this.aiWaypoints.length > 0) {
                    const target = this.aiWaypoints[this.currentWaypoint];
                    const distance = Utils.distance(
                        {x: this.x, y: this.y},
                        {x: target.x, y: target.y}
                    );
                    
                    if (distance < 10) {
                        // Waypoint raggiunto, passa al successivo
                        this.currentWaypoint = (this.currentWaypoint + 1) % this.aiWaypoints.length;
                    } else {
                        // Muovi verso il waypoint
                        const dirX = target.x - this.x;
                        const dirY = target.y - this.y;
                        this.move(dirX, dirY);
                    }
                }
                break;
                
            case "follow":
                // Segue un bersaglio (di solito il giocatore)
                if (this.aiTarget) {
                    const distance = Utils.distance(
                        {x: this.x, y: this.y},
                        {x: this.aiTarget.x, y: this.aiTarget.y}
                    );
                    
                    if (distance > 30 && distance < 200) {
                        // Segui il bersaglio se è nel raggio corretto
                        const dirX = this.aiTarget.x - this.x;
                        const dirY = this.aiTarget.y - this.y;
                        this.move(dirX, dirY);
                    } else {
                        this.move(0, 0);
                    }
                }
                break;
                
            case "aggressive":
                // Attacca il bersaglio se è nel raggio
                if (this.aiTarget) {
                    const distance = Utils.distance(
                        {x: this.x, y: this.y},
                        {x: this.aiTarget.x, y: this.aiTarget.y}
                    );
                    
                    if (distance < 200) {
                        if (distance > 50) {
                            // Avvicinati al bersaglio
                            const dirX = this.aiTarget.x - this.x;
                            const dirY = this.aiTarget.y - this.y;
                            this.move(dirX, dirY);
                        } else {
                            // Attacca il bersaglio
                            this.move(0, 0);
                            this.attack(this.aiTarget);
                        }
                    } else {
                        this.move(0, 0);
                    }
                }
                break;
        }
    }
    
    /**
     * Attacca un bersaglio
     * @param {Character} target - Bersaglio dell'attacco
     */
    attack(target) {
        // Implementazione base, da sovrascrivere nelle sottoclassi
        console.log(`${this.name} attacca ${target.name}`);
    }
    
    /**
     * Disegna il personaggio sul canvas
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     * @param {number} offsetX - Offset X della camera
     * @param {number} offsetY - Offset Y della camera
     */
    draw(ctx, offsetX = 0, offsetY = 0) {
        // Posizione sullo schermo
        const screenX = this.x - offsetX;
        const screenY = this.y - offsetY;
        
        // Se non c'è uno sprite, disegna un rettangolo colorato
        if (!this.sprite) {
            ctx.fillStyle = this.getDefaultColor();
            ctx.fillRect(
                screenX - this.width / 2,
                screenY - this.height / 2,
                this.width,
                this.height
            );
            
            // Disegna il nome
            ctx.fillStyle = "#fff";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.fillText(this.name, screenX, screenY - this.height / 2 - 5);
            return;
        }
        
        // Disegna lo sprite
        const frameX = this.animationFrame;
        const frameY = this.getDirectionFrame();
        
        ctx.drawImage(
            this.sprite,
            frameX * this.width, frameY * this.height, this.width, this.height,
            screenX - this.width / 2, screenY - this.height / 2, this.width, this.height
        );
        
        // Disegna il nome
        ctx.fillStyle = "#fff";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.name, screenX, screenY - this.height / 2 - 5);
        
        // Disegna la barra della salute se non è piena
        if (this.health < this.maxHealth) {
            const healthBarWidth = 30;
            const healthBarHeight = 4;
            const healthPercentage = this.health / this.maxHealth;
            
            // Sfondo
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(
                screenX - healthBarWidth / 2,
                screenY - this.height / 2 - 15,
                healthBarWidth,
                healthBarHeight
            );
            
            // Barra della salute
            ctx.fillStyle = this.health > this.maxHealth * 0.5 ? "#2ecc71" : "#e74c3c";
            ctx.fillRect(
                screenX - healthBarWidth / 2,
                screenY - this.height / 2 - 15,
                healthBarWidth * healthPercentage,
                healthBarHeight
            );
        }
        
        // Disegna gli effetti di stato
        this.drawStatusEffects(ctx, screenX, screenY);
    }
    
    /**
     * Ottiene il frame della direzione per l'animazione
     * @returns {number} Indice del frame della direzione
     */
    getDirectionFrame() {
        switch (this.direction) {
            case "down": return 0;
            case "left": return 1;
            case "right": return 2;
            case "up": return 3;
            default: return 0;
        }
    }
    
    /**
     * Ottiene il colore predefinito per il personaggio
     * @returns {string} Colore in formato CSS
     */
    getDefaultColor() {
        switch (this.type) {
            case "player": return "#3498db";
            case "npc": return "#2ecc71";
            case "fah": return "#e74c3c";
            case "brih": return "#3498db";
            default: return "#95a5a6";
        }
    }
    
    /**
     * Disegna gli effetti di stato
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     * @param {number} x - Posizione X sullo schermo
     * @param {number} y - Posizione Y sullo schermo
     */
    drawStatusEffects(ctx, x, y) {
        let iconX = x - 15;
        const iconY = y - this.height / 2 - 25;
        const iconSize = 10;
        
        for (const effect of this.statusEffects) {
            switch (effect.type) {
                case "burn":
                    ctx.fillStyle = "#e74c3c";
                    ctx.fillRect(iconX, iconY, iconSize, iconSize);
                    break;
                case "freeze":
                    ctx.fillStyle = "#3498db";
                    ctx.fillRect(iconX, iconY, iconSize, iconSize);
                    break;
                case "stun":
                    ctx.fillStyle = "#f39c12";
                    ctx.fillRect(iconX, iconY, iconSize, iconSize);
                    break;
            }
            
            iconX += iconSize + 5;
        }
    }
    
    /**
     * Verifica se il personaggio è vicino a un punto
     * @param {number} x - Coordinata X del punto
     * @param {number} y - Coordinata Y del punto
     * @param {number} radius - Raggio di interazione
     * @returns {boolean} true se il personaggio è vicino al punto
     */
    isNearPoint(x, y, radius) {
        const distance = Utils.distance(
            {x: this.x, y: this.y},
            {x, y}
        );
        return distance <= radius;
    }
    
    /**
     * Avvia un dialogo con questo personaggio
     * @returns {Object} Nodo di dialogo corrente
     */
    startDialogue() {
        if (this.dialogueTree) {
            this.currentDialogueNode = this.dialogueTree.rootNode;
            return this.currentDialogueNode;
        }
        return null;
    }
    
    /**
     * Avanza nel dialogo in base alla scelta
     * @param {number} choiceIndex - Indice della scelta selezionata
     * @returns {Object} Nuovo nodo di dialogo
     */
    continueDialogue(choiceIndex) {
        if (this.currentDialogueNode && this.currentDialogueNode.choices) {
            const choice = this.currentDialogueNode.choices[choiceIndex];
            if (choice && choice.nextNode) {
                this.currentDialogueNode = choice.nextNode;
                
                // Esegui eventuali azioni associate alla scelta
                if (choice.actions) {
                    for (const action of choice.actions) {
                        this.executeDialogueAction(action);
                    }
                }
                
                return this.currentDialogueNode;
            }
        }
        return null;
    }
    
    /**
     * Esegue un'azione associata a una scelta di dialogo
     * @param {Object} action - Azione da eseguire
     */
    executeDialogueAction(action) {
        // Implementazione base, da sovrascrivere nelle sottoclassi
        console.log(`Esecuzione azione: ${action.type}`);
    }
}

// Esporta la classe
window.Character = Character;
