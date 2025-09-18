/**
 * Mindworld - Sistema di combattimento
 * 
 * Questo file contiene le classi e le funzioni per gestire il sistema di combattimento,
 * inclusi attacchi, effetti e calcolo del danno.
 */

class CombatSystem {
    constructor(world) {
        this.world = world;
        this.activeAttacks = [];
        this.activeEffects = [];
    }
    
    /**
     * Crea un nuovo attacco
     * @param {Object} config - Configurazione dell'attacco
     * @returns {Object} Oggetto attacco
     */
    createAttack(config) {
        // Ottieni i dati dell'attacco dal database
        const attackData = ATTACKS_DATABASE[config.name];
        if (!attackData) {
            console.error(`Attacco ${config.name} non trovato nel database`);
            return null;
        }
        
        // Crea l'oggetto attacco
        const attack = {
            id: Utils.generateId(),
            name: config.name,
            type: attackData.type,
            damage: attackData.damage * (1 + (config.level || 0) * 0.1),
            range: attackData.range,
            duration: attackData.duration,
            effects: [...attackData.effects],
            x: config.x,
            y: config.y,
            direction: config.direction,
            owner: config.owner,
            velocity: config.velocity || { x: 0, y: 0 },
            creationTime: performance.now(),
            hitTargets: [] // Tiene traccia dei bersagli già colpiti
        };
        
        // Aggiungi l'attacco alla lista degli attacchi attivi
        this.activeAttacks.push(attack);
        
        return attack;
    }
    
    /**
     * Aggiorna tutti gli attacchi attivi
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    updateAttacks(deltaTime) {
        for (let i = this.activeAttacks.length - 1; i >= 0; i--) {
            const attack = this.activeAttacks[i];
            
            // Aggiorna la durata dell'attacco
            attack.duration -= deltaTime;
            
            // Rimuovi l'attacco se è scaduto
            if (attack.duration <= 0) {
                this.activeAttacks.splice(i, 1);
                continue;
            }
            
            // Aggiorna la posizione dell'attacco
            attack.x += attack.velocity.x * deltaTime;
            attack.y += attack.velocity.y * deltaTime;
            
            // Verifica le collisioni con i personaggi
            this.checkAttackCollisions(attack);
        }
    }
    
    /**
     * Verifica le collisioni di un attacco con i personaggi
     * @param {Object} attack - Attacco da verificare
     */
    checkAttackCollisions(attack) {
        // Salta se l'attacco non ha un proprietario
        if (!attack.owner) return;
        
        // Verifica le collisioni con i personaggi
        const targets = attack.owner === this.world.player ? this.world.npcs : [this.world.player];
        
        for (const target of targets) {
            // Salta i bersagli già colpiti da questo attacco
            if (attack.hitTargets.includes(target.id)) continue;
            
            // Salta i bersagli morti
            if (!target.isAlive) continue;
            
            // Verifica la distanza
            const distance = Utils.distance(
                {x: attack.x, y: attack.y},
                {x: target.x, y: target.y}
            );
            
            if (distance <= attack.range) {
                // Applica il danno
                this.applyDamage(attack, target);
                
                // Aggiungi il bersaglio alla lista dei bersagli colpiti
                attack.hitTargets.push(target.id);
                
                // Crea particelle per l'impatto
                this.createImpactParticles(target.x, target.y, attack.type);
            }
        }
    }
    
    /**
     * Applica il danno a un bersaglio
     * @param {Object} attack - Attacco che infligge il danno
     * @param {Character} target - Bersaglio del danno
     */
    applyDamage(attack, target) {
        // Calcola il danno base
        let damage = attack.damage;
        
        // Applica modificatori di danno
        damage = this.calculateDamageModifiers(damage, attack, target);
        
        // Applica il danno al bersaglio
        const actualDamage = target.takeDamage(damage, attack.type);
        
        // Crea un indicatore di danno fluttuante
        this.createDamageIndicator(target.x, target.y, actualDamage);
        
        // Applica gli effetti dell'attacco
        this.applyAttackEffects(attack, target);
        
        // Riproduci suono dell'impatto
        Assets.playAudio("sfx_hit", false, 0.5);
    }
    
    /**
     * Calcola i modificatori di danno
     * @param {number} baseDamage - Danno base
     * @param {Object} attack - Attacco che infligge il danno
     * @param {Character} target - Bersaglio del danno
     * @returns {number} Danno modificato
     */
    calculateDamageModifiers(baseDamage, attack, target) {
        let damage = baseDamage;
        
        // Modificatore di tipo (resistenze/debolezze)
        if (target.resistances && target.resistances[attack.type]) {
            damage *= (1 - target.resistances[attack.type] / 100);
        }
        
        if (target.weaknesses && target.weaknesses[attack.type]) {
            damage *= (1 + target.weaknesses[attack.type] / 100);
        }
        
        // Modificatore di livello
        if (attack.owner && attack.owner.level) {
            damage *= (1 + (attack.owner.level - 1) * 0.1);
        }
        
        // Modificatore di equipaggiamento
        if (attack.owner && attack.owner.equippedItems) {
            // Esempio: bonus di danno da un amuleto
            if (attack.owner.equippedItems.amulet && 
                attack.owner.equippedItems.amulet.damageBonus && 
                attack.owner.equippedItems.amulet.damageBonus[attack.type]) {
                damage *= (1 + attack.owner.equippedItems.amulet.damageBonus[attack.type] / 100);
            }
        }
        
        // Modificatore di effetti di stato
        for (const effect of target.statusEffects) {
            if (effect.type === "damageReduction") {
                damage *= (1 - effect.percentage / 100);
            }
        }
        
        // Arrotonda il danno
        return Math.round(damage);
    }
    
    /**
     * Applica gli effetti di un attacco a un bersaglio
     * @param {Object} attack - Attacco che applica gli effetti
     * @param {Character} target - Bersaglio degli effetti
     */
    applyAttackEffects(attack, target) {
        for (const effect of attack.effects) {
            switch (effect.type) {
                case "burn":
                    target.applyStatusEffect("burn", effect.duration, {
                        damagePerSecond: effect.damagePerSecond
                    });
                    break;
                    
                case "freeze":
                    target.applyStatusEffect("freeze", effect.duration, {
                        slowPercentage: effect.slowPercentage
                    });
                    break;
                    
                case "stun":
                    target.applyStatusEffect("stun", effect.duration);
                    break;
                    
                case "knockback":
                    // Calcola la direzione del knockback
                    const dirX = target.x - attack.x;
                    const dirY = target.y - attack.y;
                    const length = Math.sqrt(dirX * dirX + dirY * dirY);
                    const normalizedDirX = dirX / length;
                    const normalizedDirY = dirY / length;
                    
                    // Applica il knockback
                    target.x += normalizedDirX * effect.force;
                    target.y += normalizedDirY * effect.force;
                    break;
                    
                case "reflect":
                    // Implementazione del riflesso del danno
                    if (attack.owner) {
                        const reflectedDamage = attack.damage * (effect.reflectPercentage / 100);
                        attack.owner.takeDamage(reflectedDamage, attack.type);
                        this.createDamageIndicator(attack.owner.x, attack.owner.y, reflectedDamage);
                    }
                    break;
                    
                case "shield":
                    // Implementazione dello scudo
                    target.applyStatusEffect("shield", effect.duration, {
                        absorptionAmount: effect.absorptionAmount
                    });
                    break;
                    
                case "regeneration":
                    // Implementazione della rigenerazione
                    target.applyStatusEffect("regeneration", effect.duration, {
                        amountPerSecond: effect.amountPerSecond
                    });
                    break;
                    
                case "areaEffect":
                    // Implementazione dell'effetto ad area
                    this.applyAreaEffect(attack, target, effect);
                    break;
            }
        }
    }
    
    /**
     * Applica un effetto ad area
     * @param {Object} attack - Attacco che applica l'effetto
     * @param {Character} target - Bersaglio principale dell'effetto
     * @param {Object} effect - Effetto da applicare
     */
    applyAreaEffect(attack, target, effect) {
        // Ottieni tutti i personaggi nel raggio dell'effetto
        const targets = [...this.world.npcs];
        if (this.world.player) {
            targets.push(this.world.player);
        }
        
        for (const areaTarget of targets) {
            // Salta il bersaglio principale (già colpito)
            if (areaTarget === target) continue;
            
            // Salta i bersagli morti
            if (!areaTarget.isAlive) continue;
            
            // Verifica la distanza
            const distance = Utils.distance(
                {x: target.x, y: target.y},
                {x: areaTarget.x, y: areaTarget.y}
            );
            
            if (distance <= effect.radius) {
                // Applica il danno (ridotto in base alla distanza)
                const distanceFactor = 1 - (distance / effect.radius);
                const areaDamage = attack.damage * distanceFactor * 0.5;
                
                areaTarget.takeDamage(areaDamage, attack.type);
                this.createDamageIndicator(areaTarget.x, areaTarget.y, areaDamage);
                
                // Applica gli effetti dell'attacco (con durata ridotta)
                for (const attackEffect of attack.effects) {
                    if (attackEffect.type !== "areaEffect") {
                        // Copia l'effetto con durata ridotta
                        const reducedEffect = { ...attackEffect };
                        if (reducedEffect.duration) {
                            reducedEffect.duration *= distanceFactor;
                        }
                        
                        // Applica l'effetto
                        switch (reducedEffect.type) {
                            case "burn":
                                areaTarget.applyStatusEffect("burn", reducedEffect.duration, {
                                    damagePerSecond: reducedEffect.damagePerSecond
                                });
                                break;
                                
                            case "freeze":
                                areaTarget.applyStatusEffect("freeze", reducedEffect.duration, {
                                    slowPercentage: reducedEffect.slowPercentage
                                });
                                break;
                                
                            case "stun":
                                areaTarget.applyStatusEffect("stun", reducedEffect.duration);
                                break;
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Crea particelle per l'impatto di un attacco
     * @param {number} x - Coordinata X dell'impatto
     * @param {number} y - Coordinata Y dell'impatto
     * @param {string} type - Tipo di attacco ("fah", "brih", "combined")
     */
    createImpactParticles(x, y, type) {
        // Colore delle particelle in base al tipo di attacco
        let color;
        switch (type) {
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
        
        // Crea diverse particelle
        for (let i = 0; i < 10; i++) {
            this.world.particles.push({
                x,
                y,
                velocityX: (Math.random() - 0.5) * 100,
                velocityY: (Math.random() - 0.5) * 100,
                size: 5 + Math.random() * 5,
                color,
                duration: 0.5 + Math.random() * 0.5,
                gravity: 50,
                friction: 0.5,
                shrink: 0.5,
                fade: 0.5,
                opacity: 1
            });
        }
    }
    
    /**
     * Crea un indicatore di danno fluttuante
     * @param {number} x - Coordinata X dell'indicatore
     * @param {number} y - Coordinata Y dell'indicatore
     * @param {number} damage - Quantità di danno
     */
    createDamageIndicator(x, y, damage) {
        // Arrotonda il danno
        const roundedDamage = Math.round(damage);
        
        // Crea l'indicatore
        this.world.damageIndicators = this.world.damageIndicators || [];
        this.world.damageIndicators.push({
            x,
            y,
            text: roundedDamage.toString(),
            color: roundedDamage > 0 ? "#e74c3c" : "#2ecc71",
            duration: 1,
            velocityY: -30,
            opacity: 1
        });
    }
}

// Esporta la classe
window.CombatSystem = CombatSystem;
