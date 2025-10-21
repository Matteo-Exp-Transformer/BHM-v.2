# PANORAMICA SISTEMA 7 AGENTI - Product Development Framework

> **Versione**: 2.0
> **Data**: 2025-10-20
> **Metodologia**: 90% Planning / 10% Coding
> **Framework**: Multi-Agent Orchestration con Handoff Pattern

---

## SCOPO DEL SISTEMA

Trasformare lo sviluppo software da **codifica reattiva** a **progettazione strategica**, utilizzando un team di 7 agenti AI specializzati che collaborano seguendo il principio **90% pianificazione, 10% codifica**.

### Problema Risolto
- Blocchi di sviluppo per mesi dovuti a bug accumulati
- Perdita di allineamento tra idea iniziale e prodotto finale
- Mancanza di struttura nelle decisioni tecniche
- Testing inefficace e correzioni continue

### Soluzione
Un sistema multi-agente orchestrato dove:
- **Primi 3 agenti** → Pianificazione strategica (Product, Architecture, UX/UI)
- **Successivi 4 agenti** → Implementazione e qualità (Backend, Frontend, Testing, Security)

---

## METODOLOGIA TRACKING LAVORO (NUOVO)

### **OBBLIGATORIO**: Handoff snelliti con tracking integrato

#### **Template Handoff Snellito**
```markdown
# HANDOFF_TO_AGENTE_{N}.md

## DATI REALI DA USARE
**OBBLIGATORIO**: Usa SOLO i dati dal file `REAL_DATA_FOR_SESSION.md`

## TASK DA SVOLGERE
[Link agli handoff esistenti con task dettagliati]

## FILE NECESSARI
- `REAL_DATA_FOR_SESSION.md` (dati reali)
- `[FILE_SPECIFICI]` (file necessari per il lavoro)

---

## TRACKING LAVORO (da aggiornare durante sviluppo)

### 🐛 Problemi Identificati
- [Data] - [Descrizione problema] - [Status: Risolto/In corso/Bloccante]

### ❓ Dubbi/Questioni
- [Data] - [Descrizione dubbio] - [Status: Risolto/In attesa risposta]

### 📝 Note Agente
- [Data] - [Note libere sul lavoro svolto]
- [Data] - [Decisioni prese e perché]
- [Data] - [Idee per miglioramenti futuri]

### ✅ Completamento
- [Data] - [Task completato] - [Note]
- [Data] - [Handoff ad agente successivo pronto]
```

#### **Vantaggi Metodologia Tracking**
- **Zero duplicazioni**: Dati reali solo in `REAL_DATA_FOR_SESSION.md`
- **Comunicazione efficace**: Agenti planning monitorano progresso in tempo reale
- **Debugging facilitato**: Problemi tracciati con date e status
- **Workflow snellito**: Un solo file da mantenere per agente

### 2. Handoff Pattern con Quality Gates
Ogni agente:
- Riceve **artefatti obbligatori** dall'agente precedente
- Produce **deliverable misurabili**
- Passa il testimone solo dopo **Definition of Done (DoD)**

### 3. Tracciabilità Completa
Ogni decisione è collegata:
```
Requisito → Design → Implementazione → Test → Security → Deploy
```

### 4. Specializzazione + Collaborazione
- Ogni agente ha **competenze specifiche**
- Gli agenti **collaborano** attraverso handoff strutturati
- Nessun agente lavora in isolamento

---

## AGENTE 0 - ORCHESTRATORE

L'**Agente 0** coordina l'intero sistema:
- Normalizza richieste, mappa ai file reali, assegna priorità (P0/P1/P2)
- Seleziona e istruisce l'agente successivo con un prompt operativo (DoD incluso)
- Impone la struttura di output: `Production/Sessione_di_lavoro/Agente_X/YYYY-MM-DD/`
- Verifica i quality gates e gestisce gli handoff

Deliverable tipici:
- Prompt operativi per agenti 1–7
- Aggiornamenti a `Production/README_SESSIONE.md`
- Riepiloghi di sessione e prossimi passi

---

## FLUSSO DI LAVORO MULTI-AGENTE

```
┌─────────────────────────────────────────────────────────────┐
│                   PLANNING PHASE (90%)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [1] Product Strategy Lead                                  │
│      Input:  Idea iniziale, ricerca mercato                 │
│      Output: MVP Brief, Roadmap, Backlog prioritizzato      │
│      DoD:    PRD approvato, 0 ambiguità critiche            │
│              ↓                                               │
│  [2] Systems Blueprint Architect                            │
│      Input:  PRD, feature list                              │
│      Output: System Diagram, API Spec, scaling plan         │
│      DoD:    Diagrammi versionati, trade-off documentati    │
│              ↓                                               │
│  [3] Experience & Interface Designer                        │
│      Input:  PRD, system blueprint                          │
│      Output: User Stories, Wireframe, Design tokens         │
│      DoD:    Task success ≥90% su flow critici              │
│              ↓                                               │
├─────────────────────────────────────────────────────────────┤
│                   CODING PHASE (10%)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [4] Back-End Agent                                         │
│      Input:  API Spec, DB schema                            │
│      Output: Repo BE, endpoint, migrazioni                  │
│      DoD:    Test verdi, p95 latency rispettata             │
│              ↓                                               │
│  [5] Front-End Agent                                        │
│      Input:  Wireframe, design tokens, API                  │
│      Output: Repo FE, components, routing                   │
│      DoD:    LCP/TTI in budget, a11y AA                     │
│              ↓                                               │
│  [6] Testing Agent                                          │
│      Input:  Codice FE/BE, user stories                     │
│      Output: Suite test, coverage report                    │
│      DoD:    Coverage ≥80%, build blocker su fail           │
│              ↓                                               │
│  [7] Security & Risk Agent                                  │
│      Input:  Codice, infra, dipendenze                      │
│      Output: Security checklist, fix PR, policy             │
│      DoD:    0 vulnerabilità High, policy enforced          │
│              ↓                                               │
│          PRODUCTION READY ✅                                │
└─────────────────────────────────────────────────────────────┘
```

---

## I 7 AGENTI - OVERVIEW RAPIDA

| # | Agente | Focus | Input Chiave | Output Chiave | KPI Principale |
|---|--------|-------|--------------|---------------|----------------|
| 1 | **Product Strategy Lead** | Cosa costruire | Idea, mercato | MVP Brief, Roadmap | 0 ambiguità critiche |
| 2 | **Systems Blueprint Architect** | Come architettare | PRD | System Diagram, API | Trade-off documentati |
| 3 | **Experience & Interface Designer** | Come renderlo usabile | PRD, blueprint | Wireframe, User Stories | Task success ≥90% |
| 4 | **Back-End Agent** | Motore invisibile | API Spec | Endpoint, DB | Test verdi, latency OK |
| 5 | **Front-End Agent** | UI visibile | Wireframe, API | Components, routing | LCP/TTI in budget |
| 6 | **Testing Agent** | Prevenzione bug | Codice, stories | Suite test, coverage | Coverage ≥80% |
| 7 | **Security & Risk Agent** | Protezione | Codice, infra | Checklist, fix | 0 vuln High |

> Nota: Tutte le attività partono e si chiudono tramite **Agente 0** che gestisce priorità, handoff e cartelle di output.

---

## HANDOFF E QUALITY GATES

### Cos'è un Handoff?
Un **handoff** è il passaggio di consegne tra due agenti. Include:
1. **Artefatti obbligatori** da consegnare
2. **Criteri di accettazione** (DoD - Definition of Done)
3. **Rischi documentati** + mitigazioni
4. **Firma digitale** (approvazione esplicita)

### Quality Gates
Ogni handoff ha un **quality gate** che blocca il progresso se non soddisfatto:

```markdown
ESEMPIO: Product Strategy → Systems Blueprint

GATE CONDITIONS:
✅ PRD completo (tutte sezioni compilate)
✅ Metriche di successo definite
✅ Stakeholder hanno approvato
✅ 0 ambiguità marcate come "CRITICAL"

SE GATE PASSA → Systems Blueprint può iniziare
SE GATE FALLISCE → Torna a Product Strategy per fix
```

---

## COMPATIBILITÀ CON IL TUO STACK

### Stack Attuale Rilevato
- **Frontend**: React 18+ + Vite
- **Backend**: Supabase (REST/Edge Functions)
- **Testing**: Playwright (E2E) + Jest (unit)
- **Auth**: Mock Auth system (branch NoClerk)
- **Multi-tenant**: Company-based isolation

### Adattamento Agenti
Gli agenti sono configurati per:
- **React + Vite** → Front-End Agent conosce best practices
- **Supabase** → Back-End Agent sa progettare edge functions
- **Playwright** → Testing Agent scrive test E2E nativi
- **Mock Auth** → Tutti gli agenti testano con 4 ruoli (admin, responsabile, dipendente, collaboratore)

---

## METRICHE DI SUCCESSO DEL SISTEMA

### Planning Phase Metrics
- **Time to PRD**: Tempo per avere PRD approvato
- **Architecture iterations**: Cicli di revisione architettura (target: ≤2)
- **Design validation score**: % utenti che completano flow critici (target: ≥90%)

### Coding Phase Metrics
- **Code churn**: Modifiche post-merge (target: ≤15%)
- **Test coverage**: % copertura test (target: ≥80%)
- **Bug escape rate**: Bug in produzione (target: ≤5%)
- **Security score**: Vulnerabilità High/Critical (target: 0)

### Overall System Metrics
- **Planning/Coding ratio**: Tempo pianificazione vs codifica (target: 90/10)
- **Rework percentage**: % tempo speso in correzioni (target: ≤10%)
- **Time to market**: Giorni da idea a MVP (target: baseline -40%)

---

## QUANDO USARE QUESTO SISTEMA

### ✅ USA QUESTO SISTEMA SE:
- Stai costruendo un **nuovo feature** medio/grande
- Vuoi evitare di **bloccarti per settimane** su bug
- Hai bisogno di **allineamento** tra team/stakeholder
- Vuoi **documentazione tracciabile** delle decisioni
- Stai facendo **refactoring architetturale**

### ❌ NON USARE SE:
- Fix urgente di un bug critico in produzione (usa fix diretto)
- Piccola modifica UI (1 componente, <1h lavoro)
- Esperimento rapido "throw-away"
- Hotfix di sicurezza (priorità assoluta)

---

## QUICK START - PRIMI PASSI

### Step 0: Attiva Agente 0 (Orchestratore)
```bash
# Usa il prompt dedicato all'Agente 0
Production/Last_Info/Multi agent/Prompt_Inizio_Agenti/Agente 0.md
```

**Task iniziale**: "Interpreta la richiesta e genera il prompt operativo per l'agente corretto."

### Step 1: Avvia Agente 1 (Product Strategy Lead)
```bash
# Usa il prompt dedicato
./prompts/AGENT_1_PRODUCT_STRATEGY.md
```

**Task iniziale**: "Trasforma la mia idea in un MVP brief"

### Step 2: Attendi Handoff
Agente 1 produrrà:
- One-Page MVP Brief
- Roadmap trimestrale
- Backlog prioritizzato

### Step 3: Valida Quality Gate
Verifica:
- [ ] PRD è completo
- [ ] Metriche definite
- [ ] 0 ambiguità critiche

### Step 4: Avvia Agente 2 (Systems Blueprint)
```bash
# Passa il PRD all'agente 2
./prompts/AGENT_2_SYSTEMS_BLUEPRINT.md
```

**E così via fino ad Agente 7...**

---

## RISORSE E DOCUMENTAZIONE

### File Prompts (Cartella: Prompt_Inizio_Agenti/)
- `AGENT_1_PRODUCT_STRATEGY.md` - Product Strategy Lead
- `AGENT_2_SYSTEMS_BLUEPRINT.md` - Systems Blueprint Architect
- `AGENT_3_EXPERIENCE_DESIGNER.md` - Experience & Interface Designer
- `AGENT_4_BACKEND.md` - Back-End Agent
- `AGENT_5_FRONTEND.md` - Front-End Agent
- `AGENT_6_TESTING.md` - Testing Agent
- `AGENT_7_SECURITY.md` - Security & Risk Agent

### File di Supporto
- `HANDOFF_TEMPLATES.md` - Template handoff tra agenti
- `QUALITY_GATES_CHECKLIST.md` - Checklist quality gates
- `MIGRATION_PLAN.md` - Piano migrazione dal sistema attuale

---

## PRINCIPI DI ORCHESTRAZIONE (Da Ricerca 2025)

### 1. Sequential Orchestration
Gli agenti lavorano in **sequenza controllata**:
- Agente N inizia solo quando Agente N-1 ha completato
- Nessun "salto in avanti" senza approvazione

### 2. Dynamic Handoff
Se un agente scopre problemi critici:
- Può fare **handoff indietro** all'agente precedente
- Esempio: Frontend trova API mancante → torna a Backend

### 3. Group Chat per Review
In momenti critici (es. architectural decision records):
- **Tutti gli agenti** possono commentare
- Decisioni prese in modalità consenso

### 4. Human-in-the-Loop Gates
Su decisioni strategiche:
- Sistema si ferma e chiede approvazione umana
- Esempi: scelta database, cambio architettura, privacy policy

#### Stop-and-Ask Policy (valida per TUTTI gli agenti, in ogni fase)
- Se mancano elementi per completare il task, se qualcosa non è chiaro, o se il comportamento osservato non corrisponde a quanto previsto: **FERMARSI IMMEDIATAMENTE** e **chiedere all’utente**.
- Non inventare soluzioni o assunzioni non confermate.
- Aprire una “Richiesta Dati Mancanti” e **rielaborare la checklist/Handoff** con le nuove informazioni prima di procedere.

#### Real Data Alignment (RDA)
- Ogni handoff deve includere la sezione "10 Conferme Veloci" con valori reali dell’app (no placeholder, no esempi).
- Nessun file operativo (API client, test, componenti) deve usare URL, cookie o header fittizi.
- Se un valore non è noto, marcarlo come BLOCCANTE e fermare lo step finché definito.

---

## PROSSIMI PASSI

1. **Leggi** le spec dettagliate di ogni agente (sezione successiva)
2. **Studia** il piano di migrazione dal tuo sistema attuale
3. **Copia** i 7 prompt operativi pronti all'uso
4. **Inizia** con Agente 1 per il tuo prossimo feature

---

## MODALITÀ CATENA CON FASE DI PLANNING OBBLIGATORIA (0 → 1 → 2 → 3 → [4 → 5 → 6 → 7])

### Regole di Flusso
- Innesco: sempre tramite **Agente 0** (orchestratore).
- Input unificato per ogni avvio: 3 file forniti dall'utente o preparati da Agente 0
  1) **Skills da usare** (es. `.cursor/rules/Skills-agent-1-product-strategy.md`)
  2) **Prompt agente di inizio conversazione** (es. `Production/Last_Info/Multi agent/Prompt_Inizio_Agenti/Agente 1.md`)
  3) **Richiesta utente** (file `.md` dedicato con contesto e obiettivi)
- Fase Planning obbligatoria: la richiesta passa SEMPRE da **Agente 1 (Product)** → **Agente 2 (Systems)** → **Agente 3 (Experience)** prima di qualsiasi implementazione.
- Conferma umana: obbligatoria dopo Agente 3 e prima dell’avvio degli agenti 4–7.
- Output per agente: ogni agente produce il proprio output in `Production/Sessione_di_lavoro/Agente_{N}/{YYYY-MM-DD}/` con naming `{slug_richiesta}_step{N}_agent{N}_v{Z}.md` + eventuali allegati.
- Handoff package: ogni agente riceve il file dell’agente precedente + allegati e produce un **pacchetto di handoff** standardizzato.
- Handoff indietro: permesso su ambiguità CRITICAL o prerequisiti mancanti; l’orchestratore coordina il rientro.
- Nessun limite di tempo per agente.

### Formato Handoff (input per ogni agente)
- File: `handoff_step{N-1}_to_step{N}.md`
- Contenuti minimi:
  - Richiesta utente (riassunto 1–3 righe)
  - Artefatti inclusi (link ai file: skills, prompt, output precedente)
  - Obiettivo di questo step (DoD atteso)
  - Vincoli/Assunzioni note
  - Domande aperte

### Formato Output standard per agente
1) Analisi sintetica (delta rispetto allo step precedente; allineamento con app/stack)
2) Modifiche/Upgrade proposti (azioni puntuali ordinate; dipendenze)
3) Rischi & Mitigazioni (lista)
4) Impatti (UX, BE/DB, FE, Test, Security, Performance)
5) Definition of Done per lo step (checklist verificabile)
6) Handoff Instructions → prossimo agente (cosa fare; artefatti richiesti)
7) Allegati/Link (file generati, spec, diagrammi)

### Quality Gates obbligatori (per Planning 1→2→3)
- Gate 1 (Product → Systems):
  - ✅ PRD/Brief completo e coerente con la richiesta
  - ✅ Metriche di successo definite
  - ✅ Ambiguità “CRITICAL” = 0 (o note con handoff indietro)
- Gate 2 (Systems → Experience):
  - ✅ Diagramma alto livello + API Spec versionati con trade-off
  - ✅ Vincoli tecnici espliciti (scalabilità, sicurezza, performance)
  - ✅ Mappatura impatti su aree dell’app
- Gate 3 (Experience → Conferma Umana):
  - ✅ User stories, wireframe/walkthrough, design tokens/linee guida
  - ✅ Task success stimato ≥90% sui flow critici
  - ✅ Rischi UX noti e mitigazioni
  - ✅ Pronto per prompt operativo ad agenti 4–7
  - ✅ Allineamento utente confermato (scope, metriche, priorità P0/P1)
  - ✅ Esempi concreti raccolti: 1 caso “OK” e 1 caso “NO” per calibrare test/UX
  - ✅ "Conferma Umana – Allineamento Utente (Planning Gate)" salvata nell’handoff con firma/data

### Prompt Operativi (estratto)
- Agente 0 (Orchestratore): normalizza richiesta, crea handoff package per Agente 1, imposta priorità, traccia cartelle/data; valida gates e gestisce conferma umana.
- Agente 1 (Product): produce PRD/MVP brief, scope vs no‑scope, metriche; prepara handoff per Systems.
- Agente 2 (Systems): produce system diagram + API Spec + trade‑off + impatti; prepara handoff per Experience.
- Agente 3 (Experience): produce user stories + wireframe/walkthrough + token/linee guida; propone prompt operativo per 4–7 e attende conferma umana.

---

## CHECKLIST ORCHESTRATA (DALLA RICHIESTA AL CODICE)

### Obiettivo
Trasformare la richiesta in chat (linguaggio naturale) in azioni eseguibili sul codice, con una checklist che evolve a ogni agente fino all'implementazione sicura.

### Artefatti
- Checklist_v0 (Agente 0): generica, mappa cosa/dove/perché sul repo.
- Checklist_v1 (Agente 1): scope, metriche, rischi (Product).
- Checklist_v2 (Agente 2): API, schema dati, impatti (Systems).
- Checklist_v3 (Agente 3): stories, UX, componenti (Experience).
- Checklist Planning Consolidata: somma v1+v2+v3, delimita micro-area di lavoro.
- Checklist_v4/v5/v6/v7: esecuzione BE/FE, test, sicurezza.

### Agent-Ready Task Brief
- Ogni agente genera il file del prossimo agente in: `Production/Sessione_di_lavoro/Agente_{N+1}/{YYYY-MM-DD}/Brief_to_Agente{N+1}.md`
- Il brief è linkato nell'handoff e nel README della sessione.
- Se tutte le info per il prossimo step sono complete, l'agente deve **inviare in chat all'utente** un prompt pronto‑da‑copiare per il prossimo agente (contesto, file da leggere, DoD, percorso di output). Se non complete, aprire "Richiesta Dati Mancanti" all'utente.

### Percorso ufficiale della Checklist condivisa (Neo)
- La `Checklist Planning Consolidata` è salvata anche in una posizione centrale per rapida consultazione:
  - `Production/Sessione_di_lavoro/Neo/{YYYY-MM-DD}/Checklist_Planning_Consolidata.md`
  - Questa copia è quella che gli agenti firmano e che l'utente usa per verificare approvazioni.

### Domande Obbligatorie (per tutti gli agenti)
1. È questo il file/funzione da cambiare? (percorso + 1-2 esempi d'uso)
2. Confermi le interazioni con il resto dell'app? (lista breve)
3. Procediamo su questa micro-area per prima? (Sì/No)

### Policy dati mancanti
Se un agente implementatore (4/5) non ha tutte le info, blocca l'azione, apre “Richiesta Dati Mancanti” all'utente e coordina con l'agente precedente per reperire i dati dal codice. Si procede solo a prerequisiti soddisfatti.

**Ricorda**: Il sistema è progettato per **prevenire problemi**, non solo per **reagire** ad essi. Investi tempo nella pianificazione, risparmierai settimane di debugging.

---

*Documento generato in base a best practices 2025 di Microsoft Agent Framework, AutoGen, CrewAI e Azure AI Agent Orchestration Patterns.*
