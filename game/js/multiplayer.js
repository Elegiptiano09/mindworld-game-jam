/**
 * Mindworld - Sistema multiplayer
 * 
 * Questo file contiene le classi e le funzioni per la gestione del multiplayer
 * utilizzando WebSockets.
 */

class MultiplayerManager {
    constructor(game) {
        // Riferimento al gioco
        this.game = game;
        
        // WebSocket
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000; // 2 secondi
        
        // Dati del giocatore
        this.playerId = null;
        this.playerName = "Giocatore";
        
        // Altri giocatori
        this.otherPlayers = new Map(); // Map di ID -> dati del giocatore
        
        // Stato del gioco
        this.gameState = {
            players: {},
            enemies: {},
            attacks: []
        };
        
        // Configurazione
        this.updateRate = 50; // ms
        this.updateTimer = 0;
        
        // Modalità di debug
        this.debug = false;
    }
    
    /**
     * Inizializza il sistema multiplayer
     * @param {string} serverUrl - URL del server WebSocket
     * @param {string} playerName - Nome del giocatore
     */
    init(serverUrl, playerName) {
        this.playerName = playerName || "Giocatore";
        
        // Genera un ID casuale per il giocatore
        this.playerId = this.generatePlayerId();
        
        // Connetti al server
        this.connect(serverUrl);
    }
    
    /**
     * Genera un ID casuale per il giocatore
     * @returns {string} ID del giocatore
     */
    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Connette al server WebSocket
     * @param {string} serverUrl - URL del server WebSocket
     */
    connect(serverUrl) {
        try {
            this.socket = new WebSocket(serverUrl);
            
            this.socket.onopen = () => {
                this.isConnected = true;
                this.reconnectAttempts = 0;
                console.log("Connesso al server multiplayer");
                
                // Invia i dati del giocatore
                this.sendPlayerData();
            };
            
            this.socket.onmessage = (event) => {
                this.handleMessage(event.data);
            };
            
            this.socket.onclose = () => {
                this.isConnected = false;
                console.log("Disconnesso dal server multiplayer");
                
                // Tenta di riconnettersi
                this.attemptReconnect(serverUrl);
            };
            
            this.socket.onerror = (error) => {
                console.error("Errore WebSocket:", error);
            };
        } catch (error) {
            console.error("Errore nella connessione al server:", error);
            this.attemptReconnect(serverUrl);
        }
    }
    
    /**
     * Tenta di riconnettersi al server
     * @param {string} serverUrl - URL del server WebSocket
     */
    attemptReconnect(serverUrl) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Tentativo di riconnessione ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
            
            setTimeout(() => {
                this.connect(serverUrl);
            }, this.reconnectDelay);
        } else {
            console.error("Numero massimo di tentativi di riconnessione raggiunto");
        }
    }
    
    /**
     * Gestisce i messaggi ricevuti dal server
     * @param {string} data - Dati ricevuti
     */
    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            
            switch (message.type) {
                case "welcome":
                    // Il server ha accettato la connessione
                    this.playerId = message.playerId;
                    console.log(`ID giocatore assegnato: ${this.playerId}`);
                    break;
                    
                case "gameState":
                    // Aggiorna lo stato del gioco
                    this.updateGameState(message.state);
                    break;
                    
                case "playerJoined":
                    // Un nuovo giocatore si è unito
                    this.addOtherPlayer(message.player);
                    break;
                    
                case "playerLeft":
                    // Un giocatore ha lasciato
                    this.removeOtherPlayer(message.playerId);
                    break;
                    
                case "attack":
                    // Un giocatore ha eseguito un attacco
                    this.handleAttack(message.attack);
                    break;
                    
                case "chat":
                    // Messaggio di chat
                    this.handleChatMessage(message);
                    break;
                    
                default:
                    console.log("Messaggio sconosciuto:", message);
            }
        } catch (error) {
            console.error("Errore nell'elaborazione del messaggio:", error);
        }
    }
    
    /**
     * Invia i dati del giocatore al server
     */
    sendPlayerData() {
        if (!this.isConnected || !this.game.player) return;
        
        const playerData = {
            type: "playerData",
            player: {
                id: this.playerId,
                name: this.playerName,
                x: this.game.player.x,
                y: this.game.player.y,
                direction: this.game.player.direction,
                health: this.game.player.health,
                maxHealth: this.game.player.maxHealth,
                isMoving: this.game.player.isMoving,
                type: "player"
            }
        };
        
        this.send(playerData);
    }
    
    /**
     * Invia un messaggio al server
     * @param {Object} message - Messaggio da inviare
     */
    send(message) {
        if (this.isConnected && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        }
    }
    
    /**
     * Aggiorna lo stato del gioco
     * @param {Object} state - Nuovo stato del gioco
     */
    updateGameState(state) {
        this.gameState = state;
        
        // Aggiorna gli altri giocatori
        for (const playerId in state.players) {
            if (playerId !== this.playerId) {
                const playerData = state.players[playerId];
                
                if (this.otherPlayers.has(playerId)) {
                    // Aggiorna il giocatore esistente
                    const player = this.otherPlayers.get(playerId);
                    player.x = playerData.x;
                    player.y = playerData.y;
                    player.direction = playerData.direction;
                    player.health = playerData.health;
                    player.isMoving = playerData.isMoving;
                } else {
                    // Aggiungi un nuovo giocatore
                    this.addOtherPlayer(playerData);
                }
            }
        }
        
        // Rimuovi i giocatori che non sono più presenti
        for (const playerId of this.otherPlayers.keys()) {
            if (!state.players[playerId]) {
                this.removeOtherPlayer(playerId);
            }
        }
    }
    
    /**
     * Aggiunge un altro giocatore
     * @param {Object} playerData - Dati del giocatore
     */
    addOtherPlayer(playerData) {
        if (playerData.id === this.playerId) return;
        
        // Crea un nuovo personaggio per il giocatore
        const player = new Character({
            id: playerData.id,
            name: playerData.name,
            type: "otherPlayer",
            x: playerData.x,
            y: playerData.y,
            width: 32,
            height: 48,
            direction: playerData.direction,
            health: playerData.health,
            maxHealth: playerData.maxHealth
        });
        
        this.otherPlayers.set(playerData.id, player);
        console.log(`Giocatore aggiunto: ${playerData.name} (${playerData.id})`);
    }
    
    /**
     * Rimuove un altro giocatore
     * @param {string} playerId - ID del giocatore
     */
    removeOtherPlayer(playerId) {
        if (this.otherPlayers.has(playerId)) {
            const player = this.otherPlayers.get(playerId);
            console.log(`Giocatore rimosso: ${player.name} (${playerId})`);
            this.otherPlayers.delete(playerId);
        }
    }
    
    /**
     * Gestisce un attacco da un altro giocatore
     * @param {Object} attackData - Dati dell'attacco
     */
    handleAttack(attackData) {
        if (attackData.playerId === this.playerId) return;
        
        // Crea un nuovo attacco
        const attack = {
            id: attackData.id,
            type: attackData.type,
            x: attackData.x,
            y: attackData.y,
            range: attackData.range,
            damage: attackData.damage,
            duration: attackData.duration,
            currentTime: 0
        };
        
        // Aggiungi l'attacco al gioco
        this.game.attacks.push(attack);
        
        // Riproduci l'effetto sonoro
        if (attackData.type === "fah") {
            Assets.playAudio("sfx_attack_fah");
        } else if (attackData.type === "brih") {
            Assets.playAudio("sfx_attack_brih");
        } else if (attackData.type === "combined") {
            Assets.playAudio("sfx_attack_combined");
        }
    }
    
    /**
     * Gestisce un messaggio di chat
     * @param {Object} message - Messaggio di chat
     */
    handleChatMessage(message) {
        if (this.game.ui) {
            this.game.ui.addChatMessage(message.sender, message.text);
        }
    }
    
    /**
     * Invia un messaggio di chat
     * @param {string} text - Testo del messaggio
     */
    sendChatMessage(text) {
        const message = {
            type: "chat",
            sender: this.playerName,
            text: text
        };
        
        this.send(message);
    }
    
    /**
     * Invia un attacco
     * @param {Object} attack - Dati dell'attacco
     */
    sendAttack(attack) {
        const attackData = {
            type: "attack",
            attack: {
                id: attack.id,
                playerId: this.playerId,
                type: attack.type,
                x: attack.x,
                y: attack.y,
                range: attack.range,
                damage: attack.damage,
                duration: attack.duration
            }
        };
        
        this.send(attackData);
    }
    
    /**
     * Aggiorna il sistema multiplayer
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    update(deltaTime) {
        if (!this.isConnected) return;
        
        // Aggiorna il timer
        this.updateTimer += deltaTime * 1000; // Converti in millisecondi
        
        // Invia i dati del giocatore periodicamente
        if (this.updateTimer >= this.updateRate) {
            this.sendPlayerData();
            this.updateTimer = 0;
        }
    }
    
    /**
     * Disegna i giocatori multiplayer
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     * @param {number} offsetX - Offset X della camera
     * @param {number} offsetY - Offset Y della camera
     */
    draw(ctx, offsetX, offsetY) {
        // Disegna gli altri giocatori
        for (const player of this.otherPlayers.values()) {
            player.draw(ctx, offsetX, offsetY);
        }
        
        // Disegna informazioni di debug
        if (this.debug) {
            ctx.fillStyle = "#fff";
            ctx.font = "12px Arial";
            ctx.textAlign = "left";
            ctx.fillText(`Multiplayer: ${this.isConnected ? "Connesso" : "Disconnesso"}`, 10, 20);
            ctx.fillText(`ID: ${this.playerId}`, 10, 40);
            ctx.fillText(`Giocatori: ${this.otherPlayers.size + 1}`, 10, 60);
        }
    }
    
    /**
     * Disconnette dal server
     */
    disconnect() {
        if (this.isConnected && this.socket) {
            this.socket.close();
            this.isConnected = false;
        }
    }
}
