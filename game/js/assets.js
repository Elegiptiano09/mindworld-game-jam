/**
 * Mindworld - Sistema di gestione degli asset
 * 
 * Questo file gestisce il caricamento e l'accesso a tutti gli asset del gioco
 * (immagini, audio, dati).
 */

class AssetManager {
    constructor() {
        // Collezioni di asset
        this.images = {};
        this.audio = {};
        this.data = {};
        
        // Stato di caricamento
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.isLoading = false;
        
        // Callback di completamento
        this.onComplete = null;
        this.onProgress = null;
    }
    
    /**
     * Inizia il caricamento di tutti gli asset
     * @param {Function} onComplete - Callback chiamata al completamento
     * @param {Function} onProgress - Callback chiamata durante il progresso
     */
    loadAll(onComplete, onProgress) {
        this.onComplete = onComplete;
        this.onProgress = onProgress;
        this.isLoading = true;
        
        // Carica le immagini
        this.loadImages();
        
        // Carica l'audio
        this.loadAudio();
        
        // Carica i dati
        this.loadData();
        
        // Se non ci sono asset da caricare, completa subito
        if (this.totalAssets === 0) {
            this.complete();
        }
    }
    
    /**
     * Carica tutte le immagini
     */
    loadImages() {
        const imagesToLoad = {
            // Personaggi principali
            'aurora': 'assets/images/aurora.png',
            'leo': 'assets/images/leo.png',
            'maestro_elian': 'assets/images/maestro_elian.png',
            'vex': 'assets/images/vex.png',
            'grim': 'assets/images/grim.png',
            'dama_celeste': 'assets/images/dama_celeste.png',
            'nyx': 'assets/images/nyx.png',
            'protettore_aquos': 'assets/images/protettore_aquos.png',
            'ember_fah': 'assets/images/ember_fah.png',
            'frost_brih': 'assets/images/frost_brih.png',
            
            // Personaggi legacy (per compatibilità)
            'player': 'assets/images/aurora.png',
            'npc_elian': 'assets/images/maestro_elian.png',
            'npc_vex': 'assets/images/vex.png',
            'npc_grim': 'assets/images/grim.png',
            'npc_nyx': 'assets/images/nyx.png',
            'npc_aquos': 'assets/images/protettore_aquos.png',
            'npc_ember': 'assets/images/ember_fah.png',
            'npc_frost': 'assets/images/frost_brih.png',
            'npc_celeste': 'assets/images/dama_celeste.png',
            
            // Creature
            'fah_creature': 'assets/images/characters/fah_creature.jpg',
            'brih_creature': 'assets/images/characters/brih_creature.gif',
            
            // Ambienti
            'bg_village': 'assets/images/bg_floating_village.png',
            'bg_city': 'assets/images/bg_colorful_city.png',
            'bg_tower': 'assets/images/bg_floating_village.png',
            
            // Tiles
            'tiles_village': 'assets/images/tiles/tiles_village.gif',
            'tiles_city': 'assets/images/tiles/tiles_city.webp',
            
            // Effetti
            'effect_fire': 'assets/images/effects/fire_effect.png',
            'effect_water': 'assets/images/effects/ice_effect.png',
            'effect_combined': 'assets/images/effects/combined_effect.png',
            
            // UI
            'ui_dialog': 'assets/images/ui/ui_dialog.webp',
            'ui_icons': 'assets/images/ui/ui_icons.jpg',
            'ui_health': 'assets/images/ui/ui_health.gif',
            'ui_logo': 'assets/images/ui/ui_logo.jpg'
        };
        
        // Conta il numero di immagini da caricare
        this.totalAssets += Object.keys(imagesToLoad).length;
        
        // Carica ogni immagine
        for (const key in imagesToLoad) {
            this.loadImage(key, imagesToLoad[key]);
        }
    }
    
    /**
     * Carica una singola immagine
     * @param {string} key - Chiave per accedere all'immagine
     * @param {string} src - Percorso dell'immagine
     */
    loadImage(key, src) {
        const img = new Image();
        
        img.onload = () => {
            this.images[key] = img;
            this.assetLoaded();
        };
        
        img.onerror = () => {
            console.error(`Errore nel caricamento dell'immagine: ${src}`);
            this.assetLoaded();
        };
        
        // Avvia il caricamento
        img.src = src;
    }
    
    /**
     * Carica tutti i file audio
     */
    loadAudio() {
        const audioToLoad = {
            // Musica
            'music_title': 'assets/audio/music_title.mp3',
            'music_village': 'assets/audio/music_village.mp3',
            'music_city': 'assets/audio/music_city.mp3',
            'music_battle': 'assets/audio/music_battle.mp3',
            'music_boss': 'assets/audio/music_boss.mp3',
            
            // Effetti sonori
            'sfx_jump': 'assets/audio/sfx_jump.mp3',
            'sfx_fire_dart': 'assets/audio/sfx_fire_dart.mp3',
            'sfx_flame_wave': 'assets/audio/sfx_flame_wave.mp3',
            'sfx_meteor': 'assets/audio/sfx_meteor.mp3',
            'sfx_fire_shield': 'assets/audio/sfx_fire_shield.mp3',
            'sfx_ice_shard': 'assets/audio/sfx_ice_shard.mp3',
            'sfx_frost_nova': 'assets/audio/sfx_frost_nova.mp3',
            'sfx_blizzard': 'assets/audio/sfx_blizzard.mp3',
            'sfx_ice_armor': 'assets/audio/sfx_ice_armor.mp3',
            'sfx_elemental_blast': 'assets/audio/sfx_elemental_blast.mp3',
            'sfx_elemental_harmony': 'assets/audio/sfx_elemental_harmony.mp3',
            'sfx_hit': 'assets/audio/sfx_hit.mp3',
            'sfx_dialog': 'assets/audio/sfx_dialog.mp3',
            'sfx_menu': 'assets/audio/sfx_menu.mp3',
            'sfx_pickup': 'assets/audio/sfx_pickup.mp3',
            'sfx_level_up': 'assets/audio/sfx_level_up.mp3',
            
            // Suoni ambientali
            'ambient_wind_gentle': 'assets/audio/ambient_wind_gentle.mp3',
            'ambient_wind_mystical': 'assets/audio/ambient_wind_mystical.mp3',
            'ambient_city_bustling': 'assets/audio/ambient_city_bustling.mp3',
            'ambient_tv_studio': 'assets/audio/ambient_tv_studio.mp3',
            'ambient_water_flowing': 'assets/audio/ambient_water_flowing.mp3',
            'ambient_mystical_chamber': 'assets/audio/ambient_mystical_chamber.mp3',
            'ambient_peaceful_ending': 'assets/audio/ambient_peaceful_ending.mp3'
        };
        
        // Conta il numero di file audio da caricare
        this.totalAssets += Object.keys(audioToLoad).length;
        
        // Carica ogni file audio
        for (const key in audioToLoad) {
            this.loadAudioFile(key, audioToLoad[key]);
        }
    }
    
    /**
     * Carica un singolo file audio
     * @param {string} key - Chiave per accedere al file audio
     * @param {string} src - Percorso del file audio
     */
    loadAudioFile(key, src) {
        const audio = new Audio();
        
        audio.oncanplaythrough = () => {
            this.audio[key] = audio;
            this.assetLoaded();
        };
        
        audio.onerror = () => {
            console.error(`Errore nel caricamento dell'audio: ${src}`);
            this.assetLoaded();
        };
        
        // Avvia il caricamento
        audio.src = src;
        audio.load();
    }
    
    /**
     * Carica tutti i file di dati
     */
    loadData() {
        const dataToLoad = {
            'levels': 'assets/data/levels.json',
            'dialogs': 'assets/data/dialogs.json',
            'attacks': 'assets/data/attacks.json',
            'characters': 'assets/data/characters.json'
        };
        
        // Conta il numero di file di dati da caricare
        this.totalAssets += Object.keys(dataToLoad).length;
        
        // Carica ogni file di dati
        for (const key in dataToLoad) {
            this.loadDataFile(key, dataToLoad[key]);
        }
    }
    
    /**
     * Carica un singolo file di dati
     * @param {string} key - Chiave per accedere ai dati
     * @param {string} src - Percorso del file di dati
     */
    loadDataFile(key, src) {
        fetch(src)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Errore HTTP: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                this.data[key] = data;
                this.assetLoaded();
            })
            .catch(error => {
                console.error(`Errore nel caricamento dei dati: ${src}`, error);
                this.assetLoaded();
            });
    }
    
    /**
     * Chiamato quando un asset è stato caricato
     */
    assetLoaded() {
        this.loadedAssets++;
        
        // Calcola la percentuale di completamento
        const progress = this.totalAssets > 0 ? this.loadedAssets / this.totalAssets : 1;
        
        // Chiama il callback di progresso
        if (this.onProgress) {
            this.onProgress(progress);
        }
        
        // Verifica se tutti gli asset sono stati caricati
        if (this.loadedAssets >= this.totalAssets) {
            this.complete();
        }
    }
    
    /**
     * Chiamato quando tutti gli asset sono stati caricati
     */
    complete() {
        this.isLoading = false;
        
        // Chiama il callback di completamento
        if (this.onComplete) {
            this.onComplete();
        }
    }
    
    /**
     * Ottiene un'immagine
     * @param {string} key - Chiave dell'immagine
     * @returns {HTMLImageElement} Immagine
     */
    getImage(key) {
        return this.images[key];
    }
    
    /**
     * Ottiene un file audio
     * @param {string} key - Chiave del file audio
     * @returns {HTMLAudioElement} File audio
     */
    getAudio(key) {
        return this.audio[key];
    }
    
    /**
     * Ottiene dati
     * @param {string} key - Chiave dei dati
     * @returns {Object} Dati
     */
    getData(key) {
        return this.data[key];
    }
    
    /**
     * Riproduce un file audio
     * @param {string} key - Chiave del file audio
     * @param {boolean} loop - Se il file audio deve essere riprodotto in loop
     * @param {number} volume - Volume (0-1)
     * @returns {HTMLAudioElement} File audio
     */
    playAudio(key, loop = false, volume = 1.0) {
        const audio = this.getAudio(key);
        
        if (audio) {
            audio.loop = loop;
            audio.volume = volume;
            audio.currentTime = 0;
            audio.play().catch(error => {
                console.error(`Errore nella riproduzione dell'audio: ${key}`, error);
            });
            return audio;
        }
        
        return null;
    }
    
    /**
     * Interrompe la riproduzione di un file audio
     * @param {string} key - Chiave del file audio
     */
    stopAudio(key) {
        const audio = this.getAudio(key);
        
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }
}

// Crea un'istanza globale del gestore degli asset
const Assets = new AssetManager();
