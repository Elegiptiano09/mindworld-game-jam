/**
 * Mindworld - Sistema di Crafting Scientifico
 * 
 * Ispirato a Dr. Stone, questo sistema permette ai giocatori di combinare
 * materiali usando principi scientifici per creare oggetti utili.
 */

class CraftingSystem {
    constructor() {
        this.recipes = [];
        this.materials = [];
        this.playerInventory = new Map();
        this.knownRecipes = new Set();
        this.craftingHistory = [];
        
        // Carica le ricette e i materiali
        this.loadCraftingData();
    }
    
    /**
     * Carica i dati di crafting dal file JSON
     */
    async loadCraftingData() {
        try {
            const response = await fetch('assets/data/crafting_recipes.json');
            const data = await response.json();
            
            this.recipes = data.recipes;
            this.materials = data.materials;
            
            // Inizializza con alcune ricette base conosciute
            this.knownRecipes.add('fire_dart_enhanced');
            this.knownRecipes.add('ice_shard_crystalline');
            this.knownRecipes.add('smoke_bomb');
            
            console.log('Sistema di crafting caricato:', this.recipes.length, 'ricette');
        } catch (error) {
            console.error('Errore nel caricamento dei dati di crafting:', error);
        }
    }
    
    /**
     * Aggiunge materiali all'inventario del giocatore
     * @param {string} materialId - ID del materiale
     * @param {number} quantity - Quantità da aggiungere
     */
    addMaterial(materialId, quantity = 1) {
        const currentQuantity = this.playerInventory.get(materialId) || 0;
        this.playerInventory.set(materialId, currentQuantity + quantity);
        
        // Controlla se si sbloccano nuove ricette
        this.checkForNewRecipes();
    }
    
    /**
     * Rimuove materiali dall'inventario del giocatore
     * @param {string} materialId - ID del materiale
     * @param {number} quantity - Quantità da rimuovere
     * @returns {boolean} - True se la rimozione è riuscita
     */
    removeMaterial(materialId, quantity = 1) {
        const currentQuantity = this.playerInventory.get(materialId) || 0;
        
        if (currentQuantity >= quantity) {
            this.playerInventory.set(materialId, currentQuantity - quantity);
            return true;
        }
        
        return false;
    }
    
    /**
     * Controlla se il giocatore ha i materiali necessari per una ricetta
     * @param {Object} recipe - La ricetta da controllare
     * @returns {boolean} - True se ha tutti i materiali
     */
    canCraft(recipe) {
        if (!this.knownRecipes.has(recipe.id)) {
            return false;
        }
        
        for (const ingredient of recipe.ingredients) {
            const available = this.playerInventory.get(ingredient.item) || 0;
            if (available < ingredient.quantity) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Crafta un oggetto usando una ricetta
     * @param {string} recipeId - ID della ricetta
     * @returns {Object|null} - L'oggetto craftato o null se fallisce
     */
    craftItem(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        
        if (!recipe) {
            console.error('Ricetta non trovata:', recipeId);
            return null;
        }
        
        if (!this.canCraft(recipe)) {
            console.log('Impossibile craftare:', recipe.name);
            return null;
        }
        
        // Consuma i materiali
        for (const ingredient of recipe.ingredients) {
            this.removeMaterial(ingredient.item, ingredient.quantity);
        }
        
        // Crea l'oggetto risultante
        const craftedItem = {
            ...recipe.result,
            crafted_at: Date.now(),
            recipe_used: recipeId
        };
        
        // Aggiungi alla cronologia
        this.craftingHistory.push({
            recipe: recipe.name,
            timestamp: Date.now(),
            scientific_principle: recipe.scientific_principle
        });
        
        // Mostra il principio scientifico
        this.showScientificExplanation(recipe);
        
        console.log('Oggetto craftato:', craftedItem);
        return craftedItem;
    }
    
    /**
     * Mostra la spiegazione scientifica del crafting
     * @param {Object} recipe - La ricetta utilizzata
     */
    showScientificExplanation(recipe) {
        // Crea un popup o notifica con la spiegazione scientifica
        const explanation = {
            title: `Principio Scientifico: ${recipe.name}`,
            text: recipe.scientific_principle,
            type: 'scientific_discovery'
        };
        
        // Invia l'evento al sistema UI
        if (window.game && window.game.ui) {
            window.game.ui.showNotification(explanation);
        }
    }
    
    /**
     * Controlla se si sbloccano nuove ricette basate sui materiali disponibili
     */
    checkForNewRecipes() {
        for (const recipe of this.recipes) {
            if (this.knownRecipes.has(recipe.id)) {
                continue;
            }
            
            // Controlla se il giocatore ha almeno la metà dei materiali necessari
            let availableIngredients = 0;
            for (const ingredient of recipe.ingredients) {
                if (this.playerInventory.has(ingredient.item)) {
                    availableIngredients++;
                }
            }
            
            if (availableIngredients >= recipe.ingredients.length / 2) {
                this.discoverRecipe(recipe.id);
            }
        }
    }
    
    /**
     * Sblocca una nuova ricetta
     * @param {string} recipeId - ID della ricetta da sbloccare
     */
    discoverRecipe(recipeId) {
        if (!this.knownRecipes.has(recipeId)) {
            this.knownRecipes.add(recipeId);
            
            const recipe = this.recipes.find(r => r.id === recipeId);
            if (recipe) {
                console.log('Nuova ricetta scoperta:', recipe.name);
                
                // Notifica al giocatore
                if (window.game && window.game.ui) {
                    window.game.ui.showNotification({
                        title: 'Nuova Ricetta Scoperta!',
                        text: `Hai scoperto come creare: ${recipe.name}`,
                        type: 'recipe_discovery'
                    });
                }
            }
        }
    }
    
    /**
     * Ottiene tutte le ricette conosciute dal giocatore
     * @returns {Array} - Array delle ricette conosciute
     */
    getKnownRecipes() {
        return this.recipes.filter(recipe => this.knownRecipes.has(recipe.id));
    }
    
    /**
     * Ottiene i materiali nell'inventario del giocatore
     * @returns {Map} - Mappa dei materiali e quantità
     */
    getInventory() {
        return new Map(this.playerInventory);
    }
    
    /**
     * Ottiene informazioni su un materiale
     * @param {string} materialId - ID del materiale
     * @returns {Object|null} - Informazioni del materiale
     */
    getMaterialInfo(materialId) {
        return this.materials.find(m => m.id === materialId) || null;
    }
    
    /**
     * Ottiene la cronologia del crafting
     * @returns {Array} - Array della cronologia
     */
    getCraftingHistory() {
        return [...this.craftingHistory];
    }
    
    /**
     * Salva lo stato del sistema di crafting
     * @returns {Object} - Stato serializzato
     */
    saveState() {
        return {
            inventory: Object.fromEntries(this.playerInventory),
            knownRecipes: Array.from(this.knownRecipes),
            history: this.craftingHistory
        };
    }
    
    /**
     * Carica lo stato del sistema di crafting
     * @param {Object} state - Stato da caricare
     */
    loadState(state) {
        if (state.inventory) {
            this.playerInventory = new Map(Object.entries(state.inventory));
        }
        
        if (state.knownRecipes) {
            this.knownRecipes = new Set(state.knownRecipes);
        }
        
        if (state.history) {
            this.craftingHistory = state.history;
        }
    }
}

// Esporta la classe
window.CraftingSystem = CraftingSystem;
