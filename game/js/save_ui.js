/**
 * Mindworld - Interfaccia Utente per il Sistema di Salvataggio
 * 
 * Questo file gestisce l'interfaccia utente per il salvataggio e il caricamento dei dati di gioco.
 */

class SaveUI {
    /**
     * Crea una nuova interfaccia utente per il sistema di salvataggio
     * @param {Object} options - Opzioni per l'interfaccia utente
     * @param {SaveSystem} options.saveSystem - Riferimento al sistema di salvataggio
     * @param {UI} options.ui - Riferimento all'interfaccia utente principale
     */
    constructor(options = {}) {
        // Riferimenti
        this.saveSystem = options.saveSystem || null;
        this.ui = options.ui || null;
        
        // Elementi dell'interfaccia
        this.container = null;
        this.savePanel = null;
        this.loadPanel = null;
        this.exportPanel = null;
        this.importPanel = null;
        
        // Stato dell'interfaccia
        this.isVisible = false;
        this.currentPanel = "save";
        
        // Callback
        this.onClose = null;
    }
    
    /**
     * Inizializza l'interfaccia utente
     */
    init() {
        // Crea il container
        this.container = document.createElement("div");
        this.container.className = "save-ui";
        this.container.style.display = "none";
        
        // Crea l'intestazione
        const header = document.createElement("div");
        header.className = "save-ui-header";
        
        // Crea il titolo
        const title = document.createElement("h2");
        title.textContent = "Salvataggio";
        header.appendChild(title);
        
        // Crea il pulsante di chiusura
        const closeButton = document.createElement("button");
        closeButton.className = "save-ui-close-button";
        closeButton.textContent = "X";
        closeButton.addEventListener("click", () => this.hide());
        header.appendChild(closeButton);
        
        this.container.appendChild(header);
        
        // Crea la barra di navigazione
        const navbar = document.createElement("div");
        navbar.className = "save-ui-navbar";
        
        // Crea i pulsanti di navigazione
        const saveButton = document.createElement("button");
        saveButton.textContent = "Salva";
        saveButton.addEventListener("click", () => this.showPanel("save"));
        navbar.appendChild(saveButton);
        
        const loadButton = document.createElement("button");
        loadButton.textContent = "Carica";
        loadButton.addEventListener("click", () => this.showPanel("load"));
        navbar.appendChild(loadButton);
        
        const exportButton = document.createElement("button");
        exportButton.textContent = "Esporta";
        exportButton.addEventListener("click", () => this.showPanel("export"));
        navbar.appendChild(exportButton);
        
        const importButton = document.createElement("button");
        importButton.textContent = "Importa";
        importButton.addEventListener("click", () => this.showPanel("import"));
        navbar.appendChild(importButton);
        
        this.container.appendChild(navbar);
        
        // Crea il contenuto
        const content = document.createElement("div");
        content.className = "save-ui-content";
        
        // Crea i pannelli
        this.savePanel = this.createSavePanel();
        this.loadPanel = this.createLoadPanel();
        this.exportPanel = this.createExportPanel();
        this.importPanel = this.createImportPanel();
        
        content.appendChild(this.savePanel);
        content.appendChild(this.loadPanel);
        content.appendChild(this.exportPanel);
        content.appendChild(this.importPanel);
        
        this.container.appendChild(content);
        
        // Aggiungi il container al documento
        document.body.appendChild(this.container);
    }
    
    /**
     * Crea il pannello di salvataggio
     * @returns {HTMLElement} - Pannello di salvataggio
     */
    createSavePanel() {
        const panel = document.createElement("div");
        panel.className = "save-ui-panel";
        panel.id = "save-panel";
        
        // Crea il titolo
        const title = document.createElement("h3");
        title.textContent = "Salva Gioco";
        panel.appendChild(title);
        
        // Crea la lista degli slot
        const slotList = document.createElement("div");
        slotList.className = "save-ui-slot-list";
        
        // Ottieni le informazioni sui salvataggi
        const saveInfo = this.saveSystem ? this.saveSystem.getSaveInfo() : [];
        
        // Crea gli slot
        for (let i = 0; i < 3; i++) {
            const slot = saveInfo[i] || { slot: i + 1, empty: true };
            
            const slotItem = document.createElement("div");
            slotItem.className = "save-ui-slot-item";
            
            // Crea il contenuto dello slot
            if (slot.empty) {
                slotItem.innerHTML = `
                    <div class="save-ui-slot-header">
                        <h4>Slot ${slot.slot}</h4>
                        <span>Vuoto</span>
                    </div>
                    <div class="save-ui-slot-content">
                        <p>Nessun salvataggio</p>
                    </div>
                `;
            } else {
                slotItem.innerHTML = `
                    <div class="save-ui-slot-header">
                        <h4>Slot ${slot.slot}</h4>
                        <span>${slot.date}</span>
                    </div>
                    <div class="save-ui-slot-content">
                        <p>Livello: ${slot.level}</p>
                        <p>Posizione: ${slot.location}</p>
                        <p>Tempo di gioco: ${this.formatPlayTime(slot.playTime)}</p>
                    </div>
                `;
            }
            
            // Crea il pulsante di salvataggio
            const saveButton = document.createElement("button");
            saveButton.textContent = "Salva";
            saveButton.addEventListener("click", () => {
                if (this.saveSystem) {
                    this.saveSystem.saveGame(slot.slot);
                    this.updatePanels();
                }
            });
            
            slotItem.appendChild(saveButton);
            slotList.appendChild(slotItem);
        }
        
        panel.appendChild(slotList);
        
        return panel;
    }
    
    /**
     * Crea il pannello di caricamento
     * @returns {HTMLElement} - Pannello di caricamento
     */
    createLoadPanel() {
        const panel = document.createElement("div");
        panel.className = "save-ui-panel";
        panel.id = "load-panel";
        panel.style.display = "none";
        
        // Crea il titolo
        const title = document.createElement("h3");
        title.textContent = "Carica Gioco";
        panel.appendChild(title);
        
        // Crea la lista degli slot
        const slotList = document.createElement("div");
        slotList.className = "save-ui-slot-list";
        
        // Ottieni le informazioni sui salvataggi
        const saveInfo = this.saveSystem ? this.saveSystem.getSaveInfo() : [];
        
        // Crea gli slot
        for (let i = 0; i < 3; i++) {
            const slot = saveInfo[i] || { slot: i + 1, empty: true };
            
            const slotItem = document.createElement("div");
            slotItem.className = "save-ui-slot-item";
            
            // Crea il contenuto dello slot
            if (slot.empty) {
                slotItem.innerHTML = `
                    <div class="save-ui-slot-header">
                        <h4>Slot ${slot.slot}</h4>
                        <span>Vuoto</span>
                    </div>
                    <div class="save-ui-slot-content">
                        <p>Nessun salvataggio</p>
                    </div>
                `;
            } else {
                slotItem.innerHTML = `
                    <div class="save-ui-slot-header">
                        <h4>Slot ${slot.slot}</h4>
                        <span>${slot.date}</span>
                    </div>
                    <div class="save-ui-slot-content">
                        <p>Livello: ${slot.level}</p>
                        <p>Posizione: ${slot.location}</p>
                        <p>Tempo di gioco: ${this.formatPlayTime(slot.playTime)}</p>
                    </div>
                `;
            }
            
            // Crea i pulsanti
            const buttonContainer = document.createElement("div");
            buttonContainer.className = "save-ui-slot-buttons";
            
            // Crea il pulsante di caricamento
            const loadButton = document.createElement("button");
            loadButton.textContent = "Carica";
            loadButton.disabled = slot.empty;
            loadButton.addEventListener("click", () => {
                if (this.saveSystem && !slot.empty) {
                    this.saveSystem.loadGame(slot.slot);
                    this.hide();
                }
            });
            
            // Crea il pulsante di eliminazione
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Elimina";
            deleteButton.disabled = slot.empty;
            deleteButton.addEventListener("click", () => {
                if (this.saveSystem && !slot.empty) {
                    if (confirm(`Sei sicuro di voler eliminare il salvataggio nello slot ${slot.slot}?`)) {
                        this.saveSystem.deleteSave(slot.slot);
                        this.updatePanels();
                    }
                }
            });
            
            buttonContainer.appendChild(loadButton);
            buttonContainer.appendChild(deleteButton);
            
            slotItem.appendChild(buttonContainer);
            slotList.appendChild(slotItem);
        }
        
        panel.appendChild(slotList);
        
        // Crea il pulsante per il salvataggio automatico
        const autoSaveContainer = document.createElement("div");
        autoSaveContainer.className = "save-ui-autosave";
        
        const autoSaveTitle = document.createElement("h4");
        autoSaveTitle.textContent = "Salvataggio Automatico";
        autoSaveContainer.appendChild(autoSaveTitle);
        
        const autoSaveButton = document.createElement("button");
        autoSaveButton.textContent = "Carica Salvataggio Automatico";
        autoSaveButton.addEventListener("click", () => {
            if (this.saveSystem) {
                this.saveSystem.loadAutoSave();
                this.hide();
            }
        });
        
        autoSaveContainer.appendChild(autoSaveButton);
        panel.appendChild(autoSaveContainer);
        
        return panel;
    }
    
    /**
     * Crea il pannello di esportazione
     * @returns {HTMLElement} - Pannello di esportazione
     */
    createExportPanel() {
        const panel = document.createElement("div");
        panel.className = "save-ui-panel";
        panel.id = "export-panel";
        panel.style.display = "none";
        
        // Crea il titolo
        const title = document.createElement("h3");
        title.textContent = "Esporta Salvataggio";
        panel.appendChild(title);
        
        // Crea la descrizione
        const description = document.createElement("p");
        description.textContent = "Esporta il salvataggio corrente come file JSON.";
        panel.appendChild(description);
        
        // Crea il pulsante di esportazione
        const exportButton = document.createElement("button");
        exportButton.textContent = "Esporta Salvataggio";
        exportButton.addEventListener("click", () => {
            if (this.saveSystem) {
                this.saveSystem.exportSave();
            }
        });
        
        panel.appendChild(exportButton);
        
        return panel;
    }
    
    /**
     * Crea il pannello di importazione
     * @returns {HTMLElement} - Pannello di importazione
     */
    createImportPanel() {
        const panel = document.createElement("div");
        panel.className = "save-ui-panel";
        panel.id = "import-panel";
        panel.style.display = "none";
        
        // Crea il titolo
        const title = document.createElement("h3");
        title.textContent = "Importa Salvataggio";
        panel.appendChild(title);
        
        // Crea la descrizione
        const description = document.createElement("p");
        description.textContent = "Importa un salvataggio da un file JSON.";
        panel.appendChild(description);
        
        // Crea il form di importazione
        const form = document.createElement("div");
        form.className = "save-ui-import-form";
        
        // Crea il campo di selezione del file
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".json";
        form.appendChild(fileInput);
        
        // Crea il campo di selezione dello slot
        const slotSelect = document.createElement("select");
        
        for (let i = 1; i <= 3; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.textContent = `Slot ${i}`;
            slotSelect.appendChild(option);
        }
        
        form.appendChild(slotSelect);
        
        // Crea il pulsante di importazione
        const importButton = document.createElement("button");
        importButton.textContent = "Importa";
        importButton.addEventListener("click", () => {
            if (this.saveSystem && fileInput.files.length > 0) {
                this.saveSystem.importSave(fileInput.files[0], parseInt(slotSelect.value))
                    .then(success => {
                        if (success) {
                            alert("Salvataggio importato con successo!");
                            this.updatePanels();
                        } else {
                            alert("Errore durante l'importazione del salvataggio.");
                        }
                    });
            }
        });
        
        form.appendChild(importButton);
        
        panel.appendChild(form);
        
        return panel;
    }
    
    /**
     * Mostra l'interfaccia utente
     * @param {Function} onClose - Callback da chiamare alla chiusura dell'interfaccia
     */
    show(onClose = null) {
        this.isVisible = true;
        this.onClose = onClose;
        
        // Aggiorna i pannelli
        this.updatePanels();
        
        // Mostra il container
        if (this.container) {
            this.container.style.display = "block";
        }
        
        // Mostra il pannello corrente
        this.showPanel(this.currentPanel);
    }
    
    /**
     * Nasconde l'interfaccia utente
     */
    hide() {
        this.isVisible = false;
        
        // Nascondi il container
        if (this.container) {
            this.container.style.display = "none";
        }
        
        // Chiama il callback di chiusura
        if (this.onClose) {
            this.onClose();
        }
    }
    
    /**
     * Mostra un pannello specifico
     * @param {string} panelId - ID del pannello da mostrare
     */
    showPanel(panelId) {
        this.currentPanel = panelId;
        
        // Nascondi tutti i pannelli
        if (this.savePanel) this.savePanel.style.display = "none";
        if (this.loadPanel) this.loadPanel.style.display = "none";
        if (this.exportPanel) this.exportPanel.style.display = "none";
        if (this.importPanel) this.importPanel.style.display = "none";
        
        // Mostra il pannello richiesto
        switch (panelId) {
            case "save":
                if (this.savePanel) this.savePanel.style.display = "block";
                break;
            
            case "load":
                if (this.loadPanel) this.loadPanel.style.display = "block";
                break;
            
            case "export":
                if (this.exportPanel) this.exportPanel.style.display = "block";
                break;
            
            case "import":
                if (this.importPanel) this.importPanel.style.display = "block";
                break;
        }
    }
    
    /**
     * Aggiorna tutti i pannelli
     */
    updatePanels() {
        // Rimuovi i pannelli esistenti
        if (this.savePanel && this.savePanel.parentNode) {
            this.savePanel.parentNode.removeChild(this.savePanel);
        }
        
        if (this.loadPanel && this.loadPanel.parentNode) {
            this.loadPanel.parentNode.removeChild(this.loadPanel);
        }
        
        // Crea nuovi pannelli
        this.savePanel = this.createSavePanel();
        this.loadPanel = this.createLoadPanel();
        
        // Aggiungi i pannelli al contenuto
        const content = this.container.querySelector(".save-ui-content");
        if (content) {
            content.appendChild(this.savePanel);
            content.appendChild(this.loadPanel);
            content.appendChild(this.exportPanel);
            content.appendChild(this.importPanel);
        }
        
        // Mostra il pannello corrente
        this.showPanel(this.currentPanel);
    }
    
    /**
     * Formatta il tempo di gioco
     * @param {number} seconds - Tempo di gioco in secondi
     * @returns {string} - Tempo di gioco formattato
     */
    formatPlayTime(seconds) {
        if (!seconds) return "0:00:00";
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
}

// Esporta la classe
window.SaveUI = SaveUI;
