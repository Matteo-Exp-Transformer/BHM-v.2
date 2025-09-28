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
  - [ ] Eseguire una passata di lint completa del repository e segnalare eventuali nuovi errori a Agente B/C.
- **Stato:** in corso → blocco residuo su lint globali dovuti a codice legacy (v. sezione variazione finale).

## Agente B – Variabili Globali & Hook

- **Obiettivo:** rimuovere errori `no-undef` e warning `react-hooks/exhaustive-deps` nelle componenti onboarding.
- **File di riferimento:**
  - `src/App.tsx`
  - `src/components/OnboardingWizard.tsx`
  - `src/components/layouts/MainLayout.tsx`
  - `src/components/onboarding-steps/BusinessInfoStep.tsx`
  - `src/components/onboarding-steps/DepartmentsStep.tsx`
  - `src/components/onboarding-steps/InventoryStep.tsx`
  - `src/components/onboarding-steps/TasksStep.tsx`
- **Attività:**
  1. Sostituire l’uso diretto di `process` o `NodeJS` con alternative compatibili lato browser (variabili importate da file di config o `import.meta.env`).
  2. Aggiornare gli hook `useEffect`/`useCallback` aggiungendo le dipendenze mancanti o refactorizzando funzioni (`validateForm`, `downloadBlob`, `syncPendingOperations`, ecc.).
  3. Eseguire `npm run lint -- src/App.tsx src/components` per convalida.
  4. Annotare modifiche in `WORK_LOG.md` e, se emergono bug, aprire report in `Info per debug/Bug_Reports/`.

## Agente C – Libreria UI & Tipizzazioni

- **Obiettivo:** risolvere errori nelle componenti UI comuni e nella tipizzazione onboarding.
- **File di riferimento:**
  - `src/components/ui/Input.tsx`
  - `src/components/ui/Label.tsx`
  - `src/components/ui/Textarea.tsx`
  - `src/components/ui/index.ts`
  - `src/types/onboarding.ts`
- **Attività:**
  1. Sostituire le interfacce vuote con tipi appropriati o rimuovere dichiarazioni ridondanti (errore `@typescript-eslint/no-empty-object-type`).
  2. Verificare che `SelectOption` e altri export siano correttamente re-esportati dal barrel UI.
  3. Garantire che le tipizzazioni (`InventoryStepProps`, ecc.) corrispondano all’utilizzo nei componenti.
  4. Eseguire `npm run lint -- src/components/ui src/types/onboarding.ts` e aggiornare `WORK_LOG.md` con i risultati.

---

### Note di Coordinamento

- Dopo ogni fix, l’agente deve:
  1. Aggiornare `Info per debug/WORK_LOG.md` indicando data, file modificati e stato dei test (`npm run lint`).
  2. Se il fix risolve un bug documentato, spostare/aggiornare il relativo report in `Info per debug/Bug_Reports/Fixed/` e aggiornare `Info per debug/Bug_Reports/bug-tracking-index.md`.
  3. Lasciare eventuali TODO aperti sotto forma di commento `// TODO:` nel file interessato solo se necessario e documentare nel bug tracker.

- Prima di ogni commit:
  - Eseguire `npm run lint`, `npm run type-check` e annotare l’esito nel log.
  - Usare messaggi di commit coerenti (`fix(agent): ...`).

- Se durante il lavoro emergono task fuori scope (es. refactor profondo, problemi Supabase), aprire un nuovo bug in `Info per debug/Bug_Reports/` e assegnarlo secondo `Info per debug/CONTRIBUTING.md`.


