/**
 * Mindworld - Classe World
 * 
 * Gestisce il mondo di gioco, inclusi i personaggi, gli ambienti,
 * i sistemi di crafting e reputazione ispirati a Dr. Stone e Wind Breaker.
 */

class World {
    constructor(options) {
        // Canvas e contesto
        this.canvas = options.canvas;
        this.ctx = options.ctx;
        this.canvasWidth = options.canvas.width;
        this.canvasHeight = options.canvas.height;
        
        // Dimensioni del mondo
        this.width = options.width || 2000;
        this.height = options.height || 2000;
        this.tileSize = options.tileSize || 32;
        
        // Sistemi
        this.ui = options.ui;
        this.particleSystem = options.particleSystem;
        this.animationSystem = options.animationSystem;
        this.craftingSystem = options.craftingSystem;
        this.reputationSystem = options.reputationSystem;
        
        // Stato del gioco
        this.gameState = "menu"; // menu, playing, paused, dialog
        this.currentLevel = "village";
        
        // Personaggi
        this.player = null;
        this.npcs = [];
        this.enemies = [];
        
        // Oggetti del mondo
        this.attacks = [];
        this.items = [];
        this.interactables = [];
        
        // Ambienti
        this.backgrounds = {};
        this.currentBackground = null;
        
        // Sistema di dialoghi
        this.currentDialog = null;
        this.dialogIndex = 0;
        
        // Sistema di missioni
        this.activeMissions = [];
        this.completedMissions = new Set();
        
        // Inizializza i sistemi
        this.initSystems();
    }
    
    /**
     * Inizializza i sistemi del mondo
     */
    initSystems() {
        // Configura i callback per i sistemi
        if (this.craftingSystem) {
            // Aggiungi materiali iniziali per il tutorial
            this.craftingSystem.addMaterial('iron_scrap', 5);
            this.craftingSystem.addMaterial('wood_piece', 3);
            this.craftingSystem.addMaterial('crystal_shard', 2);
        }
        
        if (this.reputationSystem) {
            // Inizializza con reputazione neutra
            console.log('Sistema di reputazione inizializzato');
        }
    }
    
    /**
     * Inizializza il mondo
     */
    init() {
        // Carica i dati del livello
        this.loadLevel(this.currentLevel);
        
        // Crea il giocatore
        this.createPlayer();
        
        // Crea gli NPC
        this.createNPCs();
        
        // Carica gli sfondi
        this.loadBackgrounds();
        
        // Imposta lo sfondo iniziale
        this.setBackground('village');
        
        // Mostra la schermata di avvio
        this.ui.showStartScreen();
        
        console.log('Mondo inizializzato con successo');
    }
    
    /**
     * Carica un livello
     * @param {string} levelName - Nome del livello da caricare
     */
    loadLevel(levelName) {
        const levelData = Assets.getData('levels');
        if (levelData && levelData[levelName]) {
            const level = levelData[levelName];
            this.currentLevel = levelName;
            
            // Carica gli oggetti interattivi del livello
            this.loadInteractables(level.interactables || []);
            
            console.log(`Livello ${levelName} caricato`);
        }
    }
    
    /**
     * Carica gli oggetti interattivi
     * @param {Array} interactables - Array di oggetti interattivi
     */
    loadInteractables(interactables) {
        this.interactables = interactables.map(item => ({
            ...item,
            interacted: false
        }));
    }
    
    /**
     * Crea il giocatore
     */
    createPlayer() {
        this.player = new Player({
            x: 400,
            y: 300,
            world: this,
            canvas: this.canvas,
            ctx: this.ctx
        });
    }
    
    /**
     * Crea gli NPC
     */
    createNPCs() {
        const charactersData = Assets.getData('characters');
        if (!charactersData) return;
        
        this.npcs = [];
        
        // Crea gli NPC basati sui dati dei personaggi
        for (const id in charactersData.npcs) {
            const data = charactersData.npcs[id];
            if (data.location === this.currentLevel) {
                const npc = new Character({
                    id: id,
                    x: data.x || 200,
                    y: data.y || 200,
                    sprite: Assets.getImage(data.sprite),
                    name: data.name,
                    faction: data.faction,
                    world: this,
                    canvas: this.canvas,
                    ctx: this.ctx
                });
                
                this.npcs.push(npc);
            }
        }
        
        console.log(`Creati ${this.npcs.length} NPC`);
    }
    
    /**
     * Carica gli sfondi
     */
    loadBackgrounds() {
        this.backgrounds = {
            'village': Assets.getImage('bg_village'),
            'city': Assets.getImage('bg_city'),
            'tower': Assets.getImage('bg_tower')
        };
    }
    
    /**
     * Imposta lo sfondo corrente
     * @param {string} backgroundName - Nome dello sfondo
     */
    setBackground(backgroundName) {
        if (this.backgrounds[backgroundName]) {
            this.currentBackground = this.backgrounds[backgroundName];
        }
    }
    
    /**
     * Inizia il gioco
     */
    startGame() {
        this.gameState = "playing";
        this.ui.hideStartScreen();
        
        // Avvia la musica di sottofondo
        Assets.playAudio('music_village', true, 0.3);
        
        // Mostra il tutorial di crafting se è la prima volta
        if (this.craftingSystem && !localStorage.getItem('mindworld_tutorial_shown')) {
            this.showCraftingTutorial();
            localStorage.setItem('mindworld_tutorial_shown', 'true');
        }
    }
    
    /**
     * Mostra il tutorial di crafting
     */
    showCraftingTutorial() {
        const tutorialDialog = {
            character: "Maestro Elian",
            text: "Benvenuto nel laboratorio scientifico! Qui puoi combinare materiali usando principi scientifici per creare oggetti utili. Premi 'C' per aprire il menu di crafting.",
            choices: [
                { text: "Capito!", action: "close" }
            ]
        };
        
        this.startDialog(tutorialDialog);
    }
    
    /**
     * Aggiorna il mondo
     * @param {number} deltaTime - Tempo trascorso dall'ultimo frame
     */
    update(deltaTime) {
        if (this.gameState !== "playing") return;
        
        // Aggiorna il giocatore
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        // Aggiorna gli NPC
        for (const npc of this.npcs) {
            if (npc.update) {
                npc.update(deltaTime);
            }
        }
        
        // Aggiorna gli attacchi
        this.updateAttacks(deltaTime);
        
        // Aggiorna gli oggetti
        this.updateItems(deltaTime);
        
        // Controlla le interazioni
        this.checkInteractions();
        
        // Aggiorna i sistemi di particelle e animazioni
        if (this.particleSystem) {
            this.particleSystem.update(deltaTime);
        }
        
        if (this.animationSystem) {
            this.animationSystem.update(deltaTime);
        }
    }
    
    /**
     * Aggiorna gli attacchi
     * @param {number} deltaTime - Tempo trascorso
     */
    updateAttacks(deltaTime) {
        for (let i = this.attacks.length - 1; i >= 0; i--) {
            const attack = this.attacks[i];
            
            // Aggiorna la durata dell'attacco
            attack.duration -= deltaTime;
            
            // Rimuovi l'attacco se è scaduto
            if (attack.duration <= 0) {
                this.attacks.splice(i, 1);
            }
        }
    }
    
    /**
     * Aggiorna gli oggetti
     * @param {number} deltaTime - Tempo trascorso
     */
    updateItems(deltaTime) {
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            
            // Controlla se il giocatore raccoglie l'oggetto
            if (this.player && this.getDistance(this.player, item) < 30) {
                this.collectItem(item);
                this.items.splice(i, 1);
            }
        }
    }
    
    /**
     * Raccoglie un oggetto
     * @param {Object} item - Oggetto da raccogliere
     */
    collectItem(item) {
        // Aggiungi materiali al sistema di crafting
        if (this.craftingSystem && item.type === 'material') {
            this.craftingSystem.addMaterial(item.id, item.quantity || 1);
            
            // Mostra notifica
            this.ui.showNotification({
                title: 'Materiale Raccolto!',
                text: `Hai raccolto: ${item.name}`,
                type: 'item_collected'
            });
        }
        
        // Riproduci suono
        Assets.playAudio('sfx_pickup', false, 0.5);
    }
    
    /**
     * Controlla le interazioni
     */
    checkInteractions() {
        if (!this.player) return;
        
        // Controlla interazioni con NPC
        for (const npc of this.npcs) {
            if (this.getDistance(this.player, npc) < 50) {
                this.ui.showInteractionPrompt(`Premi E per parlare con ${npc.name}`);
                
                if (Input.isKeyPressed('KeyE')) {
                    this.interactWithNPC(npc);
                }
                return;
            }
        }
        
        // Controlla interazioni con oggetti
        for (const interactable of this.interactables) {
            if (this.getDistance(this.player, interactable) < 50) {
                this.ui.showInteractionPrompt(`Premi E per ${interactable.action}`);
                
                if (Input.isKeyPressed('KeyE')) {
                    this.interactWithObject(interactable);
                }
                return;
            }
        }
        
        // Nascondi il prompt se non ci sono interazioni
        this.ui.hideInteractionPrompt();
    }
    
    /**
     * Interagisce con un NPC
     * @param {Object} npc - NPC con cui interagire
     */
    interactWithNPC(npc) {
        const dialogsData = Assets.getData('dialogs');
        if (dialogsData && dialogsData[npc.id]) {
            this.startDialog(dialogsData[npc.id]);
            
            // Aggiorna reputazione se l'NPC appartiene a una fazione
            if (this.reputationSystem && npc.faction) {
                this.reputationSystem.handlePlayerAction('talk_to_faction_member', npc.faction);
            }
        }
    }
    
    /**
     * Interagisce con un oggetto
     * @param {Object} interactable - Oggetto interattivo
     */
    interactWithObject(interactable) {
        if (interactable.interacted) return;
        
        switch (interactable.type) {
            case 'crafting_station':
                this.openCraftingMenu();
                break;
            case 'reputation_board':
                this.openReputationMenu();
                break;
            case 'material_source':
                this.harvestMaterial(interactable);
                break;
            default:
                console.log(`Interazione con ${interactable.type}`);
        }
        
        interactable.interacted = true;
    }
    
    /**
     * Apre il menu di crafting
     */
    openCraftingMenu() {
        if (this.craftingSystem) {
            this.ui.showCraftingWindow(this.craftingSystem);
        }
    }
    
    /**
     * Apre il menu di reputazione
     */
    openReputationMenu() {
        if (this.reputationSystem) {
            this.ui.showReputationWindow(this.reputationSystem);
        }
    }
    
    /**
     * Raccoglie materiali da una fonte
     * @param {Object} source - Fonte di materiali
     */
    harvestMaterial(source) {
        if (this.craftingSystem && source.materials) {
            for (const material of source.materials) {
                this.craftingSystem.addMaterial(material.id, material.quantity);
            }
            
            this.ui.showNotification({
                title: 'Materiali Raccolti!',
                text: `Hai raccolto materiali da ${source.name}`,
                type: 'materials_harvested'
            });
        }
    }
    
    /**
     * Inizia un dialogo
     * @param {Object} dialog - Dati del dialogo
     */
    startDialog(dialog) {
        this.currentDialog = dialog;
        this.dialogIndex = 0;
        this.gameState = "dialog";
        this.ui.showDialog(dialog);
    }
    
    /**
     * Termina il dialogo corrente
     */
    endDialog() {
        this.currentDialog = null;
        this.dialogIndex = 0;
        this.gameState = "playing";
        this.ui.hideDialog();
    }
    
    /**
     * Calcola la distanza tra due oggetti
     * @param {Object} obj1 - Primo oggetto
     * @param {Object} obj2 - Secondo oggetto
     * @returns {number} Distanza
     */
    getDistance(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Disegna il mondo
     */
    draw() {
        // Pulisci il canvas
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Disegna lo sfondo
        this.drawBackground();
        
        // Disegna gli oggetti del mondo
        this.drawItems();
        
        // Disegna gli NPC
        this.drawNPCs();
        
        // Disegna il giocatore
        if (this.player) {
            this.player.draw();
        }
        
        // Disegna gli attacchi
        this.drawAttacks();
        
        // Disegna le particelle
        if (this.particleSystem) {
            this.particleSystem.draw();
        }
    }
    
    /**
     * Disegna lo sfondo
     */
    drawBackground() {
        if (this.currentBackground) {
            try {
                // Disegna lo sfondo adattandolo al canvas
                this.ctx.drawImage(
                    this.currentBackground,
                    0, 0,
                    this.canvasWidth,
                    this.canvasHeight
                );
            } catch (error) {
                console.error('Errore nel disegno dello sfondo:', error);
                // Fallback: sfondo colorato
                this.ctx.fillStyle = '#87CEEB';
                this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            }
        }
    }
    
    /**
     * Disegna gli oggetti
     */
    drawItems() {
        for (const item of this.items) {
            const screenX = item.x - (this.player ? this.player.cameraOffsetX : 0);
            const screenY = item.y - (this.player ? this.player.cameraOffsetY : 0);
            
            // Disegna l'oggetto come un cerchio colorato
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, 10, 0, Math.PI * 2);
            this.ctx.fillStyle = item.color || '#FFD700';
            this.ctx.fill();
            this.ctx.strokeStyle = '#FFA500';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }
    
    /**
     * Disegna gli NPC
     */
    drawNPCs() {
        for (const npc of this.npcs) {
            if (npc.draw) {
                npc.draw();
            }
        }
    }
    
    /**
     * Disegna gli attacchi
     */
    drawAttacks() {
        for (const attack of this.attacks) {
            const screenX = attack.x - (this.player ? this.player.cameraOffsetX : 0);
            const screenY = attack.y - (this.player ? this.player.cameraOffsetY : 0);
            
            // Ottieni lo sprite dell'effetto
            let effectSprite;
            switch (attack.type) {
                case "fah":
                    effectSprite = Assets.getImage("effect_fire");
                    break;
                case "brih":
                    effectSprite = Assets.getImage("effect_water");
                    break;
                case "combined":
                    effectSprite = Assets.getImage("effect_combined");
                    break;
            }
            
            if (effectSprite) {
                try {
                    const effectSize = attack.range * 0.8;
                    this.ctx.drawImage(
                        effectSprite,
                        screenX - effectSize / 2,
                        screenY - effectSize / 2,
                        effectSize,
                        effectSize
                    );
                } catch (error) {
                    this.drawFallbackAttack(attack, screenX, screenY);
                }
            } else {
                this.drawFallbackAttack(attack, screenX, screenY);
            }
        }
    }
    
    /**
     * Disegna un attacco come fallback
     * @param {Object} attack - Attacco da disegnare
     * @param {number} screenX - Coordinata X sullo schermo
     * @param {number} screenY - Coordinata Y sullo schermo
     */
    drawFallbackAttack(attack, screenX, screenY) {
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
        
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, attack.range / 3, 0, Math.PI * 2);
        this.ctx.fillStyle = color + "80";
        this.ctx.fill();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    
    /**
     * Aggiunge un attacco al mondo
     * @param {Object} attack - Dati dell'attacco
     */
    addAttack(attack) {
        this.attacks.push({
            ...attack,
            duration: attack.duration || 1.0
        });
        
        // Crea particelle per l'effetto
        if (this.particleSystem) {
            this.particleSystem.createAttackEffect(attack);
        }
    }
    
    /**
     * Cambia livello
     * @param {string} newLevel - Nome del nuovo livello
     */
    changeLevel(newLevel) {
        this.currentLevel = newLevel;
        this.loadLevel(newLevel);
        this.createNPCs();
        this.setBackground(newLevel);
        
        // Riproduci la musica appropriata
        Assets.stopAudio('music_village');
        Assets.stopAudio('music_city');
        Assets.playAudio(`music_${newLevel}`, true, 0.3);
    }
}

// Esporta la classe
window.World = World;
