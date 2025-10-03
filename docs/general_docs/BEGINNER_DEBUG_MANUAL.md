# 🎯 HACCP Debug & Testing - Manuale Essenziale

_Fatto su misura per il tuo metodo di apprendimento: Visivo, Pratico, con Esempi Concreti_

---

## 🏗️ **IL QUADRO GENERALE - La tua App HACCP**

### **Visualizza la Struttura:**

```
📁 Directory PADRE     ← Solo per git generale
└── 📁 BHM-v.2-Gemini ← TUA AREA DI LAVORO (sempre qui!)
    ├── 🚀 localhost:3000     ← La tua app HACCP live
    ├── 🤖 AI Workspaces      ← cursor/gemini/claude
    └── 🔧 Debug Scripts      ← I tuoi strumenti di test
```

### **Perché questa struttura?**

- **Directory padre** = Solo controllo versioni Git
- **BHM-v.2-Gemini** = La vera app HACCP (conservazione, inventario, attività)
- **localhost:3000** = Dove vedi i risultati delle tue modifiche

---

## 📍 **REGOLA #1: Il Tuo Posto di Lavoro**

### **✅ SEMPRE qui:**

```powershell
cd C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\BHM-v.2-Gemini
```

### **🎯 Verifica rapida - Sei nel posto giusto?**

```powershell
dir
# Dovresti vedere: package.json, src/, vite.config.ts
```

**Se non li vedi → sei nel posto sbagliato!**

---

## 🚀 **SERVER - Il Cuore della tua App**

### **Perché il Server?**

Il server trasforma il tuo codice in app HACCP funzionante su `localhost:3000`

### **🎯 I 3 Comandi Essenziali:**

#### **Avvio Normale:**

```powershell
npm run dev
# Aspetta: ➜ Local: http://localhost:3000/
```

#### **Riavvio dopo Problemi:**

```powershell
netstat -ano | findstr :3000 # Verifica che la porta sia libera
Ctrl + C          # Ferma
npm run dev       # Riavvia
```

#### **Pulizia Profonda (se bloccato):**

```powershell
Ctrl + C
taskkill /f /pid "npid" # Kill per PID
taskkill /f /im node.exe  # Kill tutti i processi Node.js
# Trova e kill il processo sulla porta 3000
Get-NetTCPConnection -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force } #Kill per porta 
npm run build:clean    # Pulisce cache
npm run dev            # Riavvia pulito
```npm run dev

---

## 🧪 **I Tuoi 4 Strumenti di Debug**

### **🔍 Test Base - "Funziona tutto?"**

```powershell
node debug-puppeteer.js
```

**Cosa fa:** Apre browser, testa pagine principali
**Quando usarlo:** Ogni volta che modifichi qualcosa

### **🔬 Test Completo - "Analisi Profonda"**

```powershell
node debug-app-detailed.js
```

**Cosa fa:** Test completo di performance, errori, responsiveness
**Quando usarlo:** Prima di finire il lavoro

### **🔓 Test Auth - "Login problemi?"**

```powershell
node test-bypass-auth.js
```

**Cosa fa:** Aggira problemi di login
**Quando usarlo:** Quando non riesci ad entrare nell'app

### **⚡ Test Automatico - "Tutto senza login"**

```powershell
node test-with-auth.js
```

**Cosa fa:** Testa tutto bypassando l'autenticazione
**Quando usarlo:** Per test rapidi completi

---

## 🤖 **Branch Agents - Chi Fa Cosa**

### **Il Sistema:**

```
main ← Versione stabile (non toccare)
├── cursor-workspace   ← Fix veloci (15 min max)
├── gemini-workspace   ← Architettura complessa
└── claude-workspace   ← Sicurezza e analisi
```

### **🎯 Workflow per Agent:**

#### **Prima di Iniziare (SEMPRE):**

```powershell
git checkout [agent]-workspace
git pull origin main
git rebase origin/main
npm run dev                    # Se non attivo
node debug-app-detailed.js     # Verifica tutto OK
```

#### **🔍 REGOLA D'ORO - PRIMA DI MODIFICARE CODICE:**

```powershell
# ANALISI OBBLIGATORIA:
# 1. Leggi TUTTO il componente/file da modificare
# 2. Capisci come è strutturata l'app (src/, components/, lib/)
# 3. Verifica dipendenze e imports
# 4. Studia pattern esistenti nel codice
# 5. SOLO DOPO modifica
```

**Perché è importante?**

- Eviti di rompere codice esistente
- Mantieni consistenza nello stile
- Capisci le dipendenze tra componenti
- Riduci errori e bug

#### **Dopo le Modifiche (SEMPRE):**

```powershell
npm run type-check            # DEVE essere ✅
npm run lint                  # DEVE essere ✅
node debug-app-detailed.js    # DEVE dire "No critical errors"
git commit -m "fix(agent): [cosa hai fatto]"
git push origin [agent]-workspace
```

---

## 🚨 **Situazioni Comuni - Cosa Fare**

### **🔴 "App non si carica"**

```powershell
# 1. Verifica posizione
cd C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\BHM-v.2-Gemini

# 2. Avvia server
npm run dev

# 3. Se errori, test diagnostico
node debug-app-detailed.js
```

### **🟡 "Pagina bianca"**

```powershell
# 1. Hard refresh browser: Ctrl + Shift + R
# 2. Pulisci e riavvia:
npm run build:clean
npm run dev
```

### **🟢 "Modifiche non si vedono"**

```powershell
# 1. Refresh: Ctrl + R
# 2. Se persiste: Ctrl + Shift + R
# 3. Se ancora persiste: riavvia server
```

---

## 📝 **La Tua Routine Quotidiana**

### **🌅 Inizio Giornata (5 comandi):**

```powershell
cd C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\BHM-v.2-Gemini
git checkout cursor-workspace  # o altro agent
git pull origin main && git rebase origin/main
npm run dev
node debug-app-detailed.js
```

### **🌙 Fine Lavoro (3 comandi):**

```powershell
git add . && git commit -m "fix(agent): [descrizione]"
git push origin [agent]-workspace
Ctrl + C    # Ferma server
```

---

## 🎮 **Micro-Missioni per Imparare**

### **MISSIONE 1: "Padronanza Base"**

1. Apri PowerShell
2. Vai nella directory corretta
3. Avvia server
4. Apri `localhost:3000` nel browser
5. Esegui `debug-puppeteer.js`
6. Ferma server

### **MISSIONE 2: "Branch Master"**

1. Controlla branch attuale: `git branch`
2. Cambia branch: `git checkout cursor-workspace`
3. Aggiorna: `git pull origin main`
4. Verifica: `git status`

### **MISSIONE 3: "Debug Detective"**

1. Esegui `debug-app-detailed.js`
2. Leggi output per errori
3. Apri pagina problematica in browser
4. Usa F12 per vedere console errori

---

## 🔮 **FUNZIONALITÀ AVANZATE (Per il Futuro)**

_Sezione da espandere quando sarai più esperto:_

### **🏗️ Architettura Avanzata**

- Database schema design con Supabase
- API route protection con Clerk
- Component architecture patterns
- State management con Zustand

### **⚡ Performance Optimization**

- Bundle size analysis
- Code splitting strategies
- Lazy loading implementation
- Caching mechanisms

### **🔒 Security & Compliance**

- Row Level Security (RLS) setup
- HACCP compliance validation
- Data encryption practices
- Audit trail implementation

### **🧪 Advanced Testing**

- Unit testing setup
- Integration testing patterns
- E2E testing workflows
- Automated testing pipelines

### **🚀 Deployment & DevOps**

- Production environment setup
- CI/CD pipeline configuration
- Monitoring and logging
- Backup and recovery strategies

---

## ❓ **FAQ Rapide**

**Q: Da dove lavoro sempre?**
**A:** `BHM-v.2-Gemini/` - MAI dalla directory padre!

**Q: Il server è lento - lo riavvio?**
**A:** SÌ! `Ctrl+C` poi `npm run dev` - è normale!

**Q: Come capisco se tutto funziona?**
**A:** `node debug-app-detailed.js` deve dire "No critical errors"

**Q: Quale branch uso?**
**A:** Dipende dall'agent: cursor/gemini/claude-workspace

---

**🚀 RICORDA: Debugging = Controllo qualità nella tua cucina HACCP!**
_Ogni test verifica che una "stazione" dell'app funzioni correttamente._
