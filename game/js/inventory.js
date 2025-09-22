/**
 * Mindworld - Sistema di inventario
 * 
 * Questo file contiene le classi e le funzioni per la gestione dell'inventario,
 * inclusi oggetti, equipaggiamento e crafting.
 */

class InventorySystem {
    constructor(game) {
        // Riferimento al gioco
        this.game = game;
        
        // Inventario del giocatore
        this.items = [];
        this.maxSize = 20;
        
        // Equipaggiamento del giocatore
        this.equipment = {
            weapon: null,
            armor: null,
            accessory: null
        };
        
        // Denaro del giocatore
        this.money = 100;
        
        // Database degli oggetti
        this.itemDatabase = {};
        
        // Database delle ricette
        this.recipeDatabase = {};
        
        // Carica i dati degli oggetti
        this.loadItems();
    }
    
    /**
     * Carica i dati degli oggetti dal file JSON
     */
    loadItems() {
        const itemsData = Assets.getData("items");
        
        if (itemsData) {
            // Carica gli oggetti consumabili
            if (itemsData.items.consumables) {
                for (const item of itemsData.items.consumables) {
                    this.itemDatabase[item.id] = item;
                }
            }
            
            // Carica l'equipaggiamento
            if (itemsData.items.equipment) {
                for (const item of itemsData.items.equipment) {
                    this.itemDatabase[item.id] = item;
                }
            }
            
            // Carica i materiali
            if (itemsData.items.materials) {
                for (const item of itemsData.items.materials) {
                    this.itemDatabase[item.id] = item;
                }
            }
            
            // Carica gli oggetti di missione
            if (itemsData.items.quest) {
                for (const item of itemsData.items.quest) {
                    this.itemDatabase[item.id] = item;
                }
            }
            
            // Carica le ricette
            if (itemsData.recipes) {
                for (const recipe of itemsData.recipes) {
                    this.recipeDatabase[recipe.id] = recipe;
                }
            }
            
            console.log(`Caricati ${Object.keys(this.itemDatabase).length} oggetti e ${Object.keys(this.recipeDatabase).length} ricette`);
        }
    }
    
    /**
     * Aggiunge un oggetto all'inventario
     * @param {string} itemId - ID dell'oggetto
     * @param {number} quantity - Quantità dell'oggetto
     * @returns {boolean} True se l'oggetto è stato aggiunto con successo
     */
    addItem(itemId, quantity = 1) {
        // Verifica se l'oggetto esiste
        if (!this.itemDatabase[itemId]) {
            console.error(`Oggetto non trovato: ${itemId}`);
            return false;
        }
        
        const itemData = this.itemDatabase[itemId];
        
        // Se l'oggetto è impilabile, cerca se è già presente nell'inventario
        if (itemData.stackable) {
            const existingItem = this.items.find(item => item.id === itemId);
            
            if (existingItem) {
                // Verifica se si supera il limite di stack
                const newQuantity = existingItem.quantity + quantity;
                if (itemData.maxStack && newQuantity > itemData.maxStack) {
                    console.log(`Limite di stack raggiunto per ${itemData.name}`);
                    existingItem.quantity = itemData.maxStack;
                    
                    // Aggiungi il resto come nuovo oggetto
                    const remainingQuantity = newQuantity - itemData.maxStack;
                    if (remainingQuantity > 0) {
                        return this.addItem(itemId, remainingQuantity);
                    }
                } else {
                    existingItem.quantity = newQuantity;
                }
                
                return true;
            }
        }
        
        // Verifica se c'è spazio nell'inventario
        if (this.items.length >= this.maxSize) {
            console.log("Inventario pieno");
            return false;
        }
        
        // Aggiungi il nuovo oggetto
        this.items.push({
            id: itemId,
            quantity: quantity
        });
        
        console.log(`Aggiunto ${quantity} ${itemData.name} all'inventario`);
        return true;
    }
    
    /**
     * Rimuove un oggetto dall'inventario
     * @param {string} itemId - ID dell'oggetto
     * @param {number} quantity - Quantità dell'oggetto
     * @returns {boolean} True se l'oggetto è stato rimosso con successo
     */
    removeItem(itemId, quantity = 1) {
        const index = this.items.findIndex(item => item.id === itemId);
        
        if (index === -1) {
            console.error(`Oggetto non trovato nell'inventario: ${itemId}`);
            return false;
        }
        
        const item = this.items[index];
        
        if (item.quantity <= quantity) {
            // Rimuovi completamente l'oggetto
            this.items.splice(index, 1);
        } else {
            // Riduci la quantità
            item.quantity -= quantity;
        }
        
        const itemData = this.itemDatabase[itemId];
        console.log(`Rimosso ${quantity} ${itemData.name} dall'inventario`);
        return true;
    }
    
    /**
     * Usa un oggetto
     * @param {string} itemId - ID dell'oggetto
     * @returns {boolean} True se l'oggetto è stato usato con successo
     */
    useItem(itemId) {
        // Verifica se l'oggetto è presente nell'inventario
        const index = this.items.findIndex(item => item.id === itemId);
        
        if (index === -1) {
            console.error(`Oggetto non trovato nell'inventario: ${itemId}`);
            return false;
        }
        
        const itemData = this.itemDatabase[itemId];
        
        // Verifica se l'oggetto è utilizzabile
        if (itemData.type !== "consumable") {
            console.log(`${itemData.name} non è utilizzabile`);
            return false;
        }
        
        // Applica gli effetti dell'oggetto
        if (itemData.effects) {
            for (const effect of itemData.effects) {
                this.applyItemEffect(effect);
            }
        }
        
        // Mostra il testo di utilizzo
        if (itemData.useText) {
            console.log(itemData.useText);
            
            // Aggiungi un messaggio al gioco
            if (this.game.ui) {
                this.game.ui.addMessage(itemData.useText);
            }
        }
        
        // Rimuovi l'oggetto dall'inventario
        this.removeItem(itemId, 1);
        
        return true;
    }
    
    /**
     * Applica l'effetto di un oggetto
     * @param {Object} effect - Effetto dell'oggetto
     */
    applyItemEffect(effect) {
        if (!this.game.player) return;
        
        switch (effect.type) {
            case "heal":
                // Ripristina salute
                this.game.player.health = Math.min(
                    this.game.player.maxHealth,
                    this.game.player.health + effect.value
                );
                break;
                
            case "energy":
                // Ripristina energia
                this.game.player.energy = Math.min(
                    this.game.player.maxEnergy,
                    this.game.player.energy + effect.value
                );
                break;
                
            case "cure":
                // Rimuovi effetti di stato negativi
                if (effect.value === "all") {
                    // Rimuovi tutti gli effetti negativi
                    this.game.player.statusEffects = this.game.player.statusEffects.filter(
                        effect => effect.type === "armor" || effect.type === "regeneration"
                    );
                } else {
                    // Rimuovi un effetto specifico
                    this.game.player.statusEffects = this.game.player.statusEffects.filter(
                        statusEffect => statusEffect.type !== effect.value
                    );
                }
                break;
                
            case "buff":
                // Applica un potenziamento temporaneo
                const buffEffect = {
                    id: Utils.generateId(),
                    type: "buff",
                    stat: effect.stat,
                    value: effect.value,
                    duration: effect.duration,
                    currentTime: 0
                };
                
                this.game.player.statusEffects.push(buffEffect);
                break;
        }
    }
    
    /**
     * Equipaggia un oggetto
     * @param {string} itemId - ID dell'oggetto
     * @returns {boolean} True se l'oggetto è stato equipaggiato con successo
     */
    equipItem(itemId) {
        // Verifica se l'oggetto è presente nell'inventario
        const index = this.items.findIndex(item => item.id === itemId);
        
        if (index === -1) {
            console.error(`Oggetto non trovato nell'inventario: ${itemId}`);
            return false;
        }
        
        const itemData = this.itemDatabase[itemId];
        
        // Verifica se l'oggetto è equipaggiabile
        if (itemData.type !== "equipment") {
            console.log(`${itemData.name} non è equipaggiabile`);
            return false;
        }
        
        // Verifica i requisiti
        if (itemData.requirements) {
            if (itemData.requirements.level && this.game.player.level < itemData.requirements.level) {
                console.log(`Livello insufficiente per equipaggiare ${itemData.name}`);
                return false;
            }
        }
        
        // Rimuovi l'equipaggiamento precedente
        const slot = itemData.slot;
        const previousItem = this.equipment[slot];
        
        if (previousItem) {
            // Aggiungi l'oggetto precedente all'inventario
            this.addItem(previousItem, 1);
        }
        
        // Equipaggia il nuovo oggetto
        this.equipment[slot] = itemId;
        
        // Rimuovi l'oggetto dall'inventario
        this.removeItem(itemId, 1);
        
        // Applica le statistiche dell'equipaggiamento
        this.updateEquipmentStats();
        
        console.log(`Equipaggiato ${itemData.name}`);
        return true;
    }
    
    /**
     * Rimuove un oggetto equipaggiato
     * @param {string} slot - Slot dell'equipaggiamento
     * @returns {boolean} True se l'oggetto è stato rimosso con successo
     */
    unequipItem(slot) {
        // Verifica se c'è un oggetto equipaggiato nello slot
        if (!this.equipment[slot]) {
            console.error(`Nessun oggetto equipaggiato nello slot ${slot}`);
            return false;
        }
        
        const itemId = this.equipment[slot];
        const itemData = this.itemDatabase[itemId];
        
        // Verifica se c'è spazio nell'inventario
        if (this.items.length >= this.maxSize) {
            console.log("Inventario pieno");
            return false;
        }
        
        // Aggiungi l'oggetto all'inventario
        this.addItem(itemId, 1);
        
        // Rimuovi l'oggetto dall'equipaggiamento
        this.equipment[slot] = null;
        
        // Aggiorna le statistiche dell'equipaggiamento
        this.updateEquipmentStats();
        
        console.log(`Rimosso ${itemData.name} dall'equipaggiamento`);
        return true;
    }
    
    /**
     * Aggiorna le statistiche dell'equipaggiamento
     */
    updateEquipmentStats() {
        if (!this.game.player) return;
        
        // Resetta i bonus dell'equipaggiamento
        this.game.player.equipmentStats = {
            attack: 0,
            defense: 0,
            fahBonus: 0,
            brihBonus: 0,
            fahEnergyCost: 0,
            brihEnergyCost: 0,
            energyRegen: 0,
            statusResistance: 0
        };
        
        // Applica le statistiche di ogni oggetto equipaggiato
        for (const slot in this.equipment) {
            const itemId = this.equipment[slot];
            
            if (itemId) {
                const itemData = this.itemDatabase[itemId];
                
                if (itemData.stats) {
                    for (const stat in itemData.stats) {
                        this.game.player.equipmentStats[stat] += itemData.stats[stat];
                    }
                }
            }
        }
    }
    
    /**
     * Crea un oggetto tramite crafting
     * @param {string} recipeId - ID della ricetta
     * @returns {boolean} True se l'oggetto è stato creato con successo
     */
    craftItem(recipeId) {
        // Verifica se la ricetta esiste
        if (!this.recipeDatabase[recipeId]) {
            console.error(`Ricetta non trovata: ${recipeId}`);
            return false;
        }
        
        const recipe = this.recipeDatabase[recipeId];
        
        // Verifica se ci sono tutti gli ingredienti
        for (const ingredient of recipe.ingredients) {
            const inventoryItem = this.items.find(item => item.id === ingredient.id);
            
            if (!inventoryItem || inventoryItem.quantity < ingredient.quantity) {
                console.log(`Ingredienti insufficienti per creare ${recipe.name}`);
                return false;
            }
        }
        
        // Verifica se c'è spazio nell'inventario
        if (this.items.length >= this.maxSize && !this.hasItem(recipe.result.id)) {
            console.log("Inventario pieno");
            return false;
        }
        
        // Rimuovi gli ingredienti
        for (const ingredient of recipe.ingredients) {
            this.removeItem(ingredient.id, ingredient.quantity);
        }
        
        // Aggiungi l'oggetto creato
        this.addItem(recipe.result.id, recipe.result.quantity);
        
        console.log(`Creato ${recipe.result.quantity} ${this.itemDatabase[recipe.result.id].name}`);
        return true;
    }
    
    /**
     * Verifica se un oggetto è presente nell'inventario
     * @param {string} itemId - ID dell'oggetto
     * @returns {boolean} True se l'oggetto è presente
     */
    hasItem(itemId) {
        return this.items.some(item => item.id === itemId);
    }
    
    /**
     * Ottiene la quantità di un oggetto nell'inventario
     * @param {string} itemId - ID dell'oggetto
     * @returns {number} Quantità dell'oggetto
     */
    getItemQuantity(itemId) {
        const item = this.items.find(item => item.id === itemId);
        return item ? item.quantity : 0;
    }
    
    /**
     * Ottiene i dati di un oggetto
     * @param {string} itemId - ID dell'oggetto
     * @returns {Object} Dati dell'oggetto
     */
    getItemData(itemId) {
        return this.itemDatabase[itemId];
    }
    
    /**
     * Ottiene le ricette disponibili
     * @returns {Array} Lista delle ricette disponibili
     */
    getAvailableRecipes() {
        const availableRecipes = [];
        
        for (const recipeId in this.recipeDatabase) {
            const recipe = this.recipeDatabase[recipeId];
            const canCraft = recipe.ingredients.every(ingredient => {
                const inventoryItem = this.items.find(item => item.id === ingredient.id);
                return inventoryItem && inventoryItem.quantity >= ingredient.quantity;
            });
            
            if (canCraft) {
                availableRecipes.push(recipe);
            }
        }
        
        return availableRecipes;
    }
    
    /**
     * Vende un oggetto
     * @param {string} itemId - ID dell'oggetto
     * @param {number} quantity - Quantità dell'oggetto
     * @returns {boolean} True se l'oggetto è stato venduto con successo
     */
    sellItem(itemId, quantity = 1) {
        // Verifica se l'oggetto è presente nell'inventario
        const index = this.items.findIndex(item => item.id === itemId);
        
        if (index === -1) {
            console.error(`Oggetto non trovato nell'inventario: ${itemId}`);
            return false;
        }
        
        const item = this.items[index];
        
        if (item.quantity < quantity) {
            console.error(`Quantità insufficiente di ${itemId}`);
            return false;
        }
        
        const itemData = this.itemDatabase[itemId];
        
        // Calcola il valore di vendita (metà del valore di acquisto)
        const sellValue = Math.floor(itemData.value * 0.5) * quantity;
        
        // Aggiungi il denaro
        this.money += sellValue;
        
        // Rimuovi l'oggetto dall'inventario
        this.removeItem(itemId, quantity);
        
        console.log(`Venduto ${quantity} ${itemData.name} per ${sellValue} monete`);
        return true;
    }
    
    /**
     * Compra un oggetto
     * @param {string} itemId - ID dell'oggetto
     * @param {number} quantity - Quantità dell'oggetto
     * @returns {boolean} True se l'oggetto è stato comprato con successo
     */
    buyItem(itemId, quantity = 1) {
        // Verifica se l'oggetto esiste
        if (!this.itemDatabase[itemId]) {
            console.error(`Oggetto non trovato: ${itemId}`);
            return false;
        }
        
        const itemData = this.itemDatabase[itemId];
        
        // Calcola il costo totale
        const totalCost = itemData.value * quantity;
        
        // Verifica se ci sono abbastanza soldi
        if (this.money < totalCost) {
            console.log("Denaro insufficiente");
            return false;
        }
        
        // Verifica se c'è spazio nell'inventario
        if (this.items.length >= this.maxSize && !this.hasItem(itemId)) {
            console.log("Inventario pieno");
            return false;
        }
        
        // Sottrai il denaro
        this.money -= totalCost;
        
        // Aggiungi l'oggetto all'inventario
        this.addItem(itemId, quantity);
        
        console.log(`Comprato ${quantity} ${itemData.name} per ${totalCost} monete`);
        return true;
    }
    
    /**
     * Disegna l'interfaccia dell'inventario
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    draw(ctx) {
        // Implementazione base, da espandere con un'interfaccia più completa
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(50, 50, ctx.canvas.width - 100, ctx.canvas.height - 100);
        
        ctx.strokeStyle = "#3498db";
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 50, ctx.canvas.width - 100, ctx.canvas.height - 100);
        
        ctx.fillStyle = "#ecf0f1";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Inventario", ctx.canvas.width / 2, 80);
        
        ctx.font = "16px Arial";
        ctx.textAlign = "left";
        ctx.fillText(`Denaro: ${this.money} monete`, 70, 110);
        
        // Disegna gli oggetti
        let y = 140;
        for (const item of this.items) {
            const itemData = this.itemDatabase[item.id];
            
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
        for (const slot in this.equipment) {
            const itemId = this.equipment[slot];
            
            if (itemId) {
                const itemData = this.itemDatabase[itemId];
                ctx.fillText(`${slot}: ${itemData.name}`, ctx.canvas.width - 200, y);
            } else {
                ctx.fillText(`${slot}: -`, ctx.canvas.width - 200, y);
            }
            
            y += 25;
        }
    }
}
