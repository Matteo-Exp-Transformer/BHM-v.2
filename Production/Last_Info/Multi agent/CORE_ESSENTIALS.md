# 🎯 CORE ESSENTIALS - Quick Start Multi-Agent

> **FILE ESSENZIALE**: Setup iniziale, credenziali, comandi critici, regole NON negoziabili
> **Tempo lettura**: 3-5 minuti

---

## 🔑 CREDENZIALI E SETUP

### Supabase
```
URL: https://tucqgcfrlzmwyfadiodo.supabase.co
Project ID: tucqgcfrlzmwyfadiodo
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1Y3FnY2ZybHptd3lmYWRpb2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NTY0ODksImV4cCI6MjA3NTUzMjQ4OX0.7m3bdxW8QMHO6YNQ4cxoxlzzgzq7DjTzufv89YAcHA4
```

### Test User
```
Email: matteo.cavallaro.work@gmail.com
Password: cavallaro
```

### Porte App
```
Agent 1 (UI Base):         3000
Agent 2 (Forms):           3001
Agent 3 (Business Logic):  3002
```

---

## 🚀 COMANDI CRITICI (Top 10)

```bash
# 1. Pre-test validation (SEMPRE prima di test)
npm run validate:pre-test

# 2. Post-test cleanup (SEMPRE dopo test)
npm run cleanup:post-test

# 3. Avvia app multi-istanza
npm run dev:multi

# 4. Test con auto-cleanup (Agente 1-3)
npm run test:agent1
npm run test:agent2
npm run test:agent3

# 5. Lock status
npm run lock:status

# 6. Lock cleanup (se stale)
npm run lock:cleanup

# 7. Verifica DB stato
node scripts/check-db-state.cjs

# 8. Rileva porte disponibili
npm run detect:free
```

---

## ⚡ TOP 10 REGOLE NON NEGOZIABILI

### 1. **MAI modificare file con `// LOCKED:`**
```javascript
// LOCKED: 2025-01-16 - LoginForm blindata
// ❌ QUALSIASI modifica richiede unlock esplicito
```

### 2. **SEMPRE eseguire pre-test validation**
```bash
npm run validate:pre-test
# ❌ Se fallisce → NON procedere con test
```

### 3. **SEMPRE eseguire post-test cleanup**
```bash
npm run cleanup:post-test
# 🧹 Cleanup DB, lock, sessioni, temp files
```

### 4. **Preservare SEMPRE dati Precompila**
Whitelist NON rimuovere:
- Paolo Dettori (staff)
- Cucina, Bancone, Sala, Magazzino (departments)
- Frigo A, Freezer A (conservation points)

### 5. **Un solo agente per host/porta**
```
✅ Agent 1 → 3000
✅ Agent 2 → 3001
✅ Agent 3 → 3002
❌ MAI due agenti sulla stessa porta
```

### 6. **Lock automatico con test**
```bash
npm run test:agent1  # ✅ Auto-lock + auto-cleanup
npx playwright test  # ❌ NO lock, NO cleanup
```

### 7. **Aggiornare tracking dopo modifiche**
Files da aggiornare:
- `MASTER_TRACKING.md` (stato globale)
- `AGENT_STATUS.md` (coordinamento)
- File tracking specifico componente

### 8. **Seguire sequenza agenti**
```
OBBLIGATORIO:
1. Agente 1 (UI Base) → completa PRIMA
2. Agente 2 (Forms) → usa UI Base
3. Agente 3 (Business) → usa Forms
4. Agente 4 (Calendario) → usa Business
5. Agente 5 (Navigazione) → usa tutto
```

### 9. **Commit convention**
```bash
git commit -m "LOCK: ComponentName - Descrizione

- Test passati: X/X (100%)
- Funzionalità verificata
- Preserva dati Precompila"
```

### 10. **Se test falliscono → FERMA tutto**
```bash
❌ Test fallito
→ 1. Analizza causa
→ 2. Fixa problema
→ 3. Ri-esegui test
→ 4. Solo se 100% successo → procedi
```

---

## 📊 STATUS AGENTI CORRENTE

| Agente | Area | Status | Locked | Host |
|--------|------|--------|---------|------|
| **Agente 1** | UI Base | ✅ COMPLETATO | 19/19 | 3000 |
| **Agente 2** | Forms/Auth | ✅ COMPLETATO | 6/6 | 3001 |
| **Agente 3** | Business Logic | ⏳ IN ATTESA | 0/8 | 3002 |
| **Agente 4** | Calendario | 🔄 IN CORSO | 6/37 | 3000 |
| **Agente 5** | Navigazione | ✅ COMPLETATO | 8/8 | 3002 |

**Totale componenti locked**: 39/200+ (19.5%)

---

## 🔄 WORKFLOW BASE (5 STEP)

### Step 1: Pre-Test Validation
```bash
npm run validate:pre-test
# Verifica: Supabase, User, Company, Schema DB, Porte
```

### Step 2: Avvia App
```bash
npm run dev:agent1  # Porta 3000
# Oppure
npm run dev:multi   # Tutte le porte
```

### Step 3: Esegui Test con Lock
```bash
npm run test:agent1
# Auto-lock + auto-cleanup integrato
```

### Step 4: Post-Test Cleanup
```bash
npm run cleanup:post-test
# Cleanup DB + lock + sessioni
```

### Step 5: Aggiorna Tracking
```bash
# Aggiorna MASTER_TRACKING.md
# Aggiorna AGENT_STATUS.md
# Commit con messaggio LOCK
```

---

## 🚨 TROUBLESHOOTING RAPIDO

### Test falliscono: "Company non trovata"
```bash
# Soluzione: Imposta dev company
# 1. Apri browser console (F12)
# 2. Esegui: devCompanyHelper.setDevCompanyFromCurrentUser()
# 3. Ri-esegui npm run validate:pre-test
```

### Lock stale bloccano test
```bash
npm run lock:cleanup
```

### Porta già in uso
```bash
npm run detect:free  # Trova porte disponibili
# Oppure
pkill -f "vite.*--port"  # Killa processi vite
```

### DB "sporco" dopo test
```bash
npm run cleanup:post-test
# Verifica con:
node scripts/check-db-state.cjs
```

### GlobalSetup/Teardown non funziona
```bash
# Verifica file esistono:
ls scripts/pre-test-validation.cjs
ls scripts/post-test-cleanup.cjs

# Verifica in playwright config:
grep "globalSetup" playwright-agent1.config.ts
```

---

## 📂 STRUTTURA DIRECTORY CRITICA

```
BHM-v.2/
├── Production/
│   ├── Last_Info/Multi agent/
│   │   ├── CORE_ESSENTIALS.md       ← SEI QUI
│   │   ├── AGENT_COORDINATION.md    ← Pool host, lock, queue
│   │   └── TESTING_STANDARDS.md     ← Template test, checklist
│   ├── Reference/                   ← Consultazione on-demand
│   ├── Archive/                     ← Report storici
│   └── Test/                        ← Suite test
│       ├── UI-Base/
│       ├── Autenticazione/
│       ├── LogicheBusiness/
│       └── ...
├── scripts/
│   ├── pre-test-validation.cjs      ← Validation prima test
│   ├── post-test-cleanup.cjs        ← Cleanup dopo test
│   ├── agent-lock-manager.cjs       ← Lock system
│   └── check-db-state.cjs           ← Diagnostica DB
└── playwright-agent[1-5].config.ts  ← Configs con auto-cleanup
```

---

## 🎓 PROSSIMI STEP SUGGERITI

### Per nuovi agenti:
1. Leggi questo file (3-5 min)
2. Leggi `AGENT_COORDINATION.md` (lock/queue)
3. Leggi `TESTING_STANDARDS.md` (template test)
4. Esegui `npm run validate:pre-test`
5. Inizia testing seguendo sequenza

### Per debug:
1. Controlla `MASTER_TRACKING.md` (stato globale)
2. Controlla `AGENT_STATUS.md` (coordinamento)
3. Usa comandi diagnostica sopra
4. Se blocco critico → chiedi aiuto

---

**Ultimo aggiornamento**: 2025-01-17
**Versione**: 2.0 (auto-cleanup enterprise-grade)
**Manutenzione**: Questo file deve rimanere <200 righe
