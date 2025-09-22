/**
 * Mindworld - Sistema di missioni
 * 
 * Questo file contiene le classi e le funzioni per la gestione delle missioni,
 * inclusi obiettivi, ricompense e dialoghi.
 */

class QuestSystem {
    constructor(game) {
        // Riferimento al gioco
        this.game = game;
        
        // Database delle missioni
        this.questDatabase = {};
        
        // Missioni attive
        this.activeQuests = [];
        
        // Missioni completate
        this.completedQuests = [];
        
        // Database dei dialoghi
        this.dialogueDatabase = {};
        
        // Dialogo corrente
        this.currentDialogue = null;
        
        // Carica i dati delle missioni
        this.loadQuests();
    }
    
    /**
     * Carica i dati delle missioni dal file JSON
     */
    loadQuests() {
        const questsData = Assets.getData("quests");
        
        if (questsData) {
            // Carica le missioni
            if (questsData.quests) {
                for (const quest of questsData.quests) {
                    this.questDatabase[quest.id] = quest;
                    
                    // Attiva le missioni iniziali
                    if (quest.status === "active") {
                        this.activeQuests.push(quest);
                    }
                }
            }
            
            // Carica i dialoghi
            if (questsData.dialogues) {
                for (const npcId in questsData.dialogues) {
                    this.dialogueDatabase[npcId] = {};
                    
                    for (const dialogue of questsData.dialogues[npcId]) {
                        this.dialogueDatabase[npcId][dialogue.id] = dialogue;
                    }
                }
            }
            
            console.log(`Caricate ${Object.keys(this.questDatabase).length} missioni e dialoghi per ${Object.keys(this.dialogueDatabase).length} NPC`);
        }
    }
    
    /**
     * Attiva una missione
     * @param {string} questId - ID della missione
     * @returns {boolean} True se la missione è stata attivata con successo
     */
    activateQuest(questId) {
        // Verifica se la missione esiste
        if (!this.questDatabase[questId]) {
            console.error(`Missione non trovata: ${questId}`);
            return false;
        }
        
        // Verifica se la missione è già attiva
        if (this.isQuestActive(questId)) {
            console.log(`La missione ${questId} è già attiva`);
            return false;
        }
        
        // Verifica se la missione è già completata
        if (this.isQuestCompleted(questId)) {
            console.log(`La missione ${questId} è già completata`);
            return false;
        }
        
        // Attiva la missione
        const quest = this.questDatabase[questId];
        quest.status = "active";
        this.activeQuests.push(quest);
        
        // Notifica l'attivazione della missione
        console.log(`Missione attivata: ${quest.title}`);
        
        // Aggiungi un messaggio al gioco
        if (this.game.ui) {
            this.game.ui.addMessage(`Nuova missione: ${quest.title}`);
        }
        
        return true;
    }
    
    /**
     * Completa una missione
     * @param {string} questId - ID della missione
     * @returns {boolean} True se la missione è stata completata con successo
     */
    completeQuest(questId) {
        // Verifica se la missione è attiva
        if (!this.isQuestActive(questId)) {
            console.error(`La missione ${questId} non è attiva`);
            return false;
        }
        
        // Trova la missione
        const questIndex = this.activeQuests.findIndex(q => q.id === questId);
        if (questIndex === -1) {
            console.error(`Missione non trovata: ${questId}`);
            return false;
        }
        
        const quest = this.activeQuests[questIndex];
        
        // Verifica se tutti gli obiettivi sono completati
        if (!this.areAllObjectivesCompleted(quest)) {
            console.log(`Non tutti gli obiettivi della missione ${questId} sono completati`);
            return false;
        }
        
        // Rimuovi la missione dalle missioni attive
        this.activeQuests.splice(questIndex, 1);
        
        // Aggiungi la missione alle missioni completate
        quest.status = "completed";
        this.completedQuests.push(quest);
        
        // Assegna le ricompense
        this.giveQuestRewards(quest);
        
        // Attiva la missione successiva, se presente
        if (quest.nextQuest) {
            this.activateQuest(quest.nextQuest);
        }
        
        // Notifica il completamento della missione
        console.log(`Missione completata: ${quest.title}`);
        
        // Aggiungi un messaggio al gioco
        if (this.game.ui) {
            this.game.ui.addMessage(`Missione completata: ${quest.title}`);
        }
        
        return true;
    }
    
    /**
     * Verifica se tutti gli obiettivi di una missione sono completati
     * @param {Object} quest - Missione
     * @returns {boolean} True se tutti gli obiettivi sono completati
     */
    areAllObjectivesCompleted(quest) {
        return quest.objectives.every(objective => objective.completed);
    }
    
    /**
     * Assegna le ricompense di una missione
     * @param {Object} quest - Missione
     */
    giveQuestRewards(quest) {
        if (!quest.rewards) return;
        
        for (const reward of quest.rewards) {
            switch (reward.type) {
                case "item":
                    // Aggiungi l'oggetto all'inventario
                    if (this.game.inventory) {
                        this.game.inventory.addItem(reward.id, reward.quantity);
                    }
                    break;
                    
                case "exp":
                    // Aggiungi esperienza al giocatore
                    if (this.game.player) {
                        this.game.player.addExperience(reward.value);
                    }
                    break;
                    
                case "money":
                    // Aggiungi denaro all'inventario
                    if (this.game.inventory) {
                        this.game.inventory.money += reward.value;
                    }
                    break;
                    
                case "ability":
                    // Sblocca un'abilità
                    if (this.game.player) {
                        this.game.player.unlockAbility(reward.id);
                    }
                    break;
            }
        }
        
        // Notifica le ricompense
        console.log(`Ricompense assegnate per la missione ${quest.title}`);
    }
    
    /**
     * Aggiorna lo stato di un obiettivo
     * @param {string} questId - ID della missione
     * @param {string} objectiveId - ID dell'obiettivo
     * @param {boolean} completed - Stato di completamento
     * @returns {boolean} True se l'obiettivo è stato aggiornato con successo
     */
    updateObjective(questId, objectiveId, completed) {
        // Verifica se la missione è attiva
        if (!this.isQuestActive(questId)) {
            console.error(`La missione ${questId} non è attiva`);
            return false;
        }
        
        // Trova la missione
        const quest = this.activeQuests.find(q => q.id === questId);
        if (!quest) {
            console.error(`Missione non trovata: ${questId}`);
            return false;
        }
        
        // Trova l'obiettivo
        const objective = quest.objectives.find(o => o.id === objectiveId);
        if (!objective) {
            console.error(`Obiettivo non trovato: ${objectiveId}`);
            return false;
        }
        
        // Aggiorna lo stato dell'obiettivo
        objective.completed = completed;
        
        // Notifica l'aggiornamento dell'obiettivo
        console.log(`Obiettivo ${objectiveId} ${completed ? "completato" : "aggiornato"}`);
        
        // Aggiungi un messaggio al gioco
        if (this.game.ui && completed) {
            this.game.ui.addMessage(`Obiettivo completato: ${objective.description}`);
        }
        
        // Verifica se tutti gli obiettivi sono completati
        if (this.areAllObjectivesCompleted(quest)) {
            // Completa la missione
            this.completeQuest(questId);
        }
        
        return true;
    }
    
    /**
     * Incrementa il contatore di un obiettivo
     * @param {string} questId - ID della missione
     * @param {string} objectiveId - ID dell'obiettivo
     * @param {number} amount - Quantità da incrementare
     * @returns {boolean} True se l'obiettivo è stato aggiornato con successo
     */
    incrementObjectiveCounter(questId, objectiveId, amount = 1) {
        // Verifica se la missione è attiva
        if (!this.isQuestActive(questId)) {
            console.error(`La missione ${questId} non è attiva`);
            return false;
        }
        
        // Trova la missione
        const quest = this.activeQuests.find(q => q.id === questId);
        if (!quest) {
            console.error(`Missione non trovata: ${questId}`);
            return false;
        }
        
        // Trova l'obiettivo
        const objective = quest.objectives.find(o => o.id === objectiveId);
        if (!objective) {
            console.error(`Obiettivo non trovato: ${objectiveId}`);
            return false;
        }
        
        // Verifica se l'obiettivo è di tipo contatore
        if (objective.type !== "counter") {
            console.error(`L'obiettivo ${objectiveId} non è di tipo contatore`);
            return false;
        }
        
        // Incrementa il contatore
        objective.currentCount = (objective.currentCount || 0) + amount;
        
        // Verifica se il contatore ha raggiunto il target
        if (objective.currentCount >= objective.targetCount) {
            // Completa l'obiettivo
            objective.completed = true;
            
            // Notifica il completamento dell'obiettivo
            console.log(`Obiettivo ${objectiveId} completato`);
            
            // Aggiungi un messaggio al gioco
            if (this.game.ui) {
                this.game.ui.addMessage(`Obiettivo completato: ${objective.description}`);
            }
            
            // Verifica se tutti gli obiettivi sono completati
            if (this.areAllObjectivesCompleted(quest)) {
                // Completa la missione
                this.completeQuest(questId);
            }
        } else {
            // Notifica l'aggiornamento dell'obiettivo
            console.log(`Obiettivo ${objectiveId}: ${objective.currentCount}/${objective.targetCount}`);
        }
        
        return true;
    }
    
    /**
     * Verifica se una missione è attiva
     * @param {string} questId - ID della missione
     * @returns {boolean} True se la missione è attiva
     */
    isQuestActive(questId) {
        return this.activeQuests.some(quest => quest.id === questId);
    }
    
    /**
     * Verifica se una missione è completata
     * @param {string} questId - ID della missione
     * @returns {boolean} True se la missione è completata
     */
    isQuestCompleted(questId) {
        return this.completedQuests.some(quest => quest.id === questId);
    }
    
    /**
     * Ottiene una missione attiva
     * @param {string} questId - ID della missione
     * @returns {Object|null} Missione o null se non trovata
     */
    getActiveQuest(questId) {
        return this.activeQuests.find(quest => quest.id === questId) || null;
    }
    
    /**
     * Ottiene una missione completata
     * @param {string} questId - ID della missione
     * @returns {Object|null} Missione o null se non trovata
     */
    getCompletedQuest(questId) {
        return this.completedQuests.find(quest => quest.id === questId) || null;
    }
    
    /**
     * Ottiene tutte le missioni attive
     * @returns {Array} Lista delle missioni attive
     */
    getAllActiveQuests() {
        return [...this.activeQuests];
    }
    
    /**
     * Ottiene tutte le missioni completate
     * @returns {Array} Lista delle missioni completate
     */
    getAllCompletedQuests() {
        return [...this.completedQuests];
    }
    
    /**
     * Avvia un dialogo con un NPC
     * @param {string} npcId - ID dell'NPC
     * @param {string} dialogueId - ID del dialogo (opzionale)
     * @returns {boolean} True se il dialogo è stato avviato con successo
     */
    startDialogue(npcId, dialogueId = null) {
        // Verifica se l'NPC ha dialoghi
        if (!this.dialogueDatabase[npcId]) {
            console.error(`Nessun dialogo trovato per l'NPC ${npcId}`);
            return false;
        }
        
        // Se non è specificato un ID di dialogo, usa il primo disponibile
        if (!dialogueId) {
            const dialogueIds = Object.keys(this.dialogueDatabase[npcId]);
            if (dialogueIds.length === 0) {
                console.error(`Nessun dialogo trovato per l'NPC ${npcId}`);
                return false;
            }
            
            dialogueId = dialogueIds[0];
        }
        
        // Verifica se il dialogo esiste
        if (!this.dialogueDatabase[npcId][dialogueId]) {
            console.error(`Dialogo non trovato: ${dialogueId}`);
            return false;
        }
        
        // Imposta il dialogo corrente
        this.currentDialogue = {
            npcId: npcId,
            dialogueId: dialogueId,
            dialogue: this.dialogueDatabase[npcId][dialogueId]
        };
        
        // Notifica l'avvio del dialogo
        console.log(`Dialogo avviato con ${npcId}: ${dialogueId}`);
        
        // Aggiorna l'interfaccia utente
        if (this.game.ui) {
            this.game.ui.showDialogue(this.currentDialogue);
        }
        
        return true;
    }
    
    /**
     * Seleziona un'opzione di dialogo
     * @param {number} optionIndex - Indice dell'opzione
     * @returns {boolean} True se l'opzione è stata selezionata con successo
     */
    selectDialogueOption(optionIndex) {
        // Verifica se c'è un dialogo corrente
        if (!this.currentDialogue) {
            console.error("Nessun dialogo corrente");
            return false;
        }
        
        // Verifica se l'opzione esiste
        if (!this.currentDialogue.dialogue.options || optionIndex >= this.currentDialogue.dialogue.options.length) {
            console.error(`Opzione non valida: ${optionIndex}`);
            return false;
        }
        
        const option = this.currentDialogue.dialogue.options[optionIndex];
        
        // Gestisci gli aggiornamenti delle missioni
        if (option.questUpdate) {
            const update = option.questUpdate;
            
            if (update.complete !== undefined) {
                this.updateObjective(update.questId, update.objectiveId, update.complete);
            }
            
            if (update.incrementCounter !== undefined) {
                this.incrementObjectiveCounter(update.questId, update.objectiveId, update.incrementCounter);
            }
        }
        
        // Gestisci l'attivazione di nuove missioni
        if (option.questTrigger) {
            this.activateQuest(option.questTrigger);
        }
        
        // Gestisci gli oggetti dati
        if (option.giveItem && this.game.inventory) {
            this.game.inventory.addItem(option.giveItem.id, option.giveItem.quantity);
        }
        
        // Passa al dialogo successivo
        if (option.nextId) {
            return this.startDialogue(this.currentDialogue.npcId, option.nextId);
        } else {
            // Termina il dialogo
            this.endDialogue();
            return true;
        }
    }
    
    /**
     * Termina il dialogo corrente
     */
    endDialogue() {
        this.currentDialogue = null;
        
        // Aggiorna l'interfaccia utente
        if (this.game.ui) {
            this.game.ui.hideDialogue();
        }
        
        console.log("Dialogo terminato");
    }
    
    /**
     * Verifica gli obiettivi di posizione
     * @param {string} locationId - ID della posizione
     */
    checkLocationObjectives(locationId) {
        for (const quest of this.activeQuests) {
            for (const objective of quest.objectives) {
                if (objective.type === "location" && objective.targetId === locationId && !objective.completed) {
                    this.updateObjective(quest.id, objective.id, true);
                }
            }
        }
    }
    
    /**
     * Verifica gli obiettivi di dialogo
     * @param {string} npcId - ID dell'NPC
     * @param {string} dialogueId - ID del dialogo
     */
    checkDialogueObjectives(npcId, dialogueId) {
        for (const quest of this.activeQuests) {
            for (const objective of quest.objectives) {
                if (objective.type === "talk" && objective.targetId === npcId && !objective.completed) {
                    // Se è richiesto un dialogo specifico
                    if (objective.dialogueId && objective.dialogueId !== dialogueId) {
                        continue;
                    }
                    
                    this.updateObjective(quest.id, objective.id, true);
                }
            }
        }
    }
    
    /**
     * Verifica gli obiettivi di battaglia
     * @param {string} enemyId - ID del nemico
     */
    checkBattleObjectives(enemyId) {
        for (const quest of this.activeQuests) {
            for (const objective of quest.objectives) {
                if (objective.type === "battle" && objective.targetId === enemyId && !objective.completed) {
                    this.updateObjective(quest.id, objective.id, true);
                }
            }
        }
    }
    
    /**
     * Verifica gli obiettivi di oggetto
     * @param {string} itemId - ID dell'oggetto
     * @param {number} quantity - Quantità dell'oggetto
     */
    checkItemObjectives(itemId, quantity) {
        for (const quest of this.activeQuests) {
            for (const objective of quest.objectives) {
                if (objective.type === "item" && objective.targetId === itemId && !objective.completed) {
                    // Se è richiesta una quantità specifica
                    if (objective.targetCount && quantity < objective.targetCount) {
                        continue;
                    }
                    
                    this.updateObjective(quest.id, objective.id, true);
                }
            }
        }
    }
    
    /**
     * Aggiorna il sistema di missioni
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    update(deltaTime) {
        // Implementazione base, da espandere con funzionalità aggiuntive
    }
    
    /**
     * Disegna l'interfaccia delle missioni
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    draw(ctx) {
        // Implementazione base, da espandere con un'interfaccia più completa
        if (this.currentDialogue) {
            this.drawDialogue(ctx);
        }
    }
    
    /**
     * Disegna l'interfaccia di dialogo
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawDialogue(ctx) {
        if (!this.currentDialogue) return;
        
        const dialogue = this.currentDialogue.dialogue;
        
        // Disegna lo sfondo del dialogo
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
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
}
