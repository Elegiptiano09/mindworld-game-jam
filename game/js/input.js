/**
 * Mindworld - Sistema di Input
 * 
 * Questo file gestisce l'input da tastiera e mouse/touch per il controllo del gioco.
 */

class InputManager {
    constructor() {
        // Stato dei tasti
        this.keys = {};
        
        // Stato del mouse
        this.mousePosition = { x: 0, y: 0 };
        this.mouseButtons = { left: false, middle: false, right: false };
        this.mouseClicked = false;
        
        // Stato del touch
        this.touchPosition = { x: 0, y: 0 };
        this.touching = false;
        
        // Mappatura dei tasti per le azioni
        this.keyMap = {
            // Movimento
            'KeyW': 'moveUp',
            'KeyS': 'moveDown',
            'KeyA': 'moveLeft',
            'KeyD': 'moveRight',
            'ArrowUp': 'moveUp',
            'ArrowDown': 'moveDown',
            'ArrowLeft': 'moveLeft',
            'ArrowRight': 'moveRight',
            
            // Azioni
            'Space': 'jump',
            'KeyE': 'interact',
            'KeyQ': 'switchWeapon',
            'Escape': 'pause',
            
            // Attacchi Fah (Rossi)
            'Digit1': 'fahAttack1',
            'Digit2': 'fahAttack2',
            'Digit3': 'fahAttack3',
            'Digit4': 'fahAttack4',
            
            // Attacchi Brih (Blu)
            'Digit5': 'brihAttack1',
            'Digit6': 'brihAttack2',
            'Digit7': 'brihAttack3',
            'Digit8': 'brihAttack4',
        };
        
        // Inizializza gli event listener
        this.initListeners();
    }
    
    /**
     * Inizializza gli event listener per tastiera e mouse/touch
     */
    initListeners() {
        // Tastiera
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // Mouse
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mouseup', (e) => this.onMouseUp(e));
        window.addEventListener('click', (e) => this.onClick(e));
        
        // Touch
        window.addEventListener('touchstart', (e) => this.onTouchStart(e));
        window.addEventListener('touchmove', (e) => this.onTouchMove(e));
        window.addEventListener('touchend', (e) => this.onTouchEnd(e));
        
        // Disabilita il menu contestuale
        window.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    /**
     * Gestisce l'evento keydown
     * @param {KeyboardEvent} e - Evento keydown
     */
    onKeyDown(e) {
        this.keys[e.code] = true;
    }
    
    /**
     * Gestisce l'evento keyup
     * @param {KeyboardEvent} e - Evento keyup
     */
    onKeyUp(e) {
        this.keys[e.code] = false;
    }
    
    /**
     * Gestisce l'evento mousemove
     * @param {MouseEvent} e - Evento mousemove
     */
    onMouseMove(e) {
        this.mousePosition.x = e.clientX;
        this.mousePosition.y = e.clientY;
    }
    
    /**
     * Gestisce l'evento mousedown
     * @param {MouseEvent} e - Evento mousedown
     */
    onMouseDown(e) {
        switch (e.button) {
            case 0: this.mouseButtons.left = true; break;
            case 1: this.mouseButtons.middle = true; break;
            case 2: this.mouseButtons.right = true; break;
        }
    }
    
    /**
     * Gestisce l'evento mouseup
     * @param {MouseEvent} e - Evento mouseup
     */
    onMouseUp(e) {
        switch (e.button) {
            case 0: this.mouseButtons.left = false; break;
            case 1: this.mouseButtons.middle = false; break;
            case 2: this.mouseButtons.right = false; break;
        }
    }
    
    /**
     * Gestisce l'evento click
     * @param {MouseEvent} e - Evento click
     */
    onClick(e) {
        this.mouseClicked = true;
        
        // Reset del flag dopo un breve ritardo
        setTimeout(() => {
            this.mouseClicked = false;
        }, 100);
    }
    
    /**
     * Gestisce l'evento touchstart
     * @param {TouchEvent} e - Evento touchstart
     */
    onTouchStart(e) {
        e.preventDefault();
        if (e.touches.length > 0) {
            this.touchPosition.x = e.touches[0].clientX;
            this.touchPosition.y = e.touches[0].clientY;
            this.touching = true;
        }
    }
    
    /**
     * Gestisce l'evento touchmove
     * @param {TouchEvent} e - Evento touchmove
     */
    onTouchMove(e) {
        e.preventDefault();
        if (e.touches.length > 0) {
            this.touchPosition.x = e.touches[0].clientX;
            this.touchPosition.y = e.touches[0].clientY;
        }
    }
    
    /**
     * Gestisce l'evento touchend
     * @param {TouchEvent} e - Evento touchend
     */
    onTouchEnd(e) {
        e.preventDefault();
        this.touching = false;
    }
    
    /**
     * Verifica se un tasto è premuto
     * @param {string} code - Codice del tasto
     * @returns {boolean} true se il tasto è premuto
     */
    isKeyPressed(code) {
        return this.keys[code] === true;
    }
    
    /**
     * Verifica se un'azione è attiva
     * @param {string} action - Nome dell'azione
     * @returns {boolean} true se l'azione è attiva
     */
    isActionActive(action) {
        for (const key in this.keyMap) {
            if (this.keyMap[key] === action && this.isKeyPressed(key)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Ottiene il vettore di movimento basato sull'input
     * @returns {Object} Vettore di movimento {x, y}
     */
    getMovementVector() {
        let x = 0;
        let y = 0;
        
        if (this.isActionActive('moveUp')) y -= 1;
        if (this.isActionActive('moveDown')) y += 1;
        if (this.isActionActive('moveLeft')) x -= 1;
        if (this.isActionActive('moveRight')) x += 1;
        
        // Normalizza il vettore se si muove in diagonale
        if (x !== 0 && y !== 0) {
            const length = Math.sqrt(x * x + y * y);
            x /= length;
            y /= length;
        }
        
        return { x, y };
    }
    
    /**
     * Verifica se il mouse è sopra un elemento
     * @param {Object} rect - Rettangolo {x, y, width, height}
     * @returns {boolean} true se il mouse è sopra l'elemento
     */
    isMouseOver(rect) {
        return Utils.pointInRect(this.mousePosition, rect);
    }
    
    /**
     * Verifica se il touch è sopra un elemento
     * @param {Object} rect - Rettangolo {x, y, width, height}
     * @returns {boolean} true se il touch è sopra l'elemento
     */
    isTouchOver(rect) {
        return this.touching && Utils.pointInRect(this.touchPosition, rect);
    }
    
    /**
     * Resetta lo stato dell'input
     */
    reset() {
        this.keys = {};
        this.mouseButtons = { left: false, middle: false, right: false };
        this.mouseClicked = false;
        this.touching = false;
    }
}

// Crea un'istanza globale del gestore dell'input
const Input = new InputManager();
