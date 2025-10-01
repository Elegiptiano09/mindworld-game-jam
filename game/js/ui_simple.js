/**
 * Mindworld - Sistema UI Semplificato
 * 
 * Versione semplificata dell'interfaccia utente per garantire compatibilità.
 */

class UI {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.startScreen = document.getElementById('start-screen');
        this.pauseScreen = document.getElementById('pause-screen');
        this.loadingBar = document.getElementById('loading-bar');
        this.loadingText = document.getElementById('loading-text');
        
        // Callback
        this.onStartGame = null;
        this.onResumeGame = null;
        this.onReturnToMenu = null;
        this.onDialogChoiceSelected = null;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Pulsante start
        const startButton = document.getElementById('start-button');
        if (startButton) {
            startButton.addEventListener('click', () => {
                if (this.onStartGame) this.onStartGame();
            });
        }
        
        // Pulsante resume
        const resumeButton = document.getElementById('resume-button');
        if (resumeButton) {
            resumeButton.addEventListener('click', () => {
                if (this.onResumeGame) this.onResumeGame();
            });
        }
        
        // Pulsante menu
        const menuButton = document.getElementById('menu-button');
        if (menuButton) {
            menuButton.addEventListener('click', () => {
                if (this.onReturnToMenu) this.onReturnToMenu();
            });
        }
    }
    
    showLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.remove('hidden');
            this.loadingScreen.style.display = 'flex';
        }
    }
    
    hideLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('hidden');
            this.loadingScreen.style.display = 'none';
        }
    }
    
    showStartScreen() {
        if (this.startScreen) {
            this.startScreen.classList.remove('hidden');
            this.startScreen.style.display = 'flex';
        }
    }
    
    hideStartScreen() {
        if (this.startScreen) {
            this.startScreen.classList.add('hidden');
            this.startScreen.style.display = 'none';
        }
    }
    
    showPauseScreen() {
        if (this.pauseScreen) {
            this.pauseScreen.classList.remove('hidden');
            this.pauseScreen.style.display = 'flex';
        }
    }
    
    hidePauseScreen() {
        if (this.pauseScreen) {
            this.pauseScreen.classList.add('hidden');
            this.pauseScreen.style.display = 'none';
        }
    }
    
    showGameUI() {
        this.hideStartScreen();
        this.hideLoadingScreen();
        this.hidePauseScreen();
    }
    
    updateLoadingProgress(progress) {
        if (this.loadingBar) {
            this.loadingBar.style.width = (progress * 100) + '%';
        }
        if (this.loadingText) {
            this.loadingText.textContent = `Caricamento... ${Math.round(progress * 100)}%`;
        }
    }
}

// Esporta la classe
window.UI = UI;
