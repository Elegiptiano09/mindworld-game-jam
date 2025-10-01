/**
 * Mindworld - Sistema di Reputazione con le Fazioni
 * 
 * Ispirato a Wind Breaker, questo sistema gestisce le relazioni del giocatore
 * con le diverse squadre/fazioni della città.
 */

class ReputationSystem {
    constructor() {
        this.factions = [];
        this.playerReputation = new Map();
        this.completedMissions = new Set();
        this.reputationHistory = [];
        
        // Carica i dati delle fazioni
        this.loadFactionsData();
    }
    
    /**
     * Carica i dati delle fazioni dal file JSON
     */
    async loadFactionsData() {
        try {
            const response = await fetch('assets/data/factions.json');
            const data = await response.json();
            
            this.factions = data.factions;
            this.reputationActions = data.reputation_actions;
            
            // Inizializza la reputazione neutra con tutte le fazioni
            for (const faction of this.factions) {
                this.playerReputation.set(faction.id, 0);
            }
            
            console.log('Sistema di reputazione caricato:', this.factions.length, 'fazioni');
        } catch (error) {
            console.error('Errore nel caricamento dei dati delle fazioni:', error);
        }
    }
    
    /**
     * Modifica la reputazione con una fazione
     * @param {string} factionId - ID della fazione
     * @param {number} change - Cambiamento di reputazione (positivo o negativo)
     * @param {string} reason - Motivo del cambiamento
     */
    changeReputation(factionId, change, reason = '') {
        const currentRep = this.playerReputation.get(factionId) || 0;
        const newRep = Math.max(-100, Math.min(200, currentRep + change));
        
        this.playerReputation.set(factionId, newRep);
        
        // Registra nella cronologia
        this.reputationHistory.push({
            faction: factionId,
            change: change,
            newTotal: newRep,
            reason: reason,
            timestamp: Date.now()
        });
        
        // Controlla se c'è stato un cambio di livello di reputazione
        const faction = this.getFaction(factionId);
        if (faction) {
            const oldLevel = this.getReputationLevel(factionId, currentRep);
            const newLevel = this.getReputationLevel(factionId, newRep);
            
            if (oldLevel !== newLevel) {
                this.onReputationLevelChange(faction, oldLevel, newLevel);
            }
        }
        
        console.log(`Reputazione con ${factionId}: ${currentRep} -> ${newRep} (${reason})`);
    }
    
    /**
     * Ottiene il livello di reputazione attuale con una fazione
     * @param {string} factionId - ID della fazione
     * @param {number} reputation - Valore di reputazione (opzionale, usa quello attuale se non specificato)
     * @returns {string} - Nome del livello di reputazione
     */
    getReputationLevel(factionId, reputation = null) {
        const faction = this.getFaction(factionId);
        if (!faction) return 'unknown';
        
        const rep = reputation !== null ? reputation : this.playerReputation.get(factionId) || 0;
        
        for (const [levelName, levelData] of Object.entries(faction.reputation_levels)) {
            if (rep >= levelData.min && rep <= levelData.max) {
                return levelName;
            }
        }
        
        return 'unknown';
    }
    
    /**
     * Ottiene i benefici attuali con una fazione
     * @param {string} factionId - ID della fazione
     * @returns {Array} - Array dei benefici
     */
    getFactionBenefits(factionId) {
        const faction = this.getFaction(factionId);
        if (!faction) return [];
        
        const level = this.getReputationLevel(factionId);
        const levelData = faction.reputation_levels[level];
        
        return levelData ? levelData.benefits : [];
    }
    
    /**
     * Ottiene le penalità attuali con una fazione
     * @param {string} factionId - ID della fazione
     * @returns {Array} - Array delle penalità
     */
    getFactionPenalties(factionId) {
        const faction = this.getFaction(factionId);
        if (!faction) return [];
        
        const level = this.getReputationLevel(factionId);
        const levelData = faction.reputation_levels[level];
        
        return levelData ? levelData.penalties : [];
    }
    
    /**
     * Controlla se il giocatore può accedere a un territorio
     * @param {string} factionId - ID della fazione che controlla il territorio
     * @returns {boolean} - True se può accedere
     */
    canAccessTerritory(factionId) {
        const penalties = this.getFactionPenalties(factionId);
        return !penalties.includes('no_access_to_territory');
    }
    
    /**
     * Ottiene le missioni disponibili per una fazione
     * @param {string} factionId - ID della fazione
     * @returns {Array} - Array delle missioni disponibili
     */
    getAvailableMissions(factionId) {
        const faction = this.getFaction(factionId);
        if (!faction) return [];
        
        const level = this.getReputationLevel(factionId);
        
        // Solo fazioni amichevoli o alleate offrono missioni
        if (level === 'hostile') return [];
        
        return faction.missions.filter(mission => 
            !this.completedMissions.has(`${factionId}_${mission.id}`)
        );
    }
    
    /**
     * Completa una missione per una fazione
     * @param {string} factionId - ID della fazione
     * @param {string} missionId - ID della missione
     * @returns {boolean} - True se la missione è stata completata con successo
     */
    completeMission(factionId, missionId) {
        const faction = this.getFaction(factionId);
        if (!faction) return false;
        
        const mission = faction.missions.find(m => m.id === missionId);
        if (!mission) return false;
        
        const missionKey = `${factionId}_${missionId}`;
        if (this.completedMissions.has(missionKey)) return false;
        
        // Segna la missione come completata
        this.completedMissions.add(missionKey);
        
        // Aumenta la reputazione
        this.changeReputation(factionId, mission.reputation_reward, `Missione completata: ${mission.name}`);
        
        // Notifica al giocatore
        if (window.game && window.game.ui) {
            window.game.ui.showNotification({
                title: 'Missione Completata!',
                text: `Hai completato "${mission.name}" per ${faction.name}`,
                type: 'mission_complete'
            });
        }
        
        return true;
    }
    
    /**
     * Gestisce le azioni del giocatore che influenzano la reputazione
     * @param {string} action - Tipo di azione
     * @param {string} factionId - ID della fazione coinvolta
     * @param {Object} context - Contesto aggiuntivo
     */
    handlePlayerAction(action, factionId, context = {}) {
        const actionData = this.reputationActions.find(a => a.action === action);
        if (!actionData) return;
        
        let change = actionData.reputation_change;
        let reason = actionData.description;
        
        // Gestisci azioni speciali
        switch (action) {
            case 'complete_faction_mission':
                // Gestito separatamente in completeMission
                return;
                
            case 'help_in_combat':
                // Bonus se il giocatore aiuta contro nemici comuni
                if (context.enemy_faction) {
                    change *= 1.5;
                    reason += ` (contro ${context.enemy_faction})`;
                }
                break;
                
            case 'trade_valuable_items':
                // Bonus basato sul valore degli oggetti
                if (context.item_value) {
                    change = Math.min(15, Math.floor(context.item_value / 100));
                }
                break;
                
            case 'craft_faction_items':
                // Bonus per oggetti specifici della fazione
                if (context.item_type === 'faction_specific') {
                    change *= 1.5;
                }
                break;
        }
        
        this.changeReputation(factionId, change, reason);
        
        // Effetti collaterali su altre fazioni
        this.handleReputationSideEffects(action, factionId, change);
    }
    
    /**
     * Gestisce gli effetti collaterali delle azioni su altre fazioni
     * @param {string} action - Tipo di azione
     * @param {string} targetFactionId - Fazione target dell'azione
     * @param {number} change - Cambiamento di reputazione
     */
    handleReputationSideEffects(action, targetFactionId, change) {
        const targetFaction = this.getFaction(targetFactionId);
        if (!targetFaction) return;
        
        // Azioni positive con una fazione possono influenzare negativamente fazioni rivali
        if (change > 0 && (action === 'complete_faction_mission' || action === 'help_in_combat')) {
            for (const faction of this.factions) {
                if (faction.id === targetFactionId) continue;
                
                // Se le fazioni hanno affinità elementali opposte, sono rivali
                if (this.areRivalFactions(targetFaction, faction)) {
                    this.changeReputation(faction.id, Math.floor(-change * 0.3), 
                        `Azione a favore di ${targetFaction.name}`);
                }
            }
        }
    }
    
    /**
     * Controlla se due fazioni sono rivali
     * @param {Object} faction1 - Prima fazione
     * @param {Object} faction2 - Seconda fazione
     * @returns {boolean} - True se sono rivali
     */
    areRivalFactions(faction1, faction2) {
        // Fazioni con affinità elementali opposte sono rivali
        return (faction1.element_affinity === 'fah' && faction2.element_affinity === 'brih') ||
               (faction1.element_affinity === 'brih' && faction2.element_affinity === 'fah');
    }
    
    /**
     * Gestisce il cambio di livello di reputazione
     * @param {Object} faction - Dati della fazione
     * @param {string} oldLevel - Livello precedente
     * @param {string} newLevel - Nuovo livello
     */
    onReputationLevelChange(faction, oldLevel, newLevel) {
        console.log(`Livello di reputazione con ${faction.name}: ${oldLevel} -> ${newLevel}`);
        
        // Notifica al giocatore
        if (window.game && window.game.ui) {
            const levelData = faction.reputation_levels[newLevel];
            window.game.ui.showNotification({
                title: `Reputazione Cambiata!`,
                text: `Il tuo status con ${faction.name} è ora: ${newLevel.toUpperCase()}\\n${levelData.description}`,
                type: 'reputation_change'
            });
        }
        
        // Sblocca o blocca contenuti basati sul nuovo livello
        this.updateAccessBasedOnReputation(faction.id, newLevel);
    }
    
    /**
     * Aggiorna l'accesso a contenuti basato sulla reputazione
     * @param {string} factionId - ID della fazione
     * @param {string} level - Livello di reputazione
     */
    updateAccessBasedOnReputation(factionId, level) {
        // Implementa logica per sbloccare/bloccare aree, negozi, abilità, etc.
        // Questo sarà collegato ad altri sistemi del gioco
    }
    
    /**
     * Ottiene una fazione per ID
     * @param {string} factionId - ID della fazione
     * @returns {Object|null} - Dati della fazione
     */
    getFaction(factionId) {
        return this.factions.find(f => f.id === factionId) || null;
    }
    
    /**
     * Ottiene tutte le fazioni
     * @returns {Array} - Array di tutte le fazioni
     */
    getAllFactions() {
        return [...this.factions];
    }
    
    /**
     * Ottiene lo stato attuale della reputazione
     * @returns {Object} - Stato della reputazione
     */
    getReputationStatus() {
        const status = {};
        
        for (const faction of this.factions) {
            const rep = this.playerReputation.get(faction.id) || 0;
            status[faction.id] = {
                name: faction.name,
                reputation: rep,
                level: this.getReputationLevel(faction.id),
                benefits: this.getFactionBenefits(faction.id),
                penalties: this.getFactionPenalties(faction.id)
            };
        }
        
        return status;
    }
    
    /**
     * Salva lo stato del sistema di reputazione
     * @returns {Object} - Stato serializzato
     */
    saveState() {
        return {
            reputation: Object.fromEntries(this.playerReputation),
            completedMissions: Array.from(this.completedMissions),
            history: this.reputationHistory
        };
    }
    
    /**
     * Carica lo stato del sistema di reputazione
     * @param {Object} state - Stato da caricare
     */
    loadState(state) {
        if (state.reputation) {
            this.playerReputation = new Map(Object.entries(state.reputation));
        }
        
        if (state.completedMissions) {
            this.completedMissions = new Set(state.completedMissions);
        }
        
        if (state.history) {
            this.reputationHistory = state.history;
        }
    }
}

// Esporta la classe
window.ReputationSystem = ReputationSystem;
