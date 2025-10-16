<!-- 61d6c130-3c2b-4a7c-a17f-f906018df26d 06ad97e3-4b0e-46a7-8336-eb8cb8958cd4 -->
# Piano: Blindatura Sistematica Componenti App

## Fase 1: Setup Infrastruttura

### 1.1 Configurazione Playwright MCP

- Installare Playwright MCP server
- Aggiungere Playwright a `.cursor/mcp.json` 
- Testare la connessione e verificare che possa navigare l'app locale
- Configurare l'URL dell'app locale per l'esplorazione

### 1.2 Creazione Struttura Cartelle Production/

```
Production/
├── Test/
│   ├── Autenticazione/
│   ├── Onboarding/
│   ├── Dashboard/
│   ├── Calendario/
│   ├── Inventario/
│   ├── Conservazione/
│   ├── Liste-Spesa/
│   ├── Gestione/
│   └── Impostazioni/
├── Knowledge/
│   ├── MASTER_TRACKING.md (stato globale di tutte le componenti)
│   └── [file dettagliati per area]
└── Prompt_Context/
    ├── REGOLE_AGENTI.md (come lavorare con codice blindato)
    ├── STRUTTURA_TEST.md (come scrivere test)
    └── WORKFLOW_BLINDATURA.md (processo step-by-step)
```

### 1.3 Creazione File Template

- Template per tracking componente singola
- Template per test JavaScript
- File MASTER_TRACKING.md con tabella stato componenti

## Fase 2: Esplorazione e Mappatura

### 2.1 Esplorazione App con MCP

Usando TestSprite e navigazione diretta, esplorare sistematicamente:

- Ogni pagina dell'app
- Ogni modal/dialog
- Ogni form e input
- Ogni bottone e azione
- Ogni tab e navigazione

### 2.2 Generazione Inventario Completo

Creare documento dettagliato in `Production/Knowledge/INVENTARIO_COMPONENTI.md` con:

- Tutte le route/pagine trovate
- Tutti i componenti UI identificati
- Tutte le funzionalità per componente
- Tutte le interazioni utente possibili
- Tutte le chiamate API/database

### 2.3 Prioritizzazione

Creare lista ordinata seguendo: Auth → Onboarding → Dashboard → UI base → Features complete

## Fase 3: Processo di Blindatura (Iterativo)

Per ogni componente, seguire questo ciclo:

### 3.1 Analisi Componente

- Leggere il codice sorgente
- Identificare tutte le funzioni/metodi
- Identificare tutti gli stati possibili
- Identificare tutte le props/input
- Identificare tutte le dipendenze

### 3.2 Test Funzionali (Tipo 1)

Creare test JavaScript che verificano:

- Ogni bottone è cliccabile e fa l'azione attesa
- Ogni form accetta input e valida correttamente
- Ogni modal si apre/chiude correttamente
- Ogni tab/navigazione funziona
- Ogni tooltip/feedback visivo appare
- Ogni azione produce il risultato atteso nell'UI

### 3.3 Test Validazione Dati (Tipo 2)

Creare test JavaScript che verificano:

- Input validi: dati corretti vengono accettati
- Input invalidi: dati sbagliati vengono rifiutati con errore appropriato
- Edge cases: valori limite, stringhe vuote, null, undefined
- Casi estremi: stringhe lunghissime, numeri negativi, date future/passate
- Sicurezza: injection attempts, caratteri speciali

### 3.4 Fix e Iterazione

- Eseguire tutti i test
- Se falliscono: fixare il codice
- Ri-testare fino a 100% successo
- Verificare che non ci siano side effects su altre componenti

### 3.5 Blindatura e Lock

Una volta che tutti i test passano:

- Aggiungere commenti `// LOCKED: [Data] - Componente blindata` nel codice
- Marcare come `[LOCKED ✓]` nel file tracking della feature
- Aggiornare MASTER_TRACKING.md con stato LOCKED
- Commit dedicato con messaggio "LOCK: [NomeComponente]"

## Fase 4: Ordine di Esecuzione

### Priorità 1: Flusso Critico

1. Login/Signup (`src/features/auth/`)
2. Onboarding wizard (`src/components/onboarding-steps/`)
3. Dashboard principale (`src/features/dashboard/`)
4. Protezione route (`src/components/ProtectedRoute.tsx`)

### Priorità 2: Componenti UI Base

5. Button, Input, Modal, Dialog (`src/components/ui/`)
6. Form components
7. Layout components (`src/components/layouts/`)

### Priorità 3: Features Complete

8. Calendario completo (`src/features/calendar/`)
9. Inventario completo (`src/features/inventory/`)
10. Conservazione completa (`src/features/conservation/`)
11. Liste spesa complete (`src/features/shopping/`)
12. Gestione completa (`src/features/management/`)
13. Impostazioni complete (`src/features/settings/`)
14. Admin completo (`src/features/admin/`)

## Fase 5: Protezione e Manutenzione

### 5.1 Sistema di Protezione

- File `Production/Prompt_Context/REGOLE_AGENTI.md` con istruzioni SEVERE:
  - "NEVER modify files marked with // LOCKED"
  - "ALWAYS check MASTER_TRACKING.md before editing"
  - "IF component is locked, ask user permission first"

### 5.2 Automazione Verifica

- Script che verifica integrità componenti locked
- Test di regressione automatici per tutte le componenti locked

## File Chiave da Creare

1. `Production/Knowledge/MASTER_TRACKING.md` - Dashboard centrale
2. `Production/Prompt_Context/REGOLE_AGENTI.md` - Regole stringenti
3. `Production/Prompt_Context/WORKFLOW_BLINDATURA.md` - Processo dettagliato
4. Template file tracking per ogni area
5. Test JavaScript per ogni componente seguendo struttura cartelle

## Note Importanti

- I test usano terminologia NON tecnica (es: "Calendario/Crea-Evento" invece di "Calendar/CreateEventModal")
- Ogni test è piccolo e specifico (max 50-100 righe)
- Il MASTER_TRACKING usa emoji e colori per immediata comprensione stato
- Ogni modifica a componente locked richiede: unlock manuale → modifica → re-test completo → re-lock

### To-dos

- [ ] Configurare TestSprite e Playwright MCP in .cursor/mcp.json
- [ ] Creare struttura cartelle Production/ con Test, Knowledge, Prompt_Context
- [ ] Creare file template e MASTER_TRACKING.md
- [ ] Esplorare app con MCP e generare inventario completo componenti
- [ ] Iniziare blindatura priorità 1: Autenticazione
- [ ] Procedere sistematicamente attraverso tutte le componenti secondo priorità