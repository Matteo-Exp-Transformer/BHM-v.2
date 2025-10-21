# ⚙️ CONFIGURAZIONE SISTEMA MULTI-AGENT

> **CONFIGURAZIONE COMPLETA** del sistema multi-agent per blindatura BHM v.2

---

## 🔧 CONFIGURAZIONI PLAYWRIGHT

### Agente 1 - UI Elementi Base (Porta 3000)
```typescript
// playwright-agent1.config.ts
export default defineConfig({
  testDir: './Production/Test',
  use: {
    baseURL: 'http://localhost:3000', // Priorità porta 3000
    headless: process.env.CI ? true : false,
  },
  projects: [
    {
      name: 'UI-Base',
      testMatch: '**/UI-Base/**/*.spec.js',
    }
  ],
});
```

### Agente 2 - Form e Validazioni (Porta 3001)
```typescript
// playwright-agent2.config.ts
export default defineConfig({
  testDir: './Production/Test',
  use: {
    baseURL: 'http://localhost:3001', // Priorità porta 3001
    headless: process.env.CI ? true : false,
  },
  projects: [
    {
      name: 'Autenticazione',
      testMatch: '**/Autenticazione/**/*.spec.js',
    }
  ],
});
```

### Agente 3 - Logiche Business (Porta 3002)
```typescript
// playwright-agent3.config.ts
export default defineConfig({
  testDir: './Production/Test',
  use: {
    baseURL: 'http://localhost:3002', // Priorità porta 3002
    headless: process.env.CI ? true : false,
  },
  projects: [
    {
      name: 'LogicheBusiness',
      testMatch: '**/LogicheBusiness/**/*.spec.js',
    }
  ],
});
```

---

## 📦 SCRIPT NPM CONFIGURATI

### Avvio Multi-Istanza
```json
{
  "scripts": {
    "dev:multi": "node scripts/start-multi-instance.cjs",
    "dev:agent1": "vite --port 3000",
    "dev:agent2": "vite --port 3001", 
    "dev:agent3": "vite --port 3002"
  }
}
```

### Test con Lock System
```json
{
  "scripts": {
    "test:agent1": "node scripts/test-with-lock.cjs agent-1 UI-Base --config=playwright-agent1.config.ts",
    "test:agent2": "node scripts/test-with-lock.cjs agent-2 Forms --config=playwright-agent2.config.ts",
    "test:agent3": "node scripts/test-with-lock.cjs agent-3 Business --config=playwright-agent3.config.ts"
  }
}
```

### Lock Management
```json
{
  "scripts": {
    "lock:status": "node scripts/agent-lock-manager.cjs status",
    "lock:monitor": "node scripts/queue-monitor.cjs --watch",
    "lock:cleanup": "node scripts/agent-lock-manager.cjs cleanup"
  }
}
```

### Port Detection
```json
{
  "scripts": {
    "detect:port": "node scripts/detect-app-port.cjs",
    "detect:all": "node scripts/detect-app-port.cjs --all",
    "detect:free": "node scripts/detect-app-port.cjs --free",
    "detect:monitor": "node scripts/detect-app-port.cjs --monitor"
  }
}
```

---

## 🔒 LOCK SYSTEM CONFIGURATION

### Directory Structure
```
.agent-locks/
├── host-3000.lock          # Lock per porta 3000
├── host-3001.lock          # Lock per porta 3001
├── host-3002.lock          # Lock per porta 3002
├── agent-1.heartbeat       # Heartbeat Agente 1
├── agent-2.heartbeat       # Heartbeat Agente 2
├── agent-3.heartbeat       # Heartbeat Agente 3
└── lock-history.log        # Storia lock
```

### Lock File Format
```json
{
  "agentId": "agent-1",
  "component": "Button",
  "timestamp": 1705334400000,
  "host": "localhost:3000",
  "port": 3000,
  "status": "locked",
  "pid": 12345
}
```

### Heartbeat Format
```json
{
  "agentId": "agent-1",
  "timestamp": 1705334400000,
  "status": "active",
  "component": "Button",
  "host": "localhost:3000"
}
```

---

## 🌐 CONFIGURAZIONE VITE

### vite.config.ts
```typescript
export default defineConfig({
  define: {
    'import.meta.env.VITE_ACTUAL_PORT': JSON.stringify(process.env.VITE_PORT || '3000'),
  },
  server: {
    host: true,
    port: parseInt(process.env.VITE_PORT || '3000'),
    cors: true,
  },
});
```

### Variabili Ambiente
```bash
# Per Agente 1
VITE_PORT=3000 npm run dev

# Per Agente 2  
VITE_PORT=3001 npm run dev

# Per Agente 3
VITE_PORT=3002 npm run dev
```

---

## 🗄️ CONFIGURAZIONE SUPABASE

### Credenziali Test
```javascript
const SUPABASE_CONFIG = {
  url: 'https://tucqgcfrlzmwyfadiodo.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  auth: {
    email: 'matteo.cavallaro.work@gmail.com',
    password: 'cavallaro'
  }
};
```

### Company ID Dinamico
```javascript
// Ottenere Company ID reale per test
const companyId = await devCompanyHelper.getDevCompany();
```

---

## 📊 CONFIGURAZIONE MONITORAGGIO

### Queue Monitor
```javascript
// scripts/queue-monitor.cjs
const MONITOR_CONFIG = {
  refreshInterval: 5000,    // 5 secondi
  lockTimeout: 300000,      // 5 minuti
  heartbeatInterval: 60000,  // 1 minuto
  maxQueueSize: 10
};
```

### Port Detection
```javascript
// scripts/detect-app-port.cjs
const DETECTION_CONFIG = {
  defaultPorts: [3000, 3001, 3002],
  timeout: 5000,            // 5 secondi
  retryAttempts: 3,
  healthCheckPath: '/'
};
```

---

## 🚀 CONFIGURAZIONE AVVIO RAPIDO

### Script di Avvio Completo
```bash
#!/bin/bash
# start-multi-agent-system.sh

echo "🚀 Avvio Sistema Multi-Agent BHM v.2"

# 1. Pulizia lock stale
npm run lock:cleanup

# 2. Avvio multi-istanza
npm run dev:multi &

# 3. Attesa avvio istanze
sleep 10

# 4. Verifica stato
npm run lock:status

# 5. Avvio monitoraggio
npm run lock:monitor &

echo "✅ Sistema Multi-Agent avviato!"
echo "📊 Monitor: npm run lock:monitor"
echo "🔍 Status: npm run lock:status"
echo "🧪 Test: npm run test:agent1/2/3"
```

---

## 🔧 CONFIGURAZIONE DEBUGGING

### Log Levels
```javascript
const LOG_CONFIG = {
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: 'timestamp:level:message',
  files: {
    lock: 'logs/lock-system.log',
    test: 'logs/test-execution.log',
    error: 'logs/errors.log'
  }
};
```

### Debug Commands
```bash
# Debug lock system
DEBUG=lock:* npm run lock:monitor

# Debug port detection  
DEBUG=port:* npm run detect:port

# Debug test execution
DEBUG=test:* npm run test:agent1
```

---

## 📈 CONFIGURAZIONE METRICHE

### Performance Monitoring
```javascript
const METRICS_CONFIG = {
  testExecution: {
    timeout: 120000,        // 2 minuti
    retries: 3,
    parallel: false
  },
  lockAcquisition: {
    timeout: 30000,         // 30 secondi
    retries: 5,
    backoff: 1000
  },
  portDetection: {
    timeout: 5000,          // 5 secondi
    retries: 3,
    interval: 1000
  }
};
```

---

**NOTA**: Tutte le configurazioni sono ottimizzate per il sistema multi-agent e garantiscono coordinamento senza conflitti. 🛡️
