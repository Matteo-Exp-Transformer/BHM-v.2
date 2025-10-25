# 📚 NEO - INIZIO LAVORO MULTI-AGENT

> **Purpose**: Contesto essenziale per iniziare sessioni multi-agent
> **Owner**: Neo (Agente 0) - Orchestrator
> **Updated**: 2025-10-24

---

## 🎯 COME USARE QUESTA CARTELLA

**All'inizio di ogni sessione multi-agent**:
1. Leggi **CORE_ESSENTIALS.md** → Contesto rapido app
2. Leggi **MASTER_TRACKING.md** → Stato corrente progetto
3. Leggi **SHARED_STATE.json** → Verifiche in corso/completate
4. Leggi **AGENT_COORDINATION.md** → Regole coordinamento

**Se devi verificare componenti**:
- **VERIFICATION_PROTOCOL.md** → Processo standard 5 step
- **FILE_PATH_REGISTRY.md** → Path ufficiali componenti
- **ISTRUZIONI_SHARED_STATE.md** → Come aggiornare SHARED_STATE.json
- **CENTRAL_VERIFICATION_LOG.md** → Storico verifiche

**Se coordini sviluppo**:
- **DEVELOPMENT_QUALITY_CHECKLIST.md** → Prevenire errori comuni
- **TESTING_STANDARDS.md** → Standard test

---

## 📋 FILE DI CONTESTO (Read Order)

### 1. CORE_ESSENTIALS.md
**Tipo**: Context - Quick Reference
**Quando**: Sempre (inizio sessione)
**Contiene**:
- Stack tecnologico (React 18, TypeScript, Supabase)
- Aree principali app (Auth, Onboarding, Dashboard)
- Priorità correnti (P0/P1/P2/P3)
- Branch attivo (NoClerk)

---

### 2. MASTER_TRACKING.md
**Tipo**: Context - Project Status
**Quando**: Sempre (inizio sessione)
**Contiene**:
- Stato corrente progetto
- Ultimi commit significativi
- Decisioni utente recenti
- Task completate/in corso
- Prossimi obiettivi

---

### 3. SHARED_STATE.json
**Tipo**: State - Single Source of Truth
**Quando**: Sempre (prima di ogni verifica)
**Contiene**:
- `verifications_in_progress`: Chi sta verificando cosa
- `verified_components`: Risultati verifiche (VERIFIED/DOUBLE_VERIFIED/FAILED)
- `discrepancies`: Contraddizioni tra agenti
- `planning_alignment`: Link a planning files e decisioni utente

**IMPORTANTE**: Leggi PRIMA di verificare per evitare lavoro duplicato

---

### 4. AGENT_COORDINATION.md
**Tipo**: Protocol - Coordination Rules
**Quando**: Sempre (inizio sessione)
**Contiene**:
- Ruoli agenti (Chi fa cosa)
- Protocollo comunicazione
- VERIFICATION SYSTEM v2.0 (5 regole mandatory)
- Lock mechanism (FIFO queue)
- Discrepancy protocol

---

### 5. VERIFICATION_PROTOCOL.md
**Tipo**: Protocol - Standard Process
**Quando**: Prima di ogni verifica componente
**Contiene**:
- PRE-VERIFICATION CHECKLIST (5 item)
- Processo 5 STEP:
  1. Check Existing State (1 min)
  2. Acquire Lock (30 sec)
  3. Execute Verification (5-10 min)
  4. Record Result (2 min)
  5. Request Confirmation (30 sec)
- Alignment con planning files
- Discrepancy protocol
- Coverage requirements

**IMPORTANTE**: Seguire TUTTI i 5 step, no eccezioni

---

### 6. FILE_PATH_REGISTRY.md
**Tipo**: Registry - Official Paths
**Quando**: Prima di testare qualsiasi componente
**Contiene**:
- Path ufficiali per OGNI componente
- Test path, test count, command esatto
- Aliases (nomi alternativi)
- Deprecated paths (da NON usare)

**ESEMPIO**:
```markdown
### RememberMeService
OFFICIAL PATH: src/services/auth/RememberMeService.ts
TEST PATH: src/services/auth/__tests__/RememberMeService.test.ts
TEST COUNT: 15 tests
COMMAND: npm test -- RememberMeService.test.ts
```

**IMPORTANTE**: Usa SOLO path da questo registry (elimina ambiguità)

---

### 7. ISTRUZIONI_SHARED_STATE.md
**Tipo**: Manual - How-To Guide
**Quando**: Quando devi aggiornare SHARED_STATE.json
**Contiene**:
- STEP 1: Read Current State
- STEP 2: Add Lock
- STEP 3: Execute Tests
- STEP 4: Record Result
- STEP 5: Request Confirmation (Agente_9)
- Validation checklist
- Common cases
- Planning alignment rules

**IMPORTANTE**: Fase 1 = manual editing. Fase 2 = automation (future)

---

### 8. CENTRAL_VERIFICATION_LOG.md
**Tipo**: Log - Historical Record
**Quando**: Dopo ogni verifica (append entry)
**Contiene**:
- Storico append-only di tutte le verifiche
- Timestamp, agent, component, result
- Git commit, branch
- Planning reference, user decision

**IMPORTANTE**: Append at TOP (newest first). Non modificare entry esistenti.

---

### 9. DEVELOPMENT_QUALITY_CHECKLIST.md
**Tipo**: Checklist - Error Prevention
**Quando**: Prima di ogni report sviluppo
**Contiene**:
- 5 errori comuni (con fix)
- Banned phrases ("MISSIONE COMPLETATA", "coverage sconosciuto")
- Mandatory pre-report checklist
- Report template corretto

**ESEMPI ERRORI**:
- ❌ "MISSIONE COMPLETATA" con test falliti
- ❌ "coverage sconosciuto" (invece di verificare)
- ❌ "probabilmente funziona" (invece di testare)

---

### 10. TESTING_STANDARDS.md
**Tipo**: Standards - Test Requirements
**Quando**: Prima di scrivere/verificare test
**Contiene**:
- Standard test per area (Auth, Onboarding, Services)
- Coverage requirements (>80%)
- Test types richiesti (funzionale, validazione, accessibility, edge cases)
- Alignment con planning

---

## 🚀 WORKFLOW STANDARD

### Inizio Sessione Multi-Agent
```bash
# 1. Read context
Read: CORE_ESSENTIALS.md
Read: MASTER_TRACKING.md
Read: SHARED_STATE.json
Read: AGENT_COORDINATION.md

# 2. Identify task
- Quale componente?
- Chi deve lavorarci? (assegna agente)
- Planning file reference?
- User decision reference?

# 3. Brief agents
- Passa contesto necessario
- Specifica file da leggere
- Specifica output atteso
```

### Durante Verifica Componente
```bash
# 1. Pre-verification
Read: SHARED_STATE.json (check if already done)
Read: FILE_PATH_REGISTRY.md (get official path)
Read: VERIFICATION_PROTOCOL.md (follow 5-step process)

# 2. Execute
Follow VERIFICATION_PROTOCOL.md exactly

# 3. Record
Update: SHARED_STATE.json
Append: CENTRAL_VERIFICATION_LOG.md
Commit: git add + commit + push
```

### Fine Sessione
```bash
# 1. Update tracking
Update: MASTER_TRACKING.md (session results)
Update: SHARED_STATE.json (if needed)

# 2. Archive reports
Move agent reports to: Production/Sessione_di_lavoro/Agente_X/YYYY-MM-DD/

# 3. Commit session
git add Production/Sessione_di_lavoro/
git commit -m "session: YYYY-MM-DD - [brief summary]"
```

---

## ⚠️ REGOLE CRITICHE

### SEMPRE:
- ✅ Leggi SHARED_STATE.json prima di verificare
- ✅ Usa path da FILE_PATH_REGISTRY.md
- ✅ Segui VERIFICATION_PROTOCOL.md (5 step)
- ✅ Richiedi double-verification (Agente_9)
- ✅ Allinea con planning files
- ✅ Aggiorna CENTRAL_VERIFICATION_LOG.md

### MAI:
- ❌ Verificare senza check SHARED_STATE.json
- ❌ Usare path non nel registry
- ❌ Saltare step del protocol
- ❌ Approvare senza double-verification
- ❌ Ignorare planning alignment
- ❌ Usare nomi vaghi ("Step 2" → usa "BusinessInfoStep")

---

## 📞 QUICK REFERENCE

**Single Source of Truth**: SHARED_STATE.json
**Official Paths**: FILE_PATH_REGISTRY.md
**Standard Process**: VERIFICATION_PROTOCOL.md (5 step)
**Coordination Rules**: AGENT_COORDINATION.md
**Error Prevention**: DEVELOPMENT_QUALITY_CHECKLIST.md

**Confirmation Agent**: Agente_9 (sempre)
**Lock Timeout**: 3 minuti
**Coverage Required**: >80% (da planning)

---

**Last Updated**: 2025-10-24
**Maintained by**: Neo (Agente 0)
**Location**: Production/Sessione_di_lavoro/Neo/Inizio_Lavoro/
**Original Files**: Production/Last_Info/Multi agent/ (source of truth)
