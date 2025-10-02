/**
 * Mindworld - Sistema di Quest
 * 
 * Gestisce le missioni del gioco, incluse quelle dei nuovi personaggi
 * Kaito, Ryu e Professoressa Hana.
 */

class QuestSystem {
    constructor(world) {
        this.world = world;
        this.activeQuests = [];
        this.completedQuests = [];
        this.availableQuests = {};
        
        this.initializeQuests();
    }
    
    /**
     * Inizializza tutte le quest disponibili
     */
    initializeQuests() {
        this.availableQuests = {
            // Quest di Kaito - Ricerca scientifica
            'kaito_ancient_tech': {
                id: 'kaito_ancient_tech',
                giver: 'kaito',
                title: 'Tecnologia Perduta',
                description: 'Kaito ha bisogno di aiuto per recuperare un antico dispositivo scientifico dalle rovine del Distretto Abbandonato.',
                objectives: [
                    {
                        id: 'find_device',
                        description: 'Trova il dispositivo antico nelle rovine',
                        completed: false,
                        location: 'ruins',
                        x: 300,
                        y: 400
                    }
                ],
                rewards: {
                    experience: 100,
                    items: [
                        { id: 'advanced_crafting_kit', quantity: 1 },
                        { id: 'scientific_notes', quantity: 3 }
                    ]
                },
                prerequisites: [],
                status: 'available'
            },
            
            // Quest di Ryu - Sabotaggio
            'ryu_sabotage_tower': {
                id: 'ryu_sabotage_tower',
                giver: 'ryu',
                title: 'Sabotaggio della Torre',
                description: 'Ryu chiede di sabotare una torre di comunicazione della Dama Celeste per dimostrare la tua lealtà ai Ghost Wolves.',
                objectives: [
                    {
                        id: 'reach_tower',
                        description: 'Raggiungi la torre di comunicazione nel Distretto Azzurro',
                        completed: false,
                        location: 'city',
                        x: 800,
                        y: 200
                    },
                    {
                        id: 'disable_tower',
                        description: 'Disabilita la torre usando il dispositivo di Ryu',
                        completed: false,
                        requiresItem: 'sabotage_device'
                    }
                ],
                rewards: {
                    experience: 150,
                    reputation: {
                        'ghost_wolves': 50
                    },
                    items: [
                        { id: 'ghost_wolves_badge', quantity: 1 }
                    ]
                },
                prerequisites: ['talk_to_ryu'],
                status: 'available'
            },
            
            // Quest della Professoressa Hana - Etica scientifica
            'hana_ethical_research': {
                id: 'hana_ethical_research',
                giver: 'professoressa_hana',
                title: 'Ricerca Etica',
                description: 'La Professoressa Hana vuole che tu raccolga campioni di energia elementale per studiare un modo sicuro di invertire la pietrificazione.',
                objectives: [
                    {
                        id: 'collect_fah_samples',
                        description: 'Raccogli 3 campioni di energia Fah',
                        completed: false,
                        requiredQuantity: 3,
                        currentQuantity: 0,
                        itemId: 'fah_energy_sample'
                    },
                    {
                        id: 'collect_brih_samples',
                        description: 'Raccogli 3 campioni di energia Brih',
                        completed: false,
                        requiredQuantity: 3,
                        currentQuantity: 0,
                        itemId: 'brih_energy_sample'
                    },
                    {
                        id: 'return_to_hana',
                        description: 'Riporta i campioni alla Professoressa Hana',
                        completed: false
                    }
                ],
                rewards: {
                    experience: 200,
                    items: [
                        { id: 'ethical_research_notes', quantity: 1 },
                        { id: 'purification_formula', quantity: 1 }
                    ]
                },
                prerequisites: [],
                status: 'available'
            },
            
            // Quest combinata - Il Torneo delle Squadre
            'tournament_of_factions': {
                id: 'tournament_of_factions',
                giver: 'vex',
                title: 'Il Torneo delle Squadre',
                description: 'Vex organizza un torneo tra le squadre di Cromopoli. Partecipa per guadagnare rispetto e informazioni su Leo.',
                objectives: [
                    {
                        id: 'register_tournament',
                        description: 'Registrati al torneo presso Vex',
                        completed: false
                    },
                    {
                        id: 'defeat_ember_team',
                        description: 'Sconfiggi la squadra di Ember nel primo round',
                        completed: false
                    },
                    {
                        id: 'defeat_frost_team',
                        description: 'Sconfiggi la squadra di Frost nel secondo round',
                        completed: false
                    },
                    {
                        id: 'final_battle',
                        description: 'Affronta la sfida finale del torneo',
                        completed: false
                    }
                ],
                rewards: {
                    experience: 300,
                    reputation: {
                        'all_factions': 25
                    },
                    items: [
                        { id: 'tournament_champion_trophy', quantity: 1 },
                        { id: 'leo_location_info', quantity: 1 }
                    ]
                },
                prerequisites: ['complete_kaito_ancient_tech', 'complete_ryu_sabotage_tower'],
                status: 'locked'
            }
        };
    }
    
    /**
     * Avvia una quest
     * @param {string} questId - ID della quest
     * @param {string} giverId - ID del personaggio che dà la quest
     */
    startQuest(questId, giverId) {
        const quest = this.availableQuests[questId];
        if (!quest || quest.status !== 'available') {
            console.warn(`Quest ${questId} non disponibile`);
            return false;
        }
        
        // Controlla i prerequisiti
        if (!this.checkPrerequisites(quest.prerequisites)) {
            console.warn(`Prerequisiti non soddisfatti per la quest ${questId}`);
            return false;
        }
        
        // Aggiungi la quest alle quest attive
        quest.status = 'active';
        quest.startTime = Date.now();
        this.activeQuests.push(quest);
        
        // Notifica al giocatore
        this.world.ui.showNotification(`Nuova Quest: ${quest.title}`, 'quest');
        
        console.log(`Quest avviata: ${quest.title}`);
        return true;
    }
    
    /**
     * Controlla i prerequisiti di una quest
     * @param {Array} prerequisites - Array di prerequisiti
     * @returns {boolean} True se tutti i prerequisiti sono soddisfatti
     */
    checkPrerequisites(prerequisites) {
        if (!prerequisites || prerequisites.length === 0) {
            return true;
        }
        
        for (const prereq of prerequisites) {
            if (prereq.startsWith('complete_')) {
                const questId = prereq.replace('complete_', '');
                if (!this.isQuestCompleted(questId)) {
                    return false;
                }
            } else if (prereq.startsWith('talk_to_')) {
                const npcId = prereq.replace('talk_to_', '');
                if (!this.hasSpokenTo(npcId)) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Controlla se una quest è stata completata
     * @param {string} questId - ID della quest
     * @returns {boolean} True se la quest è completata
     */
    isQuestCompleted(questId) {
        return this.completedQuests.some(quest => quest.id === questId);
    }
    
    /**
     * Controlla se il giocatore ha parlato con un NPC
     * @param {string} npcId - ID dell'NPC
     * @returns {boolean} True se ha parlato con l'NPC
     */
    hasSpokenTo(npcId) {
        // Implementazione semplificata - in un gioco reale si userebbe un sistema di flag
        return localStorage.getItem(`spoken_to_${npcId}`) === 'true';
    }
    
    /**
     * Aggiorna lo stato delle quest attive
     * @param {string} eventType - Tipo di evento
     * @param {Object} eventData - Dati dell'evento
     */
    updateQuests(eventType, eventData) {
        for (const quest of this.activeQuests) {
            this.updateQuestObjectives(quest, eventType, eventData);
        }
    }
    
    /**
     * Aggiorna gli obiettivi di una quest specifica
     * @param {Object} quest - La quest da aggiornare
     * @param {string} eventType - Tipo di evento
     * @param {Object} eventData - Dati dell'evento
     */
    updateQuestObjectives(quest, eventType, eventData) {
        let questCompleted = true;
        
        for (const objective of quest.objectives) {
            if (objective.completed) continue;
            
            // Controlla diversi tipi di obiettivi
            switch (eventType) {
                case 'item_collected':
                    if (objective.itemId === eventData.itemId) {
                        objective.currentQuantity = (objective.currentQuantity || 0) + eventData.quantity;
                        if (objective.currentQuantity >= objective.requiredQuantity) {
                            objective.completed = true;
                            this.world.ui.showNotification(`Obiettivo completato: ${objective.description}`, 'success');
                        }
                    }
                    break;
                    
                case 'location_reached':
                    if (objective.location === eventData.location && 
                        Math.abs(objective.x - eventData.x) < 50 && 
                        Math.abs(objective.y - eventData.y) < 50) {
                        objective.completed = true;
                        this.world.ui.showNotification(`Obiettivo completato: ${objective.description}`, 'success');
                    }
                    break;
                    
                case 'npc_talked':
                    if (objective.id === 'return_to_' + eventData.npcId) {
                        objective.completed = true;
                        this.world.ui.showNotification(`Obiettivo completato: ${objective.description}`, 'success');
                    }
                    break;
                    
                case 'enemy_defeated':
                    if (objective.enemyType === eventData.enemyType) {
                        objective.currentKills = (objective.currentKills || 0) + 1;
                        if (objective.currentKills >= objective.requiredKills) {
                            objective.completed = true;
                            this.world.ui.showNotification(`Obiettivo completato: ${objective.description}`, 'success');
                        }
                    }
                    break;
            }
            
            if (!objective.completed) {
                questCompleted = false;
            }
        }
        
        // Se tutti gli obiettivi sono completati, completa la quest
        if (questCompleted) {
            this.completeQuest(quest);
        }
    }
    
    /**
     * Completa una quest
     * @param {Object} quest - La quest da completare
     */
    completeQuest(quest) {
        // Rimuovi dalle quest attive
        const index = this.activeQuests.indexOf(quest);
        if (index > -1) {
            this.activeQuests.splice(index, 1);
        }
        
        // Aggiungi alle quest completate
        quest.status = 'completed';
        quest.completionTime = Date.now();
        this.completedQuests.push(quest);
        
        // Assegna le ricompense
        this.giveRewards(quest.rewards);
        
        // Notifica al giocatore
        this.world.ui.showNotification(`Quest Completata: ${quest.title}`, 'quest_complete');
        
        // Sblocca quest successive se necessario
        this.checkUnlockedQuests();
        
        console.log(`Quest completata: ${quest.title}`);
    }
    
    /**
     * Assegna le ricompense di una quest
     * @param {Object} rewards - Le ricompense da assegnare
     */
    giveRewards(rewards) {
        if (rewards.experience) {
            // Aggiungi esperienza al giocatore
            this.world.player.addExperience(rewards.experience);
        }
        
        if (rewards.items) {
            for (const item of rewards.items) {
                this.world.player.inventory.addItem(item.id, item.quantity);
            }
        }
        
        if (rewards.reputation) {
            for (const [faction, amount] of Object.entries(rewards.reputation)) {
                this.world.reputationSystem.addReputation(faction, amount);
            }
        }
    }
    
    /**
     * Controlla se ci sono quest da sbloccare
     */
    checkUnlockedQuests() {
        for (const [questId, quest] of Object.entries(this.availableQuests)) {
            if (quest.status === 'locked' && this.checkPrerequisites(quest.prerequisites)) {
                quest.status = 'available';
                this.world.ui.showNotification(`Nuova Quest Disponibile: ${quest.title}`, 'quest_available');
            }
        }
    }
    
    /**
     * Ottiene tutte le quest attive
     * @returns {Array} Array delle quest attive
     */
    getActiveQuests() {
        return this.activeQuests;
    }
    
    /**
     * Ottiene tutte le quest completate
     * @returns {Array} Array delle quest completate
     */
    getCompletedQuests() {
        return this.completedQuests;
    }
    
    /**
     * Ottiene le quest disponibili per un NPC
     * @param {string} npcId - ID dell'NPC
     * @returns {Array} Array delle quest disponibili
     */
    getAvailableQuestsForNPC(npcId) {
        return Object.values(this.availableQuests).filter(quest => 
            quest.giver === npcId && 
            quest.status === 'available' && 
            this.checkPrerequisites(quest.prerequisites)
        );
    }
}

// Esporta la classe
window.QuestSystem = QuestSystem;
