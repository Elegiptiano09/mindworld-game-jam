/**
 * Mindworld - Sistema del mondo di gioco
 * 
 * Questo file contiene la classe World che gestisce il mondo di gioco,
 * inclusi mappa, personaggi, oggetti e interazioni.
 */

class World {
    constructor(config) {
        // Proprietà di base
        this.name = config.name || "Unnamed World";
        this.width = config.width || 800;
        this.height = config.height || 600;
        this.tileSize = config.tileSize || 32;
        
        // Riferimenti al canvas
        this.canvas = config.canvas;
        this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
        this.canvasWidth = this.canvas ? this.canvas.width : 800;
        this.canvasHeight = this.canvas ? this.canvas.height : 600;
        
        // Mappa
        this.map = config.map || [];
        this.collisionMap = config.collisionMap || [];
        this.backgroundImage = config.backgroundImage || null;
        
        // Entità
        this.player = null;
        this.npcs = [];
        this.objects = [];
        this.attacks = [];
        this.particles = [];
        
        // Stato del mondo
        this.time = {
            hour: 12,
            minute: 0,
            day: 1,
            timeScale: 1, // 1 minuto di gioco = 1 secondo reale
            totalGameTime: 0
        };
        
        // Dialogo
        this.activeDialogue = null;
        this.activeDialogueNPC = null;
        
        // UI
        this.ui = config.ui || null;
        
        // Stato del gioco
        this.gameState = "loading"; // "loading", "title", "playing", "paused", "dialogue", "gameover"
    }
    
    /**
     * Inizializza il mondo
     */
    init() {
        // Crea il giocatore
        this.player = new Player({
            x: this.width / 2,
            y: this.height / 2,
            sprite: Assets.getImage("player")
        });
        
        // Carica la mappa
        this.loadMap();
        
        // Inizializza gli NPC
        this.initNPCs();
        
        // Inizializza gli oggetti
        this.initObjects();
        
        // Imposta lo stato di gioco
        this.gameState = "title";
    }
    
    /**
     * Carica la mappa
     */
    loadMap() {
        // Implementazione base, da sovrascrivere con la logica specifica del gioco
        console.log("Caricamento mappa...");
    }
    
    /**
     * Inizializza gli NPC
     */
    initNPCs() {
        // Implementazione base, da sovrascrivere con la logica specifica del gioco
        console.log("Inizializzazione NPC...");
        
        // Esempio: Aggiungi alcuni NPC di base
        this.addNPC(new Character({
            name: "Maestro Elian",
            x: 200,
            y: 200,
            sprite: Assets.getImage("npc_elian"),
            dialogueTree: this.createDialogueTree("elian")
        }));
        
        this.addNPC(new Character({
            name: "Nyx",
            x: 300,
            y: 250,
            sprite: Assets.getImage("npc_nyx"),
            dialogueTree: this.createDialogueTree("nyx")
        }));
    }
    
    /**
     * Inizializza gli oggetti
     */
    initObjects() {
        // Implementazione base, da sovrascrivere con la logica specifica del gioco
        console.log("Inizializzazione oggetti...");
    }
    
    /**
     * Crea un albero di dialogo
     * @param {string} npcId - ID dell'NPC
     * @returns {Object} Albero di dialogo
     */
    createDialogueTree(npcId) {
        // Ottieni i dati di dialogo dal gestore degli asset
        const dialogData = Assets.getData("dialogs");
        
        if (dialogData && dialogData[npcId]) {
            return dialogData[npcId];
        }
        
        // Dialogo di fallback
        return {
            rootNode: {
                character: npcId,
                text: "Non ho nulla da dire al momento.",
                choices: [
                    {
                        text: "Arrivederci.",
                        nextNode: null
                    }
                ]
            }
        };
    }
    
    /**
     * Aggiorna lo stato del mondo
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     * @param {InputManager} input - Riferimento al gestore dell'input
     */
    update(deltaTime, input) {
        // Aggiorna il tempo di gioco
        this.updateGameTime(deltaTime);
        
        // Gestisci lo stato del gioco
        switch (this.gameState) {
            case "loading":
                // Niente da fare, aspetta che il caricamento sia completato
                break;
                
            case "title":
                // Gestisci l'input nella schermata del titolo
                this.handleTitleScreenInput(input);
                break;
                
            case "playing":
                // Aggiorna il giocatore
                if (this.player) {
                    this.player.update(deltaTime, this, input);
                }
                
                // Aggiorna gli NPC
                for (const npc of this.npcs) {
                    npc.update(deltaTime, this);
                }
                
                // Aggiorna gli oggetti
                for (const object of this.objects) {
                    if (object.update) {
                        object.update(deltaTime, this);
                    }
                }
                
                // Aggiorna gli attacchi
                this.updateAttacks(deltaTime);
                
                // Aggiorna le particelle
                this.updateParticles(deltaTime);
                
                // Gestisci le collisioni
                this.handleCollisions();
                break;
                
            case "dialogue":
                // Gestisci l'input durante il dialogo
                this.handleDialogueInput(input);
                break;
                
            case "paused":
                // Gestisci l'input durante la pausa
                this.handlePausedInput(input);
                break;
                
            case "gameover":
                // Gestisci l'input nella schermata di game over
                this.handleGameOverInput(input);
                break;
        }
        
        // Aggiorna l'UI
        if (this.ui) {
            this.ui.update(deltaTime, this);
        }
    }
    
    /**
     * Aggiorna il tempo di gioco
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    updateGameTime(deltaTime) {
        // Incrementa il tempo totale di gioco
        this.time.totalGameTime += deltaTime;
        
        // Aggiorna l'ora di gioco
        const gameMinutesElapsed = deltaTime * this.time.timeScale;
        this.time.minute += gameMinutesElapsed;
        
        // Gestisci il passaggio dei minuti e delle ore
        while (this.time.minute >= 60) {
            this.time.minute -= 60;
            this.time.hour++;
            
            // Gestisci il passaggio dei giorni
            if (this.time.hour >= 24) {
                this.time.hour = 0;
                this.time.day++;
            }
        }
    }
    
    /**
     * Gestisce l'input nella schermata del titolo
     * @param {InputManager} input - Riferimento al gestore dell'input
     */
    handleTitleScreenInput(input) {
        // Implementazione base, da sovrascrivere con la logica specifica del gioco
    }
    
    /**
     * Gestisce l'input durante il dialogo
     * @param {InputManager} input - Riferimento al gestore dell'input
     */
    handleDialogueInput(input) {
        // Implementazione base, da sovrascrivere con la logica specifica del gioco
    }
    
    /**
     * Gestisce l'input durante la pausa
     * @param {InputManager} input - Riferimento al gestore dell'input
     */
    handlePausedInput(input) {
        // Implementazione base, da sovrascrivere con la logica specifica del gioco
    }
    
    /**
     * Gestisce l'input nella schermata di game over
     * @param {InputManager} input - Riferimento al gestore dell'input
     */
    handleGameOverInput(input) {
        // Implementazione base, da sovrascrivere con la logica specifica del gioco
    }
    
    /**
     * Aggiorna gli attacchi
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    updateAttacks(deltaTime) {
        for (let i = this.attacks.length - 1; i >= 0; i--) {
            const attack = this.attacks[i];
            
            // Aggiorna la durata dell'attacco
            attack.duration -= deltaTime;
            
            // Rimuovi l'attacco se è scaduto
            if (attack.duration <= 0) {
                this.attacks.splice(i, 1);
                continue;
            }
            
            // Aggiorna la posizione dell'attacco in base alla direzione
            switch (attack.direction) {
                case "up":
                    attack.y -= 5;
                    break;
                case "down":
                    attack.y += 5;
                    break;
                case "left":
                    attack.x -= 5;
                    break;
                case "right":
                    attack.x += 5;
                    break;
            }
        }
    }
    
    /**
     * Aggiorna le particelle
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Aggiorna la durata della particella
            particle.duration -= deltaTime;
            
            // Rimuovi la particella se è scaduta
            if (particle.duration <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // Aggiorna la posizione della particella
            particle.x += particle.velocityX * deltaTime;
            particle.y += particle.velocityY * deltaTime;
            
            // Aggiorna la velocità (gravità, attrito, ecc.)
            particle.velocityY += particle.gravity * deltaTime;
            particle.velocityX *= (1 - particle.friction * deltaTime);
            particle.velocityY *= (1 - particle.friction * deltaTime);
            
            // Aggiorna la dimensione e l'opacità
            particle.size *= (1 - particle.shrink * deltaTime);
            particle.opacity *= (1 - particle.fade * deltaTime);
        }
    }
    
    /**
     * Gestisce le collisioni
     */
    handleCollisions() {
        // Collisioni tra attacchi e NPC
        for (const attack of this.attacks) {
            // Salta gli attacchi del giocatore se l'attacco è del giocatore
            if (attack.owner === this.player) {
                for (const npc of this.npcs) {
                    // Verifica se l'NPC è nel raggio dell'attacco
                    const distance = Utils.distance(
                        {x: attack.x, y: attack.y},
                        {x: npc.x, y: npc.y}
                    );
                    
                    if (distance <= attack.range) {
                        // Applica il danno
                        const damage = npc.takeDamage(attack.damage, attack.type);
                        
                        // Crea particelle per l'impatto
                        this.createImpactParticles(npc.x, npc.y, attack.type);
                        
                        // Applica gli effetti dell'attacco
                        for (const effect of attack.effects) {
                            switch (effect.type) {
                                case "burn":
                                    npc.applyStatusEffect("burn", effect.duration, {
                                        damagePerSecond: effect.damagePerSecond
                                    });
                                    break;
                                case "freeze":
                                    npc.applyStatusEffect("freeze", effect.duration, {
                                        slowPercentage: effect.slowPercentage
                                    });
                                    break;
                                case "stun":
                                    npc.applyStatusEffect("stun", effect.duration);
                                    break;
                                case "knockback":
                                    // Calcola la direzione del knockback
                                    const dirX = npc.x - attack.x;
                                    const dirY = npc.y - attack.y;
                                    const length = Math.sqrt(dirX * dirX + dirY * dirY);
                                    const normalizedDirX = dirX / length;
                                    const normalizedDirY = dirY / length;
                                    
                                    // Applica il knockback
                                    npc.x += normalizedDirX * effect.force;
                                    npc.y += normalizedDirY * effect.force;
                                    break;
                            }
                        }
                    }
                }
            }
            // Collisioni tra attacchi degli NPC e il giocatore
            else if (this.player) {
                // Verifica se il giocatore è nel raggio dell'attacco
                const distance = Utils.distance(
                    {x: attack.x, y: attack.y},
                    {x: this.player.x, y: this.player.y}
                );
                
                if (distance <= attack.range) {
                    // Applica il danno
                    const damage = this.player.takeDamage(attack.damage, attack.type);
                    
                    // Crea particelle per l'impatto
                    this.createImpactParticles(this.player.x, this.player.y, attack.type);
                    
                    // Applica gli effetti dell'attacco
                    for (const effect of attack.effects) {
                        switch (effect.type) {
                            case "burn":
                                this.player.applyStatusEffect("burn", effect.duration, {
                                    damagePerSecond: effect.damagePerSecond
                                });
                                break;
                            case "freeze":
                                this.player.applyStatusEffect("freeze", effect.duration, {
                                    slowPercentage: effect.slowPercentage
                                });
                                break;
                            case "stun":
                                this.player.applyStatusEffect("stun", effect.duration);
                                break;
                            case "knockback":
                                // Calcola la direzione del knockback
                                const dirX = this.player.x - attack.x;
                                const dirY = this.player.y - attack.y;
                                const length = Math.sqrt(dirX * dirX + dirY * dirY);
                                const normalizedDirX = dirX / length;
                                const normalizedDirY = dirY / length;
                                
                                // Applica il knockback
                                this.player.x += normalizedDirX * effect.force;
                                this.player.y += normalizedDirY * effect.force;
                                break;
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Crea particelle per l'impatto di un attacco
     * @param {number} x - Coordinata X dell'impatto
     * @param {number} y - Coordinata Y dell'impatto
     * @param {string} type - Tipo di attacco ("fah", "brih", "combined")
     */
    createImpactParticles(x, y, type) {
        // Colore delle particelle in base al tipo di attacco
        let color;
        switch (type) {
            case "fah":
                color = "#e74c3c";
                break;
            case "brih":
                color = "#3498db";
                break;
            case "combined":
                color = "#9b59b6";
                break;
            default:
                color = "#95a5a6";
        }
        
        // Crea diverse particelle
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x,
                y,
                velocityX: (Math.random() - 0.5) * 100,
                velocityY: (Math.random() - 0.5) * 100,
                size: 5 + Math.random() * 5,
                color,
                duration: 0.5 + Math.random() * 0.5,
                gravity: 50,
                friction: 0.5,
                shrink: 0.5,
                fade: 0.5,
                opacity: 1
            });
        }
    }
    
    /**
     * Disegna il mondo
     */
    draw() {
        if (!this.ctx) return;
        
        // Pulisci il canvas
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Gestisci lo stato del gioco
        switch (this.gameState) {
            case "loading":
                this.drawLoadingScreen();
                break;
                
            case "title":
                this.drawTitleScreen();
                break;
                
            case "playing":
            case "dialogue":
            case "paused":
                // Disegna lo sfondo
                this.drawBackground();
                
                // Disegna la mappa
                this.drawMap();
                
                // Disegna gli oggetti
                this.drawObjects();
                
                // Disegna gli NPC
                this.drawNPCs();
                
                // Disegna il giocatore
                if (this.player) {
                    this.player.draw(this.ctx, this.player.cameraOffsetX, this.player.cameraOffsetY);
                }
                
                // Disegna gli attacchi
                this.drawAttacks();
                
                // Disegna le particelle
                this.drawParticles();
                
                // Disegna l'UI
                if (this.ui) {
                    this.ui.draw(this.ctx, this);
                }
                
                // Disegna il dialogo
                if (this.gameState === "dialogue") {
                    this.drawDialogue();
                }
                
                // Disegna la schermata di pausa
                if (this.gameState === "paused") {
                    this.drawPauseScreen();
                }
                break;
                
            case "gameover":
                this.drawGameOverScreen();
                break;
        }
    }
    
    /**
     * Disegna la schermata di caricamento
     */
    drawLoadingScreen() {
        // Implementazione base, da sovrascrivere con la logica specifica del gioco
        this.ctx.fillStyle = "#2c3e50";
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        this.ctx.fillStyle = "#ecf0f1";
        this.ctx.font = "30px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText("Caricamento...", this.canvasWidth / 2, this.canvasHeight / 2);
    }
    
    /**
     * Disegna la schermata del titolo
     */
    drawTitleScreen() {
        // Implementazione base, da sovrascrivere con la logica specifica del gioco
        this.ctx.fillStyle = "#2c3e50";
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        this.ctx.fillStyle = "#ecf0f1";
        this.ctx.font = "40px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText("Mindworld", this.canvasWidth / 2, this.canvasHeight / 3);
        
        this.ctx.font = "20px Arial";
        this.ctx.fillText("Un'Avventura tra Due Mondi", this.canvasWidth / 2, this.canvasHeight / 3 + 40);
        
        this.ctx.font = "16px Arial";
        this.ctx.fillText("Premi SPAZIO per iniziare", this.canvasWidth / 2, this.canvasHeight / 2 + 100);
    }
    
    /**
     * Disegna lo sfondo
     */
    drawBackground() {
        // Se c'è un'immagine di sfondo, disegnala
        if (this.backgroundImage) {
            this.ctx.drawImage(
                this.backgroundImage,
                0, 0, this.canvasWidth, this.canvasHeight
            );
        } else {
            // Altrimenti, disegna un colore di sfondo
            this.ctx.fillStyle = "#87CEEB"; // Cielo azzurro
            this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        }
    }
    
    /**
     * Disegna la mappa
     */
    drawMap() {
        // Implementazione base, da sovrascrivere con la logica specifica del gioco
        // Qui si dovrebbe disegnare la mappa di tile in base alla posizione della camera
    }
    
    /**
     * Disegna gli oggetti
     */
    drawObjects() {
        for (const object of this.objects) {
            if (object.draw) {
                object.draw(this.ctx, this.player.cameraOffsetX, this.player.cameraOffsetY);
            }
        }
    }
    
    /**
     * Disegna gli NPC
     */
    drawNPCs() {
        for (const npc of this.npcs) {
            npc.draw(this.ctx, this.player.cameraOffsetX, this.player.cameraOffsetY);
        }
    }
    
    /**
     * Disegna gli attacchi
     */
    drawAttacks() {
        for (const attack of this.attacks) {
            // Posizione sullo schermo
            const screenX = attack.x - this.player.cameraOffsetX;
            const screenY = attack.y - this.player.cameraOffsetY;
            
            // Colore dell'attacco in base al tipo
            let color;
            switch (attack.type) {
                case "fah":
                    color = "#e74c3c";
                    break;
                case "brih":
                    color = "#3498db";
                    break;
                case "combined":
                    color = "#9b59b6";
                    break;
                default:
                    color = "#95a5a6";
            }
            
            // Disegna l'attacco come un cerchio
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, attack.range / 3, 0, Math.PI * 2);
            this.ctx.fillStyle = color + "80"; // 50% di opacità
            this.ctx.fill();
            
            // Disegna il contorno
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }
    
    /**
     * Disegna le particelle
     */
    drawParticles() {
        for (const particle of this.particles) {
            // Posizione sullo schermo
            const screenX = particle.x - this.player.cameraOffsetX;
            const screenY = particle.y - this.player.cameraOffsetY;
            
            // Disegna la particella
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
            this.ctx.fill();
        }
    }
    
    /**
     * Disegna il dialogo
     */
    drawDialogue() {
        if (!this.activeDialogue || !this.activeDialogueNPC) return;
        
        // Disegna la finestra di dialogo
        const dialogueWidth = this.canvasWidth * 0.8;
        const dialogueHeight = 150;
        const dialogueX = (this.canvasWidth - dialogueWidth) / 2;
        const dialogueY = this.canvasHeight - dialogueHeight - 20;
        
        // Sfondo
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        this.ctx.fillRect(dialogueX, dialogueY, dialogueWidth, dialogueHeight);
        
        // Bordo
        this.ctx.strokeStyle = "#3498db";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(dialogueX, dialogueY, dialogueWidth, dialogueHeight);
        
        // Nome del personaggio
        this.ctx.fillStyle = "#3498db";
        this.ctx.font = "18px Arial";
        this.ctx.textAlign = "left";
        this.ctx.fillText(this.activeDialogueNPC.name, dialogueX + 20, dialogueY + 30);
        
        // Testo del dialogo
        this.ctx.fillStyle = "#ecf0f1";
        this.ctx.font = "16px Arial";
        this.ctx.fillText(this.activeDialogue.text, dialogueX + 20, dialogueY + 60);
        
        // Opzioni di risposta
        if (this.activeDialogue.choices) {
            for (let i = 0; i < this.activeDialogue.choices.length; i++) {
                const choice = this.activeDialogue.choices[i];
                const choiceY = dialogueY + 90 + i * 25;
                
                // Evidenzia l'opzione selezionata
                if (i === this.selectedChoice) {
                    this.ctx.fillStyle = "#3498db";
                } else {
                    this.ctx.fillStyle = "#bdc3c7";
                }
                
                this.ctx.fillText(`${i + 1}. ${choice.text}`, dialogueX + 30, choiceY);
            }
        }
    }
    
    /**
     * Disegna la schermata di pausa
     */
    drawPauseScreen() {
        // Implementazione base, da sovrascrivere con la logica specifica del gioco
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        this.ctx.fillStyle = "#ecf0f1";
        this.ctx.font = "30px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText("Pausa", this.canvasWidth / 2, this.canvasHeight / 3);
        
        this.ctx.font = "16px Arial";
        this.ctx.fillText("Premi ESC per riprendere", this.canvasWidth / 2, this.canvasHeight / 2);
    }
    
    /**
     * Disegna la schermata di game over
     */
    drawGameOverScreen() {
        // Implementazione base, da sovrascrivere con la logica specifica del gioco
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        this.ctx.fillStyle = "#e74c3c";
        this.ctx.font = "40px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText("Game Over", this.canvasWidth / 2, this.canvasHeight / 3);
        
        this.ctx.fillStyle = "#ecf0f1";
        this.ctx.font = "16px Arial";
        this.ctx.fillText("Premi SPAZIO per ricominciare", this.canvasWidth / 2, this.canvasHeight / 2);
    }
    
    /**
     * Verifica se c'è una collisione in un punto
     * @param {number} x - Coordinata X
     * @param {number} y - Coordinata Y
     * @param {number} radius - Raggio di collisione
     * @returns {boolean} true se c'è una collisione
     */
    checkCollision(x, y, radius) {
        // Implementazione base, da sovrascrivere con la logica specifica del gioco
        // Qui si dovrebbe verificare la collisione con la mappa di collisione
        
        // Esempio: verifica se il punto è fuori dai limiti del mondo
        if (x - radius < 0 || x + radius > this.width || y - radius < 0 || y + radius > this.height) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Trova l'NPC interagibile più vicino
     * @param {number} x - Coordinata X
     * @param {number} y - Coordinata Y
     * @param {number} radius - Raggio di interazione
     * @returns {Character} NPC interagibile più vicino
     */
    findNearestInteractableNPC(x, y, radius) {
        let nearestNPC = null;
        let nearestDistance = radius;
        
        for (const npc of this.npcs) {
            const distance = Utils.distance(
                {x, y},
                {x: npc.x, y: npc.y}
            );
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestNPC = npc;
            }
        }
        
        return nearestNPC;
    }
    
    /**
     * Trova l'oggetto interagibile più vicino
     * @param {number} x - Coordinata X
     * @param {number} y - Coordinata Y
     * @param {number} radius - Raggio di interazione
     * @returns {Object} Oggetto interagibile più vicino
     */
    findNearestInteractableObject(x, y, radius) {
        let nearestObject = null;
        let nearestDistance = radius;
        
        for (const object of this.objects) {
            if (object.isInteractable) {
                const distance = Utils.distance(
                    {x, y},
                    {x: object.x, y: object.y}
                );
                
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestObject = object;
                }
            }
        }
        
        return nearestObject;
    }
    
    /**
     * Aggiunge un NPC al mondo
     * @param {Character} npc - NPC da aggiungere
     */
    addNPC(npc) {
        this.npcs.push(npc);
    }
    
    /**
     * Aggiunge un oggetto al mondo
     * @param {Object} object - Oggetto da aggiungere
     */
    addObject(object) {
        this.objects.push(object);
    }
    
    /**
     * Aggiunge un attacco al mondo
     * @param {Object} attack - Attacco da aggiungere
     */
    addAttack(attack) {
        this.attacks.push(attack);
    }
    
    /**
     * Avvia un dialogo
     * @param {Character} npc - NPC con cui dialogare
     * @param {Object} dialogNode - Nodo di dialogo iniziale
     */
    startDialogue(npc, dialogNode) {
        this.activeDialogueNPC = npc;
        this.activeDialogue = dialogNode;
        this.selectedChoice = 0;
        this.gameState = "dialogue";
    }
    
    /**
     * Termina un dialogo
     */
    endDialogue() {
        this.activeDialogueNPC = null;
        this.activeDialogue = null;
        this.gameState = "playing";
    }
    
    /**
     * Seleziona la scelta successiva nel dialogo
     */
    selectNextChoice() {
        if (this.activeDialogue && this.activeDialogue.choices) {
            this.selectedChoice = (this.selectedChoice + 1) % this.activeDialogue.choices.length;
        }
    }
    
    /**
     * Seleziona la scelta precedente nel dialogo
     */
    selectPreviousChoice() {
        if (this.activeDialogue && this.activeDialogue.choices) {
            this.selectedChoice = (this.selectedChoice - 1 + this.activeDialogue.choices.length) % this.activeDialogue.choices.length;
        }
    }
    
    /**
     * Conferma la scelta selezionata nel dialogo
     */
    confirmChoice() {
        if (this.activeDialogue && this.activeDialogue.choices && this.activeDialogueNPC) {
            const nextNode = this.activeDialogueNPC.continueDialogue(this.selectedChoice);
            
            if (nextNode) {
                this.activeDialogue = nextNode;
                this.selectedChoice = 0;
            } else {
                this.endDialogue();
            }
        }
    }
}

// Esporta la classe
window.World = World;
