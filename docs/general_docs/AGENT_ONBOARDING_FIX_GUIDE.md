# Guida Operativa Agenti – Fix Onboarding HACCP

## Contesto e Obiettivi
- Scope: risolvere i blocchi TypeScript e funzionali legati agli step di onboarding (`BusinessInfo`, `Departments`, `Staff`, `Conservation`, `Tasks`, `Inventory`), senza introdurre regressioni nei moduli legacy.
- Blocchi noti: errori su `inventoryUtils`, `onboardingHelpers`, `OnboardingWizard`, dati precompilati e tipizzazioni condivise (`src/types/onboarding.ts`).
- Non in scope: errori storici nei moduli `calendar`, `conservation` main app, `automation`, `security`, `multi-tenant`, ecc. Lasciali documentati nel bug tracker se emergono.

## Sequenza Operativa
1. **Allineamento**
   - Leggi `fixing_onboarding_multiagent.md` per lo stato attività e ruoli (Agente A/B/C).
   - _Stato ultimo aggiornamento (03/10/2025 15:45)_
     - Agente B ha completato il riallineamento funzionale di `InventoryStep` con i modal principali (validazioni e salvataggi allineati).
     - Agente C ha uniformato tutte le tipizzazioni condivise (`src/types/onboarding.ts`) e gli helper (`conservationUtils`, `inventoryUtils`, `staffUtils`, `onboardingHelpers`), eliminando i cast `any` negli step.
     - Modulo calendar: errori TypeScript risolti (`CalendarSettings`, `CreateEventModal`, `useCalendarEvents`).
     - Modulo conservation/inventory: form e hook riallineati; hook offline (`useOfflineSync`, `BackgroundSync`, `IndexedDBManager`) ora tipizzati e test aggiornati.
     - Modulo export/realtime: `useExportManager` e `useRealtime` aggiornati (config HACCP, payload Supabase, temperature alerts) insieme al `RealtimeConnectionManager` tipizzato.
     - Modulo automation: `enterpriseAutomationManager` ora carica i servizi in modo lazy; in corso la rimozione delle variabili inutilizzate nelle singole service.
     - Il type-check globale fallisce ancora per moduli legacy (automation, multi-tenant, security, export test suites). Nessun nuovo errore sugli step di onboarding.
   - Aggiorna `Info per debug/WORK_LOG.md` prima di chiudere la sessione.
2. **Analisi mirata**
   - Esegui `npm run type-check -- --pretty false --skipLibCheck --noEmit | findstr Onboarding` per isolare i nuovi errori dopo ogni modifica.
   - Se compaiono errori legacy non toccati, annotali in `BUG_TRACKER.md` e prosegui sullo scope assegnato.
3. **Implementazione**
   - Mantieni i tipi camelCase definiti in `src/types/onboarding.ts`.
   - Aggiorna helpers (`src/utils/onboarding/*.ts`) e componenti per utilizzare gli stessi shape usati nei modal principali (vedi `GPT_ONBOARDING_REPORT.md`).
   - Evita cast generici `as any`; preferisci normalizzazioni e funzioni helper già presenti (`normalizeConservationPoint`, `normalizeGeneralTask`, ecc.).
4. **Verifica**
   - Dopo ogni blocco: `npm run type-check` (accetta il fallimento globale ma verifica che i nuovi file rientrino nello scope previsto).
   - Esegui lint mirato se richiesto: `npm run lint -- src/components/onboarding-steps`.
   - Nessuna modifica ai file di build/test finché il type-check locale fallisce per legacy.
5. **Comunicazione**
   - Registra i cambi in `WORK_LOG.md` e, se trovi blocchi, aggiungi una nota in `BUG_TRACKER.md`.
   - Quando chiudi un task, aggiorna `fixing_onboarding_multiagent.md` marcando la checkbox e indicando eventuali follow-up.

## File di Riferimento Essenziali
- `fixing_onboarding_multiagent.md` – pianificazione agenti, stato attività.
- `Info per debug/WORK_LOG.md` – log sessioni.
- `Info per debug/BUG_TRACKER.md` – registrazione bug legacy.
- `GPT_ONBOARDING_REPORT.md` – parity con i modal esistenti.
- `ONBOARDING_COMPLETE_GUIDE.md` – flusso onboarding end-to-end.
- `src/types/onboarding.ts` – sorgente unica per le tipizzazioni condivise.
- `src/components/onboarding-steps/*.tsx` – componenti target.
- `src/utils/onboarding/*.ts` e `src/utils/onboardingHelpers.ts` – helper/validator da mantenere allineati.
- `package.json` – script disponibili (`type-check`, `lint`, `build:clean`).

## Comandi Utili
- `npm run type-check` – verifica tipi (fallirà sui moduli legacy: allega il log se necessario).
- `npm run lint -- src/components/onboarding-steps` – lint mirato agli step.
- `npm run build:clean` – solo dopo avere type-check pulito sulle modifiche.

## Checklist Rapida per Ogni PR Interna
- [x] Scope confermato e documentato in `fixing_onboarding_multiagent.md` (ultimo check 01/10/2025 16:10).
- [x] Tipi aggiornati senza cast `any`.
- [x] Helper/normalizer riutilizzati invece di duplicare logica.
- [x] Type-check eseguito; errori legacy annotati (se nuovi).
- [ ] LOG aggiornato (`WORK_LOG.md`).
- [ ] Eventuali blocchi segnalati nel bug tracker.

## Escalation
- Blocchi su Clerk/Supabase o sugli hook realtime → assegnare a CLAUDE (vedi `BUG_TRACKER.md`).
- Refactor massivi (automation, security, multi-tenant) → non procedere senza nuova pianificazione condivisa.
- Build/Deploy → seguire `PRECOMPILATION_AND_RESET_GUIDE.md` e avvisare prima del push.
