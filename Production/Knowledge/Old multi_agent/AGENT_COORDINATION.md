# 🤝 AGENT COORDINATION - Pool Host, Lock, Queue

> **FILE ESSENZIALE**: Pool host/porte, lock system, queue FIFO, dipendenze agenti
> **Tempo lettura**: 4-6 minuti

---

## 🏊 POOL HOST E PORTE

### Configurazione Pool
```
Pool 1 (Porta 3000): Priorità ALTA
- Agente 1 (UI Base)
- Agente 4 (Calendario) - se 3000 libero

Pool 2 (Porta 3001): Priorità MEDIA
- Agente 2 (Forms/Auth)

Pool 3 (Porta 3002): Priorità BASSA / Overflow
- Agente 3 (Business Logic)
- Agente 5 (Navigazione)
```

### Avvio Multi-Istanza
```bash
# Avvia tutte le porte contemporaneamente
npm run dev:multi

# Oppure manualmente:
npm run dev:agent1 &  # Porta 3000
npm run dev:agent2 &  # Porta 3001
npm run dev:agent3 &  # Porta 3002
```

### Rilevamento Porte
```bash
# Trova porta app BHM
npm run detect:port

# Lista tutte le porte
npm run detect:all

# Trova porte libere
npm run detect:free

# Monitor real-time
npm run detect:monitor
```

---

## 🔒 LOCK SYSTEM

### Acquisizione Lock
```javascript
// Automatico con test:agent scripts
npm run test:agent1  // ✅ Acquisisce lock agent-1 su host 3000

// Lock manager interno usa:
// - locks/agent-1-3000.lock (file lock)
// - Heartbeat ogni 5s
// - Timeout 10 min senza heartbeat → auto-release
```

### Status Lock
```bash
# Verifica lock attivi
npm run lock:status

# Output:
# 🔒 Lock Attivi:
#   - agent-1 @ host-3000 (attivo da 5min)
#   - agent-2 @ host-3001 (attivo da 2min)
```

### Cleanup Lock Stale
```bash
# Rilascia lock vecchi/morti
npm run lock:cleanup

# Auto-cleanup se:
# - Lock > 10 min senza heartbeat
# - Processo PID morto
# - File .lock corrotto
```

### Monitor Lock Real-Time
```bash
npm run lock:monitor

# Output continuo:
# 🔍 Lock Monitor (refresh ogni 5s)
# ✅ agent-1 @ 3000 | Active | Last heartbeat: 2s ago
# ⏳ agent-2 @ 3001 | Waiting | Queue pos: #1
```

---

## 📋 QUEUE MANAGEMENT FIFO

### Come Funziona
```
1. Agente richiede lock su porta occupata
2. Entra in queue FIFO
3. Riceve stima tempo attesa
4. Quando lock libero → acquisisce automaticamente
5. Procede con test
```

### Esempio Queue
```bash
# Scenario: Porta 3000 occupata da Agent-1

$ npm run test:agent4
→ Agent-4 entra in queue per 3000
→ Posizione: #1
→ Tempo attesa stimato: 12 min
→ Polling ogni 10s

# Quando Agent-1 finisce:
→ Agent-4 acquisisce lock automaticamente
→ Inizia test
```

### Queue Status
```bash
npm run lock:monitor --watch

# Mostra:
# Queue (Porta 3000):
#   #1: agent-4 (attesa: 5min, stima residua: 7min)
#   #2: agent-1 (attesa: 2min, stima residua: 15min)
```

---

## 🔗 DIPENDENZE TRA AGENTI

### Grafo Dipendenze
```
Agente 1 (UI Base)
    ↓ dipende da
Agente 2 (Forms)
    ↓ dipende da
Agente 3 (Business Logic)
    ↓ dipende da
Agente 4 (Calendario)
    ↓ dipende da
Agente 5 (Navigazione)
```

### Dipendenze Critiche

#### Agente 1 → Agente 2
```javascript
// Agente 2 (Forms) RICHIEDE Agente 1 (UI Base) completato
// Componenti necessari:
- Button.tsx     ← usato in LoginForm
- Input.tsx      ← usato in tutti i form
- Modal.tsx      ← usato per conferme
- Alert.tsx      ← usato per errori
```

#### Agente 2 → Agente 3
```javascript
// Agente 3 (Business Logic) RICHIEDE Agente 2 (Forms) completato
// Componenti necessari:
- LoginForm           ← autenticazione per test
- CategoryForm        ← test validazioni categorie
- ConservationForm    ← test temperature constraints
```

#### Agente 3 → Agente 4
```javascript
// Agente 4 (Calendario) RICHIEDE Agente 3 (Business Logic) completato
// Logiche necessarie:
- TemperatureValidation   ← controlli calendar events
- HACCPRules             ← compliance calendar
- PermissionLogic        ← filtri eventi per ruolo
```

#### Agente 4 → Agente 5
```javascript
// Agente 5 (Navigazione) RICHIEDE Agente 4 (Calendario) completato
// Features necessarie:
- CalendarPage     ← routing /calendario
- EventModal       ← navigazione dettagli
- FilterSystem     ← state management globale
```

---

## 📢 PROTOCOLLO COMUNICAZIONE

### Quando Elemento È Blindato

**Step 1**: Aggiorna `MASTER_TRACKING.md`
```markdown
## Componenti Locked
- **ButtonComponent** - 🔒 LOCKED (2025-01-17)
  - File: src/components/ui/Button.tsx
  - Test: 30/30 passati
```

**Step 2**: Aggiorna `AGENT_STATUS.md`
```markdown
| Agente1 | UI Base | Button.tsx | ✅ Free | - | 0min |
```

**Step 3**: Commit
```bash
git commit -m "LOCK: Button.tsx - Blindatura completata

- Test: 30/30 (100%)
- Funzionalità: tutte le varianti, dimensioni, accessibility
- Preserva dati Precompila"
```

**Step 4**: Notifica altri agenti (se dipendenze)
```bash
# Se Agente 1 completa Button.tsx:
# → Notifica Agente 2 che può usare Button nei form
# → Update AGENT_STATUS.md
```

**Step 5**: Passa al prossimo elemento
```bash
# Segui sequenza in REGOLE_AGENTI
```

---

### Quando Si Trova Un Bug

**Step 1**: FERMA tutto
```bash
# ❌ Test fallito → STOP
```

**Step 2**: Aggiorna status "🔄 Bug Fix"
```markdown
| Agente2 | Forms | LoginForm | 🔄 Bug Fix | #2 | 15min |
```

**Step 3**: Documenta bug
```markdown
## BUG TROVATO: LoginForm email validation
- Descrizione: Email regex non valida caratteri Unicode
- Test fallito: test-validazione.spec.js:45
- Priorità: ALTA (blocca blindatura)
```

**Step 4**: Fix il bug
```javascript
// Fix applicato in LoginForm.tsx:123
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u  // ← Aggiunto flag 'u'
```

**Step 5**: Ri-testa TUTTO
```bash
npm run test:agent2
# ✅ Tutti i test devono passare
```

**Step 6**: Riprendi blindatura
```bash
# Aggiorna status a "✅ Blinded"
# Commit con messaggio LOCK
```

---

### Quando C'è Un Conflitto

**Scenario**: Due agenti modificano stesso file

**Step 1**: FERMA lavoro
```bash
# ⚠️ Conflitto rilevato
```

**Step 2**: Aggiorna status "⚠️ Conflitto"
```markdown
| Agente3 | Business | ⚠️ CONFLITTO | - | - | - |
```

**Step 3**: Identifica causa
```bash
# Esempio:
# Agent-2 modifica: src/hooks/useAuth.ts
# Agent-3 modifica: src/hooks/useAuth.ts
# → CONFLITTO
```

**Step 4**: Coordina risoluzione
```markdown
## COORDINAMENTO NECESSARIO
- Agent-2: completa modifiche useAuth
- Agent-3: aspetta Agent-2 finisca
- Merge manuale se necessario
```

**Step 5**: Verifica risoluzione
```bash
git status  # Nessun conflitto
npm run test:agent2
npm run test:agent3
# ✅ Entrambi passano
```

**Step 6**: Riprendi lavoro coordinato
```bash
# Update AGENT_STATUS
# Riprendi test
```

---

## 📊 METRICHE COORDINAMENTO

### Template Report Agente
```markdown
# REPORT AGENTE [Nome] - [Data]

## Stato Corrente
- Elemento corrente: [Nome]
- Test eseguiti: [X]/[Y]
- Tempo speso: [Xh Ym]
- Status: ✅ / 🔄 / ❌

## Lock Status
- Lock attivo: [host-porta]
- Acquisito: [timestamp]
- Heartbeat: OK / STALE

## Queue Status
- In queue: NO / SI (pos #X, wait Xmin)

## Dipendenze
- Waiting for: [Agente-X] completi [Componente-Y]
- Blockers: [Lista blocchi]

## Prossimi Step
1. [Azione 1]
2. [Azione 2]
```

---

## 🚨 GESTIONE ERRORI COORDINAMENTO

### Lock Non Acquisito (timeout)
```bash
# Problema: Lock non rilasciato dopo 10min
# Soluzione:
npm run lock:cleanup
npm run test:agent1  # Ri-prova
```

### Queue Bloccata
```bash
# Problema: Queue non avanza
# Soluzione:
npm run lock:monitor  # Identifica agente bloccato
npm run lock:cleanup  # Cleanup lock stale
# Verifica processo vite vivo:
ps aux | grep vite
```

### Conflitto Merge
```bash
# Problema: Git merge conflict
# Soluzione:
git status
git diff [file]
# Risolvi manualmente
git add [file]
git commit
```

### Deadlock Circolare
```bash
# Problema: Agent-1 aspetta Agent-2, Agent-2 aspetta Agent-1
# Soluzione:
npm run lock:cleanup  # Rilascia tutti i lock
# Riavvia sequenza corretta
npm run test:agent1  # Prima Agent-1
npm run test:agent2  # Poi Agent-2
```

---

## 🔧 CONFIGURAZIONE AVANZATA

### Timeout Customizzati
```javascript
// In agent-lock-manager.cjs:
const LOCK_TIMEOUT = 10 * 60 * 1000;  // 10 min default
const HEARTBEAT_INTERVAL = 5000;       // 5s default
const QUEUE_POLL_INTERVAL = 10000;     // 10s default
```

### Priorità Queue
```javascript
// FIFO di base, ma può essere overridden:
// Priorità ALTA: Agente 1, 2
// Priorità MEDIA: Agente 3, 4
// Priorità BASSA: Agente 5
```

### Max Workers Paralleli
```javascript
// playwright-agent1.config.ts:
workers: process.env.CI ? 1 : 2  // Max 2 worker paralleli
```

---

**Ultimo aggiornamento**: 2025-01-17
**Versione**: 2.0 (auto-cleanup + coordinamento avanzato)
**Manutenzione**: Questo file deve rimanere <150 righe
