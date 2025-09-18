/**
 * Mindworld - Sistema di Combattimento Magico
 * 
 * Questo file contiene le classi e le funzioni principali per il sistema di combattimento
 * basato sugli elementi Fah (rosso) e Brih (blu).
 */

// Classe principale per il bracciale tecnologico
class TechBracelet {
    constructor(playerLevel = 1) {
        this.level = playerLevel;
        this.fahEnergy = 100;
        this.brihEnergy = 100;
        this.maxEnergy = 100 + (playerLevel * 10);
        this.modules = [];
        this.activeAttacks = {
            fah: ["fireDart"],
            brih: ["waterLance"],
            combined: []
        };
        this.cooldowns = {};
        this.regenRate = 5 + Math.floor(playerLevel / 2);
    }

    // Aggiunge un modulo al bracciale (max 3)
    addModule(module) {
        if (this.modules.length >= 3) {
            console.warn("Impossibile aggiungere più di 3 moduli al bracciale");
            return false;
        }
        this.modules.push(module);
        this.applyModuleEffects(module);
        return true;
    }

    // Applica gli effetti del modulo alle statistiche del bracciale
    applyModuleEffects(module) {
        if (module.effects.maxEnergy) {
            this.maxEnergy += module.effects.maxEnergy;
        }
        if (module.effects.regenRate) {
            this.regenRate += module.effects.regenRate;
        }
        if (module.effects.unlockAttack) {
            const attackType = module.effects.unlockAttack.type;
            const attackName = module.effects.unlockAttack.name;
            if (!this.activeAttacks[attackType].includes(attackName)) {
                this.activeAttacks[attackType].push(attackName);
            }
        }
    }

    // Esegue un attacco elementale
    executeAttack(attackName, targetPosition) {
        // Verifica se l'attacco è in cooldown
        if (this.cooldowns[attackName] && this.cooldowns[attackName] > 0) {
            console.warn(`Attacco ${attackName} in cooldown per altri ${this.cooldowns[attackName]} secondi`);
            return null;
        }

        // Trova l'attacco nel database degli attacchi
        const attackData = ATTACKS_DATABASE[attackName];
        if (!attackData) {
            console.error(`Attacco ${attackName} non trovato nel database`);
            return null;
        }

        // Verifica se c'è abbastanza energia
        if (attackData.type === "fah" && this.fahEnergy < attackData.energyCost) {
            console.warn("Energia Fah insufficiente per questo attacco");
            return null;
        } else if (attackData.type === "brih" && this.brihEnergy < attackData.energyCost) {
            console.warn("Energia Brih insufficiente per questo attacco");
            return null;
        } else if (attackData.type === "combined" && 
                  (this.fahEnergy < attackData.energyCost / 2 || 
                   this.brihEnergy < attackData.energyCost / 2)) {
            console.warn("Energia insufficiente per questo attacco combinato");
            return null;
        }

        // Consuma l'energia
        if (attackData.type === "fah") {
            this.fahEnergy -= attackData.energyCost;
        } else if (attackData.type === "brih") {
            this.brihEnergy -= attackData.energyCost;
        } else if (attackData.type === "combined") {
            this.fahEnergy -= attackData.energyCost / 2;
            this.brihEnergy -= attackData.energyCost / 2;
        }

        // Imposta il cooldown
        this.cooldowns[attackName] = attackData.cooldown;

        // Applica modificatori dai moduli
        let modifiedAttack = { ...attackData };
        this.modules.forEach(module => {
            if (module.effects.attackModifiers && 
                module.effects.attackModifiers[attackName]) {
                const modifier = module.effects.attackModifiers[attackName];
                modifiedAttack.damage = modifiedAttack.damage * (1 + modifier.damageMultiplier);
                modifiedAttack.range = modifiedAttack.range * (1 + modifier.rangeMultiplier);
                modifiedAttack.duration = modifiedAttack.duration * (1 + modifier.durationMultiplier);
            }
        });

        // Crea l'istanza dell'attacco
        return new ElementalAttack(modifiedAttack, targetPosition, this.level);
    }

    // Aggiorna lo stato del bracciale (chiamato ad ogni frame)
    update(deltaTime) {
        // Rigenera energia
        this.fahEnergy = Math.min(this.maxEnergy, this.fahEnergy + this.regenRate * deltaTime);
        this.brihEnergy = Math.min(this.maxEnergy, this.brihEnergy + this.regenRate * deltaTime);

        // Aggiorna i cooldown
        for (const attack in this.cooldowns) {
            if (this.cooldowns[attack] > 0) {
                this.cooldowns[attack] -= deltaTime;
                if (this.cooldowns[attack] < 0) this.cooldowns[attack] = 0;
            }
        }
    }
}

// Classe per gli attacchi elementali
class ElementalAttack {
    constructor(attackData, targetPosition, playerLevel) {
        this.name = attackData.name;
        this.type = attackData.type;
        this.baseDamage = attackData.damage;
        this.damage = this.calculateDamage(playerLevel);
        this.range = attackData.range;
        this.duration = attackData.duration;
        this.effects = attackData.effects || [];
        this.targetPosition = targetPosition;
        this.currentPosition = { x: 0, y: 0, z: 0 }; // Sarà impostato dalla posizione del giocatore
        this.active = true;
        this.lifeTime = 0;
    }

    // Calcola il danno in base al livello del giocatore
    calculateDamage(playerLevel) {
        return this.baseDamage * (1 + (playerLevel * 0.1));
    }

    // Aggiorna la posizione e lo stato dell'attacco
    update(deltaTime) {
        this.lifeTime += deltaTime;
        if (this.lifeTime >= this.duration) {
            this.active = false;
            return;
        }

        // Logica di movimento specifica per ogni tipo di attacco
        // (implementata nelle sottoclassi o tramite strategia)
    }

    // Verifica se l'attacco colpisce un bersaglio
    checkHit(target) {
        // Calcola la distanza tra l'attacco e il bersaglio
        const distance = calculateDistance(this.currentPosition, target.position);
        return distance <= this.range;
    }

    // Applica gli effetti dell'attacco a un bersaglio
    applyEffects(target) {
        // Applica il danno base
        target.takeDamage(this.damage, this.type);

        // Applica effetti aggiuntivi
        this.effects.forEach(effect => {
            switch (effect.type) {
                case "burn":
                    target.applyStatusEffect("burn", effect.duration, effect.damagePerSecond);
                    break;
                case "freeze":
                    target.applyStatusEffect("freeze", effect.duration, effect.slowPercentage);
                    break;
                case "stun":
                    target.applyStatusEffect("stun", effect.duration);
                    break;
                // Altri effetti...
            }
        });
    }
}

// Database degli attacchi disponibili
const ATTACKS_DATABASE = {
    // Attacchi Fah (Rossi)
    "fireDart": {
        name: "Dardo Infuocato",
        type: "fah",
        damage: 15,
        range: 10,
        duration: 1.5,
        energyCost: 10,
        cooldown: 0.5,
        effects: [
            { type: "burn", duration: 2, damagePerSecond: 3 }
        ]
    },
    "heatWave": {
        name: "Onda di Calore",
        type: "fah",
        damage: 25,
        range: 8,
        duration: 2,
        energyCost: 30,
        cooldown: 8,
        effects: [
            { type: "burn", duration: 3, damagePerSecond: 5 }
        ]
    },
    "burningShield": {
        name: "Scudo Ardente",
        type: "fah",
        damage: 10,
        range: 3,
        duration: 5,
        energyCost: 25,
        cooldown: 12,
        effects: [
            { type: "reflect", reflectPercentage: 50 }
        ]
    },
    "crimsonExplosion": {
        name: "Esplosione Cremisi",
        type: "fah",
        damage: 80,
        range: 12,
        duration: 3,
        energyCost: 60,
        cooldown: 30,
        effects: [
            { type: "burn", duration: 5, damagePerSecond: 8 },
            { type: "knockback", force: 10 }
        ]
    },

    // Attacchi Brih (Blu)
    "waterLance": {
        name: "Lancia d'Acqua",
        type: "brih",
        damage: 12,
        range: 15,
        duration: 1,
        energyCost: 8,
        cooldown: 0.5,
        effects: []
    },
    "frostMist": {
        name: "Nebbia Gelida",
        type: "brih",
        damage: 5,
        range: 10,
        duration: 4,
        energyCost: 25,
        cooldown: 10,
        effects: [
            { type: "freeze", duration: 4, slowPercentage: 40 }
        ]
    },
    "crystalBarrier": {
        name: "Barriera Cristallina",
        type: "brih",
        damage: 0,
        range: 3,
        duration: 8,
        energyCost: 30,
        cooldown: 15,
        effects: [
            { type: "shield", absorptionAmount: 50 }
        ]
    },
    "iceStorm": {
        name: "Tempesta di Ghiaccio",
        type: "brih",
        damage: 70,
        range: 15,
        duration: 5,
        energyCost: 60,
        cooldown: 30,
        effects: [
            { type: "freeze", duration: 3, slowPercentage: 70 },
            { type: "areaEffect", radius: 8 }
        ]
    },

    // Attacchi Combinati (Viola)
    "elementalSpiral": {
        name: "Spirale Elementale",
        type: "combined",
        damage: 45,
        range: 12,
        duration: 3,
        energyCost: 40,
        cooldown: 15,
        effects: [
            { type: "burn", duration: 2, damagePerSecond: 5 },
            { type: "freeze", duration: 2, slowPercentage: 30 }
        ]
    },
    "balancedAura": {
        name: "Aura Equilibrata",
        type: "combined",
        damage: 5,
        range: 5,
        duration: 10,
        energyCost: 50,
        cooldown: 25,
        effects: [
            { type: "damageReduction", percentage: 40, duration: 10 },
            { type: "regeneration", amountPerSecond: 5, duration: 10 }
        ]
    },
    "chromaticNova": {
        name: "Nova Cromatica",
        type: "combined",
        damage: 150,
        range: 20,
        duration: 5,
        energyCost: 100,
        cooldown: 60,
        effects: [
            { type: "burn", duration: 8, damagePerSecond: 10 },
            { type: "freeze", duration: 4, slowPercentage: 80 },
            { type: "stun", duration: 2 },
            { type: "areaEffect", radius: 15 }
        ]
    }
};

// Funzione di utilità per calcolare la distanza tra due punti
function calculateDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const dz = point2.z - point1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Esporta le classi e le funzioni
export { TechBracelet, ElementalAttack, ATTACKS_DATABASE };
