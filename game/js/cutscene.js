/**
 * Mindworld - Sistema di Cutscene
 * 
 * Questo file gestisce le cutscene del gioco, sequenze cinematiche
 * che mostrano eventi importanti della storia.
 */

class CutsceneSystem {
    /**
     * Crea un nuovo sistema di cutscene
     * @param {Object} options - Opzioni per il sistema di cutscene
     * @param {UI} options.ui - Riferimento all'interfaccia utente
     * @param {World} options.world - Riferimento al mondo di gioco
     * @param {DialogueSystem} options.dialogueSystem - Riferimento al sistema di dialoghi
     */
    constructor(options = {}) {
        // Riferimenti
        this.ui = options.ui || null;
        this.world = options.world || null;
        this.dialogueSystem = options.dialogueSystem || null;
        
        // Stato della cutscene
        this.isActive = false;
        this.currentCutscene = null;
        this.currentStep = 0;
        this.timer = 0;
        
        // Callback
        this.onCutsceneEnd = null;
        
        // Cutscene predefinite
        this.cutscenes = {
            // Introduzione
            "intro": {
                name: "Introduzione",
                steps: [
                    { type: "fade", direction: "in", duration: 1.0 },
                    { type: "camera", x: 500, y: 500, duration: 2.0 },
                    { type: "dialogue", speaker: "Narratore", text: "Un anno fa, il villaggio di Aurora si staccò misteriosamente dalla terra, sollevandosi verso il cielo." },
                    { type: "dialogue", speaker: "Narratore", text: "Suo fratello Leo rimase intrappolato sulla terra, insieme ad altri abitanti del villaggio." },
                    { type: "dialogue", speaker: "Narratore", text: "Oggi, Aurora ha deciso di scendere per ritrovarlo e scoprire cosa è successo." },
                    { type: "camera", x: 800, y: 600, duration: 2.0 },
                    { type: "spawn", character: "Aurora", x: 800, y: 600 },
                    { type: "dialogue", speaker: "Aurora", text: "Devo trovare Leo. Non importa cosa ci aspetta laggiù." },
                    { type: "fade", direction: "out", duration: 1.0 }
                ]
            },
            
            // Incontro con Maestro Elian
            "meet_elian": {
                name: "Incontro con Maestro Elian",
                steps: [
                    { type: "camera", x: 500, y: 500, duration: 1.0 },
                    { type: "dialogue", speaker: "Maestro Elian", text: "Aurora, ti stavo aspettando." },
                    { type: "dialogue", speaker: "Aurora", text: "Maestro Elian, devo scendere a cercare mio fratello." },
                    { type: "dialogue", speaker: "Maestro Elian", text: "Lo so. Ti aiuterò nel tuo viaggio. Ma prima, devi imparare a controllare i poteri elementali." },
                    { type: "dialogue", speaker: "Maestro Elian", text: "I Fah e i Brih ti aiuteranno nella tua missione." },
                    { type: "spawn", character: "Fah", x: 450, y: 500 },
                    { type: "spawn", character: "Brih", x: 550, y: 500 },
                    { type: "dialogue", speaker: "Maestro Elian", text: "Usa i poteri Fah per attaccare e i poteri Brih per difenderti e controllare." },
                    { type: "dialogue", speaker: "Aurora", text: "Capisco. Sono pronta a partire." },
                    { type: "dialogue", speaker: "Maestro Elian", text: "Vai al portale a est del villaggio. Ti porterà direttamente in città." },
                    { type: "remove", character: "Fah" },
                    { type: "remove", character: "Brih" }
                ]
            },
            
            // Arrivo in città
            "arrive_city": {
                name: "Arrivo in Città",
                steps: [
                    { type: "fade", direction: "in", duration: 1.0 },
                    { type: "camera", x: 200, y: 200, duration: 2.0 },
                    { type: "dialogue", speaker: "Aurora", text: "Eccomi finalmente in città. È incredibile come sia cambiato tutto in un solo anno." },
                    { type: "camera", x: 300, y: 300, duration: 2.0 },
                    { type: "dialogue", speaker: "Aurora", text: "Ci sono creature che non ho mai visto prima... Fah e Brih, proprio come diceva il Maestro Elian." },
                    { type: "spawn", character: "Cittadino", x: 350, y: 300 },
                    { type: "dialogue", speaker: "Cittadino", text: "Ehi tu! Non sei di queste parti, vero?" },
                    { type: "dialogue", speaker: "Aurora", text: "No, vengo dal villaggio fluttuante. Sto cercando mio fratello Leo." },
                    { type: "dialogue", speaker: "Cittadino", text: "Il villaggio fluttuante? Ah, capisco. Dovresti parlare con Vex, il conduttore del quiz televisivo. Lui conosce tutti in città." },
                    { type: "dialogue", speaker: "Aurora", text: "Grazie per l'informazione." },
                    { type: "remove", character: "Cittadino" },
                    { type: "fade", direction: "out", duration: 1.0 }
                ]
            },
            
            // Incontro con Vex
            "meet_vex": {
                name: "Incontro con Vex",
                steps: [
                    { type: "camera", x: 800, y: 600, duration: 1.0 },
                    { type: "dialogue", speaker: "Vex", text: "Benvenuta al 'Tetto Semi Sconosciuto'! Sono Vex, il conduttore di questo quiz televisivo!" },
                    { type: "dialogue", speaker: "Aurora", text: "Salve, sto cercando mio fratello Leo. Mi hanno detto che potresti aiutarmi." },
                    { type: "dialogue", speaker: "Vex", text: "Leo? Mmm, potrei sapere qualcosa... Ma prima, ho bisogno di un favore." },
                    { type: "dialogue", speaker: "Aurora", text: "Che tipo di favore?" },
                    { type: "dialogue", speaker: "Vex", text: "Il mio co-conduttore Grim è insopportabile. Fallo licenziare e ti dirò dove si trova tuo fratello." },
                    { type: "dialogue", speaker: "Aurora", text: "E come dovrei farlo?" },
                    { type: "dialogue", speaker: "Vex", text: "Grim si trova nel camerino. Parla con lui e... beh, trova un modo." },
                    { type: "spawn", character: "Grim", x: 900, y: 650 },
                    { type: "dialogue", speaker: "Grim", text: "Ehi Vex! Chi è questa ragazza?" },
                    { type: "dialogue", speaker: "Vex", text: "Nessuno di importante. Torna al tuo camerino!" },
                    { type: "dialogue", speaker: "Grim", text: "Sempre così misterioso... Va bene, ci vediamo dopo." },
                    { type: "move", character: "Grim", x: 1000, y: 700, duration: 2.0 },
                    { type: "remove", character: "Grim" },
                    { type: "dialogue", speaker: "Vex", text: "Vedi cosa intendo? Insopportabile! Occupati di lui e ti aiuterò." }
                ]
            },
            
            // Duello con Grim
            "duel_grim": {
                name: "Duello con Grim",
                steps: [
                    { type: "camera", x: 900, y: 650, duration: 1.0 },
                    { type: "dialogue", speaker: "Grim", text: "Chi sei tu? Non dovresti essere qui!" },
                    { type: "dialogue", speaker: "Aurora", text: "Sono Aurora. Vex mi ha mandato a parlarti." },
                    { type: "dialogue", speaker: "Grim", text: "Vex? Cosa vuole quel viscido?" },
                    { type: "dialogue", speaker: "Aurora", text: "Vuole... ehm... farti licenziare." },
                    { type: "dialogue", speaker: "Grim", text: "Cosa?! Quel maledetto... Dovremo risolvere la questione con un duello!" },
                    { type: "dialogue", speaker: "Aurora", text: "Un duello?" },
                    { type: "dialogue", speaker: "Grim", text: "Sì! Se vinci tu, mi licenzierò. Se vinco io, dovrai dire a Vex che non mi farò intimidire!" },
                    { type: "dialogue", speaker: "Aurora", text: "Accetto la sfida!" },
                    { type: "dialogue", speaker: "Grim", text: "Preparati a perdere!" },
                    { type: "fade", direction: "out", duration: 0.5 }
                ]
            },
            
            // Vittoria su Grim
            "victory_grim": {
                name: "Vittoria su Grim",
                steps: [
                    { type: "fade", direction: "in", duration: 0.5 },
                    { type: "camera", x: 900, y: 650, duration: 1.0 },
                    { type: "dialogue", speaker: "Grim", text: "Non... non è possibile! Come hai fatto a sconfiggermi?" },
                    { type: "dialogue", speaker: "Aurora", text: "Ho imparato a controllare sia i poteri Fah che i poteri Brih." },
                    { type: "dialogue", speaker: "Grim", text: "Impressionante. Un accordo è un accordo. Mi licenzierò." },
                    { type: "dialogue", speaker: "Aurora", text: "Mi dispiace, Grim." },
                    { type: "dialogue", speaker: "Grim", text: "Non preoccuparti. Forse è meglio così. Vex è sempre stato difficile da sopportare. Buona fortuna nella tua ricerca." },
                    { type: "move", character: "Grim", x: 1000, y: 700, duration: 2.0 },
                    { type: "remove", character: "Grim" },
                    { type: "fade", direction: "out", duration: 0.5 }
                ]
            },
            
            // Ritorno da Vex
            "return_vex": {
                name: "Ritorno da Vex",
                steps: [
                    { type: "fade", direction: "in", duration: 0.5 },
                    { type: "camera", x: 800, y: 600, duration: 1.0 },
                    { type: "dialogue", speaker: "Vex", text: "Eccoti di ritorno! Come è andata con Grim?" },
                    { type: "dialogue", speaker: "Aurora", text: "Si licenzierà, come volevi tu." },
                    { type: "dialogue", speaker: "Vex", text: "Fantastico! Sei davvero efficiente. Come promesso, ti dirò dove si trova tuo fratello." },
                    { type: "dialogue", speaker: "Vex", text: "Leo è stato catturato dalla Dama Celeste. Lo tiene prigioniero nella sua torre al centro della città." },
                    { type: "dialogue", speaker: "Aurora", text: "La Dama Celeste? Perché tiene prigioniero mio fratello?" },
                    { type: "dialogue", speaker: "Vex", text: "La Dama Celeste è colei che ha fondato questa città. Ha fatto sollevare il vostro villaggio perché temeva che la vostra gente potesse distruggere l'equilibrio che ha creato qui." },
                    { type: "dialogue", speaker: "Vex", text: "Per entrare nella torre avrai bisogno della chiave d'acqua del Protettore Aquos. Lo troverai alla Torre dell'Acqua, a nord della città." },
                    { type: "dialogue", speaker: "Aurora", text: "Grazie per l'informazione, Vex." },
                    { type: "dialogue", speaker: "Vex", text: "Buona fortuna, Aurora. Ne avrai bisogno." },
                    { type: "fade", direction: "out", duration: 0.5 }
                ]
            },
            
            // Incontro con Aquos
            "meet_aquos": {
                name: "Incontro con Aquos",
                steps: [
                    { type: "fade", direction: "in", duration: 0.5 },
                    { type: "camera", x: 1200, y: 800, duration: 1.0 },
                    { type: "dialogue", speaker: "Protettore Aquos", text: "Chi osa entrare nella Torre dell'Acqua?" },
                    { type: "dialogue", speaker: "Aurora", text: "Sono Aurora. Vengo dal villaggio fluttuante e sto cercando mio fratello Leo." },
                    { type: "dialogue", speaker: "Protettore Aquos", text: "Ah, sei tu la sorella di Leo. La Dama Celeste mi aveva avvertito che saresti arrivata." },
                    { type: "dialogue", speaker: "Aurora", text: "Sai dove si trova mio fratello?" },
                    { type: "dialogue", speaker: "Protettore Aquos", text: "Sì, è prigioniero nella torre della Dama Celeste. Ma non puoi entrare senza la mia chiave d'acqua." },
                    { type: "dialogue", speaker: "Aurora", text: "Mi daresti la chiave?" },
                    { type: "dialogue", speaker: "Protettore Aquos", text: "Te la darò, ma prima dovrai dimostrare di saper controllare sia i poteri Fah che i poteri Brih. Affrontami in duello!" },
                    { type: "dialogue", speaker: "Aurora", text: "Accetto la sfida!" },
                    { type: "dialogue", speaker: "Protettore Aquos", text: "Preparati!" },
                    { type: "fade", direction: "out", duration: 0.5 }
                ]
            },
            
            // Vittoria su Aquos
            "victory_aquos": {
                name: "Vittoria su Aquos",
                steps: [
                    { type: "fade", direction: "in", duration: 0.5 },
                    { type: "camera", x: 1200, y: 800, duration: 1.0 },
                    { type: "dialogue", speaker: "Protettore Aquos", text: "Impressionante! Hai dimostrato di saper controllare perfettamente entrambi i poteri." },
                    { type: "dialogue", speaker: "Aurora", text: "Ora mi darai la chiave?" },
                    { type: "dialogue", speaker: "Protettore Aquos", text: "Sì, come promesso. Ecco la chiave d'acqua." },
                    { type: "effect", effect: "sparkle", x: 1200, y: 800, duration: 1.0 },
                    { type: "dialogue", speaker: "Protettore Aquos", text: "Con questa potrai entrare nella torre della Dama Celeste. Ma ti avverto, non sarà facile affrontarla." },
                    { type: "dialogue", speaker: "Aurora", text: "Sono pronta a tutto per salvare mio fratello." },
                    { type: "dialogue", speaker: "Protettore Aquos", text: "Buona fortuna, Aurora. Che le acque ti proteggano." },
                    { type: "fade", direction: "out", duration: 0.5 }
                ]
            },
            
            // Confronto con la Dama Celeste
            "confront_celestial_lady": {
                name: "Confronto con la Dama Celeste",
                steps: [
                    { type: "fade", direction: "in", duration: 0.5 },
                    { type: "camera", x: 1500, y: 1000, duration: 1.0 },
                    { type: "dialogue", speaker: "Dama Celeste", text: "Ti stavo aspettando, Aurora." },
                    { type: "dialogue", speaker: "Aurora", text: "Dov'è mio fratello? Liberalo subito!" },
                    { type: "dialogue", speaker: "Dama Celeste", text: "Tuo fratello è al sicuro. L'ho tenuto qui per proteggerlo, proprio come ho fatto sollevare il vostro villaggio per proteggere la vostra gente." },
                    { type: "dialogue", speaker: "Aurora", text: "Proteggerci? Da cosa?" },
                    { type: "dialogue", speaker: "Dama Celeste", text: "Da voi stessi. La vostra gente non capisce l'equilibrio tra i poteri Fah e Brih. Stavate per distruggere tutto." },
                    { type: "dialogue", speaker: "Aurora", text: "Non è vero! Noi non sapevamo nemmeno dell'esistenza di questi poteri!" },
                    { type: "dialogue", speaker: "Dama Celeste", text: "Esattamente. La vostra ignoranza vi rendeva pericolosi. Ma ora tu hai imparato a controllarli entrambi." },
                    { type: "dialogue", speaker: "Aurora", text: "Sì, e userò questi poteri per liberare mio fratello!" },
                    { type: "dialogue", speaker: "Dama Celeste", text: "Se vuoi tuo fratello, dovrai sconfiggermi. Dimostrami che sei degna di portare l'equilibrio nel tuo villaggio!" },
                    { type: "fade", direction: "out", duration: 0.5 }
                ]
            },
            
            // Vittoria sulla Dama Celeste
            "victory_celestial_lady": {
                name: "Vittoria sulla Dama Celeste",
                steps: [
                    { type: "fade", direction: "in", duration: 0.5 },
                    { type: "camera", x: 1500, y: 1000, duration: 1.0 },
                    { type: "dialogue", speaker: "Dama Celeste", text: "Incredibile... Hai davvero padroneggiato entrambi i poteri." },
                    { type: "dialogue", speaker: "Aurora", text: "Ora libera mio fratello!" },
                    { type: "dialogue", speaker: "Dama Celeste", text: "Come desideri. Ma prima, devi sapere la verità." },
                    { type: "dialogue", speaker: "Dama Celeste", text: "Io sono te, Aurora. O meglio, sono una versione futura di te." },
                    { type: "dialogue", speaker: "Aurora", text: "Cosa? Non è possibile!" },
                    { type: "dialogue", speaker: "Dama Celeste", text: "È la verità. Sono tornata indietro nel tempo per impedire la catastrofe che avrebbe distrutto il nostro mondo." },
                    { type: "dialogue", speaker: "Dama Celeste", text: "Ho creato questa città e ho fatto sollevare il villaggio per dare a tutti una seconda possibilità." },
                    { type: "dialogue", speaker: "Aurora", text: "Ma perché tenere prigioniero Leo?" },
                    { type: "dialogue", speaker: "Dama Celeste", text: "Per proteggerlo. E per assicurarmi che tu venissi qui e imparassi a controllare i poteri Fah e Brih." },
                    { type: "dialogue", speaker: "Dama Celeste", text: "Ora che hai dimostrato di essere pronta, puoi riportare l'equilibrio nel villaggio." },
                    { type: "spawn", character: "Leo", x: 1550, y: 1000 },
                    { type: "dialogue", speaker: "Leo", text: "Aurora! Finalmente sei qui!" },
                    { type: "dialogue", speaker: "Aurora", text: "Leo! Stai bene?" },
                    { type: "dialogue", speaker: "Leo", text: "Sì, la Dama Celeste mi ha trattato bene. Mi ha insegnato molte cose sui poteri Fah e Brih." },
                    { type: "dialogue", speaker: "Dama Celeste", text: "Ora dovete tornare al villaggio e insegnare agli altri come mantenere l'equilibrio." },
                    { type: "dialogue", speaker: "Aurora", text: "Lo faremo. Grazie per averci dato questa possibilità." },
                    { type: "fade", direction: "out", duration: 1.0 }
                ]
            },
            
            // Finale
            "ending": {
                name: "Finale",
                steps: [
                    { type: "fade", direction: "in", duration: 1.0 },
                    { type: "camera", x: 800, y: 600, duration: 2.0 },
                    { type: "dialogue", speaker: "Narratore", text: "Aurora e Leo tornarono al villaggio fluttuante, portando con sé la conoscenza dei poteri Fah e Brih." },
                    { type: "dialogue", speaker: "Narratore", text: "Grazie a loro, il villaggio imparò a mantenere l'equilibrio tra i due poteri, creando una società armoniosa." },
                    { type: "dialogue", speaker: "Narratore", text: "La città sottostante e il villaggio fluttuante iniziarono a collaborare, scambiando conoscenze e risorse." },
                    { type: "dialogue", speaker: "Narratore", text: "E Aurora, consapevole del suo destino futuro come Dama Celeste, si preparò a guidare entrambe le comunità verso un futuro di pace e prosperità." },
                    { type: "dialogue", speaker: "Narratore", text: "Fine." },
                    { type: "fade", direction: "out", duration: 2.0 }
                ]
            }
        };
    }
    
    /**
     * Avvia una cutscene
     * @param {string|Object} cutscene - ID della cutscene predefinita o oggetto cutscene personalizzato
     * @param {Function} onEnd - Callback da chiamare alla fine della cutscene
     */
    startCutscene(cutscene, onEnd = null) {
        // Se cutscene è una stringa, cerca tra le cutscene predefinite
        if (typeof cutscene === "string") {
            if (this.cutscenes[cutscene]) {
                this.currentCutscene = this.cutscenes[cutscene];
            } else {
                console.error(`Cutscene "${cutscene}" non trovata!`);
                return;
            }
        } else {
            // Altrimenti, usa l'oggetto cutscene fornito
            this.currentCutscene = cutscene;
        }
        
        // Imposta lo stato della cutscene
        this.isActive = true;
        this.currentStep = 0;
        this.timer = 0;
        this.onCutsceneEnd = onEnd;
        
        // Imposta lo stato del mondo
        if (this.world) {
            this.world.gameState = "cutscene";
        }
        
        // Esegui il primo passo della cutscene
        this.executeStep();
    }
    
    /**
     * Termina la cutscene corrente
     */
    endCutscene() {
        this.isActive = false;
        this.currentCutscene = null;
        this.currentStep = 0;
        this.timer = 0;
        
        // Ripristina lo stato del mondo
        if (this.world) {
            this.world.gameState = "playing";
        }
        
        // Chiama il callback di fine cutscene
        if (this.onCutsceneEnd) {
            this.onCutsceneEnd();
        }
    }
    
    /**
     * Esegue il passo corrente della cutscene
     */
    executeStep() {
        // Controlla se la cutscene è terminata
        if (!this.currentCutscene || this.currentStep >= this.currentCutscene.steps.length) {
            this.endCutscene();
            return;
        }
        
        // Ottieni il passo corrente
        const step = this.currentCutscene.steps[this.currentStep];
        
        // Esegui l'azione in base al tipo di passo
        switch (step.type) {
            case "dialogue":
                // Avvia un dialogo
                if (this.dialogueSystem) {
                    this.dialogueSystem.startDialogue({
                        speaker: step.speaker,
                        text: step.text,
                        choices: step.choices || []
                    }, () => {
                        // Passa al prossimo passo quando il dialogo termina
                        this.currentStep++;
                        this.executeStep();
                    });
                } else {
                    // Se non c'è un sistema di dialoghi, mostra il dialogo nell'UI
                    if (this.ui) {
                        this.ui.showDialogue(step.speaker, step.text, step.choices || []);
                        
                        // Passa al prossimo passo dopo un po'
                        setTimeout(() => {
                            this.ui.hideDialogue();
                            this.currentStep++;
                            this.executeStep();
                        }, 3000);
                    } else {
                        // Se non c'è un'UI, passa al prossimo passo
                        this.currentStep++;
                        this.executeStep();
                    }
                }
                break;
            
            case "wait":
                // Attendi un certo tempo
                setTimeout(() => {
                    this.currentStep++;
                    this.executeStep();
                }, step.duration * 1000);
                break;
            
            case "fade":
                // Effetto di dissolvenza
                if (this.ui) {
                    // Esegui la dissolvenza
                    this.ui.fade(step.direction, step.duration, () => {
                        // Passa al prossimo passo quando la dissolvenza termina
                        this.currentStep++;
                        this.executeStep();
                    });
                } else {
                    // Se non c'è un'UI, passa al prossimo passo
                    this.currentStep++;
                    this.executeStep();
                }
                break;
            
            case "camera":
                // Muovi la camera
                if (this.world) {
                    this.world.cameraTargetX = step.x;
                    this.world.cameraTargetY = step.y;
                    this.world.isCameraMoving = true;
                    
                    // Passa al prossimo passo dopo la durata specificata
                    setTimeout(() => {
                        this.world.isCameraMoving = false;
                        this.currentStep++;
                        this.executeStep();
                    }, step.duration * 1000);
                } else {
                    // Se non c'è un mondo, passa al prossimo passo
                    this.currentStep++;
                    this.executeStep();
                }
                break;
            
            case "spawn":
                // Genera un personaggio
                if (this.world) {
                    // Crea il personaggio
                    this.world.createCharacter(step.character, step.x, step.y);
                }
                
                // Passa al prossimo passo
                this.currentStep++;
                this.executeStep();
                break;
            
            case "remove":
                // Rimuovi un personaggio
                if (this.world) {
                    const character = this.getCharacterByName(step.character);
                    if (character) {
                        // Rimuovi il personaggio
                        this.world.removeCharacter(character);
                    }
                }
                
                // Passa al prossimo passo
                this.currentStep++;
                this.executeStep();
                break;
            
            case "move":
                // Muovi un personaggio
                if (this.world) {
                    const character = this.getCharacterByName(step.character);
                    if (character) {
                        // Imposta la destinazione
                        character.targetX = step.x;
                        character.targetY = step.y;
                        character.isMovingToTarget = true;
                        
                        // Passa al prossimo passo dopo la durata specificata
                        setTimeout(() => {
                            character.isMovingToTarget = false;
                            this.currentStep++;
                            this.executeStep();
                        }, step.duration * 1000);
                    } else {
                        // Se il personaggio non esiste, passa al prossimo passo
                        this.currentStep++;
                        this.executeStep();
                    }
                } else {
                    // Se non c'è un mondo, passa al prossimo passo
                    this.currentStep++;
                    this.executeStep();
                }
                break;
            
            case "effect":
                // Riproduci un effetto
                if (this.world) {
                    // Crea l'effetto
                    this.world.createEffect(step.effect, step.x, step.y);
                }
                
                // Passa al prossimo passo dopo la durata specificata
                setTimeout(() => {
                    this.currentStep++;
                    this.executeStep();
                }, step.duration * 1000);
                break;
            
            case "music":
                // Cambia la musica
                if (this.world) {
                    // Cambia la musica
                    this.world.changeMusic(step.music);
                }
                
                // Passa al prossimo passo
                this.currentStep++;
                this.executeStep();
                break;
            
            case "sound":
                // Riproduci un suono
                if (this.world) {
                    // Riproduci il suono
                    this.world.playSound(step.sound);
                }
                
                // Passa al prossimo passo
                this.currentStep++;
                this.executeStep();
                break;
            
            case "custom":
                // Azione personalizzata
                if (step.action) {
                    // Esegui l'azione personalizzata
                    step.action(() => {
                        // Passa al prossimo passo quando l'azione termina
                        this.currentStep++;
                        this.executeStep();
                    });
                } else {
                    // Se non c'è un'azione, passa al prossimo passo
                    this.currentStep++;
                    this.executeStep();
                }
                break;
            
            default:
                // Tipo di passo sconosciuto, passa al prossimo
                console.warn(`Tipo di passo cutscene sconosciuto: ${step.type}`);
                this.currentStep++;
                this.executeStep();
        }
    }
    
    /**
     * Ottiene un personaggio dal nome
     * @param {string} name - Nome del personaggio
     * @returns {Character|null} - Personaggio o null se non trovato
     */
    getCharacterByName(name) {
        if (!this.world) {
            return null;
        }
        
        // Controlla il giocatore
        if (this.world.player && this.world.player.name === name) {
            return this.world.player;
        }
        
        // Controlla gli NPC
        for (const npc of this.world.npcs) {
            if (npc.name === name) {
                return npc;
            }
        }
        
        // Controlla i nemici
        for (const enemy of this.world.enemies) {
            if (enemy.name === name) {
                return enemy;
            }
        }
        
        return null;
    }
    
    /**
     * Aggiorna il sistema di cutscene
     * @param {number} deltaTime - Tempo trascorso dall'ultimo aggiornamento in secondi
     */
    update(deltaTime) {
        // Aggiorna il timer
        if (this.isActive) {
            this.timer += deltaTime;
        }
    }
}

// Esporta la classe
window.CutsceneSystem = CutsceneSystem;
