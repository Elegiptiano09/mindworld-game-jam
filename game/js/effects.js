/**
 * Mindworld - Sistema di effetti visivi
 * 
 * Questo file contiene le classi e le funzioni per la gestione degli effetti visivi,
 * inclusi particelle, animazioni, shader e post-processing.
 */

class EffectsSystem {
    constructor(game) {
        // Riferimento al gioco
        this.game = game;
        
        // Sistemi di particelle attivi
        this.particleSystems = [];
        
        // Animazioni attive
        this.animations = [];
        
        // Effetti di post-processing
        this.postProcessingEffects = {
            bloom: {
                enabled: false,
                intensity: 0.5,
                threshold: 0.7,
                radius: 0.5
            },
            chromaticAberration: {
                enabled: false,
                intensity: 0.2,
                redOffset: { x: 2, y: 0 },
                greenOffset: { x: 0, y: 0 },
                blueOffset: { x: -2, y: 0 }
            },
            vignette: {
                enabled: false,
                intensity: 0.5,
                color: { r: 0, g: 0, b: 0 }
            },
            motionBlur: {
                enabled: false,
                intensity: 0.3,
                samples: 16
            },
            colorGrading: {
                enabled: false,
                brightness: 1.0,
                contrast: 1.0,
                saturation: 1.0,
                hue: 0.0
            }
        };
        
        // Shader attivi
        this.activeShaders = [];
        
        // Effetti di transizione
        this.transitions = {
            fade: {
                duration: 1.0,
                color: { r: 0, g: 0, b: 0 },
                progress: 0.0,
                active: false,
                callback: null
            },
            wipe: {
                duration: 1.0,
                direction: "right", // right, left, up, down
                progress: 0.0,
                active: false,
                callback: null
            },
            dissolve: {
                duration: 1.0,
                noiseScale: 30.0,
                progress: 0.0,
                active: false,
                callback: null
            },
            pixelate: {
                duration: 1.0,
                maxPixelSize: 32,
                progress: 0.0,
                active: false,
                callback: null
            }
        };
        
        // Effetti ambientali
        this.environmentalEffects = {
            rain: {
                enabled: false,
                intensity: 0.5,
                direction: { x: 0, y: 1 },
                color: { r: 200, g: 200, b: 240 },
                size: { min: 1, max: 3 },
                speed: { min: 200, max: 400 },
                particles: []
            },
            snow: {
                enabled: false,
                intensity: 0.3,
                direction: { x: 0.1, y: 0.5 },
                color: { r: 255, g: 255, b: 255 },
                size: { min: 2, max: 5 },
                speed: { min: 50, max: 100 },
                particles: []
            },
            fog: {
                enabled: false,
                intensity: 0.4,
                color: { r: 200, g: 200, b: 200 },
                speed: 0.1,
                height: 0.3,
                particles: []
            },
            fireflies: {
                enabled: false,
                count: 50,
                color: { r: 255, g: 230, b: 150 },
                size: { min: 1, max: 3 },
                speed: { min: 10, max: 30 },
                particles: []
            }
        };
        
        // Effetti di impatto
        this.impactEffects = {
            explosion: {
                particleCount: 50,
                duration: 0.5,
                size: { min: 2, max: 8 },
                speed: { min: 50, max: 200 },
                colors: [
                    { r: 255, g: 100, b: 0 },
                    { r: 255, g: 200, b: 0 },
                    { r: 255, g: 50, b: 0 }
                ]
            },
            splash: {
                particleCount: 30,
                duration: 0.4,
                size: { min: 1, max: 4 },
                speed: { min: 30, max: 150 },
                colors: [
                    { r: 100, g: 150, b: 255 },
                    { r: 150, g: 200, b: 255 },
                    { r: 200, g: 230, b: 255 }
                ]
            },
            sparkle: {
                particleCount: 20,
                duration: 0.6,
                size: { min: 1, max: 3 },
                speed: { min: 20, max: 80 },
                colors: [
                    { r: 255, g: 255, b: 200 },
                    { r: 255, g: 255, b: 150 },
                    { r: 255, g: 255, b: 100 }
                ]
            },
            smoke: {
                particleCount: 15,
                duration: 1.0,
                size: { min: 5, max: 15 },
                speed: { min: 10, max: 40 },
                colors: [
                    { r: 100, g: 100, b: 100 },
                    { r: 150, g: 150, b: 150 },
                    { r: 200, g: 200, b: 200 }
                ]
            }
        };
        
        // Effetti di stato
        this.statusEffects = {
            burning: {
                particleCount: 20,
                duration: -1, // -1 per infinito
                size: { min: 2, max: 5 },
                speed: { min: 30, max: 80 },
                colors: [
                    { r: 255, g: 100, b: 0 },
                    { r: 255, g: 150, b: 0 },
                    { r: 255, g: 200, b: 0 }
                ],
                offset: { x: 0, y: -20 }
            },
            frozen: {
                particleCount: 15,
                duration: -1,
                size: { min: 1, max: 3 },
                speed: { min: 10, max: 30 },
                colors: [
                    { r: 200, g: 200, b: 255 },
                    { r: 150, g: 150, b: 255 },
                    { r: 100, g: 100, b: 255 }
                ],
                offset: { x: 0, y: -20 }
            },
            poisoned: {
                particleCount: 10,
                duration: -1,
                size: { min: 2, max: 4 },
                speed: { min: 20, max: 50 },
                colors: [
                    { r: 100, g: 200, b: 0 },
                    { r: 150, g: 255, b: 0 },
                    { r: 50, g: 150, b: 0 }
                ],
                offset: { x: 0, y: -20 }
            },
            electrified: {
                particleCount: 25,
                duration: -1,
                size: { min: 1, max: 3 },
                speed: { min: 40, max: 100 },
                colors: [
                    { r: 200, g: 200, b: 255 },
                    { r: 150, g: 150, b: 255 },
                    { r: 100, g: 100, b: 255 }
                ],
                offset: { x: 0, y: -20 }
            }
        };
        
        // Effetti di abilità
        this.abilityEffects = {
            fireball: {
                projectile: {
                    image: null,
                    size: { width: 20, height: 20 },
                    speed: 300,
                    rotation: 0,
                    rotationSpeed: 5
                },
                trail: {
                    particleCount: 20,
                    duration: 0.3,
                    size: { min: 2, max: 5 },
                    speed: { min: 10, max: 30 },
                    colors: [
                        { r: 255, g: 100, b: 0 },
                        { r: 255, g: 150, b: 0 },
                        { r: 255, g: 200, b: 0 }
                    ]
                },
                impact: "explosion"
            },
            iceSpike: {
                projectile: {
                    image: null,
                    size: { width: 15, height: 30 },
                    speed: 350,
                    rotation: 0,
                    rotationSpeed: 0
                },
                trail: {
                    particleCount: 15,
                    duration: 0.2,
                    size: { min: 1, max: 3 },
                    speed: { min: 5, max: 20 },
                    colors: [
                        { r: 200, g: 200, b: 255 },
                        { r: 150, g: 150, b: 255 },
                        { r: 100, g: 100, b: 255 }
                    ]
                },
                impact: "splash"
            },
            flameWave: {
                wave: {
                    image: null,
                    size: { width: 100, height: 50 },
                    speed: 200,
                    duration: 0.5,
                    expandSpeed: 100
                },
                particles: {
                    particleCount: 30,
                    duration: 0.4,
                    size: { min: 3, max: 8 },
                    speed: { min: 20, max: 60 },
                    colors: [
                        { r: 255, g: 100, b: 0 },
                        { r: 255, g: 150, b: 0 },
                        { r: 255, g: 200, b: 0 }
                    ]
                }
            },
            frostNova: {
                wave: {
                    image: null,
                    size: { width: 80, height: 80 },
                    speed: 0,
                    duration: 0.4,
                    expandSpeed: 150
                },
                particles: {
                    particleCount: 25,
                    duration: 0.3,
                    size: { min: 2, max: 5 },
                    speed: { min: 30, max: 80 },
                    colors: [
                        { r: 200, g: 200, b: 255 },
                        { r: 150, g: 150, b: 255 },
                        { r: 100, g: 100, b: 255 }
                    ]
                }
            },
            meteor: {
                projectile: {
                    image: null,
                    size: { width: 40, height: 40 },
                    speed: 400,
                    rotation: 45,
                    rotationSpeed: 10
                },
                trail: {
                    particleCount: 30,
                    duration: 0.5,
                    size: { min: 5, max: 10 },
                    speed: { min: 20, max: 50 },
                    colors: [
                        { r: 255, g: 100, b: 0 },
                        { r: 255, g: 150, b: 0 },
                        { r: 255, g: 200, b: 0 }
                    ]
                },
                impact: "explosion"
            },
            blizzard: {
                area: {
                    image: null,
                    size: { width: 150, height: 150 },
                    duration: 5.0
                },
                particles: {
                    particleCount: 100,
                    duration: 5.0,
                    size: { min: 2, max: 5 },
                    speed: { min: 50, max: 150 },
                    colors: [
                        { r: 200, g: 200, b: 255 },
                        { r: 150, g: 150, b: 255 },
                        { r: 100, g: 100, b: 255 }
                    ]
                }
            },
            fireShield: {
                shield: {
                    image: null,
                    size: { width: 60, height: 60 },
                    duration: 10.0,
                    rotationSpeed: 1
                },
                particles: {
                    particleCount: 20,
                    duration: 10.0,
                    size: { min: 2, max: 4 },
                    speed: { min: 10, max: 30 },
                    colors: [
                        { r: 255, g: 100, b: 0 },
                        { r: 255, g: 150, b: 0 },
                        { r: 255, g: 200, b: 0 }
                    ]
                }
            },
            iceArmor: {
                armor: {
                    image: null,
                    size: { width: 60, height: 60 },
                    duration: 15.0,
                    pulseSpeed: 0.5
                },
                particles: {
                    particleCount: 15,
                    duration: 15.0,
                    size: { min: 1, max: 3 },
                    speed: { min: 5, max: 15 },
                    colors: [
                        { r: 200, g: 200, b: 255 },
                        { r: 150, g: 150, b: 255 },
                        { r: 100, g: 100, b: 255 }
                    ]
                }
            },
            elementalBurst: {
                explosion: {
                    image: null,
                    size: { width: 100, height: 100 },
                    duration: 0.6,
                    expandSpeed: 200
                },
                particles: {
                    particleCount: 60,
                    duration: 0.6,
                    size: { min: 3, max: 8 },
                    speed: { min: 50, max: 150 },
                    colors: [
                        { r: 255, g: 100, b: 0 },
                        { r: 100, g: 100, b: 255 },
                        { r: 255, g: 150, b: 0 },
                        { r: 150, g: 150, b: 255 }
                    ]
                }
            },
            elementalHarmony: {
                aura: {
                    image: null,
                    size: { width: 80, height: 80 },
                    duration: 20.0,
                    pulseSpeed: 0.3
                },
                particles: {
                    particleCount: 40,
                    duration: 20.0,
                    size: { min: 2, max: 5 },
                    speed: { min: 10, max: 40 },
                    colors: [
                        { r: 255, g: 100, b: 0 },
                        { r: 100, g: 100, b: 255 },
                        { r: 255, g: 150, b: 0 },
                        { r: 150, g: 150, b: 255 }
                    ]
                }
            }
        };
        
        // Inizializza il sistema
        this.initialize();
    }
    
    /**
     * Inizializza il sistema di effetti visivi
     */
    initialize() {
        // Carica le immagini per gli effetti
        this.loadImages();
    }
    
    /**
     * Carica le immagini per gli effetti
     */
    loadImages() {
        // Implementazione base, da espandere con il caricamento delle immagini
        // In una versione completa, qui si caricherebbero le immagini da Assets
    }
    
    /**
     * Crea un sistema di particelle
     * @param {Object} options - Opzioni per il sistema di particelle
     * @returns {Object} Sistema di particelle creato
     */
    createParticleSystem(options) {
        const defaults = {
            x: 0,
            y: 0,
            particleCount: 20,
            duration: 1.0,
            size: { min: 2, max: 5 },
            speed: { min: 30, max: 100 },
            direction: { x: 0, y: -1 },
            spread: Math.PI / 4,
            gravity: 0,
            colors: [
                { r: 255, g: 255, b: 255 }
            ],
            fadeOut: true,
            shrink: true,
            loop: false,
            blendMode: "source-over",
            onComplete: null
        };
        
        // Unisci le opzioni con i valori predefiniti
        const settings = { ...defaults, ...options };
        
        // Crea il sistema di particelle
        const particleSystem = {
            x: settings.x,
            y: settings.y,
            particles: [],
            settings: settings,
            active: true,
            elapsed: 0
        };
        
        // Crea le particelle
        for (let i = 0; i < settings.particleCount; i++) {
            particleSystem.particles.push(this.createParticle(particleSystem));
        }
        
        // Aggiungi il sistema di particelle alla lista
        this.particleSystems.push(particleSystem);
        
        return particleSystem;
    }
    
    /**
     * Crea una particella per un sistema di particelle
     * @param {Object} system - Sistema di particelle
     * @returns {Object} Particella creata
     */
    createParticle(system) {
        const settings = system.settings;
        
        // Calcola la dimensione della particella
        const size = Math.random() * (settings.size.max - settings.size.min) + settings.size.min;
        
        // Calcola la velocità della particella
        const speed = Math.random() * (settings.speed.max - settings.speed.min) + settings.speed.min;
        
        // Calcola la direzione della particella
        const angle = Math.atan2(settings.direction.y, settings.direction.x) + 
                      (Math.random() * settings.spread * 2 - settings.spread);
        
        // Calcola la durata della particella
        const duration = settings.duration * (0.7 + Math.random() * 0.6);
        
        // Scegli un colore casuale
        const colorIndex = Math.floor(Math.random() * settings.colors.length);
        const color = settings.colors[colorIndex];
        
        return {
            x: system.x,
            y: system.y,
            size: size,
            initialSize: size,
            velocity: {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            },
            color: { ...color },
            alpha: 1.0,
            duration: duration,
            elapsed: 0
        };
    }
    
    /**
     * Aggiorna un sistema di particelle
     * @param {Object} system - Sistema di particelle
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    updateParticleSystem(system, deltaTime) {
        // Aggiorna il tempo trascorso
        system.elapsed += deltaTime;
        
        // Aggiorna le particelle
        for (let i = system.particles.length - 1; i >= 0; i--) {
            const particle = system.particles[i];
            
            // Aggiorna il tempo trascorso
            particle.elapsed += deltaTime;
            
            // Verifica se la particella è scaduta
            if (particle.elapsed >= particle.duration) {
                // Rimuovi la particella
                system.particles.splice(i, 1);
                
                // Se il sistema è in loop, crea una nuova particella
                if (system.settings.loop) {
                    system.particles.push(this.createParticle(system));
                }
                
                continue;
            }
            
            // Calcola il progresso della particella
            const progress = particle.elapsed / particle.duration;
            
            // Aggiorna la posizione della particella
            particle.x += particle.velocity.x * deltaTime;
            particle.y += particle.velocity.y * deltaTime;
            
            // Applica la gravità
            particle.velocity.y += system.settings.gravity * deltaTime;
            
            // Aggiorna l'opacità della particella
            if (system.settings.fadeOut) {
                particle.alpha = 1.0 - progress;
            }
            
            // Aggiorna la dimensione della particella
            if (system.settings.shrink) {
                particle.size = particle.initialSize * (1.0 - progress);
            }
        }
        
        // Verifica se il sistema è scaduto
        if (!system.settings.loop && system.particles.length === 0) {
            system.active = false;
            
            // Esegui il callback di completamento
            if (system.settings.onComplete) {
                system.settings.onComplete();
            }
        }
    }
    
    /**
     * Disegna un sistema di particelle
     * @param {Object} system - Sistema di particelle
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawParticleSystem(system, ctx) {
        // Salva il contesto
        ctx.save();
        
        // Imposta il metodo di composizione
        ctx.globalCompositeOperation = system.settings.blendMode;
        
        // Disegna le particelle
        for (const particle of system.particles) {
            // Imposta l'opacità
            ctx.globalAlpha = particle.alpha;
            
            // Disegna la particella
            ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.alpha})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Ripristina il contesto
        ctx.restore();
    }
    
    /**
     * Crea un'animazione
     * @param {Object} options - Opzioni per l'animazione
     * @returns {Object} Animazione creata
     */
    createAnimation(options) {
        const defaults = {
            x: 0,
            y: 0,
            image: null,
            frameWidth: 64,
            frameHeight: 64,
            frames: 1,
            frameRate: 10,
            loop: false,
            autoDestroy: true,
            scale: 1.0,
            rotation: 0,
            alpha: 1.0,
            onComplete: null
        };
        
        // Unisci le opzioni con i valori predefiniti
        const settings = { ...defaults, ...options };
        
        // Crea l'animazione
        const animation = {
            x: settings.x,
            y: settings.y,
            image: settings.image,
            frameWidth: settings.frameWidth,
            frameHeight: settings.frameHeight,
            frames: settings.frames,
            frameRate: settings.frameRate,
            frameDuration: 1.0 / settings.frameRate,
            currentFrame: 0,
            elapsed: 0,
            loop: settings.loop,
            autoDestroy: settings.autoDestroy,
            scale: settings.scale,
            rotation: settings.rotation,
            alpha: settings.alpha,
            active: true,
            onComplete: settings.onComplete
        };
        
        // Aggiungi l'animazione alla lista
        this.animations.push(animation);
        
        return animation;
    }
    
    /**
     * Aggiorna un'animazione
     * @param {Object} animation - Animazione
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    updateAnimation(animation, deltaTime) {
        // Aggiorna il tempo trascorso
        animation.elapsed += deltaTime;
        
        // Verifica se è il momento di passare al frame successivo
        if (animation.elapsed >= animation.frameDuration) {
            // Resetta il tempo trascorso
            animation.elapsed -= animation.frameDuration;
            
            // Passa al frame successivo
            animation.currentFrame++;
            
            // Verifica se l'animazione è terminata
            if (animation.currentFrame >= animation.frames) {
                if (animation.loop) {
                    // Riavvia l'animazione
                    animation.currentFrame = 0;
                } else {
                    // Ferma l'animazione
                    animation.currentFrame = animation.frames - 1;
                    animation.active = !animation.autoDestroy;
                    
                    // Esegui il callback di completamento
                    if (animation.onComplete) {
                        animation.onComplete();
                    }
                }
            }
        }
    }
    
    /**
     * Disegna un'animazione
     * @param {Object} animation - Animazione
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawAnimation(animation, ctx) {
        // Verifica se l'immagine è caricata
        if (!animation.image) return;
        
        // Salva il contesto
        ctx.save();
        
        // Imposta l'opacità
        ctx.globalAlpha = animation.alpha;
        
        // Trasforma il contesto
        ctx.translate(animation.x, animation.y);
        ctx.rotate(animation.rotation);
        ctx.scale(animation.scale, animation.scale);
        
        // Calcola la posizione del frame
        const frameX = (animation.currentFrame % animation.frames) * animation.frameWidth;
        const frameY = Math.floor(animation.currentFrame / animation.frames) * animation.frameHeight;
        
        // Disegna il frame
        ctx.drawImage(
            animation.image,
            frameX, frameY,
            animation.frameWidth, animation.frameHeight,
            -animation.frameWidth / 2, -animation.frameHeight / 2,
            animation.frameWidth, animation.frameHeight
        );
        
        // Ripristina il contesto
        ctx.restore();
    }
    
    /**
     * Crea un effetto di impatto
     * @param {string} type - Tipo di effetto di impatto
     * @param {number} x - Coordinata X dell'effetto
     * @param {number} y - Coordinata Y dell'effetto
     * @returns {Object} Sistema di particelle creato
     */
    createImpactEffect(type, x, y) {
        // Verifica se il tipo di effetto esiste
        if (!this.impactEffects[type]) return null;
        
        // Ottieni le impostazioni dell'effetto
        const effect = this.impactEffects[type];
        
        // Crea un sistema di particelle
        return this.createParticleSystem({
            x: x,
            y: y,
            particleCount: effect.particleCount,
            duration: effect.duration,
            size: effect.size,
            speed: effect.speed,
            direction: { x: 0, y: 0 },
            spread: Math.PI * 2,
            gravity: 0,
            colors: effect.colors,
            fadeOut: true,
            shrink: true,
            loop: false,
            blendMode: "source-over"
        });
    }
    
    /**
     * Crea un effetto di stato
     * @param {string} type - Tipo di effetto di stato
     * @param {Object} target - Oggetto target dell'effetto
     * @returns {Object} Sistema di particelle creato
     */
    createStatusEffect(type, target) {
        // Verifica se il tipo di effetto esiste
        if (!this.statusEffects[type]) return null;
        
        // Ottieni le impostazioni dell'effetto
        const effect = this.statusEffects[type];
        
        // Crea un sistema di particelle
        const particleSystem = this.createParticleSystem({
            x: target.x + effect.offset.x,
            y: target.y + effect.offset.y,
            particleCount: effect.particleCount,
            duration: effect.duration < 0 ? 1.0 : effect.duration,
            size: effect.size,
            speed: effect.speed,
            direction: { x: 0, y: -1 },
            spread: Math.PI / 2,
            gravity: 10,
            colors: effect.colors,
            fadeOut: true,
            shrink: true,
            loop: effect.duration < 0,
            blendMode: "source-over"
        });
        
        // Aggiungi il riferimento al target
        particleSystem.target = target;
        
        return particleSystem;
    }
    
    /**
     * Crea un effetto di abilità
     * @param {string} type - Tipo di effetto di abilità
     * @param {number} x - Coordinata X dell'effetto
     * @param {number} y - Coordinata Y dell'effetto
     * @param {Object} options - Opzioni aggiuntive per l'effetto
     * @returns {Object} Effetto creato
     */
    createAbilityEffect(type, x, y, options = {}) {
        // Verifica se il tipo di effetto esiste
        if (!this.abilityEffects[type]) return null;
        
        // Ottieni le impostazioni dell'effetto
        const effect = this.abilityEffects[type];
        
        // Crea l'effetto in base al tipo
        if (effect.projectile) {
            // Crea un proiettile
            return this.createProjectile(type, x, y, options);
        } else if (effect.wave) {
            // Crea un'onda
            return this.createWave(type, x, y, options);
        } else if (effect.area) {
            // Crea un'area
            return this.createArea(type, x, y, options);
        } else if (effect.shield) {
            // Crea uno scudo
            return this.createShield(type, x, y, options);
        } else if (effect.armor) {
            // Crea un'armatura
            return this.createArmor(type, x, y, options);
        } else if (effect.explosion) {
            // Crea un'esplosione
            return this.createExplosion(type, x, y, options);
        } else if (effect.aura) {
            // Crea un'aura
            return this.createAura(type, x, y, options);
        }
        
        return null;
    }
    
    /**
     * Crea un proiettile
     * @param {string} type - Tipo di effetto di abilità
     * @param {number} x - Coordinata X del proiettile
     * @param {number} y - Coordinata Y del proiettile
     * @param {Object} options - Opzioni aggiuntive per il proiettile
     * @returns {Object} Proiettile creato
     */
    createProjectile(type, x, y, options = {}) {
        // Ottieni le impostazioni dell'effetto
        const effect = this.abilityEffects[type];
        const projectile = effect.projectile;
        
        // Crea l'animazione del proiettile
        const animation = this.createAnimation({
            x: x,
            y: y,
            image: projectile.image,
            frameWidth: projectile.size.width,
            frameHeight: projectile.size.height,
            frames: 1,
            frameRate: 10,
            loop: true,
            autoDestroy: false,
            scale: 1.0,
            rotation: options.angle || projectile.rotation,
            alpha: 1.0
        });
        
        // Aggiungi proprietà specifiche del proiettile
        animation.type = type;
        animation.speed = projectile.speed;
        animation.rotationSpeed = projectile.rotationSpeed;
        animation.direction = {
            x: Math.cos(options.angle || 0),
            y: Math.sin(options.angle || 0)
        };
        animation.trail = null;
        animation.impact = effect.impact;
        animation.damage = options.damage || 0;
        animation.owner = options.owner || null;
        animation.target = options.target || null;
        animation.isProjectile = true;
        
        // Crea il sistema di particelle per la scia
        if (effect.trail) {
            animation.trail = this.createParticleSystem({
                x: x,
                y: y,
                particleCount: effect.trail.particleCount,
                duration: effect.trail.duration,
                size: effect.trail.size,
                speed: effect.trail.speed,
                direction: {
                    x: -animation.direction.x,
                    y: -animation.direction.y
                },
                spread: Math.PI / 8,
                gravity: 0,
                colors: effect.trail.colors,
                fadeOut: true,
                shrink: true,
                loop: true,
                blendMode: "source-over"
            });
        }
        
        return animation;
    }
    
    /**
     * Crea un'onda
     * @param {string} type - Tipo di effetto di abilità
     * @param {number} x - Coordinata X dell'onda
     * @param {number} y - Coordinata Y dell'onda
     * @param {Object} options - Opzioni aggiuntive per l'onda
     * @returns {Object} Onda creata
     */
    createWave(type, x, y, options = {}) {
        // Ottieni le impostazioni dell'effetto
        const effect = this.abilityEffects[type];
        const wave = effect.wave;
        
        // Crea l'animazione dell'onda
        const animation = this.createAnimation({
            x: x,
            y: y,
            image: wave.image,
            frameWidth: wave.size.width,
            frameHeight: wave.size.height,
            frames: 1,
            frameRate: 10,
            loop: false,
            autoDestroy: true,
            scale: 1.0,
            rotation: options.angle || 0,
            alpha: 1.0,
            onComplete: () => {
                // Rimuovi il sistema di particelle
                if (animation.particles) {
                    animation.particles.active = false;
                }
            }
        });
        
        // Aggiungi proprietà specifiche dell'onda
        animation.type = type;
        animation.speed = wave.speed;
        animation.duration = wave.duration;
        animation.expandSpeed = wave.expandSpeed;
        animation.initialSize = { ...wave.size };
        animation.currentSize = { ...wave.size };
        animation.direction = {
            x: Math.cos(options.angle || 0),
            y: Math.sin(options.angle || 0)
        };
        animation.damage = options.damage || 0;
        animation.owner = options.owner || null;
        animation.isWave = true;
        
        // Crea il sistema di particelle per l'onda
        if (effect.particles) {
            animation.particles = this.createParticleSystem({
                x: x,
                y: y,
                particleCount: effect.particles.particleCount,
                duration: effect.particles.duration,
                size: effect.particles.size,
                speed: effect.particles.speed,
                direction: { x: 0, y: 0 },
                spread: Math.PI * 2,
                gravity: 0,
                colors: effect.particles.colors,
                fadeOut: true,
                shrink: true,
                loop: false,
                blendMode: "source-over"
            });
        }
        
        return animation;
    }
    
    /**
     * Crea un'area
     * @param {string} type - Tipo di effetto di abilità
     * @param {number} x - Coordinata X dell'area
     * @param {number} y - Coordinata Y dell'area
     * @param {Object} options - Opzioni aggiuntive per l'area
     * @returns {Object} Area creata
     */
    createArea(type, x, y, options = {}) {
        // Ottieni le impostazioni dell'effetto
        const effect = this.abilityEffects[type];
        const area = effect.area;
        
        // Crea l'animazione dell'area
        const animation = this.createAnimation({
            x: x,
            y: y,
            image: area.image,
            frameWidth: area.size.width,
            frameHeight: area.size.height,
            frames: 1,
            frameRate: 10,
            loop: true,
            autoDestroy: false,
            scale: 1.0,
            rotation: 0,
            alpha: 0.5,
            onComplete: () => {
                // Rimuovi il sistema di particelle
                if (animation.particles) {
                    animation.particles.active = false;
                }
            }
        });
        
        // Aggiungi proprietà specifiche dell'area
        animation.type = type;
        animation.duration = area.duration;
        animation.elapsed = 0;
        animation.damage = options.damage || 0;
        animation.damageInterval = options.damageInterval || 0.5;
        animation.damageElapsed = 0;
        animation.owner = options.owner || null;
        animation.isArea = true;
        
        // Crea il sistema di particelle per l'area
        if (effect.particles) {
            animation.particles = this.createParticleSystem({
                x: x,
                y: y,
                particleCount: effect.particles.particleCount,
                duration: effect.particles.duration,
                size: effect.particles.size,
                speed: effect.particles.speed,
                direction: { x: 0, y: -1 },
                spread: Math.PI * 2,
                gravity: 0,
                colors: effect.particles.colors,
                fadeOut: true,
                shrink: true,
                loop: true,
                blendMode: "source-over"
            });
        }
        
        return animation;
    }
    
    /**
     * Crea uno scudo
     * @param {string} type - Tipo di effetto di abilità
     * @param {number} x - Coordinata X dello scudo
     * @param {number} y - Coordinata Y dello scudo
     * @param {Object} options - Opzioni aggiuntive per lo scudo
     * @returns {Object} Scudo creato
     */
    createShield(type, x, y, options = {}) {
        // Ottieni le impostazioni dell'effetto
        const effect = this.abilityEffects[type];
        const shield = effect.shield;
        
        // Crea l'animazione dello scudo
        const animation = this.createAnimation({
            x: x,
            y: y,
            image: shield.image,
            frameWidth: shield.size.width,
            frameHeight: shield.size.height,
            frames: 1,
            frameRate: 10,
            loop: true,
            autoDestroy: false,
            scale: 1.0,
            rotation: 0,
            alpha: 0.7,
            onComplete: () => {
                // Rimuovi il sistema di particelle
                if (animation.particles) {
                    animation.particles.active = false;
                }
            }
        });
        
        // Aggiungi proprietà specifiche dello scudo
        animation.type = type;
        animation.duration = shield.duration;
        animation.elapsed = 0;
        animation.rotationSpeed = shield.rotationSpeed;
        animation.defense = options.defense || 0;
        animation.reflection = options.reflection || 0;
        animation.owner = options.owner || null;
        animation.target = options.target || null;
        animation.isShield = true;
        
        // Crea il sistema di particelle per lo scudo
        if (effect.particles) {
            animation.particles = this.createParticleSystem({
                x: x,
                y: y,
                particleCount: effect.particles.particleCount,
                duration: effect.particles.duration,
                size: effect.particles.size,
                speed: effect.particles.speed,
                direction: { x: 0, y: 0 },
                spread: Math.PI * 2,
                gravity: 0,
                colors: effect.particles.colors,
                fadeOut: true,
                shrink: true,
                loop: true,
                blendMode: "source-over"
            });
        }
        
        return animation;
    }
    
    /**
     * Crea un'armatura
     * @param {string} type - Tipo di effetto di abilità
     * @param {number} x - Coordinata X dell'armatura
     * @param {number} y - Coordinata Y dell'armatura
     * @param {Object} options - Opzioni aggiuntive per l'armatura
     * @returns {Object} Armatura creata
     */
    createArmor(type, x, y, options = {}) {
        // Ottieni le impostazioni dell'effetto
        const effect = this.abilityEffects[type];
        const armor = effect.armor;
        
        // Crea l'animazione dell'armatura
        const animation = this.createAnimation({
            x: x,
            y: y,
            image: armor.image,
            frameWidth: armor.size.width,
            frameHeight: armor.size.height,
            frames: 1,
            frameRate: 10,
            loop: true,
            autoDestroy: false,
            scale: 1.0,
            rotation: 0,
            alpha: 0.6,
            onComplete: () => {
                // Rimuovi il sistema di particelle
                if (animation.particles) {
                    animation.particles.active = false;
                }
            }
        });
        
        // Aggiungi proprietà specifiche dell'armatura
        animation.type = type;
        animation.duration = armor.duration;
        animation.elapsed = 0;
        animation.pulseSpeed = armor.pulseSpeed;
        animation.pulseDirection = 1;
        animation.defense = options.defense || 0;
        animation.resistance = options.resistance || 0;
        animation.owner = options.owner || null;
        animation.target = options.target || null;
        animation.isArmor = true;
        
        // Crea il sistema di particelle per l'armatura
        if (effect.particles) {
            animation.particles = this.createParticleSystem({
                x: x,
                y: y,
                particleCount: effect.particles.particleCount,
                duration: effect.particles.duration,
                size: effect.particles.size,
                speed: effect.particles.speed,
                direction: { x: 0, y: 0 },
                spread: Math.PI * 2,
                gravity: 0,
                colors: effect.particles.colors,
                fadeOut: true,
                shrink: true,
                loop: true,
                blendMode: "source-over"
            });
        }
        
        return animation;
    }
    
    /**
     * Crea un'esplosione
     * @param {string} type - Tipo di effetto di abilità
     * @param {number} x - Coordinata X dell'esplosione
     * @param {number} y - Coordinata Y dell'esplosione
     * @param {Object} options - Opzioni aggiuntive per l'esplosione
     * @returns {Object} Esplosione creata
     */
    createExplosion(type, x, y, options = {}) {
        // Ottieni le impostazioni dell'effetto
        const effect = this.abilityEffects[type];
        const explosion = effect.explosion;
        
        // Crea l'animazione dell'esplosione
        const animation = this.createAnimation({
            x: x,
            y: y,
            image: explosion.image,
            frameWidth: explosion.size.width,
            frameHeight: explosion.size.height,
            frames: 1,
            frameRate: 10,
            loop: false,
            autoDestroy: true,
            scale: 0.1,
            rotation: 0,
            alpha: 0.8,
            onComplete: () => {
                // Rimuovi il sistema di particelle
                if (animation.particles) {
                    animation.particles.active = false;
                }
            }
        });
        
        // Aggiungi proprietà specifiche dell'esplosione
        animation.type = type;
        animation.duration = explosion.duration;
        animation.elapsed = 0;
        animation.expandSpeed = explosion.expandSpeed;
        animation.damage = options.damage || 0;
        animation.owner = options.owner || null;
        animation.isExplosion = true;
        
        // Crea il sistema di particelle per l'esplosione
        if (effect.particles) {
            animation.particles = this.createParticleSystem({
                x: x,
                y: y,
                particleCount: effect.particles.particleCount,
                duration: effect.particles.duration,
                size: effect.particles.size,
                speed: effect.particles.speed,
                direction: { x: 0, y: 0 },
                spread: Math.PI * 2,
                gravity: 0,
                colors: effect.particles.colors,
                fadeOut: true,
                shrink: true,
                loop: false,
                blendMode: "source-over"
            });
        }
        
        return animation;
    }
    
    /**
     * Crea un'aura
     * @param {string} type - Tipo di effetto di abilità
     * @param {number} x - Coordinata X dell'aura
     * @param {number} y - Coordinata Y dell'aura
     * @param {Object} options - Opzioni aggiuntive per l'aura
     * @returns {Object} Aura creata
     */
    createAura(type, x, y, options = {}) {
        // Ottieni le impostazioni dell'effetto
        const effect = this.abilityEffects[type];
        const aura = effect.aura;
        
        // Crea l'animazione dell'aura
        const animation = this.createAnimation({
            x: x,
            y: y,
            image: aura.image,
            frameWidth: aura.size.width,
            frameHeight: aura.size.height,
            frames: 1,
            frameRate: 10,
            loop: true,
            autoDestroy: false,
            scale: 1.0,
            rotation: 0,
            alpha: 0.5,
            onComplete: () => {
                // Rimuovi il sistema di particelle
                if (animation.particles) {
                    animation.particles.active = false;
                }
            }
        });
        
        // Aggiungi proprietà specifiche dell'aura
        animation.type = type;
        animation.duration = aura.duration;
        animation.elapsed = 0;
        animation.pulseSpeed = aura.pulseSpeed;
        animation.pulseDirection = 1;
        animation.statBoost = options.statBoost || {};
        animation.owner = options.owner || null;
        animation.target = options.target || null;
        animation.isAura = true;
        
        // Crea il sistema di particelle per l'aura
        if (effect.particles) {
            animation.particles = this.createParticleSystem({
                x: x,
                y: y,
                particleCount: effect.particles.particleCount,
                duration: effect.particles.duration,
                size: effect.particles.size,
                speed: effect.particles.speed,
                direction: { x: 0, y: 0 },
                spread: Math.PI * 2,
                gravity: 0,
                colors: effect.particles.colors,
                fadeOut: true,
                shrink: true,
                loop: true,
                blendMode: "source-over"
            });
        }
        
        return animation;
    }
    
    /**
     * Avvia un effetto di transizione
     * @param {string} type - Tipo di transizione
     * @param {Object} options - Opzioni per la transizione
     * @returns {Object} Transizione avviata
     */
    startTransition(type, options = {}) {
        // Verifica se il tipo di transizione esiste
        if (!this.transitions[type]) return null;
        
        // Ottieni la transizione
        const transition = this.transitions[type];
        
        // Imposta le opzioni della transizione
        transition.duration = options.duration || transition.duration;
        transition.progress = 0.0;
        transition.active = true;
        transition.callback = options.callback || null;
        
        // Imposta opzioni specifiche per il tipo di transizione
        if (type === "fade") {
            transition.color = options.color || transition.color;
        } else if (type === "wipe") {
            transition.direction = options.direction || transition.direction;
        } else if (type === "dissolve") {
            transition.noiseScale = options.noiseScale || transition.noiseScale;
        } else if (type === "pixelate") {
            transition.maxPixelSize = options.maxPixelSize || transition.maxPixelSize;
        }
        
        return transition;
    }
    
    /**
     * Aggiorna un effetto di transizione
     * @param {string} type - Tipo di transizione
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    updateTransition(type, deltaTime) {
        // Verifica se il tipo di transizione esiste
        if (!this.transitions[type]) return;
        
        // Ottieni la transizione
        const transition = this.transitions[type];
        
        // Verifica se la transizione è attiva
        if (!transition.active) return;
        
        // Aggiorna il progresso della transizione
        transition.progress += deltaTime / transition.duration;
        
        // Verifica se la transizione è completata
        if (transition.progress >= 1.0) {
            transition.progress = 1.0;
            transition.active = false;
            
            // Esegui il callback di completamento
            if (transition.callback) {
                transition.callback();
            }
        }
    }
    
    /**
     * Disegna un effetto di transizione
     * @param {string} type - Tipo di transizione
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawTransition(type, ctx) {
        // Verifica se il tipo di transizione esiste
        if (!this.transitions[type]) return;
        
        // Ottieni la transizione
        const transition = this.transitions[type];
        
        // Verifica se la transizione è attiva
        if (!transition.active) return;
        
        // Disegna la transizione in base al tipo
        if (type === "fade") {
            this.drawFadeTransition(transition, ctx);
        } else if (type === "wipe") {
            this.drawWipeTransition(transition, ctx);
        } else if (type === "dissolve") {
            this.drawDissolveTransition(transition, ctx);
        } else if (type === "pixelate") {
            this.drawPixelateTransition(transition, ctx);
        }
    }
    
    /**
     * Disegna una transizione di tipo fade
     * @param {Object} transition - Transizione
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawFadeTransition(transition, ctx) {
        // Imposta l'opacità
        ctx.globalAlpha = transition.progress;
        
        // Disegna un rettangolo colorato
        ctx.fillStyle = `rgb(${transition.color.r}, ${transition.color.g}, ${transition.color.b})`;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Ripristina l'opacità
        ctx.globalAlpha = 1.0;
    }
    
    /**
     * Disegna una transizione di tipo wipe
     * @param {Object} transition - Transizione
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawWipeTransition(transition, ctx) {
        // Calcola la posizione del wipe
        let x = 0;
        let y = 0;
        let width = ctx.canvas.width;
        let height = ctx.canvas.height;
        
        if (transition.direction === "right") {
            width = ctx.canvas.width * transition.progress;
        } else if (transition.direction === "left") {
            x = ctx.canvas.width * (1.0 - transition.progress);
            width = ctx.canvas.width * transition.progress;
        } else if (transition.direction === "down") {
            height = ctx.canvas.height * transition.progress;
        } else if (transition.direction === "up") {
            y = ctx.canvas.height * (1.0 - transition.progress);
            height = ctx.canvas.height * transition.progress;
        }
        
        // Disegna un rettangolo nero
        ctx.fillStyle = "#000";
        ctx.fillRect(x, y, width, height);
    }
    
    /**
     * Disegna una transizione di tipo dissolve
     * @param {Object} transition - Transizione
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawDissolveTransition(transition, ctx) {
        // Crea un'immagine di rumore
        const imageData = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);
        const data = imageData.data;
        
        // Genera il rumore
        for (let y = 0; y < ctx.canvas.height; y++) {
            for (let x = 0; x < ctx.canvas.width; x++) {
                const index = (y * ctx.canvas.width + x) * 4;
                
                // Calcola il valore di rumore
                const noise = Math.random();
                
                // Verifica se il pixel deve essere disegnato
                if (noise < transition.progress) {
                    data[index] = 0;
                    data[index + 1] = 0;
                    data[index + 2] = 0;
                    data[index + 3] = 255;
                } else {
                    data[index + 3] = 0;
                }
            }
        }
        
        // Disegna l'immagine di rumore
        ctx.putImageData(imageData, 0, 0);
    }
    
    /**
     * Disegna una transizione di tipo pixelate
     * @param {Object} transition - Transizione
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawPixelateTransition(transition, ctx) {
        // Calcola la dimensione dei pixel
        const pixelSize = Math.max(1, Math.floor(transition.maxPixelSize * transition.progress));
        
        // Salva l'immagine originale
        const originalImage = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Crea un'immagine pixelata
        const imageData = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);
        const data = imageData.data;
        
        // Genera l'immagine pixelata
        for (let y = 0; y < ctx.canvas.height; y += pixelSize) {
            for (let x = 0; x < ctx.canvas.width; x += pixelSize) {
                // Calcola il colore medio del blocco
                let r = 0;
                let g = 0;
                let b = 0;
                let a = 0;
                let count = 0;
                
                for (let py = 0; py < pixelSize && y + py < ctx.canvas.height; py++) {
                    for (let px = 0; px < pixelSize && x + px < ctx.canvas.width; px++) {
                        const index = ((y + py) * ctx.canvas.width + (x + px)) * 4;
                        
                        r += originalImage.data[index];
                        g += originalImage.data[index + 1];
                        b += originalImage.data[index + 2];
                        a += originalImage.data[index + 3];
                        
                        count++;
                    }
                }
                
                r = Math.floor(r / count);
                g = Math.floor(g / count);
                b = Math.floor(b / count);
                a = Math.floor(a / count);
                
                // Imposta il colore del blocco
                for (let py = 0; py < pixelSize && y + py < ctx.canvas.height; py++) {
                    for (let px = 0; px < pixelSize && x + px < ctx.canvas.width; px++) {
                        const index = ((y + py) * ctx.canvas.width + (x + px)) * 4;
                        
                        data[index] = r;
                        data[index + 1] = g;
                        data[index + 2] = b;
                        data[index + 3] = a;
                    }
                }
            }
        }
        
        // Disegna l'immagine pixelata
        ctx.putImageData(imageData, 0, 0);
    }
    
    /**
     * Attiva un effetto ambientale
     * @param {string} type - Tipo di effetto ambientale
     * @param {Object} options - Opzioni per l'effetto
     * @returns {Object} Effetto ambientale attivato
     */
    enableEnvironmentalEffect(type, options = {}) {
        // Verifica se il tipo di effetto esiste
        if (!this.environmentalEffects[type]) return null;
        
        // Ottieni l'effetto
        const effect = this.environmentalEffects[type];
        
        // Imposta le opzioni dell'effetto
        effect.enabled = true;
        effect.intensity = options.intensity || effect.intensity;
        effect.direction = options.direction || effect.direction;
        effect.color = options.color || effect.color;
        effect.size = options.size || effect.size;
        effect.speed = options.speed || effect.speed;
        
        // Inizializza le particelle
        effect.particles = [];
        
        // Crea le particelle iniziali
        this.initializeEnvironmentalParticles(type);
        
        return effect;
    }
    
    /**
     * Disattiva un effetto ambientale
     * @param {string} type - Tipo di effetto ambientale
     */
    disableEnvironmentalEffect(type) {
        // Verifica se il tipo di effetto esiste
        if (!this.environmentalEffects[type]) return;
        
        // Ottieni l'effetto
        const effect = this.environmentalEffects[type];
        
        // Disattiva l'effetto
        effect.enabled = false;
        effect.particles = [];
    }
    
    /**
     * Inizializza le particelle di un effetto ambientale
     * @param {string} type - Tipo di effetto ambientale
     */
    initializeEnvironmentalParticles(type) {
        // Verifica se il tipo di effetto esiste
        if (!this.environmentalEffects[type]) return;
        
        // Ottieni l'effetto
        const effect = this.environmentalEffects[type];
        
        // Calcola il numero di particelle
        const particleCount = Math.floor(500 * effect.intensity);
        
        // Crea le particelle
        for (let i = 0; i < particleCount; i++) {
            effect.particles.push(this.createEnvironmentalParticle(type));
        }
    }
    
    /**
     * Crea una particella per un effetto ambientale
     * @param {string} type - Tipo di effetto ambientale
     * @returns {Object} Particella creata
     */
    createEnvironmentalParticle(type) {
        // Verifica se il tipo di effetto esiste
        if (!this.environmentalEffects[type]) return null;
        
        // Ottieni l'effetto
        const effect = this.environmentalEffects[type];
        
        // Crea la particella in base al tipo
        if (type === "rain") {
            return this.createRainParticle(effect);
        } else if (type === "snow") {
            return this.createSnowParticle(effect);
        } else if (type === "fog") {
            return this.createFogParticle(effect);
        } else if (type === "fireflies") {
            return this.createFireflyParticle(effect);
        }
        
        return null;
    }
    
    /**
     * Crea una particella di pioggia
     * @param {Object} effect - Effetto ambientale
     * @returns {Object} Particella creata
     */
    createRainParticle(effect) {
        // Calcola la posizione iniziale
        const x = Math.random() * (this.game.canvas.width + 200) - 100;
        const y = Math.random() * -100;
        
        // Calcola la dimensione
        const size = Math.random() * (effect.size.max - effect.size.min) + effect.size.min;
        
        // Calcola la velocità
        const speed = Math.random() * (effect.speed.max - effect.speed.min) + effect.speed.min;
        
        return {
            x: x,
            y: y,
            size: size,
            speed: speed,
            color: { ...effect.color },
            alpha: 0.7 + Math.random() * 0.3
        };
    }
    
    /**
     * Crea una particella di neve
     * @param {Object} effect - Effetto ambientale
     * @returns {Object} Particella creata
     */
    createSnowParticle(effect) {
        // Calcola la posizione iniziale
        const x = Math.random() * (this.game.canvas.width + 200) - 100;
        const y = Math.random() * -100;
        
        // Calcola la dimensione
        const size = Math.random() * (effect.size.max - effect.size.min) + effect.size.min;
        
        // Calcola la velocità
        const speed = Math.random() * (effect.speed.max - effect.speed.min) + effect.speed.min;
        
        // Calcola la velocità di oscillazione
        const oscillationSpeed = Math.random() * 2 + 1;
        const oscillationAmplitude = Math.random() * 10 + 5;
        
        return {
            x: x,
            y: y,
            size: size,
            speed: speed,
            oscillationSpeed: oscillationSpeed,
            oscillationAmplitude: oscillationAmplitude,
            oscillationOffset: Math.random() * Math.PI * 2,
            color: { ...effect.color },
            alpha: 0.7 + Math.random() * 0.3
        };
    }
    
    /**
     * Crea una particella di nebbia
     * @param {Object} effect - Effetto ambientale
     * @returns {Object} Particella creata
     */
    createFogParticle(effect) {
        // Calcola la posizione iniziale
        const x = Math.random() * (this.game.canvas.width + 400) - 200;
        const y = this.game.canvas.height - Math.random() * this.game.canvas.height * effect.height;
        
        // Calcola la dimensione
        const size = Math.random() * 100 + 50;
        
        // Calcola la velocità
        const speed = (Math.random() * 0.5 + 0.5) * effect.speed;
        
        return {
            x: x,
            y: y,
            size: size,
            speed: speed,
            color: { ...effect.color },
            alpha: Math.random() * 0.3 + 0.1
        };
    }
    
    /**
     * Crea una particella di lucciola
     * @param {Object} effect - Effetto ambientale
     * @returns {Object} Particella creata
     */
    createFireflyParticle(effect) {
        // Calcola la posizione iniziale
        const x = Math.random() * this.game.canvas.width;
        const y = Math.random() * this.game.canvas.height;
        
        // Calcola la dimensione
        const size = Math.random() * (effect.size.max - effect.size.min) + effect.size.min;
        
        // Calcola la velocità
        const speed = Math.random() * (effect.speed.max - effect.speed.min) + effect.speed.min;
        
        // Calcola la direzione
        const angle = Math.random() * Math.PI * 2;
        
        // Calcola la durata del lampeggiamento
        const blinkDuration = Math.random() * 2 + 1;
        
        return {
            x: x,
            y: y,
            size: size,
            speed: speed,
            direction: angle,
            directionChangeTime: Math.random() * 2 + 1,
            directionChangeElapsed: 0,
            blinkDuration: blinkDuration,
            blinkElapsed: Math.random() * blinkDuration,
            color: { ...effect.color },
            alpha: 0
        };
    }
    
    /**
     * Aggiorna un effetto ambientale
     * @param {string} type - Tipo di effetto ambientale
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    updateEnvironmentalEffect(type, deltaTime) {
        // Verifica se il tipo di effetto esiste
        if (!this.environmentalEffects[type]) return;
        
        // Ottieni l'effetto
        const effect = this.environmentalEffects[type];
        
        // Verifica se l'effetto è attivo
        if (!effect.enabled) return;
        
        // Aggiorna le particelle
        for (let i = effect.particles.length - 1; i >= 0; i--) {
            const particle = effect.particles[i];
            
            // Aggiorna la particella in base al tipo
            if (type === "rain") {
                this.updateRainParticle(particle, effect, deltaTime);
            } else if (type === "snow") {
                this.updateSnowParticle(particle, effect, deltaTime);
            } else if (type === "fog") {
                this.updateFogParticle(particle, effect, deltaTime);
            } else if (type === "fireflies") {
                this.updateFireflyParticle(particle, effect, deltaTime);
            }
            
            // Verifica se la particella è uscita dallo schermo
            if (particle.y > this.game.canvas.height + 10 || 
                particle.x < -100 || 
                particle.x > this.game.canvas.width + 100) {
                // Rimuovi la particella
                effect.particles.splice(i, 1);
                
                // Crea una nuova particella
                effect.particles.push(this.createEnvironmentalParticle(type));
            }
        }
    }
    
    /**
     * Aggiorna una particella di pioggia
     * @param {Object} particle - Particella
     * @param {Object} effect - Effetto ambientale
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    updateRainParticle(particle, effect, deltaTime) {
        // Aggiorna la posizione
        particle.x += effect.direction.x * particle.speed * deltaTime;
        particle.y += effect.direction.y * particle.speed * deltaTime;
    }
    
    /**
     * Aggiorna una particella di neve
     * @param {Object} particle - Particella
     * @param {Object} effect - Effetto ambientale
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    updateSnowParticle(particle, effect, deltaTime) {
        // Aggiorna la posizione
        particle.x += effect.direction.x * particle.speed * deltaTime;
        particle.y += effect.direction.y * particle.speed * deltaTime;
        
        // Aggiorna l'oscillazione
        particle.oscillationOffset += particle.oscillationSpeed * deltaTime;
        particle.x += Math.sin(particle.oscillationOffset) * particle.oscillationAmplitude * deltaTime;
    }
    
    /**
     * Aggiorna una particella di nebbia
     * @param {Object} particle - Particella
     * @param {Object} effect - Effetto ambientale
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    updateFogParticle(particle, effect, deltaTime) {
        // Aggiorna la posizione
        particle.x += particle.speed * deltaTime;
    }
    
    /**
     * Aggiorna una particella di lucciola
     * @param {Object} particle - Particella
     * @param {Object} effect - Effetto ambientale
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    updateFireflyParticle(particle, effect, deltaTime) {
        // Aggiorna la posizione
        particle.x += Math.cos(particle.direction) * particle.speed * deltaTime;
        particle.y += Math.sin(particle.direction) * particle.speed * deltaTime;
        
        // Aggiorna il cambio di direzione
        particle.directionChangeElapsed += deltaTime;
        
        if (particle.directionChangeElapsed >= particle.directionChangeTime) {
            // Resetta il tempo trascorso
            particle.directionChangeElapsed = 0;
            
            // Cambia la direzione
            particle.direction = Math.random() * Math.PI * 2;
            
            // Cambia il tempo di cambio direzione
            particle.directionChangeTime = Math.random() * 2 + 1;
        }
        
        // Aggiorna il lampeggiamento
        particle.blinkElapsed += deltaTime;
        
        if (particle.blinkElapsed >= particle.blinkDuration) {
            // Resetta il tempo trascorso
            particle.blinkElapsed = 0;
            
            // Cambia la durata del lampeggiamento
            particle.blinkDuration = Math.random() * 2 + 1;
        }
        
        // Calcola l'opacità
        const blinkProgress = particle.blinkElapsed / particle.blinkDuration;
        
        if (blinkProgress < 0.5) {
            // Aumenta l'opacità
            particle.alpha = blinkProgress * 2;
        } else {
            // Diminuisci l'opacità
            particle.alpha = (1.0 - blinkProgress) * 2;
        }
    }
    
    /**
     * Disegna un effetto ambientale
     * @param {string} type - Tipo di effetto ambientale
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawEnvironmentalEffect(type, ctx) {
        // Verifica se il tipo di effetto esiste
        if (!this.environmentalEffects[type]) return;
        
        // Ottieni l'effetto
        const effect = this.environmentalEffects[type];
        
        // Verifica se l'effetto è attivo
        if (!effect.enabled) return;
        
        // Salva il contesto
        ctx.save();
        
        // Disegna le particelle
        for (const particle of effect.particles) {
            // Disegna la particella in base al tipo
            if (type === "rain") {
                this.drawRainParticle(particle, effect, ctx);
            } else if (type === "snow") {
                this.drawSnowParticle(particle, effect, ctx);
            } else if (type === "fog") {
                this.drawFogParticle(particle, effect, ctx);
            } else if (type === "fireflies") {
                this.drawFireflyParticle(particle, effect, ctx);
            }
        }
        
        // Ripristina il contesto
        ctx.restore();
    }
    
    /**
     * Disegna una particella di pioggia
     * @param {Object} particle - Particella
     * @param {Object} effect - Effetto ambientale
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawRainParticle(particle, effect, ctx) {
        // Imposta l'opacità
        ctx.globalAlpha = particle.alpha;
        
        // Imposta il colore
        ctx.strokeStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.alpha})`;
        ctx.lineWidth = particle.size;
        
        // Disegna la goccia di pioggia
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(particle.x - effect.direction.x * 10, particle.y - effect.direction.y * 10);
        ctx.stroke();
    }
    
    /**
     * Disegna una particella di neve
     * @param {Object} particle - Particella
     * @param {Object} effect - Effetto ambientale
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawSnowParticle(particle, effect, ctx) {
        // Imposta l'opacità
        ctx.globalAlpha = particle.alpha;
        
        // Imposta il colore
        ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.alpha})`;
        
        // Disegna il fiocco di neve
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Disegna una particella di nebbia
     * @param {Object} particle - Particella
     * @param {Object} effect - Effetto ambientale
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawFogParticle(particle, effect, ctx) {
        // Imposta l'opacità
        ctx.globalAlpha = particle.alpha;
        
        // Imposta il colore
        ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.alpha})`;
        
        // Disegna la nebbia
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Disegna una particella di lucciola
     * @param {Object} particle - Particella
     * @param {Object} effect - Effetto ambientale
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    drawFireflyParticle(particle, effect, ctx) {
        // Imposta l'opacità
        ctx.globalAlpha = particle.alpha;
        
        // Imposta il colore
        ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.alpha})`;
        
        // Disegna la lucciola
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Disegna il bagliore
        const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 3
        );
        
        gradient.addColorStop(0, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Aggiorna il sistema di effetti visivi
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    update(deltaTime) {
        // Aggiorna i sistemi di particelle
        for (let i = this.particleSystems.length - 1; i >= 0; i--) {
            const system = this.particleSystems[i];
            
            // Aggiorna il sistema di particelle
            this.updateParticleSystem(system, deltaTime);
            
            // Verifica se il sistema è ancora attivo
            if (!system.active) {
                // Rimuovi il sistema
                this.particleSystems.splice(i, 1);
            }
        }
        
        // Aggiorna le animazioni
        for (let i = this.animations.length - 1; i >= 0; i--) {
            const animation = this.animations[i];
            
            // Aggiorna l'animazione
            this.updateAnimation(animation, deltaTime);
            
            // Verifica se l'animazione è ancora attiva
            if (!animation.active) {
                // Rimuovi l'animazione
                this.animations.splice(i, 1);
            } else {
                // Aggiorna le proprietà specifiche dell'animazione
                if (animation.isProjectile) {
                    this.updateProjectile(animation, deltaTime);
                } else if (animation.isWave) {
                    this.updateWave(animation, deltaTime);
                } else if (animation.isArea) {
                    this.updateArea(animation, deltaTime);
                } else if (animation.isShield) {
                    this.updateShield(animation, deltaTime);
                } else if (animation.isArmor) {
                    this.updateArmor(animation, deltaTime);
                } else if (animation.isExplosion) {
                    this.updateExplosion(animation, deltaTime);
                } else if (animation.isAura) {
                    this.updateAura(animation, deltaTime);
                }
            }
        }
        
        // Aggiorna le transizioni
        for (const type in this.transitions) {
            this.updateTransition(type, deltaTime);
        }
        
        // Aggiorna gli effetti ambientali
        for (const type in this.environmentalEffects) {
            this.updateEnvironmentalEffect(type, deltaTime);
        }
    }
    
    /**
     * Aggiorna un proiettile
     * @param {Object} projectile - Proiettile
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    updateProjectile(projectile, deltaTime) {
        // Aggiorna la posizione
        projectile.x += projectile.direction.x * projectile.speed * deltaTime;
        projectile.y += projectile.direction.y * projectile.speed * deltaTime;
        
        // Aggiorna la rotazione
        projectile.rotation += projectile.rotationSpeed * deltaTime;
        
        // Aggiorna la scia
        if (projectile.trail) {
            projectile.trail.x = projectile.x;
            projectile.trail.y = projectile.y;
        }
        
        // Verifica se il proiettile è uscito dallo schermo
        if (projectile.x < -50 || 
            projectile.x > this.game.canvas.width + 50 || 
            projectile.y < -50 || 
            projectile.y > this.game.canvas.height + 50) {
            // Disattiva il proiettile
            projectile.active = false;
            
            // Disattiva la scia
            if (projectile.trail) {
                projectile.trail.active = false;
            }
        }
        
        // Verifica le collisioni
        // Implementazione base, da espandere con la logica di collisione
    }
    
    /**
     * Aggiorna un'onda
     * @param {Object} wave - Onda
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    updateWave(wave, deltaTime) {
        // Aggiorna la posizione
        wave.x += wave.direction.x * wave.speed * deltaTime;
        wave.y += wave.direction.y * wave.speed * deltaTime;
        
        // Aggiorna la dimensione
        wave.currentSize.width += wave.expandSpeed * deltaTime;
        wave.currentSize.height += wave.expandSpeed * deltaTime;
        
        // Aggiorna il sistema di particelle
        if (wave.particles) {
            wave.particles.x = wave.x;
            wave.particles.y = wave.y;
        }
        
        // Aggiorna il tempo trascorso
        wave.elapsed = (wave.elapsed || 0) + deltaTime;
        
        // Verifica se l'onda è scaduta
        if (wave.elapsed >= wave.duration) {
            // Disattiva l'onda
            wave.active = false;
        }
        
        // Verifica le collisioni
        // Implementazione base, da espandere con la logica di collisione
    }
    
    /**
     * Aggiorna un'area
     * @param {Object} area - Area
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    updateArea(area, deltaTime) {
        // Aggiorna il sistema di particelle
        if (area.particles) {
            area.particles.x = area.x;
            area.particles.y = area.y;
        }
        
        // Aggiorna il tempo trascorso
        area.elapsed += deltaTime;
        
        // Aggiorna il tempo trascorso per il danno
        area.damageElapsed = (area.damageElapsed || 0) + deltaTime;
        
        // Verifica se è il momento di infliggere danno
        if (area.damageElapsed >= area.damageInterval) {
            // Resetta il tempo trascorso per il danno
            area.damageElapsed -= area.damageInterval;
            
            // Infliggi danno
            // Implementazione base, da espandere con la logica di danno
        }
        
        // Verifica se l'area è scaduta
        if (area.elapsed >= area.duration) {
            // Disattiva l'area
            area.active = false;
        }
    }
    
    /**
     * Aggiorna uno scudo
     * @param {Object} shield - Scudo
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    updateShield(shield, deltaTime) {
        // Aggiorna la posizione
        if (shield.target) {
            shield.x = shield.target.x;
            shield.y = shield.target.y;
        }
        
        // Aggiorna la rotazione
        shield.rotation += shield.rotationSpeed * deltaTime;
        
        // Aggiorna il sistema di particelle
        if (shield.particles) {
            shield.particles.x = shield.x;
            shield.particles.y = shield.y;
        }
        
        // Aggiorna il tempo trascorso
        shield.elapsed += deltaTime;
        
        // Verifica se lo scudo è scaduto
        if (shield.elapsed >= shield.duration) {
            // Disattiva lo scudo
            shield.active = false;
        }
    }
    
    /**
     * Aggiorna un'armatura
     * @param {Object} armor - Armatura
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    updateArmor(armor, deltaTime) {
        // Aggiorna la posizione
        if (armor.target) {
            armor.x = armor.target.x;
            armor.y = armor.target.y;
        }
        
        // Aggiorna il sistema di particelle
        if (armor.particles) {
            armor.particles.x = armor.x;
            armor.particles.y = armor.y;
        }
        
        // Aggiorna il tempo trascorso
        armor.elapsed += deltaTime;
        
        // Aggiorna l'effetto di pulsazione
        armor.alpha = 0.3 + Math.sin(armor.elapsed * armor.pulseSpeed * Math.PI * 2) * 0.3;
        
        // Verifica se l'armatura è scaduta
        if (armor.elapsed >= armor.duration) {
            // Disattiva l'armatura
            armor.active = false;
        }
    }
    
    /**
     * Aggiorna un'esplosione
     * @param {Object} explosion - Esplosione
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    updateExplosion(explosion, deltaTime) {
        // Aggiorna il sistema di particelle
        if (explosion.particles) {
            explosion.particles.x = explosion.x;
            explosion.particles.y = explosion.y;
        }
        
        // Aggiorna il tempo trascorso
        explosion.elapsed += deltaTime;
        
        // Aggiorna la scala
        explosion.scale = Math.min(1.0, explosion.elapsed / explosion.duration);
        
        // Verifica se l'esplosione è scaduta
        if (explosion.elapsed >= explosion.duration) {
            // Disattiva l'esplosione
            explosion.active = false;
        }
        
        // Verifica le collisioni
        // Implementazione base, da espandere con la logica di collisione
    }
    
    /**
     * Aggiorna un'aura
     * @param {Object} aura - Aura
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    updateAura(aura, deltaTime) {
        // Aggiorna la posizione
        if (aura.target) {
            aura.x = aura.target.x;
            aura.y = aura.target.y;
        }
        
        // Aggiorna il sistema di particelle
        if (aura.particles) {
            aura.particles.x = aura.x;
            aura.particles.y = aura.y;
        }
        
        // Aggiorna il tempo trascorso
        aura.elapsed += deltaTime;
        
        // Aggiorna l'effetto di pulsazione
        aura.alpha = 0.3 + Math.sin(aura.elapsed * aura.pulseSpeed * Math.PI * 2) * 0.2;
        
        // Verifica se l'aura è scaduta
        if (aura.elapsed >= aura.duration) {
            // Disattiva l'aura
            aura.active = false;
        }
    }
    
    /**
     * Disegna il sistema di effetti visivi
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     */
    draw(ctx) {
        // Disegna gli effetti ambientali (sfondo)
        for (const type in this.environmentalEffects) {
            if (type === "fog") {
                this.drawEnvironmentalEffect(type, ctx);
            }
        }
        
        // Disegna i sistemi di particelle
        for (const system of this.particleSystems) {
            this.drawParticleSystem(system, ctx);
        }
        
        // Disegna le animazioni
        for (const animation of this.animations) {
            this.drawAnimation(animation, ctx);
        }
        
        // Disegna gli effetti ambientali (primo piano)
        for (const type in this.environmentalEffects) {
            if (type !== "fog") {
                this.drawEnvironmentalEffect(type, ctx);
            }
        }
        
        // Disegna le transizioni
        for (const type in this.transitions) {
            this.drawTransition(type, ctx);
        }
    }
}
