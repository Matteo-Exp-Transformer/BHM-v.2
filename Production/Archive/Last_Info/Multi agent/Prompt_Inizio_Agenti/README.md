# SISTEMA 7 AGENTI - Product Development Framework

> **Sistema Multi-Agent per Sviluppo Software Strategico**
> **Metodologia**: 90% Planning / 10% Coding
> **Versione**: 2.0 | **Data**: 20-10-2025

---

## QUICK START

### Per Iniziare un Nuovo Feature

1. **Leggi** → [00_PANORAMICA_SISTEMA_7_AGENTI.md](00_PANORAMICA_SISTEMA_7_AGENTI.md) (15 min)
2. **Usa** → [PROMPT_AGENT_1_PRODUCT_STRATEGY.md](PROMPT_AGENT_1_PRODUCT_STRATEGY.md)
3. **Segui** il flusso agente-per-agente fino ad Agente 7

### Avvio Standard (Model 1-2-3)

Per avviare un agente usa sempre tre input dichiarati nell'handoff:
1) **Skills file** (identità/regole dell'agente)
   - Esempio: `.cursor/rules/Skills-agent-1-product-strategy.md`
2) **Prompt file** (istruzioni operative iniziali)
   - Esempio: `Production/Last_Info/Multi agent/Prompt_Inizio_Agenti/Agente 1.md`
3) **Richiesta utente** (file `.md` con contesto, obiettivi, vincoli)

Template e naming: vedi [`HANDOFF_TEMPLATES.md`](HANDOFF_TEMPLATES.md)

### Conferma Umana obbligatoria alla fine del Planning (dopo Agente 3)
Prima di avviare Agenti 4–7:
- Poni le “Domande finali di allineamento” (scope, metriche/AC, priorità, esempi OK/NO)
- Registra la “Conferma Umana – Allineamento Utente (Planning Gate)” nel file di handoff
- Procedi al coding solo dopo conferma positiva

### Guide operative

- Blindatura Login (workflow per agenti): [`LOGIN_HARDENING_WORKFLOW.md`](LOGIN_HARDENING_WORKFLOW.md)

### Per Migrare dal Sistema Attuale

1. **Leggi** → [MIGRATION_PLAN.md](MIGRATION_PLAN.md)
2. **Segui** le 3 fasi: Allineamento → Re-prompting → Stabilizzazione

---

## STRUTTURA DOCUMENTAZIONE

### 📚 Documenti Principali (LEGGI QUESTI PRIMA)

| File | Descrizione | Tempo Lettura |
|------|-------------|---------------|
| [00_PANORAMICA_SISTEMA_7_AGENTI.md](00_PANORAMICA_SISTEMA_7_AGENTI.md) | Overview sistema, principi 90/10, flusso completo | 15 min |
| [MIGRATION_PLAN.md](MIGRATION_PLAN.md) | Piano migrazione dal sistema attuale (5 agenti → 7 agenti) | 20 min |

### 📋 Spec Dettagliate Agenti (RIFERIMENTO)

| File | Agente | Fase | Tempo Lettura |
|------|--------|------|---------------|
| [SPEC_AGENT_1_PRODUCT_STRATEGY.md](SPEC_AGENT_1_PRODUCT_STRATEGY.md) | Product Strategy Lead | Planning | 20 min |
| [SPEC_AGENT_2_SYSTEMS_BLUEPRINT.md](SPEC_AGENT_2_SYSTEMS_BLUEPRINT.md) | Systems Blueprint Architect | Planning | 20 min |
| [SPEC_AGENTS_3_TO_7_COMPLETE.md](SPEC_AGENTS_3_TO_7_COMPLETE.md) | Agenti 3-7 (UX, BE, FE, Test, Security) | Planning + Coding | 30 min |

### ⚡ Prompt Operativi (USA QUESTI)

| File | Agente | Quando Usare |
|------|--------|--------------|
| [PROMPT_AGENT_1_PRODUCT_STRATEGY.md](PROMPT_AGENT_1_PRODUCT_STRATEGY.md) | Product Strategy Lead | SEMPRE all'inizio di un nuovo feature |
| [PROMPT_ALL_AGENTS_2_TO_7.md](PROMPT_ALL_AGENTS_2_TO_7.md) | Agenti 2-7 (tutti) | Dopo aver completato Agente 1 |

---

## I 7 AGENTI - OVERVIEW

### PLANNING PHASE (90% del tempo)

#### 1️⃣ Product Strategy Lead
**Input**: Idea grezza, problema da risolvere
**Output**: MVP Brief, Roadmap, Backlog prioritizzato (RICE)
**KPI**: 0 ambiguità critiche, stakeholder approval

#### 2️⃣ Systems Blueprint Architect
**Input**: MVP Brief, feature list
**Output**: System Diagram, API Spec (OpenAPI), DB Schema
**KPI**: Diagrammi versionati, trade-off documentati

#### 3️⃣ Experience & Interface Designer
**Input**: System Blueprint, API Spec
**Output**: User Stories, Wireframe, Design Tokens
**KPI**: Task success ≥90% su flow critici

---

### CODING PHASE (10% del tempo)

#### 4️⃣ Back-End Agent
**Input**: API Spec, DB Schema, User Stories
**Output**: DB migrations, API endpoint, business logic
**KPI**: Test verdi, p95 latency <300ms

#### 5️⃣ Front-End Agent
**Input**: Wireframe, Design Tokens, API
**Output**: React components, routing, state management
**KPI**: LCP <2.5s, Accessibility AA, pixel-perfect

#### 6️⃣ Testing Agent
**Input**: Codice FE+BE, User Stories
**Output**: Suite test (unit, integration, E2E), coverage report
**KPI**: Coverage ≥80%, build blocker su test fail

#### 7️⃣ Security & Risk Agent
**Input**: Codice completo, dipendenze, infra
**Output**: Security checklist, vulnerability scan, fix PR
**KPI**: 0 vulnerabilità High/Critical, policy enforced

---

## FLUSSO COMPLETO (ESEMPIO)

### Feature: Sistema Notifiche Push

```
[User] → "Voglio notifiche push per task in scadenza"
   ↓
[Handoff] (Model 1-2-3)
  - Skills: .cursor/rules/Skills-agent-1-product-strategy.md
  - Prompt: Production/Last_Info/Multi agent/Prompt_Inizio_Agenti/Agente 1.md
  - Richiesta: Production/Sessione_di_lavoro/Agente_0/{DATA_CORRENTE}/notifiche-push.md
   ↓
[Agente 1] → MVP Brief (3 giorni)
   - Feature core: Notifiche task, alert scadenza, storico
   - Metrics: ≥70% notifiche lette entro 1h
   ↓
[Agente 2] → Architecture (2 giorni)
   - API: POST /api/notifications, GET /api/notifications
   - DB: notifications table + RLS policies
   - Tech decision: Web Push API (ADR)
   ↓
[Agente 3] → UX Design (2 giorni)
   - User stories: 5 stories con acceptance criteria
   - Wireframe: NotificationCenter, NotificationBadge
   - Design tokens: colors, spacing
   ↓
[Agente 4] → Backend (3 giorni)
   - DB migration: create_notifications_table.sql
   - API: Edge function notifications/index.ts
   - Tests: 15 unit test, 5 integration test
   ↓
[Agente 5] → Frontend (3 giorni)
   - Components: NotificationCenter, NotificationList
   - API client: fetchNotifications, markAsRead
   - State: useNotificationStore (Zustand)
   ↓
[Agente 6] → Testing (2 giorni)
   - E2E: 3 flow completi (receive → read → dismiss)
   - Unit: 12 component tests
   - Coverage: 85%
   ↓
[Agente 7] → Security (1 giorno)
   - Audit: OWASP checklist completed
   - Scan: npm audit (0 high vuln)
   - Fix: Rate limiting added (10 notif/min)
   ↓
✅ PRODUCTION READY (16 giorni totali)
```

---

## PRINCIPI FONDAMENTALI

### 1. Planning > Coding (90/10 Rule)
- **90% tempo**: Capire problema, progettare soluzione, validare con utenti
- **10% tempo**: Scrivere codice già progettato

**Risultato**: Meno bug, meno rework, time-to-market più veloce.

### 2. Handoff con Quality Gates
Ogni agente passa il testimone solo dopo **Definition of Done**:
- Artefatti obbligatori consegnati
- Criteri accettazione soddisfatti
- Rischi documentati + mitigazioni

### 3. Tracciabilità Completa
```
Requisito → Design → Implementazione → Test → Security → Deploy
```
Ogni decisione è collegata e documentata (ADR, PRD, User Stories).

### 4. Prevenzione > Reazione
Non "fixare bug dopo codifica", ma **prevenire bug prima di codificare**.

---

## METRICHE DI SUCCESSO

### Planning Phase
- **Time to PRD**: Giorni da idea a MVP Brief approvato
- **Architecture iterations**: Cicli revisione (target: ≤2)
- **Design validation**: % utenti che completano flow (target: ≥90%)

### Coding Phase
- **Code churn**: % modifiche post-merge (target: ≤15%)
- **Test coverage**: % copertura (target: ≥80%)
- **Bug escape rate**: Bug in produzione (target: ≤5%)

### Overall
- **Planning/Coding ratio**: 90/10
- **Rework %**: ≤10%
- **Time to market**: Baseline -40%

---

## QUANDO USARE QUESTO SISTEMA

### ✅ USA SE:
- Nuova feature medio/grande
- Vuoi evitare settimane di debugging
- Serve allineamento team/stakeholder
- Vuoi documentazione tracciabile
- Refactoring architetturale

### ❌ NON USARE SE:
- Hotfix urgente in produzione
- Piccola modifica UI (<1h)
- Esperimento "throw-away"
- Fix critico di sicurezza

---

## BEST PRACTICES

### Per Agenti
1. **Leggi sempre le spec** del tuo agente prima di iniziare
2. **Rispetta quality gates** (0 ambiguità, DoD completo)
3. **Documenta decisioni** (ADR, commit messages)
4. **Chiedi chiarimenti** se handoff non chiaro
5. **Timeboxing**: Non paralisi da analisi (1 settimana max per planning)

### Per Team Lead
1. **Monitora metriche** (dashboard mensile)
2. **Facilita handoff** (meeting brevi tra agenti)
3. **Retrospettive** (ogni 2 settimane)
4. **Celebra successi** (feature rilasciate senza bug)

---

## TROUBLESHOOTING

### "Il sistema è troppo lento, serve più velocità"
**Risposta**: Misura "rework time". Se cala del 50%, il planning sta pagando.

### "Gli agenti non seguono i prompt"
**Risposta**: Formazione (walkthrough esempi) + Pilot test con feature reale.

### "Quality gate troppo rigidi, nessuno avanza"
**Risposta**: Itera sui criteri DoD. Distingui MUST vs SHOULD.

### "Troppa documentazione, poco codice"
**Risposta**: Principio 80/20. Documenta solo decisioni critiche.

---

## RISORSE ESTERNE

### Framework & Tool
- **RICE Prioritization**: [Intercom Blog](https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/)
- **Jobs-to-be-done**: [JTBD.info](https://jtbd.info/)
- **OpenAPI Spec**: [Swagger Editor](https://editor.swagger.io/)
- **C4 Model**: [c4model.com](https://c4model.com/)
- **OWASP ASVS**: [OWASP.org](https://owasp.org/www-project-application-security-verification-standard/)

### Best Practices 2025
- Microsoft Agent Framework: [DevBlogs](https://devblogs.microsoft.com/foundry/)
- Azure AI Orchestration Patterns: [Microsoft Learn](https://learn.microsoft.com/en-us/azure/architecture/)
- AutoGen Multi-Agent Systems: [AutoGen Docs](https://microsoft.github.io/autogen/)

---

## SUPPORTO & CONTATTI

**Domande**:
- Consulta FAQ (in questa cartella)
- Team chat: #multi-agent-system
- Escalation: PM/Tech Lead

**Feedback**:
- Retrospettive mensili (calendario team)
- Proponi miglioramenti via PR
- Survey mensile (link in email)

---

## CHANGELOG

### v2.0 (2025-10-20) - Sistema 7 Agenti
- Aggiunto Agente 1 (Product Strategy Lead)
- Aggiunto Agente 2 (Systems Blueprint Architect)
- Aggiunto Agente 3 (Experience Designer)
- Rinominato Agenti 3-5 → Agenti 4-6
- Aggiunto Agente 7 (Security & Risk Agent)
- Metodologia 90/10 planning/coding
- Handoff pattern con quality gates

### v1.0 (Precedente) - Sistema 5 Agenti Blindatura
- Focus: Testing e blindatura componenti
- Agenti: UI Base, Forms, Business Logic, Calendario, Navigazione
- Metodologia: Reattiva (codice → test → fix)

---

## PROSSIMI PASSI

### Se Sei Nuovo
1. Leggi [00_PANORAMICA_SISTEMA_7_AGENTI.md](00_PANORAMICA_SISTEMA_7_AGENTI.md)
2. Walkthrough esempio (Calendario case study in panoramica)
3. Shadowing agente esperto (1 giorno)

### Se Migri dal Sistema Vecchio
1. Leggi [MIGRATION_PLAN.md](MIGRATION_PLAN.md)
2. Fase 1: Allineamento (1 settimana)
3. Fase 2: Pilot test (2 settimane)
4. Fase 3: Stabilizzazione (3-4 settimane)

### Per Primo Feature
1. Usa [PROMPT_AGENT_1_PRODUCT_STRATEGY.md](PROMPT_AGENT_1_PRODUCT_STRATEGY.md)
2. Segui step-by-step fino ad Agente 7
3. Documenta learnings per prossima feature

---

**Sistema progettato per**: Prevenire problemi, non solo reagire ad essi.

**Investi tempo nella pianificazione, risparmierai settimane di debugging.**

---

*Documentazione generata seguendo best practices 2025 di Microsoft Agent Framework, AutoGen, CrewAI, Azure AI Agent Orchestration Patterns.*

**Versione**: 2.0 | **Ultimo aggiornamento**: 2025-10-20
