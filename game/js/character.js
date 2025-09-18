    /**
     * Disegna il personaggio sul canvas
     * @param {CanvasRenderingContext2D} ctx - Contesto del canvas
     * @param {number} offsetX - Offset X della camera
     * @param {number} offsetY - Offset Y della camera
     */
    draw(ctx, offsetX = 0, offsetY = 0) {
        // Posizione sullo schermo
        const screenX = this.x - offsetX;
        const screenY = this.y - offsetY;
        
        // Se non c'è uno sprite, disegna un rettangolo colorato
        if (!this.sprite) {
            ctx.fillStyle = this.getDefaultColor();
            ctx.fillRect(
                screenX - this.width / 2,
                screenY - this.height / 2,
                this.width,
                this.height
            );
            
            // Disegna il nome
            ctx.fillStyle = "#fff";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.fillText(this.name, screenX, screenY - this.height / 2 - 5);
            return;
        }
        
        try {
            // Disegna lo sprite
            // Per gli sprite che non sono sprite sheet, disegna l'intera immagine
            if (this.type === "player" || this.type === "npc") {
                // Calcola le dimensioni per mantenere le proporzioni
                const aspectRatio = this.sprite.width / this.sprite.height;
                let drawWidth = this.width;
                let drawHeight = this.height;
                
                if (aspectRatio > 1) {
                    // Immagine più larga che alta
                    drawHeight = this.width / aspectRatio;
                } else {
                    // Immagine più alta che larga
                    drawWidth = this.height * aspectRatio;
                }
                
                ctx.drawImage(
                    this.sprite,
                    screenX - drawWidth / 2,
                    screenY - drawHeight / 2,
                    drawWidth,
                    drawHeight
                );
            } else {
                // Per sprite sheet, usa l'animazione
                const frameX = this.animationFrame;
                const frameY = this.getDirectionFrame();
                
                ctx.drawImage(
                    this.sprite,
                    frameX * this.width, frameY * this.height, this.width, this.height,
                    screenX - this.width / 2, screenY - this.height / 2, this.width, this.height
                );
            }
        } catch (error) {
            // In caso di errore nel disegno dello sprite, usa il rettangolo colorato
            console.error(`Errore nel disegno dello sprite per ${this.name}:`, error);
            ctx.fillStyle = this.getDefaultColor();
            ctx.fillRect(
                screenX - this.width / 2,
                screenY - this.height / 2,
                this.width,
                this.height
            );
        }
        
        // Disegna il nome
        ctx.fillStyle = "#fff";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.name, screenX, screenY - this.height / 2 - 5);
        
        // Disegna la barra della salute se non è piena
        if (this.health < this.maxHealth) {
