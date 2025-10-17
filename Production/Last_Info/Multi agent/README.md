# 🤖 MULTI-AGENT SYSTEM - BHM v.2

> **SISTEMA COMPLETO** di coordinamento multi-agent per blindatura sistematica dell'app BHM v.2

---

## 📁 FILE ORGANIZZATI

### 🎯 File Principali
- **`AGENT_STATUS.md`** - Stato globale agenti e coordinamento
- **`REGOLE_AGENTI.md`** - Regole critiche NON NEGOZIABILI
- **`GUIDA_TESTING_MULTI_AGENT.md`** - Guida completa testing multi-agent
- **`WORKFLOW_BLINDATURA.md`** - Processo step-by-step blindatura
- **`MASTER_TRACKING.md`** - Tracking globale componenti

### 🚀 File Operativi
- **`QUICK_REFERENCE.md`** - Riferimento rapido per agenti
- **`SISTEMA_CONFIGURAZIONE.md`** - Configurazioni complete sistema

---

## 🎯 STATUS ATTUALE SISTEMA

### ✅ Sistema Operativo
- **3 istanze app attive**: 3000, 3001, 3002
- **Lock system funzionante**: 0/3 lock attivi (tutti liberi)
- **Auto-detect porte**: Operativo e testato
- **Configurazioni Playwright**: Blindate e funzionanti
- **Script npm**: Tutti operativi

### ⏳ Queue Attuale
- **agent-4** (CalendarConfig): Posizione #1, attesa 22h
- **agent-3** (TemperatureValidation): Posizione #2, attesa 12min

### 🎯 Agenti Pronti
- **Agente 1**: ✅ Può iniziare Button.tsx su porta 3000
- **Agente 2**: ✅ Può iniziare LoginForm su porta 3001  
- **Agente 5**: ✅ Può iniziare SyncStatusBar su porta 3002

---

## 🚀 COMANDI ESSENZIALI

### Verifica Sistema
```bash
npm run lock:status      # Stato lock system
npm run detect:all       # Verifica istanze app
npm run lock:monitor     # Monitor real-time
```

### Avvio Sistema
```bash
npm run dev:multi        # Avvio 3 istanze simultanee
```

### Test Agenti
```bash
npm run test:agent1      # Test Agente 1 (porta 3000)
npm run test:agent2      # Test Agente 2 (porta 3001)
npm run test:agent3      # Test Agente 3 (porta 3002)
```

---

## 📋 WORKFLOW AGENTI

### Prima di Iniziare
1. **Leggi** `AGENT_STATUS.md` per stato globale
2. **Leggi** `REGOLE_AGENTI.md` per regole critiche
3. **Verifica** porta assegnata e lock status
4. **Controlla** queue e dipendenze

### Durante il Lavoro
1. **Usa** lock system per coordinamento
2. **Aggiorna** `AGENT_STATUS.md` dopo ogni modifica
3. **Segui** sequenza obbligatoria elementi
4. **Comunica** con altri agenti per conflitti

### Dopo Completamento
1. **Blinda** elemento con `// LOCKED:`
2. **Aggiorna** tutti i file di tracking
3. **Notifica** altri agenti se necessario
4. **Passa** all'elemento successivo

---

## 🔒 REGOLE CRITICHE

### ❌ MAI FARE
- Modificare file con `// LOCKED:`
- Lavorare senza lock system
- Saltare test di validazione
- Usare dati mock senza verificare database

### ✅ SEMPRE FARE
- Consultare database Supabase prima di testare
- Aggiornare `AGENT_STATUS.md` dopo ogni modifica
- Usare lock system per coordinamento
- Testare con dati reali verificati

---

## 📊 METRICHE SISTEMA

### Performance Attuale
- **Lock Acquisition**: < 1 secondo
- **Port Detection**: < 5 secondi
- **Test Execution**: Configurabile (default 2 min)
- **Queue Processing**: FIFO automatico

### Configurazioni Blindate
- ✅ `scripts/start-multi-instance.cjs`
- ✅ `scripts/detect-app-port.cjs`
- ✅ `scripts/test-with-lock.cjs`
- ✅ `scripts/agent-lock-manager.cjs`
- ✅ `playwright-agent1.config.ts`
- ✅ `playwright-agent2.config.ts`
- ✅ `playwright-agent3.config.ts`
- ✅ `vite.config.ts`
- ✅ `package.json` (script npm)

---

## 🆘 SUPPORTO

### Se hai problemi:
1. **Leggi** `QUICK_REFERENCE.md` per soluzioni rapide
2. **Controlla** `SISTEMA_CONFIGURAZIONE.md` per configurazioni
3. **Verifica** `AGENT_STATUS.md` per stato globale
4. **Chiedi** chiarimenti all'utente

### Comandi di emergenza:
```bash
# Reset completo lock system
npm run lock:cleanup

# Riavvio sistema multi-istanza
npm run dev:multi

# Verifica stato generale
npm run lock:status
```

---

## 🎯 OBIETTIVO FINALE

**APP INDISTRUTTIBILE** 🛡️

Ogni componente deve essere:
- ✅ Testata al 100%
- ✅ Blindata con `// LOCKED:`
- ✅ Coordinata senza conflitti
- ✅ Documentata completamente

**La qualità è tutto! Meglio un elemento perfettamente blindato che 10 elementi parzialmente funzionanti.**

---

*Sistema Multi-Agent BHM v.2 - Coordinamento Completo per Blindatura Sistematica*
