/**
 * Mindworld - Sistema dell'interfaccia utente
 * 
 * Questo file contiene la classe UI che gestisce l'interfaccia utente del gioco.
 */

class UI {
    constructor() {
        // Elementi dell'interfaccia
        this.elements = {
            healthBar: document.getElementById("health-fill"),
            fahEnergyBar: document.getElementById("fah-fill"),
            brihEnergyBar: document.getElementById("brih-fill"),
            dialogBox: document.getElementById("dialog-box"),
            dialogCharacter: document.getElementById("dialog-character"),
            dialogText: document.getElementById("dialog-text"),
            dialogChoices: document.getElementById("dialog-choices"),
            loadingScreen: document.getElementById("loading-screen"),
            loadingBar: document.getElementById("loading-bar"),
            loadingText: document.getElementById("loading-text"),
            startScreen: document.getElementById("start-screen"),
            startButton: document.getElementById("start-button"),
            controlsButton: document.getElementById("controls-button"),
            controlsScreen: document.getElementById("controls-screen"),
            backButton: document.getElementById("back-button"),
            pauseScreen: document.getElementById("pause-screen"),
            resumeButton: document.getElementById("resume-button"),
            menuButton: document.getElementById("menu-button")
        };
        
        // Stato dell'interfaccia
        this.isDialogOpen = false;
        this.currentDialogNPC = null;
        this.currentDialogNode = null;
        this.selectedChoice = 0;
        
        // Inizializza gli event listener
        this.initListeners();
    }
    
    /**
     * Inizializza gli event listener per i pulsanti dell'interfaccia
     */
    initListeners() {
        // Pulsante Start
        if (this.elements.startButton) {
            this.elements.startButton.addEventListener("click", () => {
                this.hideStartScreen();
                this.onStartGame();
            });
        }
        
        // Pulsante Controls
        if (this.elements.controlsButton) {
            this.elements.controlsButton.addEventListener("click", () => {
                this.hideStartScreen();
                this.showControlsScreen();
            });
        }
        
        // Pulsante Back
        if (this.elements.backButton) {
            this.elements.backButton.addEventListener("click", () => {
                this.hideControlsScreen();
                this.showStartScreen();
            });
        }
        
        // Pulsante Resume
        if (this.elements.resumeButton) {
            this.elements.resumeButton.addEventListener("click", () => {
                this.hidePauseScreen();
                this.onResumeGame();
            });
        }
        
        // Pulsante Menu
        if (this.elements.menuButton) {
            this.elements.menuButton.addEventListener("click", () => {
                this.hidePauseScreen();
                this.hideGameUI();
                this.showStartScreen();
                this.onReturnToMenu();
            });
        }
    }
    
    /**
     * Aggiorna l'interfaccia utente
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     * @param {World} world - Riferimento al mondo di gioco
     */
    update(deltaTime, world) {
        // Aggiorna le barre di stato
        this.updateStatusBars(world);
        
        // Aggiorna il dialogo
        this.updateDialog(world);
    }
    
    /**
     * Aggiorna le barre di stato
     * @param {World} world - Riferimento al mondo di gioco
     */
    updateStatusBars(world) {
        if (!world.player) return;
        
        // Barra della salute
        if (this.elements.healthBar) {
            const healthPercentage = (world.player.health / world.player.maxHealth) * 100;
            this.elements.healthBar.style.width = `${healthPercentage}%`;
            
            // Cambia il colore in base alla salute
            if (healthPercentage > 50) {
                this.elements.healthBar.style.backgroundColor = "#2ecc71";
            } else if (healthPercentage > 25) {
                this.elements.healthBar.style.backgroundColor = "#f39c12";
            } else {
                this.elements.healthBar.style.backgroundColor = "#e74c3c";
            }
        }
        
        // Barra dell'energia Fah
        if (this.elements.fahEnergyBar) {
            const fahPercentage = (world.player.fahEnergy / world.player.maxFahEnergy) * 100;
            this.elements.fahEnergyBar.style.width = `${fahPercentage}%`;
        }
        
        // Barra dell'energia Brih
        if (this.elements.brihEnergyBar) {
            const brihPercentage = (world.player.brihEnergy / world.player.maxBrihEnergy) * 100;
            this.elements.brihEnergyBar.style.width = `${brihPercentage}%`;
        }
    }
    
    /**
     * Aggiorna il dialogo
     * @param {World} world - Riferimento al mondo di gioco
     */
    updateDialog(world) {
        // Verifica se lo stato del dialogo è cambiato
        if (world.gameState === "dialogue" && !this.isDialogOpen) {
            this.openDialog(world.activeDialogueNPC, world.activeDialogue);
        } else if (world.gameState !== "dialogue" && this.isDialogOpen) {
            this.closeDialog();
        }
        
        // Aggiorna la scelta selezionata
        if (this.isDialogOpen && world.selectedChoice !== this.selectedChoice) {
            this.selectedChoice = world.selectedChoice;
            this.updateDialogChoices();
        }
    }
    
    /**
     * Apre una finestra di dialogo
     * @param {Character} npc - NPC con cui dialogare
     * @param {Object} dialogNode - Nodo di dialogo
     */
    openDialog(npc, dialogNode) {
        if (!this.elements.dialogBox || !npc || !dialogNode) return;
        
        this.isDialogOpen = true;
        this.currentDialogNPC = npc;
        this.currentDialogNode = dialogNode;
        this.selectedChoice = 0;
        
        // Mostra la finestra di dialogo
        this.elements.dialogBox.classList.remove("hidden");
        
        // Imposta il nome del personaggio
        if (this.elements.dialogCharacter) {
            this.elements.dialogCharacter.textContent = npc.name;
        }
        
        // Imposta il testo del dialogo
        if (this.elements.dialogText) {
            this.elements.dialogText.textContent = dialogNode.text;
        }
        
        // Imposta le scelte
        this.updateDialogChoices();
        
        // Riproduci suono del dialogo
        Assets.playAudio("sfx_dialog", false, 0.5);
    }
    
    /**
     * Aggiorna le scelte del dialogo
     */
    updateDialogChoices() {
        if (!this.elements.dialogChoices || !this.currentDialogNode) return;
        
        // Pulisci le scelte precedenti
        this.elements.dialogChoices.innerHTML = "";
        
        // Aggiungi le nuove scelte
        if (this.currentDialogNode.choices) {
            for (let i = 0; i < this.currentDialogNode.choices.length; i++) {
                const choice = this.currentDialogNode.choices[i];
                
                // Crea l'elemento della scelta
                const choiceElement = document.createElement("div");
                choiceElement.className = "dialog-choice";
                choiceElement.textContent = choice.text;
                
                // Evidenzia la scelta selezionata
                if (i === this.selectedChoice) {
                    choiceElement.classList.add("selected");
                }
                
                // Aggiungi l'event listener
                choiceElement.addEventListener("click", () => {
                    this.onDialogChoiceSelected(i);
                });
                
                // Aggiungi la scelta alla lista
                this.elements.dialogChoices.appendChild(choiceElement);
            }
        }
    }
    
    /**
     * Chiude la finestra di dialogo
     */
    closeDialog() {
        if (!this.elements.dialogBox) return;
        
        this.isDialogOpen = false;
        this.currentDialogNPC = null;
        this.currentDialogNode = null;
        
        // Nascondi la finestra di dialogo
        this.elements.dialogBox.classList.add("hidden");
    }
    
    /**
     * Mostra la schermata di caricamento
     */
    showLoadingScreen() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.classList.remove("hidden");
        }
    }
    
    /**
     * Aggiorna la barra di caricamento
     * @param {number} progress - Progresso del caricamento (0-1)
     */
    updateLoadingProgress(progress) {
        if (this.elements.loadingBar) {
            this.elements.loadingBar.style.width = `${progress * 100}%`;
        }
        
        if (this.elements.loadingText) {
            this.elements.loadingText.textContent = `Caricamento... ${Math.floor(progress * 100)}%`;
        }
    }
    
    /**
     * Nasconde la schermata di caricamento
     */
    hideLoadingScreen() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.classList.add("hidden");
        }
    }
    
    /**
     * Mostra la schermata iniziale
     */
    showStartScreen() {
        if (this.elements.startScreen) {
            this.elements.startScreen.classList.remove("hidden");
        }
    }
    
    /**
     * Nasconde la schermata iniziale
     */
    hideStartScreen() {
        if (this.elements.startScreen) {
            this.elements.startScreen.classList.add("hidden");
        }
    }
    
    /**
     * Mostra la schermata dei controlli
     */
    showControlsScreen() {
        if (this.elements.controlsScreen) {
            this.elements.controlsScreen.classList.remove("hidden");
        }
    }
    
    /**
     * Nasconde la schermata dei controlli
     */
    hideControlsScreen() {
        if (this.elements.controlsScreen) {
            this.elements.controlsScreen.classList.add("hidden");
        }
    }
    
    /**
     * Mostra la schermata di pausa
     */
    showPauseScreen() {
        if (this.elements.pauseScreen) {
            this.elements.pauseScreen.classList.remove("hidden");
        }
    }
    
    /**
     * Nasconde la schermata di pausa
     */
    hidePauseScreen() {
        if (this.elements.pauseScreen) {
            this.elements.pauseScreen.classList.add("hidden");
        }
    }
    
    /**
     * Mostra l'interfaccia di gioco
     */
    showGameUI() {
        // Mostra le barre di stato
        if (this.elements.healthBar) {
            this.elements.healthBar.parentElement.parentElement.style.display = "block";
        }
        
        if (this.elements.fahEnergyBar) {
            this.elements.fahEnergyBar.parentElement.parentElement.parentElement.style.display = "block";
        }
    }
    
    /**
     * Nasconde l'interfaccia di gioco
     */
    hideGameUI() {
        // Nascondi le barre di stato
        if (this.elements.healthBar) {
            this.elements.healthBar.parentElement.parentElement.style.display = "none";
        }
        
        if (this.elements.fahEnergyBar) {
            this.elements.fahEnergyBar.parentElement.parentElement.parentElement.style.display = "none";
        }
        
        // Nascondi il dialogo
        this.closeDialog();
    }
    
    /**
     * Callback per quando viene selezionata una scelta nel dialogo
     * @param {number} choiceIndex - Indice della scelta selezionata
     */
    onDialogChoiceSelected(choiceIndex) {
        // Implementazione base, da sovrascrivere con la logica specifica del gioco
        console.log(`Scelta selezionata: ${choiceIndex}`);
    }
    
    /**
     * Callback per quando viene avviato il gioco
     */
    onStartGame() {
        // Implementazione base, da sovrascrivere con la logica specifica del gioco
        console.log("Gioco avviato");
    }
    
    /**
     * Callback per quando viene ripreso il gioco
     */
    onResumeGame() {
        // Implementazione base, da sovrascrivere con la logica specifica del gioco
        console.log("Gioco ripreso");
    }
    
    /**
     * Callback per quando si torna al menu principale
     */
    onReturnToMenu() {
        // Implementazione base, da sovrascrivere con la logica specifica del gioco
        console.log("Ritorno al menu principale");
    }
}

// Esporta la classe
window.UI = UI;
