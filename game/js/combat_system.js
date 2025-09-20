/**
 * Mindworld - Sistema di combattimento avanzato
 * 
 * Questo file contiene le classi e le funzioni per la gestione del sistema di combattimento,
 * inclusi attacchi, effetti di stato e calcolo del danno.
 */

class CombatSystem {
    constructor(game) {
        // Riferimento al gioco
        this.game = game;
        
        // Attacchi disponibili
        this.attacks = {};
        
        // Cooldown degli attacchi
        this.cooldowns = {};
        
        // Effetti di stato attivi
        this.statusEffects = [];
        
        // Sistema di particelle
        this.particles = [];
        
        // Carica gli attacchi
        this.loadAttacks();
    }
    
    /**
     * Carica gli attacchi dal file JSON
     */
    loadAttacks() {
        const attacksData = Assets.getData("attacks");
        
        if (attacksData) {
            // Carica gli attacchi Fah
            if (attacksData.attacks.fah) {
                for (const attack of attacksData.attacks.fah) {
                    this.attacks[attack.id] = attack;
                }
            }
            
            // Carica gli attacchi Brih
            if (attacksData.attacks.brih) {
                for (const attack of attacksData.attacks.brih) {
                    this.attacks[attack.id] = attack;
                }
            }
            
            // Carica gli attacchi combinati
            if (attacksData.attacks.combined) {
                for (const attack of attacksData.attacks.combined) {
                    this.attacks[attack.id] = attack;
                }
            }
            
            console.log(`Caricati ${Object.keys(this.attacks).length} attacchi`);
        }
    }
    
    /**
     * Esegue un attacco
     * @param {string} attackId - ID dell'attacco
     * @param {Character} attacker - Personaggio che esegue l'attacco
     * @param {number} targetX - Coordinata X del bersaglio
     * @param {number} targetY - Coordinata Y del bersaglio
     * @returns {boolean} True se l'attacco è stato eseguito con successo
     */
    executeAttack(attackId, attacker, targetX, targetY) {
        // Verifica se l'attacco esiste
        if (!this.attacks[attackId]) {
            console.error(`Attacco non trovato: ${attackId}`);
            return false;
        }
        
        const attack = this.attacks[attackId];
        
        // Verifica il cooldown
        if (this.cooldowns[attackId] && this.cooldowns[attackId] > 0) {
            console.log(`Attacco in cooldown: ${attackId} (${this.cooldowns[attackId].toFixed(1)}s)`);
            return false;
        }
        
        // Verifica l'energia
        if (attacker.energy < attack.energyCost) {
            console.log(`Energia insufficiente per l'attacco: ${attackId}`);
            return false;
        }
        
        // Consuma l'energia
        attacker.energy -= attack.energyCost;
        
        // Imposta il cooldown
        this.cooldowns[attackId] = attack.cooldown;
        
        // Crea l'oggetto attacco
        const attackObj = {
            id: Utils.generateId(),
            type: attack.type,
            x: targetX,
            y: targetY,
            range: attack.range,
            damage: attack.damage,
            attacker: attacker,
            statusEffect: attack.statusEffect,
            duration: 0.5, // Durata dell'effetto visivo in secondi
            currentTime: 0
        };
        
        // Aggiungi l'attacco al gioco
        this.game.attacks.push(attackObj);
        
        // Crea particelle per l'effetto visivo
        this.createAttackParticles(attackObj);
        
        // Riproduci l'effetto sonoro
        if (attack.soundEffect) {
            Assets.playAudio(attack.soundEffect);
        }
        
        // Se è un attacco di guarigione, applica subito
        if (attack.healing) {
            attacker.health = Math.min(attacker.maxHealth, attacker.health + attack.healing);
        }
        
        // Se è un attacco che ripristina energia, applica subito
        if (attack.energyRestore) {
            attacker.energy = Math.min(attacker.maxEnergy, attacker.energy + attack.energyRestore);
        }
        
        // Invia l'attacco al sistema multiplayer se disponibile
        if (this.game.multiplayer && this.game.multiplayer.isConnected) {
            this.game.multiplayer.sendAttack(attackObj);
        }
        
        return true;
    }
    
    /**
     * Crea particelle per l'effetto visivo dell'attacco
     * @param {Object} attack - Oggetto attacco
     */
    createAttackParticles(attack) {
        const attackData = this.attacks[attack.id] || {
            particleColor: attack.type === "fah" ? "#e74c3c" : attack.type === "brih" ? "#3498db" : "#9b59b6",
            particleCount: 30
        };
        
        const particleCount = attackData.particleCount || 30;
        const particleColor = attackData.particleColor || "#ffffff";
        
        for (let i = 0; i < particleCount; i++) {
            // Calcola una posizione casuale all'interno del raggio dell'attacco
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * attack.range;
            const x = attack.x + Math.cos(angle) * distance;
            const y = attack.y + Math.sin(angle) * distance;
            
            // Calcola una velocità casuale
            const speed = 50 + Math.random() * 100;
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;
            
            // Crea la particella
            const particle = {
                x: x,
                y: y,
                velocityX: velocityX,
                velocityY: velocityY,
                size: 2 + Math.random() * 4,
                color: particleColor,
                life: 0.5 + Math.random() * 0.5, // Durata in secondi
                opacity: 1.0
            };
            
            // Aggiungi la particella al gioco
            this.game.particles.push(particle);
        }
    }
    
    /**
     * Applica il danno dell'attacco ai bersagli
     * @param {Object} attack - Oggetto attacco
     */
    applyAttackDamage(attack) {
        // Trova tutti i personaggi nel raggio dell'attacco
        const targets = [];
        
        // Aggiungi i nemici
        for (const enemy of this.game.enemies) {
            const distance = Utils.distance(
                {x: attack.x, y: attack.y},
                {x: enemy.x, y: enemy.y}
            );
            
            if (distance <= attack.range) {
                targets.push(enemy);
            }
        }
        
        // Aggiungi gli NPC (se l'attacco può colpirli)
        for (const npc of this.game.npcs) {
            const distance = Utils.distance(
                {x: attack.x, y: attack.y},
                {x: npc.x, y: npc.y}
            );
            
            if (distance <= attack.range) {
                targets.push(npc);
            }
        }
        
        // Aggiungi il giocatore (se l'attacco è di un nemico)
        if (attack.attacker && attack.attacker.type !== "player" && this.game.player) {
            const distance = Utils.distance(
                {x: attack.x, y: attack.y},
                {x: this.game.player.x, y: this.game.player.y}
            );
            
            if (distance <= attack.range) {
                targets.push(this.game.player);
            }
        }
        
        // Aggiungi gli altri giocatori (in modalità PvP)
        if (this.game.multiplayer && this.game.multiplayer.isConnected && this.game.isPvPEnabled) {
            for (const player of this.game.multiplayer.otherPlayers.values()) {
                const distance = Utils.distance(
                    {x: attack.x, y: attack.y},
                    {x: player.x, y: player.y}
                );
                
                if (distance <= attack.range) {
                    targets.push(player);
                }
            }
        }
        
        // Applica il danno a tutti i bersagli
        for (const target of targets) {
            // Non danneggiare l'attaccante
            if (target === attack.attacker) continue;
            
            // Non danneggiare gli alleati (a meno che non sia PvP)
            if (target.type === attack.attacker.type && !this.game.isPvPEnabled) continue;
            
            // Calcola il danno in base al tipo di attacco e alle resistenze
            let damage = attack.damage;
            
            // Applica modificatori di danno in base al tipo
            if (attack.type === "fah" && target.type === "brih") {
                damage *= 1.5; // Danno aumentato contro i Brih
            } else if (attack.type === "brih" && target.type === "fah") {
                damage *= 1.5; // Danno aumentato contro i Fah
            }
            
            // Applica la difesa del bersaglio
            if (target.defense) {
                damage = Math.max(1, damage - target.defense);
            }
            
            // Applica il danno
            target.health -= damage;
            
            // Verifica se il bersaglio è morto
            if (target.health <= 0) {
                target.health = 0;
                target.isAlive = false;
                
                // Gestisci la morte del bersaglio
                this.handleCharacterDeath(target);
            }
            
            // Applica l'effetto di stato
            if (attack.statusEffect) {
                this.applyStatusEffect(target, attack.statusEffect);
            }
            
            // Crea un effetto di danno
            this.createDamageEffect(target, damage);
        }
    }
    
    /**
     * Applica un effetto di stato a un personaggio
     * @param {Character} target - Personaggio bersaglio
     * @param {Object} effectData - Dati dell'effetto di stato
     */
    applyStatusEffect(target, effectData) {
        // Crea l'oggetto effetto di stato
        const statusEffect = {
            id: Utils.generateId(),
            type: effectData.type,
            target: target,
            duration: effectData.duration,
            currentTime: 0,
            ...effectData
        };
        
        // Rimuovi eventuali effetti dello stesso tipo
        this.statusEffects = this.statusEffects.filter(effect => 
            !(effect.target === target && effect.type === effectData.type)
        );
        
        // Aggiungi il nuovo effetto
        this.statusEffects.push(statusEffect);
        
        // Aggiungi l'effetto anche al personaggio
        target.statusEffects.push(statusEffect);
    }
    
    /**
     * Crea un effetto visivo di danno
     * @param {Character} target - Personaggio bersaglio
     * @param {number} damage - Quantità di danno
     */
    createDamageEffect(target, damage) {
        // Crea un testo di danno fluttuante
        const damageText = {
            x: target.x,
            y: target.y - target.height / 2,
            text: Math.floor(damage).toString(),
            color: "#e74c3c",
            size: 16,
            life: 1.0, // Durata in secondi
            velocityY: -50, // Velocità verso l'alto
            opacity: 1.0
        };
        
        // Aggiungi il testo al gioco
        if (!this.game.damageTexts) {
            this.game.damageTexts = [];
        }
        this.game.damageTexts.push(damageText);
        
        // Riproduci l'effetto sonoro di colpo
        Assets.playAudio("sfx_hit");
    }
    
    /**
     * Gestisce la morte di un personaggio
     * @param {Character} character - Personaggio morto
     */
    handleCharacterDeath(character) {
        if (character.type === "player") {
            // Il giocatore è morto
            this.game.gameState = "gameover";
            console.log("Game Over");
        } else if (character.type === "fah" || character.type === "brih") {
            // Un nemico è morto
            console.log(`Nemico sconfitto: ${character.name}`);
            
            // Rimuovi il nemico dalla lista
            const index = this.game.enemies.indexOf(character);
            if (index !== -1) {
                this.game.enemies.splice(index, 1);
            }
            
            // Genera drop
            this.generateDrops(character);
        }
    }
    
    /**
     * Genera oggetti drop da un nemico sconfitto
     * @param {Character} enemy - Nemico sconfitto
     */
    generateDrops(enemy) {
        // Implementazione base, da espandere con un sistema di loot più complesso
        if (enemy.dropTable) {
            for (const drop of enemy.dropTable) {
                // Verifica la probabilità di drop
                if (Math.random() < drop.chance) {
                    // Crea l'oggetto drop
                    const item = {
                        id: drop.id,
                        x: enemy.x,
                        y: enemy.y,
                        width: 16,
                        height: 16,
                        quantity: drop.quantity,
                        
                        draw: function(ctx, offsetX, offsetY) {
                            const screenX = this.x - offsetX;
                            const screenY = this.y - offsetY;
                            
                            // Disegna l'oggetto
                            ctx.fillStyle = "#f1c40f";
                            ctx.beginPath();
                            ctx.arc(screenX, screenY, this.width / 2, 0, Math.PI * 2);
                            ctx.fill();
                            
                            // Disegna il nome
                            ctx.fillStyle = "#fff";
                            ctx.font = "10px Arial";
                            ctx.textAlign = "center";
                            ctx.fillText(this.id, screenX, screenY + this.height);
                        }
                    };
                    
                    // Aggiungi l'oggetto al gioco
                    if (!this.game.items) {
                        this.game.items = [];
                    }
                    this.game.items.push(item);
                }
            }
        }
    }
    
    /**
     * Aggiorna il sistema di combattimento
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    update(deltaTime) {
        // Aggiorna i cooldown degli attacchi
        for (const attackId in this.cooldowns) {
            if (this.cooldowns[attackId] > 0) {
                this.cooldowns[attackId] -= deltaTime;
                
                if (this.cooldowns[attackId] <= 0) {
                    this.cooldowns[attackId] = 0;
                }
            }
        }
        
        // Aggiorna gli attacchi
        for (let i = this.game.attacks.length - 1; i >= 0; i--) {
            const attack = this.game.attacks[i];
            
            // Aggiorna il timer
            attack.currentTime += deltaTime;
            
            // Applica il danno all'inizio dell'attacco
            if (attack.currentTime <= deltaTime) {
                this.applyAttackDamage(attack);
            }
            
            // Rimuovi l'attacco se è scaduto
            if (attack.currentTime >= attack.duration) {
                this.game.attacks.splice(i, 1);
            }
        }
        
        // Aggiorna gli effetti di stato
        for (let i = this.statusEffects.length - 1; i >= 0; i--) {
            const effect = this.statusEffects[i];
            
            // Aggiorna il timer
            effect.currentTime += deltaTime;
            
            // Applica l'effetto
            this.updateStatusEffect(effect, deltaTime);
            
            // Rimuovi l'effetto se è scaduto
            if (effect.currentTime >= effect.duration) {
                // Rimuovi l'effetto dal personaggio
                const index = effect.target.statusEffects.indexOf(effect);
                if (index !== -1) {
                    effect.target.statusEffects.splice(index, 1);
                }
                
                // Rimuovi l'effetto dalla lista
                this.statusEffects.splice(i, 1);
            }
        }
        
        // Aggiorna le particelle
        for (let i = this.game.particles.length - 1; i >= 0; i--) {
            const particle = this.game.particles[i];
            
            // Aggiorna la posizione
            particle.x += particle.velocityX * deltaTime;
            particle.y += particle.velocityY * deltaTime;
            
            // Aggiorna la vita
            particle.life -= deltaTime;
            
            // Aggiorna l'opacità
            particle.opacity = particle.life / 0.5;
            
            // Rimuovi la particella se è scaduta
            if (particle.life <= 0) {
                this.game.particles.splice(i, 1);
            }
        }
        
        // Aggiorna i testi di danno
        if (this.game.damageTexts) {
            for (let i = this.game.damageTexts.length - 1; i >= 0; i--) {
                const text = this.game.damageTexts[i];
                
                // Aggiorna la posizione
                text.y += text.velocityY * deltaTime;
                
                // Aggiorna la vita
                text.life -= deltaTime;
                
                // Aggiorna l'opacità
                text.opacity = text.life;
                
                // Rimuovi il testo se è scaduto
                if (text.life <= 0) {
                    this.game.damageTexts.splice(i, 1);
                }
            }
        }
    }
    
    /**
     * Aggiorna un effetto di stato
     * @param {Object} effect - Effetto di stato
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    updateStatusEffect(effect, deltaTime) {
        switch (effect.type) {
            case "burn":
                // Applica danno da bruciatura
                if (effect.target.isAlive) {
                    effect.target.health -= effect.damage * deltaTime;
                    
                    // Verifica se il bersaglio è morto
                    if (effect.target.health <= 0) {
                        effect.target.health = 0;
                        effect.target.isAlive = false;
                        
                        // Gestisci la morte del bersaglio
                        this.handleCharacterDeath(effect.target);
                    }
                }
                break;
                
            case "freeze":
                // Applica rallentamento
                if (effect.target.isAlive) {
                    effect.target.speedModifier = effect.slowFactor;
                }
                break;
                
            case "armor":
                // Applica riduzione del danno
                if (effect.target.isAlive) {
                    effect.target.damageReduction = effect.damageReduction;
                }
                break;
                
            case "regeneration":
                // Applica rigenerazione di salute ed energia
                if (effect.target.isAlive) {
                    effect.target.health = Math.min(effect.target.maxHealth, effect.target.health + effect.healing * deltaTime);
                    
                    if (effect.target.energy !== undefined && effect.target.maxEnergy !== undefined) {
                        effect.target.energy = Math.min(effect.target.maxEnergy, effect.target.energy + effect.energyRestore * deltaTime);
                    }
                }
                break;
                
            case "elemental":
                // Applica sia danno che rallentamento
                if (effect.target.isAlive) {
                    effect.target.health -= effect.damage * deltaTime;
                    effect.target.speedModifier = effect.slowFactor;
                    
                    // Verifica se il bersaglio è morto
                    if (effect.target.health <= 0) {
                        effect.target.health = 0;
                        effect.target.isAlive = false;
                        
                        // Gestisci la morte del bersaglio
                        this.handleCharacterDeath(effect.target);
                    }
                }
                break;
        }
    }
    
    /**
     * Disegna gli effetti di combattimento
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     * @param {number} offsetX - Offset X della camera
     * @param {number} offsetY - Offset Y della camera
     */
    draw(ctx, offsetX, offsetY) {
        // Disegna i testi di danno
        if (this.game.damageTexts) {
            for (const text of this.game.damageTexts) {
                const screenX = text.x - offsetX;
                const screenY = text.y - offsetY;
                
                ctx.fillStyle = text.color + Math.floor(text.opacity * 255).toString(16).padStart(2, '0');
                ctx.font = `${text.size}px Arial`;
                ctx.textAlign = "center";
                ctx.fillText(text.text, screenX, screenY);
            }
        }
    }
}
