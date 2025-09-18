/**
 * Mindworld - Funzioni di utilità
 * 
 * Questo file contiene funzioni di utilità generiche utilizzate in tutto il gioco.
 */

const Utils = {
    /**
     * Genera un ID univoco
     * @returns {string} ID univoco
     */
    generateId: function() {
        return '_' + Math.random().toString(36).substr(2, 9);
    },
    
    /**
     * Calcola la distanza tra due punti
     * @param {Object} point1 - Primo punto {x, y}
     * @param {Object} point2 - Secondo punto {x, y}
     * @returns {number} Distanza tra i due punti
     */
    distance: function(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    /**
     * Limita un valore tra un minimo e un massimo
     * @param {number} value - Valore da limitare
     * @param {number} min - Valore minimo
     * @param {number} max - Valore massimo
     * @returns {number} Valore limitato
     */
    clamp: function(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    
    /**
     * Interpola linearmente tra due valori
     * @param {number} a - Valore iniziale
     * @param {number} b - Valore finale
     * @param {number} t - Fattore di interpolazione (0-1)
     * @returns {number} Valore interpolato
     */
    lerp: function(a, b, t) {
        return a + (b - a) * t;
    },
    
    /**
     * Converte gradi in radianti
     * @param {number} degrees - Angolo in gradi
     * @returns {number} Angolo in radianti
     */
    toRadians: function(degrees) {
        return degrees * Math.PI / 180;
    },
    
    /**
     * Converte radianti in gradi
     * @param {number} radians - Angolo in radianti
     * @returns {number} Angolo in gradi
     */
    toDegrees: function(radians) {
        return radians * 180 / Math.PI;
    },
    
    /**
     * Calcola l'angolo tra due punti
     * @param {Object} point1 - Primo punto {x, y}
     * @param {Object} point2 - Secondo punto {x, y}
     * @returns {number} Angolo in radianti
     */
    angle: function(point1, point2) {
        return Math.atan2(point2.y - point1.y, point2.x - point1.x);
    },
    
    /**
     * Verifica se un punto è all'interno di un rettangolo
     * @param {Object} point - Punto {x, y}
     * @param {Object} rect - Rettangolo {x, y, width, height}
     * @returns {boolean} true se il punto è all'interno del rettangolo
     */
    pointInRect: function(point, rect) {
        return point.x >= rect.x && 
               point.x <= rect.x + rect.width &&
               point.y >= rect.y && 
               point.y <= rect.y + rect.height;
    },
    
    /**
     * Verifica se due rettangoli si sovrappongono
     * @param {Object} rect1 - Primo rettangolo {x, y, width, height}
     * @param {Object} rect2 - Secondo rettangolo {x, y, width, height}
     * @returns {boolean} true se i rettangoli si sovrappongono
     */
    rectIntersect: function(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },
    
    /**
     * Verifica se un cerchio e un rettangolo si sovrappongono
     * @param {Object} circle - Cerchio {x, y, radius}
     * @param {Object} rect - Rettangolo {x, y, width, height}
     * @returns {boolean} true se il cerchio e il rettangolo si sovrappongono
     */
    circleRectIntersect: function(circle, rect) {
        // Trova il punto più vicino al cerchio all'interno del rettangolo
        const closestX = Utils.clamp(circle.x, rect.x, rect.x + rect.width);
        const closestY = Utils.clamp(circle.y, rect.y, rect.y + rect.height);
        
        // Calcola la distanza tra il cerchio e questo punto
        const distance = Utils.distance(
            {x: circle.x, y: circle.y},
            {x: closestX, y: closestY}
        );
        
        return distance <= circle.radius;
    },
    
    /**
     * Verifica se due cerchi si sovrappongono
     * @param {Object} circle1 - Primo cerchio {x, y, radius}
     * @param {Object} circle2 - Secondo cerchio {x, y, radius}
     * @returns {boolean} true se i cerchi si sovrappongono
     */
    circleIntersect: function(circle1, circle2) {
        const distance = Utils.distance(
            {x: circle1.x, y: circle1.y},
            {x: circle2.x, y: circle2.y}
        );
        return distance <= circle1.radius + circle2.radius;
    },
    
    /**
     * Genera un colore casuale in formato esadecimale
     * @returns {string} Colore in formato esadecimale
     */
    randomColor: function() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    },
    
    /**
     * Genera un numero intero casuale tra min e max (inclusi)
     * @param {number} min - Valore minimo
     * @param {number} max - Valore massimo
     * @returns {number} Numero casuale
     */
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Genera un numero decimale casuale tra min e max
     * @param {number} min - Valore minimo
     * @param {number} max - Valore massimo
     * @returns {number} Numero casuale
     */
    randomFloat: function(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    /**
     * Sceglie un elemento casuale da un array
     * @param {Array} array - Array di elementi
     * @returns {*} Elemento casuale
     */
    randomElement: function(array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    
    /**
     * Mescola un array (algoritmo Fisher-Yates)
     * @param {Array} array - Array da mescolare
     * @returns {Array} Array mescolato
     */
    shuffleArray: function(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    },
    
    /**
     * Ritarda l'esecuzione di una funzione
     * @param {Function} callback - Funzione da eseguire
     * @param {number} delay - Ritardo in millisecondi
     * @returns {number} ID del timeout
     */
    delay: function(callback, delay) {
        return setTimeout(callback, delay);
    },
    
    /**
     * Esegue una funzione a intervalli regolari
     * @param {Function} callback - Funzione da eseguire
     * @param {number} interval - Intervallo in millisecondi
     * @returns {number} ID dell'intervallo
     */
    interval: function(callback, interval) {
        return setInterval(callback, interval);
    },
    
    /**
     * Cancella un timeout
     * @param {number} timeoutId - ID del timeout
     */
    clearDelay: function(timeoutId) {
        clearTimeout(timeoutId);
    },
    
    /**
     * Cancella un intervallo
     * @param {number} intervalId - ID dell'intervallo
     */
    clearInterval: function(intervalId) {
        clearInterval(intervalId);
    }
};
