# Fixing Onboarding Multiagent

Coordinamento per la risoluzione degli errori di lint e TypeScript rilevati nello step di onboarding. Ogni agente lavora sul branch `GPT`. Prima di iniziare:

1. Leggere `Info per debug/CONTRIBUTING.md` e `Info per debug/GIT_GUIDE_SIMPLE.md` per seguire il workflow git corretto.
2. Consultare il bug tracker in `Info per debug/BUG_TRACKER.md` per il contesto generale.
3. Aggiornare il `WORK_LOG` in `Info per debug/WORK_LOG.md` al termine delle attività assegnate.

---

## Agente A – Fix Sintattici e Tipi Onboarding

- **Obiettivo:** eliminare gli errori bloccanti in `ConservationStep`, `StaffStep` e `conservationUtils`.
- **File di riferimento:**
  - `src/components/onboarding-steps/ConservationStep.tsx`
  - `src/components/onboarding-steps/StaffStep.tsx`
  - `src/utils/onboarding/conservationUtils.ts`
- **Attività:**
  - [x] Ripulire import/variabili inutilizzate e chiudere tutte le funzioni JSX nei file indicati.
  - [x] Ripristinare `SelectOption`/checkbox per categorie e reparti nel `StaffStep`.
  - [x] Sistemare toggle categorie/compatibilità nel `ConservationStep`.
  - [x] Snellire `conservationUtils` eliminando placeholder icone e variabili inutili.
  - [ ] Eseguire una passata di lint completa del repository e segnalare eventuali nuovi errori a Agente B/C. _(tentata: `npm run lint -- src/components/onboarding-steps/ConservationStep.tsx src/components/onboarding-steps/StaffStep.tsx src/utils/onboarding/conservationUtils.ts`, fallita per 700+ errori legacy fuori scope)_
- **Stato:** in corso → blocco residuo su lint globali dovuti a codice legacy (v. sezione variazione finale). Commit creato: `Restore onboarding HACCP logic (branch GPT)`.

## Agente B – Logiche HACCP & Hook

- **Obiettivo:** portare gli step di onboarding alle stesse logiche di compilazione, validazione HACCP e funzionalità presenti nei modal principali della app (vedi `GPT_ONBOARDING_REPORT.md`), mantenendo però il layout attuale dello step wizard.
- **File di riferimento:**
  - Componenti onboarding: `BusinessInfoStep.tsx`, `DepartmentsStep.tsx`, `InventoryStep.tsx`, `ConservationStep.tsx`, `TasksStep.tsx`
  - Modal di riferimento: `src/features/inventory/components/AddProductModal.tsx`, `src/features/conservation/components/AddPointModal.tsx`, modal task conservazione/attività
- **Attività:**
  1. Riutilizzare la stessa logica dei modal (validazioni HACCP, campi obbligatori, gestione allergeni/task/mansioni) adattandola agli step senza introdurre nuove modifiche al layout grafico esistente.
  2. Sostituire l’uso diretto di `process`, `NodeJS`, `global` con alternative compatibili lato browser (`import.meta.env`, tipi di timer, ecc.).
  3. Aggiornare hook `useEffect`/`useCallback`/`useMemo` con le dipendenze corrette dopo il porting delle logiche, evitando regressioni funzionali.
  4. Eseguire `npm run lint -- src/components/onboarding-steps` per verificare gli step; documentare gli errori legacy non correlati nel bug tracker.
- **Nota layout:** non modificare struttura/tabs/estetica dell’onboarding wizard; integrare la logica dei modal all’interno del layout esistente.

## Agente C – Libreria UI & Tipizzazioni condivise

- **Obiettivo:** garantire che i componenti UI e le tipizzazioni condivise supportino le logiche portate dagli agenti A/B, eliminando warning TypeScript e assicurando corrispondenza con i modal di riferimento (`GPT_ONBOARDING_REPORT.md`).
- **File di riferimento:**
  - `src/components/ui/Input.tsx`, `Label.tsx`, `Textarea.tsx`, `Tooltip.tsx`, `Select.tsx`
  - `src/components/ui/index.ts`
  - `src/types/onboarding.ts`
  - `src/utils/onboarding/*`
- **Attività:**
  1. [x] Sostituire interfacce vuote con type alias (`InputProps`, `LabelProps`, `TextareaProps`) e uniformare tipizzazioni degli helper UI.
  2. [x] Uniformare l’uso di `setTimeout`/`setInterval` per evitare riferimenti a `NodeJS.Timeout` nei componenti browser-only.
  3. [x] Allineare le tipizzazioni (`InventoryStepData`, `InventoryProduct`, `HaccpTask`, ecc.) alle esigenze dei modal principali, così che gli step possano riutilizzare tutte le funzioni di validazione senza cast impropri.
  4. [x] Aggiornare `inventoryUtils.ts`, `staffUtils.ts`, `conservationUtils.ts` e relativi test/validazioni per esporre helper coerenti con i modal.
  5. [ ] Eseguire `npm run lint -- src/components/ui src/types/onboarding.ts src/utils/onboarding` e riportare l’esito nel `WORK_LOG`.
- **Nota layout:** ogni refactor deve preservare la struttura UI dell’onboarding; le modifiche a componenti condivisi non devono alterare lo stile esistente.

---

### Note di Coordinamento

- Dopo ogni fix, l’agente deve:
  1. Aggiornare `Info per debug/WORK_LOG.md`
  2. Aggiornare `Info per debug/WORK_LOG.md`

- **Avanzamento (ultima sessione):**
  - ✅ Variabili globali migrate a `import.meta.env.DEV` in `src/App.tsx`, `src/components/OnboardingWizard.tsx`, `src/components/layouts/MainLayout.tsx`.
  - ✅ Timer tipizzati con `ReturnType<typeof setTimeout>` in `src/hooks/useRealtime.ts`.
  - ✅ Hook `useEffect`/`useMemo` aggiornati con dipendenze corrette in `BusinessInfoStep.tsx`, `DepartmentsStep.tsx`, `InventoryStep.tsx`, `TasksStep.tsx`.
  - ✅ Prima integrazione `InventoryStep` con struttura modale del main app (ancora da completare per parity totale e validazione).
  - ⛔ Lint globale ancora fallisce per warning/unused legacy fuori scope agent B.
- **Aggiornamenti (sessione corrente):**
  - ✅ Consolidate le tipizzazioni condivise (`src/types/onboarding.ts`) e aggiornati tutti gli helper onboarding (`conservationUtils`, `inventoryUtils`, `staffUtils`, `taskUtils`, `onboardingHelpers`).
  - ✅ Eliminati i cast `any` negli step (`BusinessInfoStep`, `DepartmentsStep`, `StaffStep`, `TasksStep`, `ConservationStep`, `OnboardingWizard`) ripristinando la parità con i modal.
  - ⛔ Lint generale (`npm run lint -- src/components/onboarding-steps`) fallisce per warning/unused legacy fuori scope (calendar, automation, multi-tenant, offline).

## SITUAZIONE ATTUALE - Branch GPT

**Problema:** Push fallito per errori TypeScript nel pre-push hook.
**Build:** ✅ Funzionante (`npm run build:clean` completato)
**Commit:** ✅ Locale aggiornato (`0f5d34d`)
**Remote:** ❌ Branch GPT non esiste ancora

### Errori TypeScript da risolvere:

✅ Nessun errore aperto sugli step di onboarding. Il type-check fallisce ancora per moduli legacy (calendar, automation, multi-tenant, offline).

### Prossimi passi:

1. **Documentazione**: Aggiornare `WORK_LOG.md` con il resoconto della sessione e annotare nel bug tracker i moduli legacy ancora bloccanti.
2. **Verifica legacy**: Preparare piano di mitigazione per gli errori `calendar/*`, `automation/*`, `offline/*` identificati dal type-check.
3. **Lint mirato**: Rieseguire `npm run lint -- src/components/ui src/types/onboarding.ts src/utils/onboarding` e registrare outcome appena il backlog legacy viene ridotto.
