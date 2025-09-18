/**
 * Mindworld - File di inizializzazione
 * 
 * Questo file inizializza il gioco quando la pagina è completamente caricata.
 */

// Attendi che il DOM sia completamente caricato
document.addEventListener("DOMContentLoaded", () => {
    // Crea un'istanza del gioco
    const game = new Game();
    
    // Inizializza il gioco
    game.init();
    
    // Esponi il gioco globalmente per il debug
    window.mindworldGame = game;
    
    console.log("Mindworld: Un'Avventura tra Due Mondi - Inizializzato");
});
