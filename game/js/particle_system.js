/**
 * Mindworld - Sistema di Particelle
 * 
 * Questo file contiene il sistema di particelle per effetti visivi anime-inspired,
 * inclusi effetti di combattimento, atmosferici e di interfaccia.
 */

class ParticleSystem {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
        this.maxParticles = 500;
        
        // Tipi di particelle predefiniti
        this.particleTypes = {
            fire: {
                color: ['#ff6b35', '#f7931e', '#ffcc02'],
                size: { min: 2, max: 8 },
                life: { min: 0.5, max: 2.0 },
                speed: { min: 20, max: 80 },
                gravity: -30,
                fade: true
            },
            ice: {
                color: ['#74c0fc', '#339af0', '#1c7ed6'],
                size: { min: 1, max: 6 },
                life: { min: 0.8, max: 2.5 },
                speed: { min: 15, max: 60 },
                gravity: 20,
                fade: true,
                sparkle: true
            },
            magic: {
                color: ['#da77f2', '#9775fa', '#7048e8'],
                size: { min: 3, max: 10 },
                life: { min: 1.0, max: 3.0 },
                speed: { min: 10, max: 50 },
                gravity: 0,
                fade: true,
                glow: true
            },
            heal: {
                color: ['#51cf66', '#40c057', '#37b24d'],
                size: { min: 2, max: 6 },
                life: { min: 1.5, max: 3.0 },
                speed: { min: 5, max: 30 },
                gravity: -40,
                fade: true,
                glow: true
            },
            sparkle: {
                color: ['#fff', '#ffd43b', '#fab005'],
                size: { min: 1, max: 4 },
                life: { min: 0.3, max: 1.0 },
                speed: { min: 20, max: 100 },
                gravity: 0,
                fade: true,
                twinkle: true
            },
            smoke: {
                color: ['#868e96', '#495057', '#343a40'],
                size: { min: 5, max: 15 },
                life: { min: 2.0, max: 4.0 },
                speed: { min: 5, max: 25 },
                gravity: -10,
                fade: true,
                expand: true
            }
        };
    }
    
    /**
     * Crea un'esplosione di particelle
     * @param {number} x - Coordinata X
     * @param {number} y - Coordinata Y
     * @param {string} type - Tipo di particella
     * @param {number} count - Numero di particelle
     * @param {Object} options - Opzioni aggiuntive
     */
    createExplosion(x, y, type = 'fire', count = 20, options = {}) {
        const particleType = this.particleTypes[type] || this.particleTypes.fire;
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const speed = this.randomBetween(particleType.speed.min, particleType.speed.max);
            
            this.createParticle({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                type: type,
                ...options
            });
        }
    }
    
    /**
     * Crea un effetto di trail (scia)
     * @param {number} x - Coordinata X
     * @param {number} y - Coordinata Y
     * @param {number} targetX - Coordinata X di destinazione
     * @param {number} targetY - Coordinata Y di destinazione
     * @param {string} type - Tipo di particella
     * @param {number} count - Numero di particelle
     */
    createTrail(x, y, targetX, targetY, type = 'magic', count = 10) {
        const particleType = this.particleTypes[type] || this.particleTypes.magic;
        
        for (let i = 0; i < count; i++) {
            const progress = i / count;
            const particleX = x + (targetX - x) * progress;
            const particleY = y + (targetY - y) * progress;
            
            // Aggiungi un po' di variazione casuale
            const offsetX = (Math.random() - 0.5) * 20;
            const offsetY = (Math.random() - 0.5) * 20;
            
            this.createParticle({
                x: particleX + offsetX,
                y: particleY + offsetY,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                type: type,
                delay: i * 0.05 // Ritardo per creare l'effetto scia
            });
        }
    }
    
    /**
     * Crea particelle ambientali continue
     * @param {string} type - Tipo di particella
     * @param {number} intensity - Intensità (particelle per secondo)
     */
    createAmbientParticles(type = 'sparkle', intensity = 5) {
        const particleType = this.particleTypes[type] || this.particleTypes.sparkle;
        
        // Crea particelle casuali sui bordi dello schermo
        for (let i = 0; i < intensity; i++) {
            let x, y, vx, vy;
            
            // Scegli un lato casuale dello schermo
            const side = Math.floor(Math.random() * 4);
            switch (side) {
                case 0: // Top
                    x = Math.random() * this.canvas.width;
                    y = -10;
                    vx = (Math.random() - 0.5) * 20;
                    vy = this.randomBetween(10, 30);
                    break;
                case 1: // Right
                    x = this.canvas.width + 10;
                    y = Math.random() * this.canvas.height;
                    vx = this.randomBetween(-30, -10);
                    vy = (Math.random() - 0.5) * 20;
                    break;
                case 2: // Bottom
                    x = Math.random() * this.canvas.width;
                    y = this.canvas.height + 10;
                    vx = (Math.random() - 0.5) * 20;
                    vy = this.randomBetween(-30, -10);
                    break;
                case 3: // Left
                    x = -10;
                    y = Math.random() * this.canvas.height;
                    vx = this.randomBetween(10, 30);
                    vy = (Math.random() - 0.5) * 20;
                    break;
            }
            
            this.createParticle({
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                type: type
            });
        }
    }
    
    /**
     * Crea una singola particella
     * @param {Object} config - Configurazione della particella
     */
    createParticle(config) {
        if (this.particles.length >= this.maxParticles) {
            // Rimuovi la particella più vecchia
            this.particles.shift();
        }
        
        const type = config.type || 'fire';
        const particleType = this.particleTypes[type] || this.particleTypes.fire;
        
        const particle = {
            x: config.x || 0,
            y: config.y || 0,
            vx: config.vx || 0,
            vy: config.vy || 0,
            size: config.size || this.randomBetween(particleType.size.min, particleType.size.max),
            life: config.life || this.randomBetween(particleType.life.min, particleType.life.max),
            maxLife: 0,
            color: config.color || this.randomChoice(particleType.color),
            type: type,
            delay: config.delay || 0,
            rotation: config.rotation || 0,
            rotationSpeed: config.rotationSpeed || (Math.random() - 0.5) * 5,
            alpha: config.alpha || 1,
            scale: config.scale || 1,
            scaleSpeed: config.scaleSpeed || 0
        };
        
        particle.maxLife = particle.life;
        
        // Applica proprietà specifiche del tipo
        if (particleType.expand) {
            particle.scaleSpeed = 0.5;
        }
        
        this.particles.push(particle);
    }
    
    /**
     * Aggiorna tutte le particelle
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento
     */
    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Gestisci il ritardo
            if (particle.delay > 0) {
                particle.delay -= deltaTime;
                continue;
            }
            
            // Aggiorna la vita della particella
            particle.life -= deltaTime;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // Aggiorna la posizione
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            
            // Applica la gravità
            const particleType = this.particleTypes[particle.type];
            if (particleType.gravity) {
                particle.vy += particleType.gravity * deltaTime;
            }
            
            // Aggiorna la rotazione
            particle.rotation += particle.rotationSpeed * deltaTime;
            
            // Aggiorna la scala
            particle.scale += particle.scaleSpeed * deltaTime;
            
            // Aggiorna l'alpha per l'effetto fade
            if (particleType.fade) {
                particle.alpha = particle.life / particle.maxLife;
            }
            
            // Effetto twinkle
            if (particleType.twinkle) {
                particle.alpha *= 0.5 + 0.5 * Math.sin(Date.now() * 0.01 + particle.x * 0.1);
            }
        }
    }
    
    /**
     * Disegna tutte le particelle
     */
    draw() {
        this.ctx.save();
        
        for (const particle of this.particles) {
            if (particle.delay > 0) continue;
            
            const particleType = this.particleTypes[particle.type];
            
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation);
            this.ctx.scale(particle.scale, particle.scale);
            
            // Effetto glow
            if (particleType.glow) {
                this.ctx.shadowColor = particle.color;
                this.ctx.shadowBlur = particle.size * 2;
            }
            
            // Disegna la particella
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            
            if (particle.type === 'sparkle') {
                // Disegna una stella per le particelle sparkle
                this.drawStar(0, 0, particle.size, particle.size * 0.5, 5);
            } else {
                // Disegna un cerchio per le altre particelle
                this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
            }
            
            this.ctx.fill();
            this.ctx.restore();
        }
        
        this.ctx.restore();
    }
    
    /**
     * Disegna una stella
     * @param {number} cx - Centro X
     * @param {number} cy - Centro Y
     * @param {number} outerRadius - Raggio esterno
     * @param {number} innerRadius - Raggio interno
     * @param {number} points - Numero di punte
     */
    drawStar(cx, cy, outerRadius, innerRadius, points) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / points;
        
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < points; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
            
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
        }
        
        this.ctx.lineTo(cx, cy - outerRadius);
        this.ctx.closePath();
    }
    
    /**
     * Pulisce tutte le particelle
     */
    clear() {
        this.particles = [];
    }
    
    /**
     * Ottiene il numero di particelle attive
     * @returns {number} Numero di particelle
     */
    getParticleCount() {
        return this.particles.length;
    }
    
    /**
     * Genera un numero casuale tra min e max
     * @param {number} min - Valore minimo
     * @param {number} max - Valore massimo
     * @returns {number} Numero casuale
     */
    randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    /**
     * Sceglie un elemento casuale da un array
     * @param {Array} array - Array da cui scegliere
     * @returns {*} Elemento casuale
     */
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
}

// Esporta la classe
window.ParticleSystem = ParticleSystem;
