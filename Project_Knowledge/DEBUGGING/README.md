# 🚀 Debugging and Refactoring Coordination

**Objective:** To improve the overall quality, performance, and maintainability of the HACCP Business Manager application.

This document outlines the plan and division of tasks between Gemini and Cursor for the debugging and refactoring phase.

## Plan and Task Division

### Fase 1: Analisi Statica e Correzione del Codice
- **Gemini (Complesso):**
    - Abilitare e configurare il type checker di TypeScript (`npm run type-check`) per essere più restrittivo.
    - Analizzare e risolvere gli errori di tipo più complessi e strutturali.
- **Cursor (Semplice):**
    - Eseguire il linter (`npm run lint -- --fix`) per correggere automaticamente i problemi di stile.
    - Risolvere gli errori di linting rimanenti che richiedono un intervento manuale.

### Fase 2: Analisi e Ottimizzazione delle Dipendenze
- **Gemini (Complesso):**
    - Analizzare l'impatto dell'aggiornamento delle dipendenze maggiori e gestire eventuali breaking changes.
    - Valutare la sostituzione di librerie pesanti.
- **Cursor (Semplice):**
    - Eseguire `depcheck` per ottenere una lista di dipendenze non utilizzate.
    - Rimuovere le dipendenze chiaramente non utilizzate.
    - Aggiornare le dipendenze minori.

### Fase 3: Pulizia del Codice e dei File Obsoleti
- **Gemini (Complesso):**
    - Identificare e rimuovere intere feature o componenti obsoleti.
    - Rimuovere codice morto con potenziali effetti collaterali.
- **Cursor (Semplice):**
    - Rimuovere blocchi di codice commentati.
    - Eliminare file di asset non utilizzati.

### Fase 4: Refactoring e Miglioramento della Struttura
- **Gemini (Complesso):**
    - Scomporre i componenti "god-like".
    - Estrarre logica di business complessa in custom hook o servizi.
- **Cursor (Semplice):**
    - Refattorizzare codice duplicato semplice.
    - Convertire i componenti di classe in componenti funzionali.

### Fase 5: Validazione e Test
- **Gemini (Complesso):**
    - Impostare la misurazione della code coverage.
    - Scrivere test di integrazione per i workflow critici.
- **Cursor (Semplice):**
    - Scrivere unit test per i componenti UI semplici.
    - Aggiornare gli snapshot test.

## Metodologia di Lavoro

Per ogni task di debug o refactoring, seguire la metodologia di Claude:
1.  **Segnalazione del Bug/Problema:** Creare un nuovo file nella cartella `Project_Knowledge/DEBUGGING/BUGS` utilizzando il template `BUG-REPORT-TEMPLATE.md`.
2.  **Documentazione della Strategia:** Prima di applicare la soluzione, documentare la strategia risolutiva in un nuovo file nella cartella `Project_Knowledge/DEBUGGING/STRATEGIES` utilizzando il template `STRATEGY-TEMPLATE.md`.
3.  **Implementazione:** Applicare la soluzione.
4.  **Validazione:** Testare la soluzione e assicurarsi che non introduca regressioni.
