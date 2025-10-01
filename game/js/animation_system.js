/**
 * Mindworld - Sistema di Animazioni
 * 
 * Questo file contiene il sistema di animazioni per transizioni fluide,
 * effetti anime-inspired e animazioni dell'interfaccia utente.
 */

class AnimationSystem {
    constructor() {
        this.animations = [];
        this.tweens = [];
        this.easingFunctions = {
            linear: t => t,
            easeInQuad: t => t * t,
            easeOutQuad: t => t * (2 - t),
            easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            easeInCubic: t => t * t * t,
            easeOutCubic: t => (--t) * t * t + 1,
            easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
            easeInQuart: t => t * t * t * t,
            easeOutQuart: t => 1 - (--t) * t * t * t,
            easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
            easeInBounce: t => 1 - this.easingFunctions.easeOutBounce(1 - t),
            easeOutBounce: t => {
                if (t < 1 / 2.75) {
                    return 7.5625 * t * t;
                } else if (t < 2 / 2.75) {
                    return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
                } else if (t < 2.5 / 2.75) {
                    return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
                } else {
                    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
                }
            },
            easeInOutBounce: t => t < 0.5 ? 
                this.easingFunctions.easeInBounce(t * 2) * 0.5 : 
                this.easingFunctions.easeOutBounce(t * 2 - 1) * 0.5 + 0.5,
            easeInElastic: t => {
                if (t === 0) return 0;
                if (t === 1) return 1;
                const p = 0.3;
                const s = p / 4;
                return -(Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
            },
            easeOutElastic: t => {
                if (t === 0) return 0;
                if (t === 1) return 1;
                const p = 0.3;
                const s = p / 4;
                return Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1;
            }
        };
    }
    
    /**
     * Crea una nuova animazione tween
     * @param {Object} target - Oggetto da animare
     * @param {Object} properties - Proprietà da animare con valori finali
     * @param {number} duration - Durata in secondi
     * @param {Object} options - Opzioni aggiuntive
     * @returns {Object} Oggetto tween
     */
    tween(target, properties, duration, options = {}) {
        const tween = {
            id: this.generateId(),
            target: target,
            startValues: {},
            endValues: properties,
            duration: duration,
            elapsed: 0,
            easing: options.easing || 'easeOutQuad',
            delay: options.delay || 0,
            onUpdate: options.onUpdate || null,
            onComplete: options.onComplete || null,
            onStart: options.onStart || null,
            started: false,
            completed: false,
            yoyo: options.yoyo || false,
            repeat: options.repeat || 0,
            currentRepeat: 0,
            reversed: false
        };
        
        // Salva i valori iniziali
        for (const prop in properties) {
            if (target.hasOwnProperty(prop)) {
                tween.startValues[prop] = target[prop];
            }
        }
        
        this.tweens.push(tween);
        return tween;
    }
    
    /**
     * Crea un'animazione di shake (scuotimento)
     * @param {Object} target - Oggetto da scuotere
     * @param {number} intensity - Intensità dello shake
     * @param {number} duration - Durata in secondi
     * @param {Object} options - Opzioni aggiuntive
     */
    shake(target, intensity = 10, duration = 0.5, options = {}) {
        const originalX = target.x;
        const originalY = target.y;
        const shakeCount = Math.floor(duration * 60); // 60 FPS
        let currentShake = 0;
        
        const shakeAnimation = {
            id: this.generateId(),
            update: (deltaTime) => {
                if (currentShake >= shakeCount) {
                    target.x = originalX;
                    target.y = originalY;
                    if (options.onComplete) options.onComplete();
                    return false; // Rimuovi l'animazione
                }
                
                const progress = currentShake / shakeCount;
                const currentIntensity = intensity * (1 - progress);
                
                target.x = originalX + (Math.random() - 0.5) * currentIntensity;
                target.y = originalY + (Math.random() - 0.5) * currentIntensity;
                
                currentShake++;
                return true; // Continua l'animazione
            }
        };
        
        this.animations.push(shakeAnimation);
        return shakeAnimation;
    }
    
    /**
     * Crea un'animazione di pulse (pulsazione)
     * @param {Object} target - Oggetto da far pulsare
     * @param {number} scale - Scala massima
     * @param {number} duration - Durata di un ciclo in secondi
     * @param {Object} options - Opzioni aggiuntive
     */
    pulse(target, scale = 1.2, duration = 1.0, options = {}) {
        const originalScale = target.scale || 1;
        let elapsed = 0;
        
        const pulseAnimation = {
            id: this.generateId(),
            update: (deltaTime) => {
                elapsed += deltaTime;
                
                if (options.duration && elapsed >= options.duration) {
                    target.scale = originalScale;
                    if (options.onComplete) options.onComplete();
                    return false;
                }
                
                const progress = (elapsed % duration) / duration;
                const pulseValue = Math.sin(progress * Math.PI * 2) * 0.5 + 0.5;
                target.scale = originalScale + (scale - originalScale) * pulseValue;
                
                return true;
            }
        };
        
        this.animations.push(pulseAnimation);
        return pulseAnimation;
    }
    
    /**
     * Crea un'animazione di float (galleggiamento)
     * @param {Object} target - Oggetto da far galleggiare
     * @param {number} amplitude - Ampiezza del movimento
     * @param {number} frequency - Frequenza del movimento
     * @param {Object} options - Opzioni aggiuntive
     */
    float(target, amplitude = 5, frequency = 2, options = {}) {
        const originalY = target.y;
        let elapsed = 0;
        
        const floatAnimation = {
            id: this.generateId(),
            update: (deltaTime) => {
                elapsed += deltaTime;
                
                if (options.duration && elapsed >= options.duration) {
                    target.y = originalY;
                    if (options.onComplete) options.onComplete();
                    return false;
                }
                
                target.y = originalY + Math.sin(elapsed * frequency) * amplitude;
                return true;
            }
        };
        
        this.animations.push(floatAnimation);
        return floatAnimation;
    }
    
    /**
     * Crea un'animazione di fade in
     * @param {Object} target - Oggetto da far apparire
     * @param {number} duration - Durata in secondi
     * @param {Object} options - Opzioni aggiuntive
     */
    fadeIn(target, duration = 1.0, options = {}) {
        target.alpha = 0;
        return this.tween(target, { alpha: 1 }, duration, options);
    }
    
    /**
     * Crea un'animazione di fade out
     * @param {Object} target - Oggetto da far scomparire
     * @param {number} duration - Durata in secondi
     * @param {Object} options - Opzioni aggiuntive
     */
    fadeOut(target, duration = 1.0, options = {}) {
        return this.tween(target, { alpha: 0 }, duration, options);
    }
    
    /**
     * Crea un'animazione di slide in
     * @param {Object} target - Oggetto da far scorrere
     * @param {string} direction - Direzione ('left', 'right', 'up', 'down')
     * @param {number} distance - Distanza di scorrimento
     * @param {number} duration - Durata in secondi
     * @param {Object} options - Opzioni aggiuntive
     */
    slideIn(target, direction = 'left', distance = 100, duration = 0.5, options = {}) {
        const originalX = target.x;
        const originalY = target.y;
        
        switch (direction) {
            case 'left':
                target.x = originalX - distance;
                return this.tween(target, { x: originalX }, duration, options);
            case 'right':
                target.x = originalX + distance;
                return this.tween(target, { x: originalX }, duration, options);
            case 'up':
                target.y = originalY - distance;
                return this.tween(target, { y: originalY }, duration, options);
            case 'down':
                target.y = originalY + distance;
                return this.tween(target, { y: originalY }, duration, options);
        }
    }
    
    /**
     * Crea un'animazione di scale in
     * @param {Object} target - Oggetto da far crescere
     * @param {number} duration - Durata in secondi
     * @param {Object} options - Opzioni aggiuntive
     */
    scaleIn(target, duration = 0.5, options = {}) {
        const originalScale = target.scale || 1;
        target.scale = 0;
        return this.tween(target, { scale: originalScale }, duration, {
            easing: 'easeOutBounce',
            ...options
        });
    }
    
    /**
     * Crea un'animazione di rotazione
     * @param {Object} target - Oggetto da ruotare
     * @param {number} angle - Angolo finale in radianti
     * @param {number} duration - Durata in secondi
     * @param {Object} options - Opzioni aggiuntive
     */
    rotate(target, angle, duration = 1.0, options = {}) {
        const startRotation = target.rotation || 0;
        return this.tween(target, { rotation: startRotation + angle }, duration, options);
    }
    
    /**
     * Ferma un'animazione specifica
     * @param {Object} animation - Animazione da fermare
     */
    stop(animation) {
        if (animation.id) {
            // Rimuovi dai tweens
            this.tweens = this.tweens.filter(t => t.id !== animation.id);
            // Rimuovi dalle animazioni
            this.animations = this.animations.filter(a => a.id !== animation.id);
        }
    }
    
    /**
     * Ferma tutte le animazioni di un target
     * @param {Object} target - Oggetto target
     */
    stopAll(target) {
        this.tweens = this.tweens.filter(t => t.target !== target);
        this.animations = this.animations.filter(a => a.target !== target);
    }
    
    /**
     * Aggiorna tutte le animazioni
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento
     */
    update(deltaTime) {
        // Aggiorna i tweens
        for (let i = this.tweens.length - 1; i >= 0; i--) {
            const tween = this.tweens[i];
            
            if (tween.delay > 0) {
                tween.delay -= deltaTime;
                continue;
            }
            
            if (!tween.started) {
                tween.started = true;
                if (tween.onStart) tween.onStart();
            }
            
            tween.elapsed += deltaTime;
            const progress = Math.min(tween.elapsed / tween.duration, 1);
            const easedProgress = this.easingFunctions[tween.easing](progress);
            
            // Applica i valori interpolati
            for (const prop in tween.endValues) {
                const startValue = tween.startValues[prop];
                const endValue = tween.endValues[prop];
                
                if (tween.reversed) {
                    tween.target[prop] = endValue + (startValue - endValue) * easedProgress;
                } else {
                    tween.target[prop] = startValue + (endValue - startValue) * easedProgress;
                }
            }
            
            if (tween.onUpdate) tween.onUpdate(tween.target, easedProgress);
            
            if (progress >= 1) {
                if (tween.yoyo && !tween.reversed) {
                    tween.reversed = true;
                    tween.elapsed = 0;
                } else if (tween.repeat > 0 && tween.currentRepeat < tween.repeat) {
                    tween.currentRepeat++;
                    tween.elapsed = 0;
                    tween.reversed = false;
                } else {
                    if (tween.onComplete) tween.onComplete();
                    this.tweens.splice(i, 1);
                }
            }
        }
        
        // Aggiorna le animazioni personalizzate
        for (let i = this.animations.length - 1; i >= 0; i--) {
            const animation = this.animations[i];
            const shouldContinue = animation.update(deltaTime);
            
            if (!shouldContinue) {
                this.animations.splice(i, 1);
            }
        }
    }
    
    /**
     * Genera un ID univoco
     * @returns {string} ID univoco
     */
    generateId() {
        return 'anim_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Pulisce tutte le animazioni
     */
    clear() {
        this.animations = [];
        this.tweens = [];
    }
    
    /**
     * Ottiene il numero di animazioni attive
     * @returns {number} Numero di animazioni
     */
    getAnimationCount() {
        return this.animations.length + this.tweens.length;
    }
}

// Esporta la classe
window.AnimationSystem = AnimationSystem;
