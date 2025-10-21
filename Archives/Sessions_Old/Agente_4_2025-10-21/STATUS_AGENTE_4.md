# 🚀 AGENTE 4 - BACKEND AGENT - STATUS

**Data**: 2025-10-21  
**Agente**: 4 - Backend Agent (Supabase + Edge Functions)  
**Status**: 🟢 PRONTO E OPERATIVO  
**Skills**: `.cursor/rules/Skills-agent-4-backend.md`

---

## 📋 IDENTITÀ CONFERMATA

✅ **Panoramica Sistema**: Letta e compresa  
✅ **Skills File**: Caricato e attivo  
✅ **Cartella Lavoro**: Creata (`Production/Sessione_di_lavoro/Agente_4/2025-10-21/`)  
✅ **Handoff Templates**: Studiati  
✅ **Metodologia Tracking**: Compresa  

---

## 🎯 MISSIONE PRINCIPALE

**Implementare l'infrastruttura server-side robusta, sicura, performante e testata** basandomi sulle specifiche di:
- **Agente 2** (Systems Blueprint): API specs, DB schema, ADR
- **Agente 3** (Experience Designer): User stories, validation rules, acceptance criteria

### Responsabilità Core
1. ✅ **Database Implementation**: Migrations SQL, tabelle, indici, vincoli
2. ✅ **Row-Level Security (RLS)**: Policies multi-tenant con company_id isolation
3. ✅ **API Development**: Supabase Edge Functions (TypeScript/Deno)
4. ✅ **Business Logic**: Validazione HACCP, regole business, calcoli
5. ✅ **Testing**: Unit tests (≥80% coverage), integration tests
6. ✅ **Performance**: Query optimization, p95 latency <300ms
7. ✅ **Documentation**: API docs, migration guides, code comments

---

## 📊 STATO ATTUALE PROGETTI

### ✅ Progetto Login Hardening (2025-10-20)
- **Status**: ✅ COMPLETATO da tutti gli agenti (4, 5, 6, 7)
- **Handoff ricevuto**: `Agente_3/2025-10-20/HANDOFF_TO_AGENTE_4_5.md`
- **Deliverables**: Edge Functions, Database schema, RLS policies, Testing
- **Quality Gate**: ✅ PASSED

### 🟡 Nuovo Lavoro Blindaggio Componenti (2025-10-21)
- **Status**: 🟡 IN ATTESA DI HANDOFF
- **Progetto**: Blindaggio completo componenti app
- **Handoff atteso**: Da Agente 2 o Agente 3 per nuova feature
- **Prossimo step**: Attendere richiesta specifica

---

## 🔧 CAPACITÀ TECNICHE

### Stack Primario
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Language**: TypeScript/Deno
- **Database**: PostgreSQL con RLS
- **Testing**: Deno Test, Vitest
- **Security**: CSRF, Rate Limiting, Audit Logging

### Competenze Specialistiche
- ✅ **Supabase Edge Functions**: TypeScript/Deno development
- ✅ **PostgreSQL**: Schema design, RLS policies, performance optimization
- ✅ **Multi-tenant Architecture**: Company-based data isolation
- ✅ **Security Implementation**: CSRF, rate limiting, session management
- ✅ **API Development**: RESTful APIs, validation, error handling
- ✅ **Testing**: Unit, integration, performance testing
- ✅ **Documentation**: API docs, technical specifications

---

## 🚨 ANTI-FALSI POSITIVI

### Verifiche Obbligatorie per ogni test:
1. ✅ **Verifica DB reale**: Query effettive su database
2. ✅ **Verifica API reale**: Chiamate HTTP effettive
3. ✅ **Verifica RLS reale**: Test isolation multi-tenant
4. ✅ **Verifica Performance reale**: Misurazioni latenza effettive
5. ✅ **Verifica Edge Cases reali**: Test scenari limite

### Regola d'Oro
Ogni test deve avere almeno 2 verifiche:
1. **Verifica risultato** (quello che si aspetta)
2. **Verifica controprova** (DB, API, o altra fonte di verità)
3. **Log verifica** (per debugging e trasparenza)

---

## 📁 STRUTTURA CARTELLA LAVORO

```
Production/Sessione_di_lavoro/Agente_4/2025-10-21/
├── STATUS_AGENTE_4.md                    ← Questo file
├── [FEATURE]_schema.sql                  ← Migration SQL
├── edge-functions/                       ← Edge Functions
│   ├── [feature]-create/
│   ├── [feature]-list/
│   ├── [feature]-get/
│   ├── [feature]-update/
│   ├── [feature]-delete/
│   └── shared/
│       ├── types.ts
│       ├── validation.ts
│       ├── errors.ts
│       └── business-logic.ts
├── API_DOCUMENTATION.md                  ← API docs
├── PERFORMANCE_ANALYSIS.md              ← Performance metrics
└── HANDOFF_TO_AGENTE_5.md              ← Handoff per frontend
```

---

## 🎯 DOMANDE OBBLIGATORIE

Prima di iniziare qualsiasi lavoro, devo chiedere all'utente:

1. **È questo il file/funzione che intendi modificare?** (percorso + esempio d'uso)
2. **Confermi che queste interazioni con il resto dell'app sono rilevanti?** (lista breve)
3. **Procediamo su questa micro-area per prima?** (Sì/No)

---

## 🚨 STOP-AND-ASK POLICY

Se mancano dettagli su API/DB/RLS o i vincoli non sono chiari:
- ❌ **NON inventare** soluzioni
- ✅ **Fermarsi subito** e chiedere chiarimenti
- ✅ **Aprire "Richiesta Dati Mancanti"** all'utente
- ✅ **Aggiornare handoff/checklist** con le risposte prima di procedere

---

## 📞 COMUNICAZIONE

### Output Standard
Al completamento di ogni task, genero:
- ✅ **Brief_to_Agente5.md** in `Production/Sessione_di_lavoro/Agente_5/{YYYY-MM-DD}/`
- ✅ **Messaggio di completamento** con deliverable e metriche
- ✅ **Aggiornamento README_SESSIONE.md**

### Chiusura Standard
```
✅ Backend completato. Invio ad Agente 5 per UI?
```

---

**🎯 Status**: 🟢 PRONTO E OPERATIVO - In attesa di handoff o richiesta specifica

**📅 Ultimo aggiornamento**: 2025-10-21  
**👤 Autore**: Agente 4 - Backend Agent  
**🔗 Skills**: `.cursor/rules/Skills-agent-4-backend.md`
