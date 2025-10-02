/**
 * Mindworld - Sistema di Dialoghi
 * 
 * Questo file gestisce il sistema di dialoghi e cutscene del gioco.
 */

class DialogueSystem {
    /**
     * Crea un nuovo sistema di dialoghi
     * @param {Object} options - Opzioni per il sistema di dialoghi
     * @param {UI} options.ui - Riferimento all'interfaccia utente
     * @param {World} options.world - Riferimento al mondo di gioco
     */
    constructor(options = {}) {
        // Riferimenti
        this.ui = options.ui || null;
        this.world = options.world || null;
        
        // Stato del dialogo
        this.isActive = false;
        this.currentDialogue = null;
        this.currentSpeaker = null;
        this.currentText = "";
        this.currentChoices = [];
        this.selectedChoice = 0;
        
        // Animazione del testo
        this.textSpeed = 30; // Caratteri al secondo
        this.textTimer = 0;
        this.textIndex = 0;
        this.isTextComplete = false;
        
        // Cutscene
        this.isCutsceneActive = false;
        this.currentCutscene = null;
        this.cutsceneStep = 0;
        this.cutsceneTimer = 0;
        
        // Callback
        this.onDialogueEnd = null;
        this.onChoiceSelected = null;
        this.onCutsceneEnd = null;
    }
    
    /**
     * Avvia un dialogo
     * @param {Object} dialogue - Dati del dialogo
     * @param {string} dialogue.speaker - Nome del personaggio che parla
     * @param {string} dialogue.text - Testo del dialogo
     * @param {Array} dialogue.choices - Scelte disponibili
     * @param {Function} onEnd - Callback da chiamare alla fine del dialogo
     */
    startDialogue(dialogue, onEnd = null) {
        this.isActive = true;
        this.currentDialogue = dialogue;
        this.currentSpeaker = dialogue.speaker;
        this.currentText = dialogue.text;
        this.currentChoices = dialogue.choices || [];
        this.selectedChoice = 0;
        this.textIndex = 0;
        this.isTextComplete = false;
        this.onDialogueEnd = onEnd;
        
        // Mostra il dialogo nell'UI
        if (this.ui) {
            this.ui.showDialogue(this.currentSpeaker, "", this.currentChoices);
        }
        
        // Imposta lo stato del mondo
        if (this.world) {
            this.world.gameState = "dialogue";
        }
    }
    
    /**
     * Termina il dialogo corrente
     */
    endDialogue() {
        this.isActive = false;
        this.currentDialogue = null;
        this.currentSpeaker = null;
        this.currentText = "";
        this.currentChoices = [];
        this.selectedChoice = 0;
        
        // Nascondi il dialogo nell'UI
        if (this.ui) {
            this.ui.hideDialogue();
        }
        
        // Ripristina lo stato del mondo
        if (this.world) {
            this.world.gameState = "playing";
        }
        
        // Chiama il callback di fine dialogo
        if (this.onDialogueEnd) {
            this.onDialogueEnd();
        }
    }
    
    /**
     * Avanza nel dialogo
     */
    advanceDialogue() {
        // Se il testo non è completo, completalo
        if (!this.isTextComplete) {
            this.textIndex = this.currentText.length;
            this.isTextComplete = true;
            
            // Aggiorna il testo nell'UI
            if (this.ui) {
                this.ui.updateDialogueText(this.currentText);
            }
            
            return;
        }
        
        // Se ci sono scelte, seleziona quella corrente
        if (this.currentChoices && this.currentChoices.length > 0) {
            const choice = this.currentChoices[this.selectedChoice];
            
            // Chiama il callback di selezione della scelta
            if (this.onChoiceSelected) {
                this.onChoiceSelected(choice, this.selectedChoice);
            }
            
            return;
        }
        
        // Altrimenti, termina il dialogo
        this.endDialogue();
    }
    
    /**
     * Seleziona la scelta successiva
     */
    selectNextChoice() {
        if (this.currentChoices && this.currentChoices.length > 0) {
            this.selectedChoice = (this.selectedChoice + 1) % this.currentChoices.length;
            
            // Aggiorna la selezione nell'UI
            if (this.ui) {
                this.ui.updateDialogueSelection(this.selectedChoice);
            }
        }
    }
    
    /**
     * Seleziona la scelta precedente
     */
    selectPrevChoice() {
        if (this.currentChoices && this.currentChoices.length > 0) {
            this.selectedChoice = (this.selectedChoice - 1 + this.currentChoices.length) % this.currentChoices.length;
            
            // Aggiorna la selezione nell'UI
            if (this.ui) {
                this.ui.updateDialogueSelection(this.selectedChoice);
            }
        }
    }
    
    /**
     * Avvia una cutscene
     * @param {Object} cutscene - Dati della cutscene
     * @param {Array} cutscene.steps - Passi della cutscene
     * @param {Function} onEnd - Callback da chiamare alla fine della cutscene
     */
    startCutscene(cutscene, onEnd = null) {
        this.isCutsceneActive = true;
        this.currentCutscene = cutscene;
        this.cutsceneStep = 0;
        this.cutsceneTimer = 0;
        this.onCutsceneEnd = onEnd;
        
        // Imposta lo stato del mondo
        if (this.world) {
            this.world.gameState = "cutscene";
        }
        
        // Esegui il primo passo della cutscene
        this.executeCutsceneStep();
    }
    
    /**
     * Termina la cutscene corrente
     */
    endCutscene() {
        this.isCutsceneActive = false;
        this.currentCutscene = null;
        this.cutsceneStep = 0;
        this.cutsceneTimer = 0;
        
        // Ripristina lo stato del mondo
        if (this.world) {
            this.world.gameState = "playing";
        }
        
        // Chiama il callback di fine cutscene
        if (this.onCutsceneEnd) {
            this.onCutsceneEnd();
        }
    }
    
    /**
     * Esegue il passo corrente della cutscene
     */
    executeCutsceneStep() {
        // Controlla se la cutscene è terminata
        if (!this.currentCutscene || this.cutsceneStep >= this.currentCutscene.steps.length) {
            this.endCutscene();
            return;
        }
        
        // Ottieni il passo corrente
        const step = this.currentCutscene.steps[this.cutsceneStep];
        
        // Esegui l'azione in base al tipo di passo
        switch (step.type) {
            case "dialogue":
                // Avvia un dialogo
                this.startDialogue(step.dialogue, () => {
                    // Passa al prossimo passo quando il dialogo termina
                    this.cutsceneStep++;
                    this.executeCutsceneStep();
                });
                break;
            
            case "move":
                // Muovi un personaggio
                if (this.world) {
                    const character = this.getCharacterByName(step.character);
                    if (character) {
                        // Imposta la destinazione
                        character.targetX = step.x;
                        character.targetY = step.y;
                        character.isMovingToTarget = true;
                        
                        // Passa al prossimo passo quando il movimento termina
                        const checkMovement = setInterval(() => {
                            if (!character.isMovingToTarget) {
                                clearInterval(checkMovement);
                                this.cutsceneStep++;
                                this.executeCutsceneStep();
                            }
                        }, 100);
                    } else {
                        // Se il personaggio non esiste, passa al prossimo passo
                        this.cutsceneStep++;
                        this.executeCutsceneStep();
                    }
                } else {
                    // Se il mondo non esiste, passa al prossimo passo
                    this.cutsceneStep++;
                    this.executeCutsceneStep();
                }
                break;
            
            case "wait":
                // Attendi un certo tempo
                setTimeout(() => {
                    this.cutsceneStep++;
                    this.executeCutsceneStep();
                }, step.duration * 1000);
                break;
            
            case "camera":
                // Muovi la camera
                if (this.world) {
                    this.world.cameraTargetX = step.x;
                    this.world.cameraTargetY = step.y;
                    this.world.isCameraMoving = true;
                    
                    // Passa al prossimo passo quando la camera termina il movimento
                    const checkCamera = setInterval(() => {
                        if (!this.world.isCameraMoving) {
                            clearInterval(checkCamera);
                            this.cutsceneStep++;
                            this.executeCutsceneStep();
                        }
                    }, 100);
                } else {
                    // Se il mondo non esiste, passa al prossimo passo
                    this.cutsceneStep++;
                    this.executeCutsceneStep();
                }
                break;
            
            case "animation":
                // Riproduci un'animazione
                if (this.world) {
                    const character = this.getCharacterByName(step.character);
                    if (character) {
                        // Riproduci l'animazione
                        character.playAnimation(step.animation);
                        
                        // Passa al prossimo passo quando l'animazione termina
                        setTimeout(() => {
                            this.cutsceneStep++;
                            this.executeCutsceneStep();
                        }, step.duration * 1000);
                    } else {
                        // Se il personaggio non esiste, passa al prossimo passo
                        this.cutsceneStep++;
                        this.executeCutsceneStep();
                    }
                } else {
                    // Se il mondo non esiste, passa al prossimo passo
                    this.cutsceneStep++;
                    this.executeCutsceneStep();
                }
                break;
            
            case "effect":
                // Riproduci un effetto
                if (this.world) {
                    // Crea l'effetto
                    this.world.createEffect(step.effect, step.x, step.y);
                    
                    // Passa al prossimo passo dopo la durata dell'effetto
                    setTimeout(() => {
                        this.cutsceneStep++;
                        this.executeCutsceneStep();
                    }, step.duration * 1000);
                } else {
                    // Se il mondo non esiste, passa al prossimo passo
                    this.cutsceneStep++;
                    this.executeCutsceneStep();
                }
                break;
            
            case "spawn":
                // Genera un personaggio
                if (this.world) {
                    // Crea il personaggio
                    const character = this.world.createCharacter(step.character, step.x, step.y);
                    
                    // Passa al prossimo passo
                    this.cutsceneStep++;
                    this.executeCutsceneStep();
                } else {
                    // Se il mondo non esiste, passa al prossimo passo
                    this.cutsceneStep++;
                    this.executeCutsceneStep();
                }
                break;
            
            case "remove":
                // Rimuovi un personaggio
                if (this.world) {
                    const character = this.getCharacterByName(step.character);
                    if (character) {
                        // Rimuovi il personaggio
                        this.world.removeCharacter(character);
                    }
                    
                    // Passa al prossimo passo
                    this.cutsceneStep++;
                    this.executeCutsceneStep();
                } else {
                    // Se il mondo non esiste, passa al prossimo passo
                    this.cutsceneStep++;
                    this.executeCutsceneStep();
                }
                break;
            
            case "music":
                // Cambia la musica
                if (this.world) {
                    // Cambia la musica
                    this.world.changeMusic(step.music);
                    
                    // Passa al prossimo passo
                    this.cutsceneStep++;
                    this.executeCutsceneStep();
                } else {
                    // Se il mondo non esiste, passa al prossimo passo
                    this.cutsceneStep++;
                    this.executeCutsceneStep();
                }
                break;
            
            case "sound":
                // Riproduci un suono
                if (this.world) {
                    // Riproduci il suono
                    this.world.playSound(step.sound);
                    
                    // Passa al prossimo passo
                    this.cutsceneStep++;
                    this.executeCutsceneStep();
                } else {
                    // Se il mondo non esiste, passa al prossimo passo
                    this.cutsceneStep++;
                    this.executeCutsceneStep();
                }
                break;
            
            case "fade":
                // Effetto di dissolvenza
                if (this.ui) {
                    // Esegui la dissolvenza
                    this.ui.fade(step.direction, step.duration, () => {
                        // Passa al prossimo passo quando la dissolvenza termina
                        this.cutsceneStep++;
                        this.executeCutsceneStep();
                    });
                } else {
                    // Se l'UI non esiste, passa al prossimo passo
                    this.cutsceneStep++;
                    this.executeCutsceneStep();
                }
                break;
            
            case "custom":
                // Azione personalizzata
                if (step.action) {
                    // Esegui l'azione personalizzata
                    step.action(() => {
                        // Passa al prossimo passo quando l'azione termina
                        this.cutsceneStep++;
                        this.executeCutsceneStep();
                    });
                } else {
                    // Se non c'è un'azione, passa al prossimo passo
                    this.cutsceneStep++;
                    this.executeCutsceneStep();
                }
                break;
            
            default:
                // Tipo di passo sconosciuto, passa al prossimo
                console.warn(`Tipo di passo cutscene sconosciuto: ${step.type}`);
                this.cutsceneStep++;
                this.executeCutsceneStep();
        }
    }
    
    /**
     * Ottiene un personaggio dal nome
     * @param {string} name - Nome del personaggio
     * @returns {Character|null} - Personaggio o null se non trovato
     */
    getCharacterByName(name) {
        if (!this.world) {
            return null;
        }
        
        // Controlla il giocatore
        if (this.world.player && this.world.player.name === name) {
            return this.world.player;
        }
        
        // Controlla gli NPC
        for (const npc of this.world.npcs) {
            if (npc.name === name) {
                return npc;
            }
        }
        
        // Controlla i nemici
        for (const enemy of this.world.enemies) {
            if (enemy.name === name) {
                return enemy;
            }
        }
        
        return null;
    }
    
    /**
     * Aggiorna il sistema di dialoghi
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     * @param {Object} input - Stato dell'input
     */
    update(deltaTime, input) {
        // Aggiorna l'animazione del testo
        if (this.isActive && !this.isTextComplete) {
            this.textTimer += deltaTime;
            
            // Calcola quanti caratteri mostrare
            const charactersToShow = Math.floor(this.textTimer * this.textSpeed);
            
            if (charactersToShow > this.textIndex) {
                // Aggiorna l'indice del testo
                this.textIndex = Math.min(charactersToShow, this.currentText.length);
                
                // Aggiorna il testo nell'UI
                if (this.ui) {
                    this.ui.updateDialogueText(this.currentText.substring(0, this.textIndex));
                }
                
                // Controlla se il testo è completo
                if (this.textIndex >= this.currentText.length) {
                    this.isTextComplete = true;
                    
                    // Mostra le scelte se presenti
                    if (this.currentChoices && this.currentChoices.length > 0 && this.ui) {
                        this.ui.showDialogueChoices(this.currentChoices);
                    }
                }
            }
        }
        
        // Gestisci l'input per i dialoghi
        if (this.isActive) {
            // Avanza nel dialogo con Spazio o E
            if (input.isKeyPressed("Space") || input.isKeyPressed("KeyE")) {
                this.advanceDialogue();
            }
            
            // Seleziona la scelta successiva con Giù
            if (input.isKeyPressed("ArrowDown") || input.isKeyPressed("KeyS")) {
                this.selectNextChoice();
            }
            
            // Seleziona la scelta precedente con Su
            if (input.isKeyPressed("ArrowUp") || input.isKeyPressed("KeyW")) {
                this.selectPrevChoice();
            }
        }
    }
}

// Esporta la classe
window.DialogueSystem = DialogueSystem;
