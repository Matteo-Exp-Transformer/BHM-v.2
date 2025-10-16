# 🔄 ESEMPI WORKFLOW QUEUE - Scenari Pratici Multi-Agent

> **SCOPO**: Esempi concreti di come gli agenti interagiscono con il sistema queue e gestiscono conflitti

---

## 📋 SCENARI PRATICI

### **SCENARIO 1: Agente Trova Host Libero** ✅

**Situazione**: Agente-1 vuole testare Button component

**Workflow**:
```bash
# 1. Setup environment
node scripts/agent-setup.cjs agent-1

# 2. Acquisisce lock immediatamente
node scripts/agent-lock-manager.cjs acquire localhost:3000 agent-1 Button
# Output: ✅ Lock acquisito: agent-1 su localhost:3000 per Button

# 3. Esegue test
AGENT_PORT=3000 AGENT_ID=agent-1 npx playwright test "Production/Test/UI-Base/Button" -c playwright.config.unified.ts

# 4. Rilascia lock
node scripts/agent-lock-manager.js release localhost:3000
# Output: 🔓 Lock rilasciato: agent-1 da localhost:3000
```

**Risultato**: ✅ Test completato immediatamente, nessuna attesa

---

### **SCENARIO 2: Tutti Host Occupati - Entra in Queue** ⏳

**Situazione**: 
- Agente-1 su localhost:3000 (Button)
- Agente-2 su localhost:3001 (LoginForm)  
- Agente-3 su localhost:3002 (TemperatureValidation)
- Agente-4 vuole testare CalendarConfig

**Workflow Agente-4**:
```bash
# 1. Setup
node scripts/agent-setup.js agent-4

# 2. Tentativo lock fallisce
node scripts/agent-lock-manager.js acquire localhost:3000 agent-4 CalendarConfig
# Output: ❌ Lock già esistente su localhost:3000

# 3. Entra in queue
node scripts/agent-lock-manager.js queue agent-4 CalendarConfig
# Output: ⏳ Agente agent-4 in coda per CalendarConfig (posizione: 1)

# 4. Polling ogni 30s
while true; do
  sleep 30
  node scripts/agent-lock-manager.js acquire localhost:3001 agent-4 CalendarConfig
  if [ $? -eq 0 ]; then
    echo "✅ Lock acquisito dopo attesa!"
    break
  fi
done
```

**Risultato**: ⏳ Agente-4 in attesa, entra in queue FIFO

---

### **SCENARIO 3: Lock Stale Detectato - Cleanup Automatico** 🧹

**Situazione**: Agente-2 crasha, lock rimane attivo oltre 3 minuti

**Workflow**:
```bash
# 1. Monitor detecta lock stale
node scripts/queue-monitor.js
# Output: ⚠️ Lock stale su localhost:3001 (185s)

# 2. Cleanup automatico
node scripts/agent-lock-manager.js cleanup
# Output: 🧹 Lock stale rimosso: agent-2 da localhost:3001

# 3. Agente-4 può acquisire lock
node scripts/agent-lock-manager.js acquire localhost:3001 agent-4 CalendarConfig
# Output: ✅ Lock acquisito: agent-4 su localhost:3001 per CalendarConfig
```

**Risultato**: 🧹 Sistema si auto-ripara, deadlock evitato

---

### **SCENARIO 4: Timeout Queue - Escalation Emergenza** 🚨

**Situazione**: Agente-5 aspetta in queue da 10 minuti

**Workflow**:
```bash
# 1. Timeout raggiunto (10 minuti)
echo "⏰ Timeout attesa lock (10 minuti)"
echo "🚨 Uso host emergenza..."

# 2. Prova host emergenza (3002)
node scripts/agent-lock-manager.js acquire localhost:3002 agent-5 Navigation
# Output: ✅ Lock acquisito su host emergenza: localhost:3002

# 3. Esegue test su porta emergenza
AGENT_PORT=3002 AGENT_ID=agent-5 npx playwright test "Production/Test/Navigazione" -c playwright.config.unified.ts
```

**Risultato**: 🚨 Agente-5 usa host emergenza, test completato

---

### **SCENARIO 5: Setup Supabase Failed - Retry con Backoff** 🔄

**Situazione**: Connessione Supabase temporaneamente non disponibile

**Workflow**:
```bash
# 1. Setup fallisce
node scripts/agent-setup.js agent-1
# Output: ❌ Setup fallito per agent-1: Connection timeout

# 2. Retry con backoff
for attempt in 1 2 3; do
  echo "🔄 Tentativo $attempt/3..."
  sleep $((attempt * 5))  # 5s, 10s, 15s
  node scripts/agent-setup.js agent-1
  if [ $? -eq 0 ]; then
    echo "✅ Setup riuscito al tentativo $attempt"
    break
  fi
done

# 3. Se ancora fallisce, usa mock data
if [ $? -ne 0 ]; then
  echo "⚠️ Usando dati mock per continuare"
  # Continua con dati mock
fi
```

**Risultato**: 🔄 Sistema resiliente, retry automatico

---

### **SCENARIO 6: Bug Trovato Durante Test - Documentazione** 📝

**Situazione**: Agente-1 trova bug in Button component

**Workflow**:
```bash
# 1. Test identifica bug
AGENT_PORT=3000 AGENT_ID=agent-1 npx playwright test "Production/Test/UI-Base/Button"
# Output: ❌ Test falliti: 25/30 (5 test falliscono)

# 2. Documenta bug trovati
echo "📝 BUG-001: Button non gestisce stato disabled correttamente" >> .agent-locks/bugs-found.log
echo "📝 BUG-002: Button onClick non funziona con keyboard navigation" >> .agent-locks/bugs-found.log

# 3. Aggiorna tracking
echo "🔄 Testing (bug trovati)" >> Production/Knowledge/MASTER_TRACKING.md

# 4. Rilascia lock (NO fix durante test)
node scripts/agent-lock-manager.js release localhost:3000
# Output: 🔓 Lock rilasciato: agent-1 da localhost:3000

# 5. Informa utente per sessione fix dedicata
echo "ℹ️ Bug documentati, richiesta sessione fix dedicata"
```

**Risultato**: 📝 Bug documentati, NO fix durante test

---

### **SCENARIO 7: 100% Successo - Lock Componente** 🔒

**Situazione**: Agente-1 completa tutti i test Button con successo

**Workflow**:
```bash
# 1. Test completati con successo
AGENT_PORT=3000 AGENT_ID=agent-1 npx playwright test "Production/Test/UI-Base/Button"
# Output: ✅ Test completati: 30/30 (100%)

# 2. Applica lock componente
echo "// LOCKED: $(date) - Button componente blindata" >> src/components/ui/Button.tsx
echo "// Tutti i test passano, funzionalità verificata" >> src/components/ui/Button.tsx

# 3. Aggiorna tracking
echo "🔒 LOCKED" >> Production/Knowledge/MASTER_TRACKING.md

# 4. Rilascia lock host
node scripts/agent-lock-manager.js release localhost:3000

# 5. Passa a componente successiva
echo "⏭️ Prossimo: Input.tsx"
```

**Risultato**: 🔒 Componente blindata, agente passa al successivo

---

## 🎯 COMANDI UTILI PER AGENTI

### **Monitor Real-time**
```bash
# Dashboard completo
node scripts/queue-monitor.js --watch

# Stato specifico
node scripts/agent-lock-manager.js status localhost:3000
```

### **Gestione Lock**
```bash
# Acquisisci lock
node scripts/agent-lock-manager.js acquire localhost:3000 agent-1 Button

# Rilascia lock
node scripts/agent-lock-manager.js release localhost:3000

# Cleanup automatico
node scripts/agent-lock-manager.js cleanup
```

### **Workflow Completo**
```bash
# Setup + Test + Cleanup
./scripts/run-agent-tests.sh agent-1 3000 "Production/Test/UI-Base"
```

---

## 📊 METRICHE DI SUCCESSO

### **Efficienza Sistema**
- ✅ Lock acquisiti immediatamente: >80%
- ✅ Tempo attesa medio: <2 minuti
- ✅ Lock stale rimossi: 100%
- ✅ Deadlock evitati: 100%

### **Qualità Test**
- ✅ Test completati con successo: >95%
- ✅ Bug documentati correttamente: 100%
- ✅ Componenti blindate: incrementale
- ✅ Compliance database: 100%

---

**🎯 Questi scenari mostrano come il sistema gestisce automaticamente tutti i casi d'uso reali per il coordinamento multi-agent!**
