/**
 * Mindworld - Sistema dell'interfaccia utente
 * 
 * Questo file contiene la classe UISystem che gestisce l'interfaccia utente del gioco,
 * inclusi menu, HUD, finestre di dialogo e notifiche.
 */

class UISystem {
    constructor(game) {
        // Riferimento al gioco
        this.game = game;
        
        // Stato dell'interfaccia
        this.state = "game"; // game, menu, inventory, quest, dialogue, map
        
        // Messaggi
        this.messages = [];
        this.maxMessages = 5;
        this.messageTimeout = 5; // secondi
        
        // Messaggi di chat (multiplayer)
        this.chatMessages = [];
        this.maxChatMessages = 10;
        
        // Dialogo corrente
        this.currentDialogue = null;
        
        // Menu corrente
        this.currentMenu = null;
        
        // Finestra corrente
        this.currentWindow = null;
        
        // Tooltip
        this.tooltip = null;
        
        // Elementi dell'interfaccia
        this.elements = {
            healthBar: {
                x: 20,
                y: 20,
                width: 200,
                height: 20,
                color: "#e74c3c",
                backgroundColor: "#34495e"
            },
            energyBar: {
                x: 20,
                y: 45,
                width: 200,
                height: 15,
                color: "#3498db",
                backgroundColor: "#34495e"
            },
            expBar: {
                x: 20,
                y: 65,
                width: 200,
                height: 5,
                color: "#f1c40f",
                backgroundColor: "#34495e"
            },
            minimap: {
                x: 20,
                y: 80,
                width: 150,
                height: 150,
                visible: false
            },
            questTracker: {
                x: 20,
                y: 240,
                width: 250,
                height: 150,
                visible: true
            },
            abilityBar: {
                x: 20,
                y: 400,
                width: 400,
                height: 50,
                visible: true
            }
        };
        
        // Pulsanti
        this.buttons = [
            {
                id: "inventory",
                x: 20,
                y: 500,
                width: 100,
                height: 30,
                text: "Inventario",
                action: () => this.toggleInventory()
            },
            {
                id: "quests",
                x: 130,
                y: 500,
                width: 100,
                height: 30,
                text: "Missioni",
                action: () => this.toggleQuestLog()
            },
            {
                id: "map",
                x: 240,
                y: 500,
                width: 100,
                height: 30,
                text: "Mappa",
                action: () => this.toggleMap()
            },
            {
                id: "menu",
                x: 350,
                y: 500,
                width: 100,
                height: 30,
                text: "Menu",
                action: () => this.toggleMenu()
            }
        ];
        
        // Immagini dell'interfaccia
        this.images = {
            healthIcon: null,
            energyIcon: null,
            expIcon: null,
            inventoryIcon: null,
            questIcon: null,
            mapIcon: null,
            menuIcon: null
        };
        
        // Carica le immagini
        this.loadImages();
        
        // Inizializza gli eventi dell'interfaccia
        this.initEvents();
    }
    
    /**
     * Carica le immagini dell'interfaccia
     */
    loadImages() {
        // Implementazione base, da espandere con il caricamento delle immagini
        // In una versione completa, qui si caricherebbero le immagini da Assets
    }
    
    /**
     * Inizializza gli eventi dell'interfaccia
     */
    initEvents() {
        // Implementazione base, da espandere con la gestione degli eventi
        // In una versione completa, qui si aggiungerebbero gli event listener
    }
    
    /**
     * Aggiunge un messaggio
     * @param {string} text - Testo del messaggio
     * @param {string} type - Tipo del messaggio (info, warning, error, success)
     */
    addMessage(text, type = "info") {
        const message = {
            text: text,
            type: type,
            time: this.messageTimeout
        };
        
        this.messages.push(message);
        
        // Limita il numero di messaggi
        if (this.messages.length > this.maxMessages) {
            this.messages.shift();
        }
    }
    
    /**
     * Aggiunge un messaggio di chat
     * @param {string} sender - Nome del mittente
     * @param {string} text - Testo del messaggio
     */
    addChatMessage(sender, text) {
        const message = {
            sender: sender,
            text: text,
            time: new Date()
        };
        
        this.chatMessages.push(message);
        
        // Limita il numero di messaggi di chat
        if (this.chatMessages.length > this.maxChatMessages) {
            this.chatMessages.shift();
        }
    }
    
    /**
     * Mostra un dialogo
     * @param {Object} dialogue - Dialogo da mostrare
     */
    showDialogue(dialogue) {
        this.currentDialogue = dialogue;
        this.state = "dialogue";
    }
    
    /**
     * Nasconde il dialogo corrente
     */
    hideDialogue() {
        this.currentDialogue = null;
        this.state = "game";
    }
    
    /**
     * Seleziona un'opzione di dialogo
     * @param {number} optionIndex - Indice dell'opzione
     */
    selectDialogueOption(optionIndex) {
        if (this.game.quests) {
            this.game.quests.selectDialogueOption(optionIndex);
        }
    }
    
    /**
     * Mostra un menu
     * @param {string} menuId - ID del menu
     */
    showMenu(menuId) {
        // Implementazione base, da espandere con i vari tipi di menu
        this.currentMenu = menuId;
        this.state = "menu";
    }
    
    /**
     * Nasconde il menu corrente
     */
    hideMenu() {
        this.currentMenu = null;
        this.state = "game";
    }
    
    /**
     * Alterna la visualizzazione dell'inventario
     */
    toggleInventory() {
        if (this.state === "inventory") {
            this.state = "game";
        } else {
            this.state = "inventory";
        }
    }
    
    /**
     * Alterna la visualizzazione del registro delle missioni
     */
    toggleQuestLog() {
        if (this.state === "quest") {
            this.state = "game";
        } else {
            this.state = "quest";
        }
    }
    
    /**
     * Alterna la visualizzazione della mappa
     */
    toggleMap() {
        if (this.state === "map") {
            this.state = "game";
        } else {
            this.state = "map";
        }
    }
    
    /**
     * Alterna la visualizzazione del menu principale
     */
    toggleMenu() {
        if (this.state === "menu") {
            this.state = "game";
        } else {
            this.showMenu("main");
        }
    }
    
    /**
     * Mostra un tooltip
     * @param {string} text - Testo del tooltip
     * @param {number} x - Coordinata X
     * @param {number} y - Coordinata Y
     */
    showTooltip(text, x, y) {
        this.tooltip = {
            text: text,
            x: x,
            y: y
        };
    }
    
    /**
     * Nasconde il tooltip corrente
     */
    hideTooltip() {
        this.tooltip = null;
    }
    
    /**
     * Gestisce un click dell'utente
     * @param {number} x - Coordinata X del click
     * @param {number} y - Coordinata Y del click
     * @returns {boolean} True se il click è stato gestito dall'interfaccia
     */
    handleClick(x, y) {
        // Verifica se il click è su un pulsante
        for (const button of this.buttons) {
            if (x >= button.x && x <= button.x + button.width &&
                y >= button.y && y <= button.y + button.height) {
                // Esegui l'azione del pulsante
                button.action();
                return true;
            }
        }
        
        // Gestisci il click in base allo stato dell'interfaccia
        switch (this.state) {
            case "dialogue":
                // Verifica se il click è su un'opzione di dialogo
                if (this.currentDialogue && this.currentDialogue.dialogue.options) {
                    const options = this.currentDialogue.dialogue.options;
                    const startY = 400;
                    const optionHeight = 20;
                    
                    for (let i = 0; i < options.length; i++) {
                        if (x >= 70 && x <= 700 &&
                            y >= startY + i * optionHeight && y <= startY + (i + 1) * optionHeight) {
                            this.selectDialogueOption(i);
                            return true;
                        }
                    }
                }
                break;
                
            case "inventory":
                // Gestisci il click nell'inventario
                if (this.game.inventory) {
                    // Implementazione base, da espandere con la gestione del click nell'inventario
                }
                break;
                
            case "quest":
                // Gestisci il click nel registro delle missioni
                // Implementazione base, da espandere con la gestione del click nel registro delle missioni
                break;
                
            case "map":
                // Gestisci il click sulla mappa
                // Implementazione base, da espandere con la gestione del click sulla mappa
                break;
                
            case "menu":
                // Gestisci il click nel menu
                // Implementazione base, da espandere con la gestione del click nel menu
                break;
        }
        
        return false;
    }
    
    /**
     * Gestisce la pressione di un tasto
     * @param {string} key - Tasto premuto
     * @returns {boolean} True se il tasto è stato gestito dall'interfaccia
     */
    handleKeyPress(key) {
        // Gestisci il tasto in base allo stato dell'interfaccia
        switch (this.state) {
            case "dialogue":
                // Verifica se il tasto è un numero per selezionare un'opzione di dialogo
                if (this.currentDialogue && this.currentDialogue.dialogue.options) {
                    const optionIndex = parseInt(key) - 1;
                    if (optionIndex >= 0 && optionIndex < this.currentDialogue.dialogue.options.length) {
                        this.selectDialogueOption(optionIndex);
                        return true;
                    }
                }
                
                // Premi Spazio o Invio per continuare il dialogo
                if (key === " " || key === "Enter") {
                    // Se non ci sono opzioni, chiudi il dialogo
                    if (!this.currentDialogue.dialogue.options || this.currentDialogue.dialogue.options.length === 0) {
                        this.hideDialogue();
                    }
                    return true;
                }
                break;
                
            case "inventory":
                // Premi I o Esc per chiudere l'inventario
                if (key === "i" || key === "Escape") {
                    this.toggleInventory();
                    return true;
                }
                break;
                
            case "quest":
                // Premi Q o Esc per chiudere il registro delle missioni
                if (key === "q" || key === "Escape") {
                    this.toggleQuestLog();
                    return true;
                }
                break;
                
            case "map":
                // Premi M o Esc per chiudere la mappa
                if (key === "m" || key === "Escape") {
                    this.toggleMap();
                    return true;
                }
                break;
                
            case "menu":
                // Premi Esc per chiudere il menu
                if (key === "Escape") {
                    this.toggleMenu();
                    return true;
                }
                break;
                
            case "game":
                // Premi I per aprire l'inventario
                if (key === "i") {
                    this.toggleInventory();
                    return true;
                }
                
                // Premi Q per aprire il registro delle missioni
                if (key === "q") {
                    this.toggleQuestLog();
                    return true;
                }
                
                // Premi M per aprire la mappa
                if (key === "m") {
                    this.toggleMap();
                    return true;
                }
                
                // Premi Esc per aprire il menu
                if (key === "Escape") {
                    this.toggleMenu();
                    return true;
                }
                break;
        }
        
        return false;
    }
    
    /**
     * Aggiorna l'interfaccia utente
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    update(deltaTime) {
        // Aggiorna i messaggi
        for (let i = this.messages.length - 1; i >= 0; i--) {
            this.messages[i].time -= deltaTime;
            
            if (this.messages[i].time <= 0) {
                this.messages.splice(i, 1);
            }
        }
    }
    
    /**
     * Disegna l'interfaccia utente
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    draw(ctx) {
        // Disegna l'HUD
        this.drawHUD(ctx);
        
        // Disegna i messaggi
        this.drawMessages(ctx);
        
        // Disegna l'interfaccia in base allo stato
        switch (this.state) {
            case "dialogue":
                this.drawDialogue(ctx);
                break;
                
            case "inventory":
                this.drawInventory(ctx);
                break;
                
            case "quest":
                this.drawQuestLog(ctx);
                break;
                
            case "map":
                this.drawMap(ctx);
                break;
                
            case "menu":
                this.drawMenu(ctx);
                break;
        }
        
        // Disegna i pulsanti
        this.drawButtons(ctx);
        
        // Disegna il tooltip
        if (this.tooltip) {
            this.drawTooltip(ctx);
        }
    }
    
    /**
     * Disegna l'HUD
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawHUD(ctx) {
        if (!this.game.player) return;
        
        // Disegna la barra della salute
        const healthBar = this.elements.healthBar;
        const healthPercentage = this.game.player.health / this.game.player.maxHealth;
        
        ctx.fillStyle = healthBar.backgroundColor;
        ctx.fillRect(healthBar.x, healthBar.y, healthBar.width, healthBar.height);
        
        ctx.fillStyle = healthBar.color;
        ctx.fillRect(healthBar.x, healthBar.y, healthBar.width * healthPercentage, healthBar.height);
        
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.strokeRect(healthBar.x, healthBar.y, healthBar.width, healthBar.height);
        
        ctx.fillStyle = "#fff";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${Math.floor(this.game.player.health)}/${this.game.player.maxHealth}`, healthBar.x + healthBar.width / 2, healthBar.y + 15);
        
        // Disegna la barra dell'energia
        const energyBar = this.elements.energyBar;
        const energyPercentage = this.game.player.energy / this.game.player.maxEnergy;
        
        ctx.fillStyle = energyBar.backgroundColor;
        ctx.fillRect(energyBar.x, energyBar.y, energyBar.width, energyBar.height);
        
        ctx.fillStyle = energyBar.color;
        ctx.fillRect(energyBar.x, energyBar.y, energyBar.width * energyPercentage, energyBar.height);
        
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.strokeRect(energyBar.x, energyBar.y, energyBar.width, energyBar.height);
        
        ctx.fillStyle = "#fff";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${Math.floor(this.game.player.energy)}/${this.game.player.maxEnergy}`, energyBar.x + energyBar.width / 2, energyBar.y + 12);
        
        // Disegna la barra dell'esperienza
        const expBar = this.elements.expBar;
        const expPercentage = this.game.player.experience / this.game.player.experienceToNextLevel;
        
        ctx.fillStyle = expBar.backgroundColor;
        ctx.fillRect(expBar.x, expBar.y, expBar.width, expBar.height);
        
        ctx.fillStyle = expBar.color;
        ctx.fillRect(expBar.x, expBar.y, expBar.width * expPercentage, expBar.height);
        
        // Disegna il livello del giocatore
        ctx.fillStyle = "#fff";
        ctx.font = "12px Arial";
        ctx.textAlign = "left";
        ctx.fillText(`Livello ${this.game.player.level}`, expBar.x + expBar.width + 10, expBar.y + 5);
        
        // Disegna il tracker delle missioni
        if (this.elements.questTracker.visible && this.game.quests) {
            this.drawQuestTracker(ctx);
        }
        
        // Disegna la barra delle abilità
        if (this.elements.abilityBar.visible) {
            this.drawAbilityBar(ctx);
        }
    }
    
    /**
     * Disegna il tracker delle missioni
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawQuestTracker(ctx) {
        const questTracker = this.elements.questTracker;
        
        // Disegna lo sfondo
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(questTracker.x, questTracker.y, questTracker.width, questTracker.height);
        
        ctx.strokeStyle = "#3498db";
        ctx.lineWidth = 1;
        ctx.strokeRect(questTracker.x, questTracker.y, questTracker.width, questTracker.height);
        
        // Disegna il titolo
        ctx.fillStyle = "#f39c12";
        ctx.font = "14px Arial";
        ctx.textAlign = "left";
        ctx.fillText("Missioni Attive", questTracker.x + 10, questTracker.y + 20);
        
        // Disegna le missioni attive
        if (this.game.quests) {
            const activeQuests = this.game.quests.getAllActiveQuests();
            let y = questTracker.y + 40;
            
            for (const quest of activeQuests) {
                // Disegna il titolo della missione
                ctx.fillStyle = "#fff";
                ctx.font = "12px Arial";
                ctx.fillText(quest.title, questTracker.x + 10, y);
                y += 15;
                
                // Disegna gli obiettivi
                for (const objective of quest.objectives) {
                    const status = objective.completed ? "✓" : "○";
                    ctx.fillStyle = objective.completed ? "#2ecc71" : "#bdc3c7";
                    ctx.fillText(`${status} ${objective.description}`, questTracker.x + 20, y);
                    y += 15;
                }
                
                y += 5;
                
                // Evita di disegnare troppe missioni
                if (y > questTracker.y + questTracker.height - 15) {
                    ctx.fillStyle = "#bdc3c7";
                    ctx.fillText("...", questTracker.x + 10, y);
                    break;
                }
            }
        }
    }
    
    /**
     * Disegna la barra delle abilità
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawAbilityBar(ctx) {
        const abilityBar = this.elements.abilityBar;
        
        // Disegna lo sfondo
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(abilityBar.x, abilityBar.y, abilityBar.width, abilityBar.height);
        
        // Disegna le abilità
        if (this.game.player && this.game.player.abilities) {
            const abilities = [
                ...this.game.player.abilities.fah,
                ...this.game.player.abilities.brih,
                ...this.game.player.abilities.combined
            ];
            
            const slotWidth = 40;
            const slotHeight = 40;
            const slotMargin = 5;
            
            for (let i = 0; i < abilities.length; i++) {
                const x = abilityBar.x + 10 + i * (slotWidth + slotMargin);
                const y = abilityBar.y + 5;
                
                // Disegna lo slot
                ctx.fillStyle = "#34495e";
                ctx.fillRect(x, y, slotWidth, slotHeight);
                
                ctx.strokeStyle = "#2c3e50";
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, slotWidth, slotHeight);
                
                // Disegna l'icona dell'abilità
                const abilityId = abilities[i];
                const ability = this.game.combatSystem ? this.game.combatSystem.attacks[abilityId] : null;
                
                if (ability) {
                    // Disegna un colore di sfondo in base al tipo di abilità
                    if (ability.type === "fah") {
                        ctx.fillStyle = "rgba(231, 76, 60, 0.5)";
                    } else if (ability.type === "brih") {
                        ctx.fillStyle = "rgba(52, 152, 219, 0.5)";
                    } else if (ability.type === "combined") {
                        ctx.fillStyle = "rgba(155, 89, 182, 0.5)";
                    }
                    
                    ctx.fillRect(x, y, slotWidth, slotHeight);
                    
                    // Disegna il testo dell'abilità
                    ctx.fillStyle = "#fff";
                    ctx.font = "10px Arial";
                    ctx.textAlign = "center";
                    ctx.fillText(ability.name.substring(0, 8), x + slotWidth / 2, y + slotHeight / 2);
                    
                    // Disegna il tasto di scelta rapida
                    ctx.fillStyle = "#f1c40f";
                    ctx.font = "12px Arial";
                    ctx.fillText(ability.keyBinding, x + slotWidth / 2, y + slotHeight - 5);
                    
                    // Disegna il cooldown
                    if (this.game.combatSystem && this.game.combatSystem.cooldowns[abilityId] > 0) {
                        const cooldown = this.game.combatSystem.cooldowns[abilityId];
                        
                        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                        ctx.fillRect(x, y, slotWidth, slotHeight);
                        
                        ctx.fillStyle = "#fff";
                        ctx.font = "14px Arial";
                        ctx.fillText(cooldown.toFixed(1), x + slotWidth / 2, y + slotHeight / 2);
                    }
                }
            }
        }
    }
    
    /**
     * Disegna i messaggi
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawMessages(ctx) {
        let y = ctx.canvas.height - 150;
        
        for (let i = this.messages.length - 1; i >= 0; i--) {
            const message = this.messages[i];
            
            // Calcola l'opacità in base al tempo rimanente
            const opacity = Math.min(1, message.time / 2);
            
            // Scegli il colore in base al tipo di messaggio
            let color;
            switch (message.type) {
                case "info":
                    color = `rgba(52, 152, 219, ${opacity})`;
                    break;
                case "warning":
                    color = `rgba(241, 196, 15, ${opacity})`;
                    break;
                case "error":
                    color = `rgba(231, 76, 60, ${opacity})`;
                    break;
                case "success":
                    color = `rgba(46, 204, 113, ${opacity})`;
                    break;
                default:
                    color = `rgba(236, 240, 241, ${opacity})`;
            }
            
            // Disegna lo sfondo del messaggio
            ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.7})`;
            ctx.fillRect(ctx.canvas.width - 310, y - 20, 300, 25);
            
            // Disegna il bordo del messaggio
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.strokeRect(ctx.canvas.width - 310, y - 20, 300, 25);
            
            // Disegna il testo del messaggio
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.font = "12px Arial";
            ctx.textAlign = "left";
            ctx.fillText(message.text, ctx.canvas.width - 300, y);
            
            y -= 30;
        }
    }
    
    /**
     * Disegna i pulsanti
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawButtons(ctx) {
        for (const button of this.buttons) {
            // Disegna lo sfondo del pulsante
            ctx.fillStyle = "#34495e";
            ctx.fillRect(button.x, button.y, button.width, button.height);
            
            // Disegna il bordo del pulsante
            ctx.strokeStyle = "#2c3e50";
            ctx.lineWidth = 2;
            ctx.strokeRect(button.x, button.y, button.width, button.height);
            
            // Disegna il testo del pulsante
            ctx.fillStyle = "#ecf0f1";
            ctx.font = "14px Arial";
            ctx.textAlign = "center";
            ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2 + 5);
        }
    }
    
    /**
     * Disegna il tooltip
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawTooltip(ctx) {
        if (!this.tooltip) return;
        
        // Calcola le dimensioni del tooltip
        ctx.font = "12px Arial";
        const textWidth = ctx.measureText(this.tooltip.text).width;
        const tooltipWidth = textWidth + 20;
        const tooltipHeight = 25;
        
        // Calcola la posizione del tooltip
        let x = this.tooltip.x;
        let y = this.tooltip.y - tooltipHeight - 10;
        
        // Assicurati che il tooltip non esca dallo schermo
        if (x + tooltipWidth > ctx.canvas.width) {
            x = ctx.canvas.width - tooltipWidth;
        }
        
        if (y < 0) {
            y = this.tooltip.y + 10;
        }
        
        // Disegna lo sfondo del tooltip
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(x, y, tooltipWidth, tooltipHeight);
        
        // Disegna il bordo del tooltip
        ctx.strokeStyle = "#3498db";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, tooltipWidth, tooltipHeight);
        
        // Disegna il testo del tooltip
        ctx.fillStyle = "#ecf0f1";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.tooltip.text, x + tooltipWidth / 2, y + tooltipHeight / 2 + 4);
    }
    
    /**
     * Disegna il dialogo
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawDialogue(ctx) {
        if (!this.currentDialogue) return;
        
        const dialogue = this.currentDialogue.dialogue;
        
        // Disegna lo sfondo del dialogo
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(50, ctx.canvas.height - 200, ctx.canvas.width - 100, 150);
        
        ctx.strokeStyle = "#3498db";
        ctx.lineWidth = 2;
        ctx.strokeRect(50, ctx.canvas.height - 200, ctx.canvas.width - 100, 150);
        
        // Disegna il nome dell'NPC
        ctx.fillStyle = "#f39c12";
        ctx.font = "18px Arial";
        ctx.textAlign = "left";
        ctx.fillText(this.currentDialogue.npcId, 70, ctx.canvas.height - 175);
        
        // Disegna il testo del dialogo
        ctx.fillStyle = "#ecf0f1";
        ctx.font = "16px Arial";
        ctx.textAlign = "left";
        
        // Dividi il testo in righe
        const maxWidth = ctx.canvas.width - 140;
        const words = dialogue.text.split(" ");
        let line = "";
        let y = ctx.canvas.height - 150;
        
        for (const word of words) {
            const testLine = line + word + " ";
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth) {
                ctx.fillText(line, 70, y);
                line = word + " ";
                y += 20;
            } else {
                line = testLine;
            }
        }
        
        ctx.fillText(line, 70, y);
        
        // Disegna le opzioni di dialogo
        if (dialogue.options) {
            y += 30;
            
            for (let i = 0; i < dialogue.options.length; i++) {
                const option = dialogue.options[i];
                
                ctx.fillStyle = "#3498db";
                ctx.fillText(`${i + 1}. ${option.text}`, 70, y);
                y += 20;
            }
        }
    }
    
    /**
     * Disegna l'inventario
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawInventory(ctx) {
        // Disegna lo sfondo dell'inventario
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(50, 50, ctx.canvas.width - 100, ctx.canvas.height - 100);
        
        ctx.strokeStyle = "#3498db";
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 50, ctx.canvas.width - 100, ctx.canvas.height - 100);
        
        // Disegna il titolo
        ctx.fillStyle = "#ecf0f1";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Inventario", ctx.canvas.width / 2, 80);
        
        // Disegna il denaro
        if (this.game.inventory) {
            ctx.font = "16px Arial";
            ctx.textAlign = "left";
            ctx.fillText(`Denaro: ${this.game.inventory.money} monete`, 70, 110);
            
            // Disegna gli oggetti
            let y = 140;
            for (const item of this.game.inventory.items) {
                const itemData = this.game.inventory.getItemData(item.id);
                
                if (itemData) {
                    ctx.fillText(`${itemData.name} x${item.quantity}`, 70, y);
                    y += 25;
                    
                    // Evita di disegnare troppi oggetti
                    if (y > ctx.canvas.height - 70) {
                        ctx.fillText("...", 70, y);
                        break;
                    }
                }
            }
            
            // Disegna l'equipaggiamento
            ctx.textAlign = "center";
            ctx.fillText("Equipaggiamento", ctx.canvas.width - 200, 140);
            
            y = 170;
            for (const slot in this.game.inventory.equipment) {
                const itemId = this.game.inventory.equipment[slot];
                
                if (itemId) {
                    const itemData = this.game.inventory.getItemData(itemId);
                    ctx.fillText(`${slot}: ${itemData.name}`, ctx.canvas.width - 200, y);
                } else {
                    ctx.fillText(`${slot}: -`, ctx.canvas.width - 200, y);
                }
                
                y += 25;
            }
        }
    }
    
    /**
     * Disegna il registro delle missioni
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawQuestLog(ctx) {
        // Disegna lo sfondo del registro delle missioni
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(50, 50, ctx.canvas.width - 100, ctx.canvas.height - 100);
        
        ctx.strokeStyle = "#3498db";
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 50, ctx.canvas.width - 100, ctx.canvas.height - 100);
        
        // Disegna il titolo
        ctx.fillStyle = "#ecf0f1";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Registro delle Missioni", ctx.canvas.width / 2, 80);
        
        // Disegna le missioni attive
        if (this.game.quests) {
            const activeQuests = this.game.quests.getAllActiveQuests();
            
            ctx.font = "18px Arial";
            ctx.textAlign = "left";
            ctx.fillStyle = "#f39c12";
            ctx.fillText("Missioni Attive", 70, 120);
            
            let y = 150;
            for (const quest of activeQuests) {
                // Disegna il titolo della missione
                ctx.fillStyle = "#ecf0f1";
                ctx.font = "16px Arial";
                ctx.fillText(quest.title, 70, y);
                y += 20;
                
                // Disegna la descrizione della missione
                ctx.font = "14px Arial";
                ctx.fillStyle = "#bdc3c7";
                
                // Dividi la descrizione in righe
                const maxWidth = ctx.canvas.width - 140;
                const words = quest.description.split(" ");
                let line = "";
                
                for (const word of words) {
                    const testLine = line + word + " ";
                    const metrics = ctx.measureText(testLine);
                    
                    if (metrics.width > maxWidth) {
                        ctx.fillText(line, 70, y);
                        line = word + " ";
                        y += 20;
                    } else {
                        line = testLine;
                    }
                }
                
                ctx.fillText(line, 70, y);
                y += 30;
                
                // Disegna gli obiettivi
                ctx.fillStyle = "#3498db";
                ctx.fillText("Obiettivi:", 70, y);
                y += 20;
                
                for (const objective of quest.objectives) {
                    const status = objective.completed ? "✓" : "○";
                    ctx.fillStyle = objective.completed ? "#2ecc71" : "#bdc3c7";
                    ctx.fillText(`${status} ${objective.description}`, 90, y);
                    y += 20;
                }
                
                y += 20;
                
                // Evita di disegnare troppe missioni
                if (y > ctx.canvas.height - 70) {
                    ctx.fillStyle = "#bdc3c7";
                    ctx.fillText("...", 70, y);
                    break;
                }
            }
            
            // Disegna le missioni completate
            const completedQuests = this.game.quests.getAllCompletedQuests();
            
            if (completedQuests.length > 0) {
                ctx.font = "18px Arial";
                ctx.textAlign = "left";
                ctx.fillStyle = "#f39c12";
                ctx.fillText("Missioni Completate", ctx.canvas.width / 2 + 50, 120);
                
                y = 150;
                for (const quest of completedQuests) {
                    ctx.fillStyle = "#2ecc71";
                    ctx.font = "16px Arial";
                    ctx.fillText(`✓ ${quest.title}`, ctx.canvas.width / 2 + 50, y);
                    y += 30;
                    
                    // Evita di disegnare troppe missioni
                    if (y > ctx.canvas.height - 70) {
                        ctx.fillStyle = "#bdc3c7";
                        ctx.fillText("...", ctx.canvas.width / 2 + 50, y);
                        break;
                    }
                }
            }
        }
    }
    
    /**
     * Disegna la mappa
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawMap(ctx) {
        // Disegna lo sfondo della mappa
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(50, 50, ctx.canvas.width - 100, ctx.canvas.height - 100);
        
        ctx.strokeStyle = "#3498db";
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 50, ctx.canvas.width - 100, ctx.canvas.height - 100);
        
        // Disegna il titolo
        ctx.fillStyle = "#ecf0f1";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Mappa", ctx.canvas.width / 2, 80);
        
        // Disegna la mappa
        if (this.game.levelManager && this.game.levelManager.levels) {
            const levels = this.game.levelManager.levels;
            const currentLevel = this.game.levelManager.currentLevel;
            
            // Calcola le dimensioni della mappa
            const mapWidth = ctx.canvas.width - 200;
            const mapHeight = ctx.canvas.height - 200;
            const mapX = 100;
            const mapY = 100;
            
            // Disegna i livelli
            for (const levelId in levels) {
                const level = levels[levelId];
                
                // Calcola la posizione del livello sulla mappa
                const x = mapX + Math.random() * mapWidth;
                const y = mapY + Math.random() * mapHeight;
                
                // Disegna il livello
                ctx.fillStyle = level === currentLevel ? "#e74c3c" : "#3498db";
                ctx.beginPath();
                ctx.arc(x, y, 10, 0, Math.PI * 2);
                ctx.fill();
                
                // Disegna il nome del livello
                ctx.fillStyle = "#ecf0f1";
                ctx.font = "12px Arial";
                ctx.textAlign = "center";
                ctx.fillText(level.name, x, y - 15);
                
                // Disegna le connessioni
                if (level.connections) {
                    for (const connection of level.connections) {
                        const targetLevel = levels[connection.levelId];
                        
                        if (targetLevel) {
                            // Calcola la posizione del livello di destinazione
                            const targetX = mapX + Math.random() * mapWidth;
                            const targetY = mapY + Math.random() * mapHeight;
                            
                            // Disegna la linea di connessione
                            ctx.strokeStyle = "#bdc3c7";
                            ctx.lineWidth = 1;
                            ctx.beginPath();
                            ctx.moveTo(x, y);
                            ctx.lineTo(targetX, targetY);
                            ctx.stroke();
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Disegna il menu
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawMenu(ctx) {
        // Disegna lo sfondo del menu
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Disegna il titolo
        ctx.fillStyle = "#ecf0f1";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Menu", ctx.canvas.width / 2, 100);
        
        // Disegna le opzioni del menu
        const options = [
            "Continua",
            "Opzioni",
            "Aiuto",
            "Esci"
        ];
        
        const optionHeight = 50;
        const startY = 200;
        
        for (let i = 0; i < options.length; i++) {
            const y = startY + i * optionHeight;
            
            // Disegna lo sfondo dell'opzione
            ctx.fillStyle = "#34495e";
            ctx.fillRect(ctx.canvas.width / 2 - 100, y - 20, 200, 40);
            
            // Disegna il bordo dell'opzione
            ctx.strokeStyle = "#2c3e50";
            ctx.lineWidth = 2;
            ctx.strokeRect(ctx.canvas.width / 2 - 100, y - 20, 200, 40);
            
            // Disegna il testo dell'opzione
            ctx.fillStyle = "#ecf0f1";
            ctx.font = "20px Arial";
            ctx.textAlign = "center";
            ctx.fillText(options[i], ctx.canvas.width / 2, y + 5);
        }
    }
}
