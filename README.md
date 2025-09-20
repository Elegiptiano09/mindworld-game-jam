# Mindworld: Un'Avventura tra Due Mondi

## Descrizione del Progetto

**Mindworld** è un gioco di avventura fantasy sviluppato per una Game Jam. Il gioco segue la storia di **Aurora** (precedentemente Lily/Marilyn), una giovane ragazza che cerca di salvare suo fratello **Leo** (precedentemente Tommy) dopo che il loro villaggio si è staccato dalla terra, sollevandosi verso il cielo.

## La Storia

Un anno dopo la misteriosa separazione del villaggio, Aurora decide di scendere sulla terra per ritrovare suo fratello. Al suo arrivo, scopre che tutto è cambiato: la vegetazione è diventata incredibilmente colorata e una grande città è sorta dove prima non c'era nulla.

La città è abitata non solo da umani, ma anche da due tipi di creature magiche:
- I **Fah**: creature di colore rosso, energiche e passionali
- I **Brih**: creature di colore blu, calme e sagge

Durante la sua avventura, Aurora dovrà scoprire:
1. Chi ha causato la salita del villaggio verso l'alto
2. Chi ha costruito la nuova città colorata
3. Dove sono le persone rimaste a terra, incluso suo fratello Leo

## Personaggi Principali

- **Aurora** - La protagonista, una ragazza di 20 anni determinata a ritrovare il fratello
- **Leo** - Il fratello di Aurora, rimasto intrappolato sulla terra
- **Maestro Elian** - Un saggio anziano che guida Aurora all'inizio del suo viaggio
- **Vex** - Un conduttore televisivo e giornalista che conosce tutti i segreti della città (precedentemente Ben)
- **Grim** - Il co-conduttore del quiz televisivo "Il Tetto Semi Sconosciuto" (precedentemente Suino)
- **Dama Celeste** - La misteriosa antagonista vestita di blu che ha fondato la città (precedentemente Signora Creatrice)
- **Nyx** - Una mercante che vende armi magiche ad Aurora
- **Protettore Aquos** - Il guardiano delle acque che garantisce l'esistenza di acqua potabile nella città
- **Gemelli Ember e Frost** - Due fratelli, uno Fah e uno Brih, che aiutano Aurora nella sua missione

## Caratteristiche del Gioco

### Sistema di Livelli
- **6 livelli unici**: Villaggio Fluttuante, Sentiero di Discesa, Città Colorata, Studio Televisivo, Torre dell'Acqua, Camera della Dama Celeste
- **Sistema di transizione** tra livelli con punti di connessione
- **Punti di salvataggio** strategicamente posizionati
- **Ambienti diversificati** con tileset e sfondi unici

### Sistema di Combattimento
- **Attacchi elementali**:
  - **Fah (Fuoco)**: Palla di Fuoco, Onda di Fiamme, Meteora, Scudo di Fuoco
  - **Brih (Ghiaccio)**: Spuntone di Ghiaccio, Nova di Gelo, Tormenta, Armatura di Ghiaccio
  - **Combinati**: Esplosione Elementale, Armonia Elementale
- **Effetti di stato**: Bruciatura, Congelamento, Armatura, Rigenerazione
- **Sistema di particelle** per effetti visivi
- **Calcolo del danno** con resistenze e debolezze elementali

### Modalità Multiplayer
- **Cooperativa**: Gioca con amici per esplorare il mondo e combattere nemici
- **PvP opzionale**: Sfida altri giocatori in combattimenti elementali
- **Chat in-game**: Comunica con altri giocatori
- **Sincronizzazione** di posizioni, attacchi e stato del gioco

### Grafica e Audio
- **Sprite dettagliati** per personaggi, nemici e NPC
- **Effetti visivi** per attacchi e abilità
- **Tileset** per ambienti diversificati
- **Interfaccia utente** intuitiva e stilizzata
- **Effetti sonori** per azioni e attacchi
- **Musica di sottofondo** per ogni livello

## Meccaniche di Gioco

- **Sistema di Combattimento Magico**: Utilizzo di tecnologie avanzate che permettono attacchi magici attraverso le armi
- **Esplorazione**: Scoperta di una città completamente trasformata e colorata
- **Dialoghi e Missioni**: Interazioni con vari personaggi per ottenere informazioni e progredire nella storia
- **Puzzle e Sfide**: Risolvere enigmi per avanzare, come il quiz televisivo "Il Tetto Semi Sconosciuto"

## Struttura del Progetto

```
mindworld-game-jam/
├── game/
│   ├── assets/       # Risorse grafiche, audio e dati
│   │   ├── data/     # File JSON per livelli, personaggi e attacchi
│   │   ├── images/   # Sprite e immagini
│   │   └── audio/    # Musica ed effetti sonori
│   ├── css/          # Fogli di stile
│   ├── js/           # Codice JavaScript
│   └── index.html    # File principale del gioco
├── src/
│   ├── characters/   # Definizioni dei personaggi
│   ├── world/        # Descrizioni del mondo di gioco
│   └── gameplay/     # Descrizioni delle meccaniche
└── README.md         # Questo file
```

## Tecnologie Utilizzate
- **HTML5 Canvas** per il rendering
- **JavaScript** per la logica di gioco
- **WebSockets** per il multiplayer
- **JSON** per la gestione dei dati di gioco

## Come Giocare
1. Clona il repository: `git clone https://github.com/Elegiptiano09/mindworld-game-jam.git`
2. Apri il file `game/index.html` in un browser web
3. Usa WASD per muoverti, E per interagire
4. Usa i tasti 1-4 per attacchi Fah, 5-8 per attacchi Brih, Q ed E per attacchi combinati

## Sviluppo Futuro
- Implementazione completa di tutti i livelli
- Aggiunta di più nemici e boss
- Sistema di inventario e equipaggiamento
- Missioni secondarie
- Editor di livelli
- Modalità storia completa

## Licenza

Questo progetto è rilasciato sotto licenza MIT.
