    /**
     * Disegna gli attacchi
     */
    drawAttacks() {
        for (const attack of this.attacks) {
            // Posizione sullo schermo
            const screenX = attack.x - this.player.cameraOffsetX;
            const screenY = attack.y - this.player.cameraOffsetY;
            
            // Ottieni lo sprite dell'effetto in base al tipo
            let effectSprite;
            switch (attack.type) {
                case "fah":
                    effectSprite = Assets.getImage("effect_fire");
                    break;
                case "brih":
                    effectSprite = Assets.getImage("effect_water");
                    break;
                case "combined":
                    effectSprite = Assets.getImage("effect_combined");
                    break;
                default:
                    effectSprite = null;
            }
            
            // Se abbiamo uno sprite per l'effetto, disegnalo
            if (effectSprite) {
                try {
                    // Calcola le dimensioni dell'effetto in base al range dell'attacco
                    const effectSize = attack.range * 0.8;
                    
                    // Disegna lo sprite dell'effetto
                    this.ctx.drawImage(
                        effectSprite,
                        screenX - effectSize / 2,
                        screenY - effectSize / 2,
                        effectSize,
                        effectSize
                    );
                } catch (error) {
                    console.error(`Errore nel disegno dell'effetto:`, error);
                    // Fallback: disegna un cerchio colorato
                    this.drawFallbackAttack(attack, screenX, screenY);
                }
            } else {
                // Fallback: disegna un cerchio colorato
                this.drawFallbackAttack(attack, screenX, screenY);
            }
        }
    }
    
    /**
     * Disegna un attacco come fallback quando lo sprite non è disponibile
     * @param {Object} attack - Attacco da disegnare
     * @param {number} screenX - Coordinata X sullo schermo
     * @param {number} screenY - Coordinata Y sullo schermo
     */
    drawFallbackAttack(attack, screenX, screenY) {
        // Colore dell'attacco in base al tipo
        let color;
        switch (attack.type) {
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
        
        // Disegna l'attacco come un cerchio
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, attack.range / 3, 0, Math.PI * 2);
        this.ctx.fillStyle = color + "80"; // 50% di opacità
        this.ctx.fill();
        
        // Disegna il contorno
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
