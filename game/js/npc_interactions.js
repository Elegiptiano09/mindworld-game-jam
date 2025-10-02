/**
 * Mindworld - Sistema di Interazioni NPC
 * 
 * Gestisce le interazioni avanzate con gli NPC, inclusi i nuovi personaggi
 * Kaito, Ryu e Professoressa Hana.
 */

class NPCInteractionSystem {
    constructor(world) {
        this.world = world;
        this.interactionCallbacks = {};
        this.setupInteractions();
    }
    
    /**
     * Configura le interazioni specifiche per ogni NPC
     */
    setupInteractions() {
        // Kaito - Ricercatore scientifico
        this.interactionCallbacks['kaito'] = {
            onFirstMeet: (npc) => {
                this.world.ui.showNotification("Hai incontrato Kaito, il ricercatore errante!", 'info');
                localStorage.setItem('spoken_to_kaito', 'true');
            },
            onInteract: (npc) => {
                const availableQuests = this.world.questSystem.getAvailableQuestsForNPC('kaito');
                if (availableQuests.length > 0) {
                    this.showQuestDialog(npc, availableQuests[0]);
                } else {
                    this.showTradeDialog(npc);
                }
            },
            onQuestComplete: (npc, questId) => {
                if (questId === 'kaito_ancient_tech') {
                    this.world.ui.showNotification("Kaito: Incredibile! Questo dispositivo potrebbe cambiare tutto!", 'success');
                    // Sblocca nuove ricette di crafting
                    this.world.craftingSystem.unlockRecipe('advanced_scanner');
                    this.world.craftingSystem.unlockRecipe('energy_amplifier');
                }
            }
        };
        
        // Ryu - Leader dei Ghost Wolves
        this.interactionCallbacks['ryu'] = {
            onFirstMeet: (npc) => {
                this.world.ui.showNotification("Hai incontrato Ryu, leader dei Ghost Wolves!", 'warning');
                localStorage.setItem('spoken_to_ryu', 'true');
            },
            onInteract: (npc) => {
                const reputation = this.world.reputationSystem.getReputation('ghost_wolves');
                if (reputation < 0) {
                    this.showHostileDialog(npc);
                } else {
                    const availableQuests = this.world.questSystem.getAvailableQuestsForNPC('ryu');
                    if (availableQuests.length > 0) {
                        this.showQuestDialog(npc, availableQuests[0]);
                    } else {
                        this.showFriendlyDialog(npc);
                    }
                }
            },
            onQuestComplete: (npc, questId) => {
                if (questId === 'ryu_sabotage_tower') {
                    this.world.ui.showNotification("Ryu: Bene fatto. Ora sei uno di noi.", 'success');
                    // Sblocca l'accesso a Leo
                    this.unlockLeoAccess();
                }
            }
        };
        
        // Professoressa Hana - Scienziata etica
        this.interactionCallbacks['professoressa_hana'] = {
            onFirstMeet: (npc) => {
                this.world.ui.showNotification("Hai incontrato la Professoressa Hana!", 'info');
                localStorage.setItem('spoken_to_professoressa_hana', 'true');
            },
            onInteract: (npc) => {
                const availableQuests = this.world.questSystem.getAvailableQuestsForNPC('professoressa_hana');
                if (availableQuests.length > 0) {
                    this.showQuestDialog(npc, availableQuests[0]);
                } else {
                    this.showWisdomDialog(npc);
                }
            },
            onQuestComplete: (npc, questId) => {
                if (questId === 'hana_ethical_research') {
                    this.world.ui.showNotification("Prof. Hana: Questi dati sono preziosi per la ricerca etica!", 'success');
                    // Sblocca informazioni sulla Dama Celeste
                    this.revealCelesteSecrets();
                }
            }
        };
    }
    
    /**
     * Gestisce l'interazione con un NPC
     * @param {Object} npc - L'NPC con cui interagire
     */
    handleInteraction(npc) {
        const callbacks = this.interactionCallbacks[npc.id];
        if (!callbacks) {
            // Interazione di default
            this.showDefaultDialog(npc);
            return;
        }
        
        // Controlla se è il primo incontro
        if (!localStorage.getItem(`met_${npc.id}`)) {
            localStorage.setItem(`met_${npc.id}`, 'true');
            if (callbacks.onFirstMeet) {
                callbacks.onFirstMeet(npc);
            }
        }
        
        // Esegui l'interazione principale
        if (callbacks.onInteract) {
            callbacks.onInteract(npc);
        }
    }
    
    /**
     * Mostra un dialogo di quest
     * @param {Object} npc - L'NPC
     * @param {Object} quest - La quest da mostrare
     */
    showQuestDialog(npc, quest) {
        const dialog = {
            character: npc.name,
            text: `${quest.description} Vuoi accettare questa missione?`,
            choices: [
                {
                    text: "Accetto la missione",
                    action: () => {
                        this.world.questSystem.startQuest(quest.id, npc.id);
                        this.world.ui.hideDialog();
                    }
                },
                {
                    text: "Non ora",
                    action: () => {
                        this.world.ui.hideDialog();
                    }
                }
            ]
        };
        
        this.world.ui.showDialog(dialog);
    }
    
    /**
     * Mostra un dialogo di commercio per Kaito
     * @param {Object} npc - L'NPC
     */
    showTradeDialog(npc) {
        const dialog = {
            character: npc.name,
            text: "Hai trovato qualche reperto interessante? Posso scambiarlo con componenti utili per il crafting!",
            choices: [
                {
                    text: "Mostrami cosa hai",
                    action: () => {
                        this.openTradeWindow(npc);
                    }
                },
                {
                    text: "Non ho niente ora",
                    action: () => {
                        this.world.ui.hideDialog();
                    }
                }
            ]
        };
        
        this.world.ui.showDialog(dialog);
    }
    
    /**
     * Mostra un dialogo ostile per Ryu
     * @param {Object} npc - L'NPC
     */
    showHostileDialog(npc) {
        const dialog = {
            character: npc.name,
            text: "Non ti fido. Hai fatto troppi danni alla nostra causa. Vattene prima che le cose si mettano male.",
            choices: [
                {
                    text: "Me ne vado",
                    action: () => {
                        this.world.ui.hideDialog();
                    }
                }
            ]
        };
        
        this.world.ui.showDialog(dialog);
    }
    
    /**
     * Mostra un dialogo amichevole per Ryu
     * @param {Object} npc - L'NPC
     */
    showFriendlyDialog(npc) {
        const dialog = {
            character: npc.name,
            text: "Rispetto quello che hai fatto per noi. I Ghost Wolves non dimenticano i favori.",
            choices: [
                {
                    text: "Posso vedere Leo ora?",
                    action: () => {
                        if (this.world.questSystem.isQuestCompleted('ryu_sabotage_tower')) {
                            this.showLeoLocation();
                        } else {
                            this.world.ui.showNotification("Devi prima completare la missione di sabotaggio", 'warning');
                        }
                        this.world.ui.hideDialog();
                    }
                },
                {
                    text: "Grazie",
                    action: () => {
                        this.world.ui.hideDialog();
                    }
                }
            ]
        };
        
        this.world.ui.showDialog(dialog);
    }
    
    /**
     * Mostra un dialogo di saggezza per la Professoressa Hana
     * @param {Object} npc - L'NPC
     */
    showWisdomDialog(npc) {
        const wisdomQuotes = [
            "La scienza senza coscienza è solo rovina dell'anima.",
            "Ogni scoperta porta con sé una responsabilità.",
            "La vera saggezza sta nel sapere quando non usare il proprio potere.",
            "La Dama Celeste ha dimenticato che la scienza deve servire l'umanità, non dominarla."
        ];
        
        const randomQuote = wisdomQuotes[Math.floor(Math.random() * wisdomQuotes.length)];
        
        const dialog = {
            character: npc.name,
            text: randomQuote,
            choices: [
                {
                    text: "Grazie per il consiglio",
                    action: () => {
                        this.world.ui.hideDialog();
                    }
                }
            ]
        };
        
        this.world.ui.showDialog(dialog);
    }
    
    /**
     * Mostra un dialogo di default
     * @param {Object} npc - L'NPC
     */
    showDefaultDialog(npc) {
        const dialog = {
            character: npc.name,
            text: "Ciao, viaggiatore. Come posso aiutarti?",
            choices: [
                {
                    text: "Solo salutare",
                    action: () => {
                        this.world.ui.hideDialog();
                    }
                }
            ]
        };
        
        this.world.ui.showDialog(dialog);
    }
    
    /**
     * Apre la finestra di commercio
     * @param {Object} npc - L'NPC commerciante
     */
    openTradeWindow(npc) {
        // Implementazione semplificata - in un gioco reale ci sarebbe una finestra di commercio completa
        this.world.ui.showNotification("Sistema di commercio in sviluppo!", 'info');
        this.world.ui.hideDialog();
    }
    
    /**
     * Sblocca l'accesso a Leo
     */
    unlockLeoAccess() {
        // Aggiunge Leo come NPC interagibile nella città
        const leoData = {
            id: 'leo',
            name: 'Leo',
            sprite: 'leo',
            location: 'city',
            x: 1200,
            y: 600,
            dialogueId: 'leo'
        };
        
        // Aggiunge Leo agli NPC del mondo
        if (this.world.currentLevel === 'city') {
            const leo = new Character({
                id: 'leo',
                x: leoData.x,
                y: leoData.y,
                sprite: Assets.getImage('leo'),
                name: leoData.name,
                world: this.world,
                canvas: this.world.canvas,
                ctx: this.world.ctx
            });
            
            this.world.npcs.push(leo);
            this.world.ui.showNotification("Leo è ora disponibile nella città!", 'success');
        }
    }
    
    /**
     * Rivela i segreti della Dama Celeste
     */
    revealCelesteSecrets() {
        const secretDialog = {
            character: "Professoressa Hana",
            text: "Ora che ho analizzato i campioni, posso rivelarti la verità: la Dama Celeste possiede ancora la tecnologia per invertire la pietrificazione, ma la usa come arma di controllo. Dobbiamo fermarla!",
            choices: [
                {
                    text: "Come possiamo fermarla?",
                    action: () => {
                        // Sblocca la quest finale
                        this.world.questSystem.availableQuests['final_confrontation'].status = 'available';
                        this.world.ui.showNotification("Nuova Quest Sbloccata: Confronto Finale!", 'quest_available');
                        this.world.ui.hideDialog();
                    }
                }
            ]
        };
        
        this.world.ui.showDialog(secretDialog);
    }
    
    /**
     * Mostra la posizione di Leo
     */
    showLeoLocation() {
        this.world.ui.showNotification("Leo si trova nel quartiere industriale della città, vicino alla Torre dell'Acqua", 'info');
        
        // Aggiunge un marker sulla minimap
        if (this.world.ui.minimap) {
            this.world.ui.minimap.addMarker('leo', 1200, 600, 'blue');
        }
    }
    
    /**
     * Gestisce il completamento di una quest
     * @param {string} npcId - ID dell'NPC
     * @param {string} questId - ID della quest completata
     */
    onQuestComplete(npcId, questId) {
        const callbacks = this.interactionCallbacks[npcId];
        if (callbacks && callbacks.onQuestComplete) {
            const npc = this.world.npcs.find(n => n.id === npcId);
            if (npc) {
                callbacks.onQuestComplete(npc, questId);
            }
        }
    }
}

// Esporta la classe
window.NPCInteractionSystem = NPCInteractionSystem;
