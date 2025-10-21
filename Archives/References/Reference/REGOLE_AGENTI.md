# 🚨 REGOLE CRITICHE PER AGENTI

> **ATTENZIONE**: Queste regole sono OBBLIGATORIE per tutti gli agenti che lavorano su questo progetto.

## 🔒 REGOLE BLINDATURA - NON NEGOZIABILI

## 🔐 PROTOCOLLO LOCK MULTI-AGENT

### Lock Files Atomici
Gli agenti DEVONO usare il sistema di lock atomici per coordinarsi:

```javascript
// Directory: .agent-locks/
// File lock: host-{port}.lock
// Heartbeat: agent-{id}.heartbeat
// History: lock-history.log

// Esempio acquisizione lock
const lockAcquired = await acquireLock('localhost:3000', 'agent-1', 'Button');
if (lockAcquired) {
  // Esegui test
  await runTests();
  // Rilascia lock
  await releaseLock('localhost:3000');
} else {
  // Entra in queue
  await enterQueue('agent-1', 'Button');
}
```

### Regole Lock Files
1. **Acquisizione:** Solo UN agente per host alla volta
2. **Heartbeat:** Aggiorna ogni 60s obbligatorio
3. **Scadenza:** Lock scade automaticamente dopo 3min
4. **Cleanup:** Lock stale rimossi automaticamente
5. **Queue:** FIFO per agenti in attesa

### Gestione Conflitti Automatica
```javascript
// Se lock non disponibile
if (!lockAcquired) {
  // Entra in queue
  const queuePosition = await enterQueue(agentId, component);
  console.log(`In queue position: ${queuePosition}`);
  
  // Polling ogni 30s
  while (true) {
    await sleep(30000);
    const available = await checkHostAvailability(port);
    if (available) {
      break;
    }
  }
}
```

### Esempi Codice Lock Atomico
```javascript
// scripts/agent-lock-manager.js
const fs = require('fs').promises;
const path = require('path');

async function acquireLock(host, agentId, component) {
  const lockFile = path.join('.agent-locks', `host-${host}.lock`);
  const heartbeatFile = path.join('.agent-locks', `agent-${agentId}.heartbeat`);
  
  try {
    // Tentativo lock atomico
    await fs.writeFile(lockFile, JSON.stringify({
      agentId,
      component,
      timestamp: Date.now(),
      host
    }), { flag: 'wx' });
    
    // Crea heartbeat
    await fs.writeFile(heartbeatFile, JSON.stringify({
      agentId,
      timestamp: Date.now(),
      status: 'active'
    }));
    
    return true;
  } catch (error) {
    if (error.code === 'EEXIST') {
      return false; // Lock già esistente
    }
    throw error;
  }
}

async function releaseLock(host) {
  const lockFile = path.join('.agent-locks', `host-${host}.lock`);
  await fs.unlink(lockFile);
}
```

## 🗄️ CONSULTAZIONE DATABASE OBBLIGATORIA

**CRITICO:** Prima di creare qualsiasi test JS, gli agenti DEVONO consultare il database Supabase reale per garantire compliance:

### Workflow Database Compliance
1. **🔍 Schema Check:** Verifica struttura tabelle correnti
2. **📊 Data Verification:** Controlla dati reali esistenti  
3. **🎯 Constraint Validation:** Verifica vincoli e validazioni
4. **✅ Real Data Usage:** Usa dati reali per test

### Esempi Query Obbligatorie
```javascript
// Prima di creare test, consulta sempre:
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://tucqgcfrlzmwyfadiodo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
);

// 1. Verifica schema tabelle
const { data: schema } = await supabase
  .from('information_schema.tables')
  .select('table_name, column_name, data_type, is_nullable')
  .eq('table_schema', 'public');

// 2. Dati reali per test
const { data: companies } = await supabase
  .from('companies')
  .select('id, name, email, staff_count')
  .limit(5);

// 3. Verifica vincoli business
const { data: constraints } = await supabase
  .from('information_schema.check_constraints')
  .select('constraint_name, check_clause');

// 4. Company ID reale
const companyId = await devCompanyHelper.getDevCompany();
```

### Regole Database Compliance
- ✅ **SEMPRE** consultare schema database prima di test
- ✅ **SEMPRE** usare Company ID reale dal database
- ✅ **SEMPRE** verificare vincoli esistenti
- ✅ **SEMPRE** testare con dati validi secondo schema
- ❌ **MAI** usare dati mock senza verificare database
- ❌ **MAI** assumere struttura senza consultarla

### 1. COMPONENTI LOCKED - ZONA VIETATA
```
🚫 MAI MODIFICARE FILE CON COMMENTI:
// LOCKED: [Data] - Componente blindata
// LOCKED: [Data] - [NomeComponente] testata e funzionante
```

**SE TROVI UN COMMENTO LOCKED:**
1. **FERMATI IMMEDIATAMENTE**
2. **NON MODIFICARE IL FILE**
3. **CHIEDI PERMESSO ESPLICITO** all'utente
4. **SE L'UTENTE ACCONSENTE**: procedi con unlock → modifica → re-test completo → re-lock

### 2. CONTROLLO OBBLIGATORIO
**PRIMA DI OGNI MODIFICA:**
1. Leggi `Production/Knowledge/MASTER_TRACKING.md`
2. Verifica se il componente è 🔒 LOCKED
3. Se LOCKED: **NON PROCEDERE SENZA PERMESSO**

### 3. AGGIORNAMENTO OBBLIGATORIO
**DOPO OGNI MODIFICA:**
1. Aggiorna `Production/Knowledge/MASTER_TRACKING.md`
2. Cambia lo stato della componente modificata
3. Documenta cosa è stato fatto

## 📋 PROCESSO DI BLINDATURA

### Quando una componente è "Locked":
1. ✅ **Tutti i test passano al 100%**
2. ✅ **Funzionalità verificate con dati validi e invalidi**
3. ✅ **Edge cases testati**
4. ✅ **UI/UX verificata completamente**
5. ✅ **Nessun side effect su altre componenti**

### Come "Lockare" una componente:
```javascript
// LOCKED: [Data] - [NomeComponente] blindata
// Tutti i test passano, funzionalità verificata
// NON MODIFICARE SENZA PERMESSO ESPLICITO
```

### Come "Unlockare" una componente:
```javascript
// UNLOCKED: [Data] - [NomeComponente] per modifica
// RICORDARE: re-test completo dopo modifica e re-lock
```

## 🎯 PRIORITÀ DI LAVORO

### Ordine di Blindatura:
1. **🔐 Autenticazione** (Login, Signup, Auth guards)
2. **🎯 Onboarding** (Wizard, setup iniziale)
3. **📊 Dashboard** (Home, navigazione principale)
4. **🎨 UI Base** (Button, Input, Modal, Form)
5. **📅 Calendario** (Eventi, task, scheduling)
6. **📦 Inventario** (Prodotti, stock, categorie)
7. **🌡️ Conservazione** (Temperature, controlli)
8. **🛒 Liste Spesa** (Shopping, ordini)
9. **⚙️ Gestione** (Admin, utenti, aziende)
10. **🔧 Impostazioni** (Configurazioni, preferenze)

## 🧪 STANDARD DI TESTING

### Test Funzionali (Tipo 1):
- ✅ Ogni bottone è cliccabile
- ✅ Ogni form accetta input e valida
- ✅ Ogni modal si apre/chiude
- ✅ Ogni tab/navigazione funziona
- ✅ Ogni tooltip/feedback appare
- ✅ Ogni azione produce risultato atteso

### Test Validazione Dati (Tipo 2):
- ✅ Input validi accettati
- ✅ Input invalidi rifiutati con errore
- ✅ Edge cases (valori limite, null, undefined)
- ✅ Casi estremi (stringhe lunghe, numeri negativi)
- ✅ Sicurezza (injection, caratteri speciali)

## 📁 ORGANIZZAZIONE FILE

### Struttura Test:
```
Production/Test/[Area]/
├── [Sottocomponente]/
│   ├── test-funzionale.js
│   ├── test-validazione.js
│   └── test-edge-cases.js
```

### Nomenclatura:
- **Cartelle**: Terminologia NON tecnica (es: "Calendario/Crea-Evento")
- **File**: Descrittivi e specifici
- **Test**: Max 50-100 righe per file

## 🚨 SANZIONI PER VIOLAZIONI

**Se modifichi codice LOCKED senza permesso:**
1. ⚠️ **PRIMO AVVERTIMENTO**: Stop immediato, rollback
2. 🔴 **SECONDO AVVERTIMENTO**: Blocco temporaneo
3. 🚫 **TERZO AVVERTIMENTO**: Esclusione dal progetto

## 📞 SUPPORTO

**Se hai dubbi:**
1. Leggi questo file completamente
2. Controlla `MASTER_TRACKING.md`
3. Chiedi chiarimenti all'utente
4. **MEGLIO CHIEDERE TROPPO CHE MODIFICARE MALE**

---

**RICORDA**: L'obiettivo è avere un'app **INDISTRUTTIBILE**. Ogni componente locked è un mattoncino solido di questa fortificazione. **NON ROMPERE I MATTONCINI!** 🛡️


