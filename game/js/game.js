/**
 * Mindworld - Classe principale del gioco
 * 
 * Questo file contiene la classe Game che gestisce il ciclo di gioco,
 * il caricamento delle risorse e la coordinazione tra i vari sistemi.
 */

class Game {
    constructor() {
        // Canvas e contesto
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
        
        // Ridimensiona il canvas per adattarlo alla finestra
        this.resizeCanvas();
        
        // Sistemi di gioco
        this.particleSystem = new ParticleSystem(this.canvas, this.ctx);
        this.animationSystem = new AnimationSystem();
        this.craftingSystem = new CraftingSystem();
        this.reputationSystem = new ReputationSystem();
        this.questSystem = null; // Inizializzato dopo la creazione del mondo
        this.world = null;
        this.ui = new UI();
        
        // Stato del gioco
        this.isRunning = false;
        this.isPaused = false;
        
        // Tempo
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // Inizializza gli event listener
        this.initListeners();
        
        // Imposta i callback dell'UI
        this.setupUICallbacks();
    }
    
    /**
     * Inizializza gli event listener
     */
    initListeners() {
        // Ridimensiona il canvas quando la finestra viene ridimensionata
        window.addEventListener("resize", () => this.resizeCanvas());
        
        // Gestisci il tasto ESC per mettere in pausa il gioco
        window.addEventListener("keydown", (e) => {
            if (e.code === "Escape" && this.isRunning) {
                this.togglePause();
            }
        });
    }
    
    /**
     * Imposta i callback dell'UI
     */
    setupUICallbacks() {
        // Callback per l'avvio del gioco
        this.ui.onStartGame = () => {
            this.startGame();
        };
        
        // Callback per la ripresa del gioco
        this.ui.onResumeGame = () => {
            this.resumeGame();
        };
        
        // Callback per il ritorno al menu principale
        this.ui.onReturnToMenu = () => {
            this.returnToMenu();
        };
        
        // Callback per la selezione di una scelta nel dialogo
        this.ui.onDialogChoiceSelected = (choiceIndex) => {
            if (this.world && this.world.gameState === "dialogue") {
                this.world.selectedChoice = choiceIndex;
                this.world.confirmChoice();
            }
        };
    }
    
    /**
     * Ridimensiona il canvas per adattarlo alla finestra
     */
    resizeCanvas() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Aggiorna le dimensioni del canvas nel mondo
        if (this.world) {
            this.world.canvasWidth = this.canvas.width;
            this.world.canvasHeight = this.canvas.height;
        }
    }
    
    /**
     * Inizializza il gioco
     */
    init() {
        // Mostra la schermata di caricamento
        this.ui.showLoadingScreen();
        
        // Carica gli asset
        Assets.loadAll(
            // Callback di completamento
            () => {
                // Crea il mondo
                this.world = new World({
                    canvas: this.canvas,
                    ctx: this.ctx,
                    width: 2000,
                    height: 2000,
                    tileSize: 32,
                    ui: this.ui,
                    particleSystem: this.particleSystem,
                    animationSystem: this.animationSystem,
                    craftingSystem: this.craftingSystem,
                    reputationSystem: this.reputationSystem
                });
                
                // Inizializza il mondo
                this.world.init();
                
                // Inizializza il sistema di quest dopo la creazione del mondo
                this.questSystem = new QuestSystem(this.world);
                this.world.questSystem = this.questSystem;
                
                // Nascondi la schermata di caricamento
                this.ui.hideLoadingScreen();
                
                // Mostra la schermata iniziale
                this.ui.showStartScreen();
            },
            // Callback di progresso
            (progress) => {
                this.ui.updateLoadingProgress(progress);
            }
        );
    }
    
    /**
     * Avvia il gioco
     */
    startGame() {
        if (!this.world) return;
        
        // Imposta lo stato di gioco
        this.world.gameState = "playing";
        
        // Mostra l'interfaccia di gioco
        this.ui.showGameUI();
        
        // Avvia il ciclo di gioco
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
    
    /**
     * Mette in pausa o riprende il gioco
     */
    togglePause() {
        if (!this.isRunning) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            // Metti in pausa il gioco
            this.world.gameState = "paused";
            this.ui.showPauseScreen();
        } else {
            // Riprendi il gioco
            this.world.gameState = "playing";
            this.ui.hidePauseScreen();
        }
    }
    
    /**
     * Riprende il gioco dalla pausa
     */
    resumeGame() {
        if (!this.isRunning || !this.isPaused) return;
        
        this.isPaused = false;
        this.world.gameState = "playing";
    }
    
    /**
     * Torna al menu principale
     */
    returnToMenu() {
        this.isRunning = false;
        this.isPaused = false;
        
        // Ricrea il mondo
        this.world = new World({
            canvas: this.canvas,
            ctx: this.ctx,
            width: 2000,
            height: 2000,
            tileSize: 32,
            ui: this.ui,
            particleSystem: this.particleSystem,
            animationSystem: this.animationSystem,
            craftingSystem: this.craftingSystem,
            reputationSystem: this.reputationSystem
        });
        
        // Inizializza il mondo
        this.world.init();
    }
    
    /**
     * Ciclo principale del gioco
     * @param {number} timestamp - Timestamp corrente
     */
    gameLoop(timestamp) {
        // Calcola il delta time
        this.deltaTime = (timestamp - this.lastTime) / 1000; // Converti in secondi
        this.lastTime = timestamp;
        
        // Limita il delta time per evitare problemi con frame rate bassi
        if (this.deltaTime > 0.1) {
            this.deltaTime = 0.1;
        }
        
        // Aggiorna il gioco solo se non è in pausa
        if (!this.isPaused) {
            this.update(this.deltaTime);
            this.particleSystem.update(this.deltaTime);
            this.animationSystem.update(this.deltaTime);
        }
        
        // Disegna il gioco
        this.draw();
        
        // Continua il ciclo di gioco
        if (this.isRunning) {
            requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        }
    }
    
    /**
     * Aggiorna lo stato del gioco
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    update(deltaTime) {
        // Aggiorna il mondo
        if (this.world) {
            this.world.update(deltaTime, Input);
        }
    }
    
    /**
     * Disegna il gioco
     */
    draw() {
        // Disegna il mondo
        if (this.world) {
            this.world.draw();
        }
        
        // Disegna le particelle
        this.particleSystem.draw();
    }
}

// Esporta la classe
window.Game = Game;
