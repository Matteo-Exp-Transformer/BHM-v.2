# Fonte per Notebook LM – Configurazione BHM-v.2 in Vibe Kanban

**Scopo**: Testo unico da copiare e incollare come fonte in Notebook LM per ricevere assistenza sulla configurazione del progetto BHM-v.2 in Vibe Kanban (repository, script, varianti agente, contesto app).

---

## 1. Cos'è Vibe Kanban

Vibe Kanban è uno strumento di orchestrazione per agenti di programmazione AI (come Cursor CLI, Claude Code e Gemini) che consente di gestire i task attraverso un'interfaccia in stile Kanban. La sua architettura si basa sull'uso dei git worktree, che creano ambienti isolati per ogni tentativo di risoluzione di un task. Questo approccio permette di:

- Eseguire più agenti in parallelo senza conflitti nel repository principale.
- Utilizzare un diff tool integrato per revisionare, modificare e approvare il lavoro degli agenti come se fosse una pull request umana.
- Mantenere la cronologia git pulita grazie all'integrazione nativa con GitHub.

---

## 2. Configurazione per Cursor

Per utilizzare Cursor come agente principale in Vibe Kanban, segui questi passaggi:

1. **Installazione CLI**:
   - **Windows (PowerShell)**: `irm 'https://cursor.com/install?win32=true' | iex` — poi verificare con `cursor-agent --version`. Se "executable not found in PATH", aggiungere la cartella dell'eseguibile al PATH di sistema (Impostazioni → Variabili d'ambiente).
   - **macOS/Linux**: `curl https://cursor.com/install -fsS | bash`.
   - Vibe Kanban richiede che `cursor-agent` sia nel PATH dell'ambiente da cui parte l'app; in caso di errore "Executable cursor-agent not found in PATH", aggiungere la cartella al **PATH di sistema**: eseguire come Amministratore lo script `scripts/add-cursor-agent-to-system-path.ps1` (oppure aggiungere manualmente `%LOCALAPPDATA%\cursor-agent` a Variabili d'ambiente → Path → Variabili di sistema). Poi riavviare Vibe Kanban.
2. **Autenticazione**: Esegui `cursor-agent login` per autenticarti tramite browser, oppure imposta la variabile d'ambiente `CURSOR_API_KEY`.
3. **Estensione IDE**: All'interno di Cursor, apri il pannello delle estensioni e cerca l'ID `@id:bloop.vibe-kanban` per installare l'estensione ufficiale. Questa permette di monitorare log, diff e processi direttamente nell'IDE.
4. **Integrazione Editor**: Nelle impostazioni di Vibe Kanban, configura Cursor come editor predefinito affinché il pulsante "Open in Cursor" apra automaticamente il worktree corretto.

---

## 3. Struttura app e knowledge base (contesto progetto)

### 3.1 Visione e scope

**BHM v.2 – Business HACCP Manager** è un'app per aiutare i ristoratori a gestire la propria azienda rispettando le norme HACCP in modo user-friendly, pratico e educativo. Funzioni core: modulo Conservazione (form a cascata), Calendario attività, timestamp sessione utente, Inventario/lista spesa, sistema di alert.

**Stack (Beta Production)**: Frontend React 18 + TypeScript + Vite + Tailwind; backend Supabase (PostgreSQL, Auth, Realtime); testing Vitest + Playwright (multi-agent); deploy Vercel + PWA. Multi-tenancy (companies, company_members), RBAC, tabelle HACCP (conservation_points, temperature_readings), calendar_events, maintenance_tasks.

### 3.2 Struttura moduli / aree

La documentazione dell'app è organizzata in `Production/Conoscenze_congelate/APP_DEFINITION/`:

- **01_AUTH** – Login, onboarding, permessi, sessioni
- **02_DASHBOARD** – Homepage, layout, KPI
- **03_CONSERVATION** – Conservazione (punti, temperature, manutenzioni)
- **04_CALENDAR** – Calendario attività (eventi, mansioni, macro-categorie)
- **05_INVENTORY** – Inventario, liste spesa
- **06_SETTINGS** – Impostazioni azienda e HACCP
- **07_MANAGEMENT** – Gestione personale e reparti
- **08_COMPONENTS** – Componenti UI base
- **09_INTERACTIONS** – Flussi utente, conflitti, stato

Dettaglio elementi (pagine, componenti, modali, form) in: `APP_DEFINITION/00_MASTER_INDEX.md`.

### 3.3 Knowledge base: dove si trova cosa

- **Root**: `Production/Conoscenze_congelate/` – visione (APP_VISION_CAPTURE.md), spec beta (BETA_PRODUCTION_SPEC.md), analisi tecnica (TECHNICAL_ANALYSIS.md), report implementazioni (es. IMPLEMENTAZIONE_REMEMBER_ME_COMPLETATA.md).
- **Mappa elementi**: `APP_DEFINITION/00_MASTER_INDEX.md` – elenco pagine, componenti, modali, form per area.
- **Auth**: `01_AUTH/conoscenze-definizioni/` – ONBOARDING_FLOW.md (step 1–7), ONBOARDING_TO_MAIN_MAPPING.md (onboarding → main app: step → Settings/Management/Conservation/Calendar/Inventario).
- **Conservazione**: `03_CONSERVATION/Conoscenze-Definizioni/` – CONSERVATION_PAGE.md, ADD_POINT_MODAL.md, ADD_TEMPERATURE_MODAL.md, CONSERVATION_POINT_CARD.md, SCHEDULED_MAINTENANCE_SECTION.md, TEMPERATURE_READINGS_SECTION.md.
- **Calendario**: `04_CALENDAR/conoscenze-definizioni/` – 00_MASTER_INDEX_CALENDAR.md (architettura, 6 fonti evento, filtri 2-layer, directory), CALENDAR_PAGE.md, EVENT_AGGREGATION.md, FILTERS_AND_PERMISSIONS.md, GENERIC_TASK_FORM.md, MACRO_CATEGORY_SYSTEM.md.

### 3.4 Flussi utente principali

- **Onboarding**: 7 step (info azienda → reparti → personale → conservazione → attività → inventario → calendario); dati mappati in main app (ONBOARDING_TO_MAIN_MAPPING: step → Settings, Management, ConservationPage, CalendarPage, InventoryPage).
- **Conservazione**: Consultare CONSERVATION_PAGE.md – punti di conservazione, letture temperatura, manutenzioni programmate, "Visualizza nel Calendario", apertura modal temperatura da Attività (state `openTemperatureForPointId`).
- **Calendario**: Consultare 00_MASTER_INDEX_CALENDAR.md e CALENDAR_PAGE.md – visualizzare eventi aggregati (6 fonti), completare manutenzioni/mansioni, creare mansioni (GenericTaskForm), filtrare (reparto solo admin, tipo), navigazione da Conservazione con state (openMacroCategory, date, highlightMaintenanceTaskId).

### 3.5 Punti chiave del codice

- **Entry point pagine**: `src/features/calendar/CalendarPage.tsx`, `src/features/conservation/ConservationPage.tsx`; onboarding in `src/components/onboarding-steps/`.
- **Calendario**: hook `useAggregatedEvents`, `useFilteredEvents`, `useMacroCategoryEvents`, `useGenericTasks`; componenti MacroCategoryModal, GenericTaskForm, NewCalendarFilters, CalendarStatsPanel.
- **Conservazione**: hook `useConservation`, `useMaintenanceTasks`, `useMaintenanceTasksCritical`, `useConservationRealtime`; componenti AddPointModal, AddTemperatureModal, TemperatureReadingsTable, ScheduledMaintenanceCard.
- Per flussi, stati e conflitti completi: usare i file .md in APP_DEFINITION e Conoscenze_congelate indicati sopra.

---

## 4. Dati necessari per la documentazione dell'app (BHM-v.2)

Valori concreti da usare per configurare il progetto in Vibe Kanban.

### Repository e workspace

- **Repository**: Git esistente.
- **Percorso workspace**: `C:\Users\matte.MIO\Documents\GitHub\BHM-v.2` (Windows). Per altri ambienti usare il path assoluto della root del repo.
- **Worktree**: Il progetto usa già workflow/skill per worktree (es. `.worktrees/` o `worktrees/`). Se si usano worktree project-local, aggiungere la directory scelta (es. `.worktrees/`) a `.gitignore` se non già presente.

### Setup scripts

- **Obbligatorio**: `npm install`
- **Opzionale (pre-agent)**: `npm run type-check` per verificare che l'ambiente compili.

### Dev server scripts

- **Singola istanza**: `npm run dev` (Vite, porta di default).
- **Preview (dopo build)**: `npm run preview` oppure `npm run preview:clean` (cleanup + build + preview).
- **Multi-agenzia / più istanze**: `npm run dev:agent1` (porta 3000), `npm run dev:agent2` (3001), `npm run dev:agent3` (3002), oppure `npm run dev:multi` (script `scripts/start-multi-instance.cjs` che gestisce più istanze e lock).

### Cleanup scripts (post-esecuzione / pre-commit)

- **Lint**: `npm run lint` (solo check) oppure `npm run lint:fix` (correzioni automatiche).
- **TypeScript**: `npm run type-check`.
- **Pulizia artefatti**: `npm run clean` (esegue `cleanup.ps1`: rimuove dist, node_modules/.vite, .vercel). Non è presente uno script `format` dedicato in package.json; eventualmente aggiungere prettier/format se necessario.

### Copy files (file da copiare nel worktree prima dello setup)

File non tracciati da git che devono essere disponibili nel worktree:

- **Template sicuro**: `.env.example` (contiene placeholder per VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_CLERK_*, opzionali Sentry/PostHog/Resend). Istruzione: copiare come base in `.env` o `.env.local` e compilare le variabili.
- **Da copiare se esistono localmente**: `.env`, `.env.local`; opzionali per ambiente: `.env.test`, `.env.vercel`, `.env.production.vercel`. Tutti sono in .gitignore.

### Varianti agente

- **DEFAULT**: modello standard, con conferme per comandi shell.
- **PLAN**: modalità piano-first; utile perché è più veloce giudicare un piano testuale che una serie di diff.
- **YOLO / dangerously_skip_permissions**: per lavoro asincrono; evita che l'agente si fermi a chiedere autorizzazioni per ogni comando shell.
- **Verificabilità**: Il progetto espone `npm run test` (Vitest) e `npm run test:e2e` / `npm run test:e2e:headless` (Playwright). Configurare in modo che l'agente possa eseguire i test in autonomia (es. criterio "tests pass") invece di chiedere conferma manuale.

---

## 5. Best practice operative

- **Pianificazione (Planning)**: Si consiglia di iniziare sempre con un piano, poiché è più veloce giudicare un piano testuale che una serie di modifiche al codice (diff).
- **Modalità YOLO**: Per il lavoro asincrono, utilizza la modalità yolo o dangerously_skip_permissions per evitare che l'agente si fermi continuamente a chiedere autorizzazioni per ogni comando shell.
- **Verificabilità**: Configura il progetto in modo che l'agente possa eseguire test autonomamente (es. "tests pass") invece di dover chiedere conferma manuale all'utente.
- **Gestione porte**: Se esegui più server di sviluppo in parallelo, è consigliato integrare l'MCP dev-manager-mcp per evitare collisioni di porte. In BHM-v.2 sono già definiti dev:agent1/2/3 (porte 3000–3002) e dev:multi.

---

## 6. Note specifiche progetto

- **OS**: Ambiente principale Windows (PowerShell). Lo script `cleanup.ps1` è Windows-specific; su altri OS potrebbero servire equivalenti o uno script Node.
- **Branch/worktree**: In .claude_rules si menziona un worktree "Claude" e porta 3001; per Vibe Kanban ogni task può avere un worktree separato (porte diverse o dev:multi).
- **Lock agenti**: Il repo ha già script per lock e multi-istanza (`lock:status`, `lock:monitor`, `test:agent1/2/3`); coesistono con la gestione worktree di Vibe Kanban senza sovrapposizione concettuale.

---

**Ultimo aggiornamento**: 2026-02-13  
**Uso**: Copiare l’intero contenuto di questo file come fonte in Notebook LM per ottenere assistenza sulla configurazione di BHM-v.2 in Vibe Kanban e sul contesto dell’app (struttura, knowledge base, flussi, punti chiave codice).
