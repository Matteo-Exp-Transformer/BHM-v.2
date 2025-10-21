# 🎯 Manuale Completo Testing & Debug BHM

*Come gestire la tua "cucina digitale" HACCP - Comandi essenziali spiegati semplicemente*

---

## 🏗️ **LA TUA CUCINA DIGITALE - Panoramica**

### **Visualizza la Struttura:**
```
🏠 Casa (GitHub)           ← Il tuo "ristorante" online
├── 🍳 Cucina (BHM-v.2)    ← Dove prepari i piatti (codice)
├── 🚀 Servizio (localhost:3000) ← Dove servono ai clienti
└── 📦 Magazzino (Vercel)  ← Dove conservi le scorte (produzione)
```

### **Perché questa organizzazione?**
- **Cucina** = Dove modifichi e testi il codice
- **Servizio** = Dove vedi i risultati in tempo reale
- **Magazzino** = Dove conservi la versione finale

---

## 📍 **REGOLA #1: Il Tuo Posto di Lavoro**

### **✅ SEMPRE qui:**
```powershell
cd C:\Users\matte.MIO\Documents\GitHub\BHM-v.2
```

### **🎯 Verifica rapida - Sei nel posto giusto?**
```powershell
dir
# Dovresti vedere: package.json, src/, vite.config.ts
```
**Se non li vedi → sei nel posto sbagliato!**

---

## ⚡ **COMANDI RAPIDI - Server di Sviluppo**

*Sezione dedicata per gestire velocemente i tuoi server HACCP*

### **🎯 SCOPIO:**
- **Visualizzare** solo i server delle tue app (non Chrome/sistema)
- **Chiudere** tutti i server di sviluppo
- **Riavviare** app pulita

### **🔍 VISUALIZZARE SERVER ATTIVI**

#### **Comando Semplice - Vedi Tutte le Porte:**
```powershell
# Vedi tutte le porte in ascolto
netstat -ano | findstr LISTENING
```

#### **Comando Specifico - Solo Porte 3000-3001:**
```powershell
# Solo le porte che usi per sviluppo
netstat -ano | findstr ":3000\|:3001"
```

#### **Comando Range - Porte 3000-3009:**
```powershell
# Vedi porte da 3000 a 3009 (tutte le porte dev)
netstat -ano | findstr ":300[0-9]"
```

#### **Comando Alternativo - Select-String:**
```powershell
# Versione PowerShell (funziona meglio)
netstat -ano | Select-String ":3000|:3001"

# Range con Select-String (porte 3000-3009)
netstat -ano | Select-String ":300[0-9]"
```

### **🚫 CHIUDERE SERVER**

#### **Chiudi Tutti i Server Node.js:**
```powershell
# Chiudi TUTTI i server Node.js (sicuro)
taskkill /IM "node.exe" /F
```

#### **Chiudi Processo Specifico per PID:**
```powershell
# Chiudi processo specifico (sostituisci XXXX con il PID reale)
taskkill /PID XXXX /F

# Esempio con i PID che abbiamo visto:
taskkill /PID 7912 /F  # Chiude porta 3000
taskkill /PID 9152 /F  # Chiude porta 3001
```

#### **Chiudi Più Processi Specifici:**
```powershell
# Chiudi più processi insieme (se conosci i PID)
taskkill /PID 7912 /F & taskkill /PID 9152 /F & taskkill /PID 1234 /F

# Oppure uno dopo l'altro
taskkill /PID 7912 /F
taskkill /PID 9152 /F
taskkill /PID 1234 /F
```

#### **Chiudi Solo Porte App (Non Chrome/Sistema):**
```powershell
# Chiudi solo processi Node.js (le tue app)
taskkill /IM "node.exe" /F

# Chiudi solo processi npm
taskkill /IM "npm.exe" /F

# Chiudi tutto lo stack di sviluppo
taskkill /IM "node.exe" /F & taskkill /IM "npm.exe" /F
```

#### **Vedi Processi e Chiudi:**
```powershell
# 1. Prima vedi i processi Node.js attivi
tasklist | findstr node

# 2. Poi chiudi quello che vuoi
taskkill /PID [numero_pid] /F
```


### **🔄 RIAVVIARE APP PULITA**

#### **Riavvio Standard:**
```powershell
# 1. Chiudi tutto
taskkill /IM "node.exe" /F

# 2. Vai nella directory
cd C:\Users\matte.MIO\Documents\GitHub\BHM-v.2

# 3. Riavvia
npm run dev
```

#### **Riavvio Pulito (con pulizia cache):**
```powershell
# 1. Chiudi tutto
taskkill /IM "node.exe" /F

# 2. Vai nella directory
cd C:\Users\matte.MIO\Documents\GitHub\BHM-v.2

# 3. Pulisci cache
npm run build:clean

# 4. Riavvia
npm run dev
```

#### **Riavvio Ultra Pulito (reset completo):**
```powershell
# 1. Chiudi tutto
taskkill /IM "node.exe" /F

# 2. Vai nella directory
cd C:\Users\matte.MIO\Documents\GitHub\BHM-v.2

# 3. Reset completo
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item package-lock.json -Force -ErrorAction SilentlyContinue
Remove-Item .vite -Recurse -Force -ErrorAction SilentlyContinue

# 4. Reinstalla e riavvia
npm install
npm run dev
```

### **⚡ SCRIPT COMPLETO - Tutto in Uno:**

```powershell
# SCRIPT COMPLETO: Visualizza → Chiudi → Riavvia
Write-Host "🔍 VISUALIZZANDO SERVER ATTIVI..." -ForegroundColor Cyan

# 1. Mostra server attivi
$activeServers = netstat -ano | Select-String "LISTENING.*:3[0-9]{3}" | Where-Object { 
    (Get-Process -Id ($_ -split '\s+')[-1] -ErrorAction SilentlyContinue).ProcessName -eq "node" 
}

if ($activeServers) {
    Write-Host "`n🚀 SERVER ATTIVI TROVATI:" -ForegroundColor Yellow
    $activeServers | ForEach-Object {
        $port = ($_ -split '\s+')[1]
        $pid = ($_ -split '\s+')[-1]
        Write-Host "   Porta $port - PID $pid" -ForegroundColor Green
    }
    
    Write-Host "`n🚫 CHIUDENDO SERVER..." -ForegroundColor Red
    taskkill /IM "node.exe" /F
    
    Write-Host "`n⏳ Aspetta 3 secondi..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    Write-Host "`n🔄 RIAVVIANDO APP..." -ForegroundColor Green
    cd C:\Users\matte.MIO\Documents\GitHub\BHM-v.2
    npm run dev
} else {
    Write-Host "`n✅ Nessun server attivo trovato" -ForegroundColor Green
    Write-Host "🔄 Avviando app..." -ForegroundColor Green
    cd C:\Users\matte.MIO\Documents\GitHub\BHM-v.2
    npm run dev
}
```

### **🎯 COMANDI ONE-LINER (Copy & Paste):**

```powershell
# Vedi porte attive (semplice)
netstat -ano | findstr LISTENING

# Vedi solo porte 3000-3001
netstat -ano | findstr ":3000\|:3001"

# Vedi porte range 3000-3009
netstat -ano | findstr ":300[0-9]"

# Chiudi tutto Node.js (solo le tue app)
taskkill /IM "node.exe" /F

# Chiudi più processi insieme
taskkill /PID 7912 /F & taskkill /PID 9152 /F

# Vedi processi Node.js
tasklist | findstr node

# Riavvia app
cd C:\Users\matte.MIO\Documents\GitHub\BHM-v.2 && npm run dev
```

---

## 🔧 **CATEGORIA 1: GIT - Il Sistema di Versioni**

*Git è come il "libro delle ricette" del tuo ristorante - tiene traccia di tutte le modifiche*

### **📖 Comandi Base - "Leggere le Ricette"**

#### **Vedere lo stato attuale:**
```powershell
git status
# Mostra: cosa hai modificato, cosa è pronto per il commit
```

#### **Vedere la cronologia:**
```powershell
git log --oneline
# Mostra: ultimi commit in formato compatto
```

#### **Vedere differenze:**
```powershell
git diff
# Mostra: cosa hai cambiato rispetto all'ultimo commit
```

### **📝 Comandi Scrittura - "Aggiornare le Ricette"**

#### **Salvare le modifiche (commit):**
```powershell
git add .                    # Prepara tutti i file modificati
git commit -m "Messaggio"    # Salva con un messaggio descrittivo
```

**Esempi di messaggi buoni:**
```powershell
git commit -m "fix: risolto problema login"
git commit -m "feat: aggiunto nuovo form conservazione"
git commit -m "style: migliorato layout pagina inventario"
```

#### **Inviare al repository online:**
```powershell
git push origin main
# Invia le tue modifiche su GitHub
```

### **🔄 Comandi Sincronizzazione - "Aggiornare le Ricette"**

#### **Scaricare modifiche da GitHub:**
```powershell
git pull origin main
# Scarica le ultime modifiche dal repository online
```

#### **Cambiare versione/branch:**
```powershell
git branch                   # Vedi tutti i branch disponibili
git checkout nome-branch     # Cambia branch
```

**Branch principali del progetto:**
```powershell
git checkout main                    # Versione stabile
git checkout cursor-workspace        # Per fix veloci
git checkout gemini-workspace        # Per architettura complessa
git checkout claude-workspace        # Per sicurezza e analisi
```

### **🚨 Comandi Emergenza - "Ripristinare Ricette"**

#### **Annullare modifiche non salvate:**
```powershell
git checkout -- nome-file    # Ripristina un file specifico
git reset --hard HEAD        # Ripristina TUTTO all'ultimo commit
```

#### **Ripristinare da GitHub:**
```powershell
git fetch origin
git reset --hard origin/main
# Riavvia tutto da zero con la versione online
```

---

## 🚀 **CATEGORIA 2: DEV MODE - Modalità Sviluppo**

*Come accendere i "fornelli" della tua cucina digitale*

### **🔥 Avvio Server Sviluppo**

#### **Avvio normale:**
```powershell
npm run dev
# Aspetta: ➜ Local: http://localhost:3000/
```

#### **Avvio con porta specifica:**
```powershell
npm run dev -- --port 3001
# Avvia su porta 3001 invece di 3000
```

#### **Avvio con host esterno (per test mobile):**
```powershell
npm run dev -- --host 0.0.0.0
# Permette accesso da altri dispositivi in rete
```

#### **Avvio in modalità verbose (vedi tutto):**
```powershell
npm run dev -- --verbose
# Mostra dettagli completi di avvio
```

#### **Riavvio dopo problemi:**
```powershell
Ctrl + C          # Spegni il server
npm run dev       # Riavvia
```

#### **Pulizia profonda (se bloccato):**
```powershell
Ctrl + C
npm run build:clean    # Pulisce cache
npm run dev            # Riavvia pulito
```

#### **Reset completo (ultima spiaggia):**
```powershell
Ctrl + C
Remove-Item node_modules -Recurse -Force    # Cancella dipendenze
Remove-Item package-lock.json -Force        # Cancella lock file
npm install                                  # Reinstalla tutto
npm run dev                                  # Riavvia
```

### **🔍 Verifica Funzionamento**

#### **Controllo base:**
```powershell
npm run type-check     # Verifica errori TypeScript
npm run lint          # Verifica stile codice
```

#### **Controllo avanzato:**
```powershell
npm run build          # Testa build di produzione
npm run preview        # Testa build locale
npm run test           # Esegue test automatici (se configurati)
```

#### **Verifica dipendenze:**
```powershell
npm audit              # Controlla vulnerabilità sicurezza
npm outdated           # Vedi pacchetti obsoleti
npm ls                 # Vedi albero dipendenze
```

### **📊 Monitoraggio Server**

#### **Vedere logs in tempo reale:**
```powershell
# In un terminale separato mentre npm run dev è attivo
Get-Content .\logs\dev.log -Wait -Tail 10
# Mostra ultimi 10 log e continua a seguire
```

#### **Monitoraggio risorse:**
```powershell
# Vedere uso CPU e memoria
Get-Process node | Select-Object ProcessName, CPU, WorkingSet

# Vedere tutti i processi npm/node
Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*npm*"}
```

#### **Test connessione server:**
```powershell
# Test se server risponde
Invoke-WebRequest -Uri "http://localhost:3000" -Method GET
# Se funziona, vedrai status 200

# Test con timeout
try {
    Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
    Write-Host "✅ Server risponde correttamente"
} catch {
    Write-Host "❌ Server non risponde"
}
```

### **🛠️ Comandi Debug Avanzati**

#### **Debug con breakpoints:**
```powershell
npm run dev -- --inspect
# Avvia con debugger Node.js attivo
# Poi apri Chrome: chrome://inspect
```

#### **Debug con profiler:**
```powershell
npm run dev -- --inspect-brk
# Avvia e si ferma subito per debug
```

#### **Analisi bundle:**
```powershell
npm run build -- --analyze
# Mostra analisi dimensione bundle
```

#### **Modalità development con source maps:**
```powershell
npm run dev -- --source-map
# Migliora debugging nel browser
```

### **🔄 Gestione Cache e Temp**

#### **Pulizia cache npm:**
```powershell
npm cache clean --force
# Pulisce cache npm (se problemi strani)
```

#### **Pulizia cache Vite:**
```powershell
Remove-Item .vite -Recurse -Force -ErrorAction SilentlyContinue
# Pulisce cache Vite
```

#### **Pulizia cache browser (programmatica):**
```powershell
# Pulisce cache Chrome (se hai Chrome)
$chromeCache = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cache"
if (Test-Path $chromeCache) {
    Remove-Item $chromeCache -Recurse -Force
    Write-Host "✅ Cache Chrome pulita"
}
```

### **📱 Test Multi-Device**

#### **Avvio con IP di rete:**
```powershell
npm run dev -- --host $(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"} | Select-Object -First 1).IPAddress
# Avvia con IP locale per test da mobile
```

#### **Test responsive automatico:**
```powershell
# Apre browser con dimensioni diverse
Start-Process "chrome.exe" "--new-window --window-size=375,667 http://localhost:3000"  # Mobile
Start-Process "chrome.exe" "--new-window --window-size=768,1024 http://localhost:3000" # Tablet
Start-Process "chrome.exe" "--new-window --window-size=1920,1080 http://localhost:3000" # Desktop
```

### **⚡ Performance Monitoring**

#### **Monitoraggio velocità build:**
```powershell
Measure-Command { npm run build }
# Misura quanto tempo impiega il build
```

#### **Analisi file più grandi:**
```powershell
Get-ChildItem -Path "dist" -Recurse | Sort-Object Length -Descending | Select-Object -First 10 Name, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB,2)}}
# Mostra i 10 file più grandi nel build
```

#### **Controllo memory leak:**
```powershell
# Monitora memoria processo Node.js
while ($true) {
    $process = Get-Process node -ErrorAction SilentlyContinue
    if ($process) {
        $memory = [math]::Round($process.WorkingSet/1MB,2)
        Write-Host "$(Get-Date): Memory usage: $memory MB"
    }
    Start-Sleep -Seconds 5
}
```

#### **Test automatici:**
```powershell
node debug-puppeteer.js        # Test base funzionalità
node debug-app-detailed.js     # Test completo approfondito
```

### **📊 Monitoraggio Performance**

#### **🔍 Select-String Avanzato - "Cerca e Trova"**

**Perché Select-String?** È come il "cerca e trova" del tuo browser, ma per il terminale!

#### **Vedere processi attivi - Select-String Avanzato:**
```powershell
# Solo porte specifiche (es. 3000, 3001)
netstat -ano | Select-String ":3000|:3001"

# Tutte le porte di sviluppo (3000-3010)
netstat -ano | Select-String ":300[0-9]"

# Porte comuni di sviluppo
netstat -ano | Select-String ":3000|:3001|:5173|:8080|:4000"

# Solo connessioni LISTENING (server attivi)
netstat -ano | Select-String "LISTENING"

# Porte con processi Node.js
netstat -ano | Select-String "LISTENING" | Where-Object { (Get-Process -Id ($_ -split '\s+')[-1] -ErrorAction SilentlyContinue).ProcessName -eq "node" }

# Porte con processi npm
netstat -ano | Select-String "LISTENING" | Where-Object { (Get-Process -Id ($_ -split '\s+')[-1] -ErrorAction SilentlyContinue).ProcessName -eq "npm" }

# Tutte le porte aperte con dettagli processo
netstat -ano | Select-String "LISTENING" | ForEach-Object {
    $pid = ($_ -split '\s+')[-1]
    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
    "$_ - Processo: $($process.ProcessName) ($pid)"
}
```

#### **🔍 Select-String Super Avanzato - Pattern Matching:**
```powershell
# Cerca porte in range specifico (3000-3999)
netstat -ano | Select-String ":3[0-9]{3}"

# Cerca solo IPv4 (non IPv6)
netstat -ano | Select-String "^TCP\s+[0-9]" -NotMatch "^TCP\s+\["

# Cerca connessioni ESTABLISHED (attive)
netstat -ano | Select-String "ESTABLISHED"

# Cerca connessioni con timeout
netstat -ano | Select-String "TIME_WAIT|CLOSE_WAIT|FIN_WAIT"

# Cerca per indirizzo IP specifico
netstat -ano | Select-String "192\.168\.1\."

# Cerca processi con nome specifico (case insensitive)
netstat -ano | Select-String -Pattern "LISTENING" | Where-Object {
    $pid = ($_ -split '\s+')[-1]
    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
    $process.ProcessName -like "*node*" -or $process.ProcessName -like "*npm*"
}

# Cerca porte "sospette" (molto aperte)
netstat -ano | Select-String "LISTENING" | Group-Object {($_ -split '\s+')[1]} | Where-Object Count -gt 5

# Cerca connessioni da IP esterni
netstat -ano | Select-String "ESTABLISHED" | Where-Object {($_ -split '\s+')[2] -notlike "127.0.0.1*" -and ($_ -split '\s+')[2] -notlike "::1*"}
```

#### **🎯 Select-String per Log Files:**
```powershell
# Cerca errori nei log
Get-Content .\logs\*.log | Select-String "ERROR|FATAL|CRITICAL"

# Cerca errori con contesto (5 linee prima e dopo)
Get-Content .\logs\*.log | Select-String "ERROR" -Context 5,5

# Cerca pattern specifici con regex
Get-Content .\logs\*.log | Select-String -Pattern "\d{4}-\d{2}-\d{2}.*ERROR"

# Cerca e conta occorrenze
(Get-Content .\logs\*.log | Select-String "ERROR").Count

# Cerca errori unici (senza duplicati)
Get-Content .\logs\*.log | Select-String "ERROR" | Sort-Object -Unique
```

#### **🔧 Select-String per File di Configurazione:**
```powershell
# Cerca configurazioni in package.json
Get-Content package.json | Select-String '"scripts"|"dependencies"|"devDependencies"'

# Cerca variabili d'ambiente
Get-Content .env* | Select-String "=" | Select-String -NotMatch "^#"

# Cerca import/require nel codice
Get-Content src\**\*.ts,src\**\*.tsx | Select-String "import.*from|require\(" | Select-String -NotMatch "^\s*//"

# Cerca TODO/FIXME nel codice
Get-Content src\**\*.ts,src\**\*.tsx | Select-String "TODO|FIXME|HACK" -CaseSensitive

# Cerca console.log (per debug)
Get-Content src\**\*.ts,src\**\*.tsx | Select-String "console\.(log|error|warn|debug)"
```

#### **🚫 Chiudere Processi - Comandi Avanzati:**
```powershell
# Chiudere processo specifico per PID
taskkill /PID 7912 /F    # Sostituisci 7912 con il PID reale

# Chiudere tutti i processi Node.js
taskkill /IM "node.exe" /F

# Chiudere tutti i processi npm
taskkill /IM "npm.exe" /F

# Chiudere tutti i processi di sviluppo in una volta
taskkill /IM "node.exe" /F & taskkill /IM "npm.exe" /F & taskkill /IM "vite.exe" /F

# Chiudere con PowerShell (più elegante)
Stop-Process -Name "node" -Force
Stop-Process -Name "npm" -Force

# Chiudere processi per porta specifica
Get-NetTCPConnection -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Chiudere tutto il "family tree" di un processo
$parentProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($parentProcess) {
    $childProcesses = Get-WmiObject Win32_Process | Where-Object {$_.ParentProcessId -eq $parentProcess.Id}
    foreach ($child in $childProcesses) {
        Stop-Process -Id $child.ProcessId -Force
    }
    Stop-Process -Id $parentProcess.Id -Force
}

# Chiudere processi "orfani" (senza padre)
Get-Process | Where-Object {$_.ProcessName -like "*node*" -and $_.Parent -eq $null} | Stop-Process -Force

# Chiudere processi che usano troppa memoria
Get-Process | Where-Object {$_.ProcessName -like "*node*" -and $_.WorkingSet -gt 500MB} | Stop-Process -Force
```

---

## 🌐 **CATEGORIA 3: VERCEL - Deployment Produzione**

*Come spedire i tuoi "piatti finiti" ai clienti*

### **📦 Preparazione per Produzione**

#### **Build di produzione:**
```powershell
npm run build
# Crea versione ottimizzata per produzione
```

#### **Test build locale:**
```powershell
npm run preview
# Testa la versione di produzione localmente
```

### **🚀 Deployment su Vercel**

#### **Deploy automatico (se configurato):**
```powershell
git push origin main
# Se Vercel è configurato, deploya automaticamente
```

#### **Deploy manuale:**
```powershell
npx vercel --prod
# Deploya manualmente su Vercel
```

### **📊 Monitoraggio Produzione**

#### **Vedere deployment attivi:**
```powershell
npx vercel ls
# Mostra: tutti i deployment su Vercel
```

#### **Vedere logs di produzione:**
```powershell
npx vercel logs
# Mostra: errori e attività in produzione
```

---

## 🧪 **CATEGORIA 4: TESTING - Controllo Qualità**

*Come "assaggiare" i tuoi piatti prima di servirli*

### **🔍 Test Automatici**

#### **Test base (5 minuti):**
```powershell
node debug-puppeteer.js
# Testa: login, navigazione, funzionalità principali
```

#### **Test completo (15 minuti):**
```powershell
node debug-app-detailed.js
# Testa: performance, errori, responsiveness, sicurezza
```

#### **Test bypass auth (per problemi login):**
```powershell
node test-bypass-auth.js
# Testa: tutto senza bisogno di login
```

### **🎯 Test Manuali**

#### **Test browser (F12):**
```powershell
# 1. Apri localhost:3000
# 2. Premi F12
# 3. Vai su Console
# 4. Cerca errori in rosso
```

#### **Test responsive:**
```powershell
# 1. F12 → Device Toolbar
# 2. Testa su mobile, tablet, desktop
# 3. Verifica che tutto si adatti
```

### **📈 Test Performance**

#### **Test velocità caricamento:**
```powershell
# 1. F12 → Network
# 2. Ricarica pagina
# 3. Verifica tempi di caricamento
# 4. Cerca file troppo pesanti (>1MB)
```

---

## 🔧 **CATEGORIA 5: UTILITY - Strumenti di Supporto**

*Gli "utensili" della tua cucina digitale*

### **📁 Gestione File**

#### **Vedere struttura progetto:**
```powershell
tree /F
# Mostra: struttura completa cartelle e file
```

#### **Cercare file:**
```powershell
dir /s nome-file
# Cerca: file specifico in tutte le sottocartelle
```

#### **Vedere spazio disco:**
```powershell
dir
# Mostra: dimensione cartelle e file
```

### **🌐 Gestione Rete**

#### **Test connessione:**
```powershell
ping google.com
# Testa: se internet funziona
```

#### **Vedere IP locale:**
```powershell
ipconfig
# Mostra: indirizzo IP del tuo computer
```

### **💾 Gestione Processi**

#### **Vedere tutti i processi:**
```powershell
tasklist
# Mostra: tutti i programmi in esecuzione
```

#### **Chiudere tutto Node.js:**
```powershell
taskkill /IM "node.exe" /F
taskkill /IM "npm.exe" /F
# Chiude: tutti i processi di sviluppo
```

---

## 🚨 **CATEGORIA 6: TROUBLESHOOTING - Risoluzione Problemi**

*Come "aggiustare" quando qualcosa va storto*

### **🔴 Problemi Comuni**

#### **"App non si carica":**
```powershell
# 1. Verifica posizione
cd C:\Users\matte.MIO\Documents\GitHub\BHM-v.2

# 2. Avvia server
npm run dev

# 3. Se errori, test diagnostico
node debug-app-detailed.js
```

#### **"Pagina bianca":**
```powershell
# 1. Hard refresh browser: Ctrl + Shift + R
# 2. Pulisci e riavvia:
npm run build:clean
npm run dev
```

#### **"Modifiche non si vedono":**
```powershell
# 1. Refresh: Ctrl + R
# 2. Se persiste: Ctrl + Shift + R
# 3. Se ancora persiste: riavvia server
```

#### **"Errori TypeScript":**
```powershell
# 1. Vedi errori specifici:
npm run type-check

# 2. Se troppi errori, reset:
git checkout -- .
git pull origin main
```

### **🟡 Problemi Git**

#### **"Conflitti di merge":**
```powershell
# 1. Vedi conflitti:
git status

# 2. Risolvi manualmente nei file
# 3. Aggiungi risoluzione:
git add .
git commit -m "resolve: risolti conflitti"
```

#### **"Commit sbagliato":**
```powershell
# Annulla ultimo commit (mantieni modifiche):
git reset --soft HEAD~1

# Annulla ultimo commit (cancella modifiche):
git reset --hard HEAD~1
```

### **🟢 Problemi Vercel**

#### **"Deploy fallito":**
```powershell
# 1. Vedi errori:
npx vercel logs

# 2. Testa build locale:
npm run build

# 3. Se build OK, riprova deploy:
npx vercel --prod
```


## 📅 **ROUTINE QUOTIDIANA - La Tua Giornata Tipo**

### **🌅 Inizio Giornata (5 comandi):**
```powershell
cd C:\Users\matte.MIO\Documents\GitHub\BHM-v.2    # Vai al progetto
git checkout cursor-workspace                      # Scegli branch
git pull origin main && git rebase origin/main    # Aggiorna
npm run dev                                        # Avvia server
node debug-app-detailed.js                        # Verifica tutto OK
```

### **🌙 Fine Lavoro (3 comandi):**
```powershell
git add . && git commit -m "fix: descrizione modifiche"  # Salva
git push origin cursor-workspace                         # Invia online
Ctrl + C                                                # Spegni server
```

### **🔄 Prima di Dormire (2 comandi):**
```powershell
git push origin main                                   # Backup finale
taskkill /IM "node.exe" /F                             # Chiudi tutto
```

---

## 🎮 **MICRO-MISSIONI - Imparare Facendo**

### **MISSIONE 1: "Padronanza Base" (15 min)**
1. Apri PowerShell
2. Vai nella directory corretta
3. Avvia server
4. Apri `localhost:3000` nel browser
5. Esegui `debug-puppeteer.js`
6. Ferma server

### **MISSIONE 2: "Branch Master" (10 min)**
1. Controlla branch attuale: `git branch`
2. Cambia branch: `git checkout cursor-workspace`
3. Aggiorna: `git pull origin main`
4. Verifica: `git status`

### **MISSIONE 3: "Debug Detective" (20 min)**
1. Esegui `debug-app-detailed.js`
2. Leggi output per errori
3. Apri pagina problematica in browser
4. Usa F12 per vedere console errori

### **MISSIONE 4: "Git Ninja" (15 min)**
1. Modifica un file
2. Vedi modifiche: `git diff`
3. Salva: `git add . && git commit -m "test: modifiche prova"`
4. Invia: `git push origin cursor-workspace`

---

## ❓ **FAQ RAPIDE - Domande Frequenti**

**Q: Da dove lavoro sempre?**
**A:** `BHM-v.2/` - MAI dalla directory padre!

**Q: Il server è lento - lo riavvio?**
**A:** SÌ! `Ctrl+C` poi `npm run dev` - è normale!

**Q: Come capisco se tutto funziona?**
**A:** `node debug-app-detailed.js` deve dire "No critical errors"

**Q: Quale branch uso?**
**A:** Dipende dall'agent: cursor/gemini/claude-workspace

**Q: Come faccio backup sicuro?**
**A:** `git push origin main` prima di dormire

**Q: Ho rotto tutto - come ripristino?**
**A:** `git reset --hard origin/main` (ATTENZIONE: cancella modifiche!)

---

## 🎯 **RICORDA SEMPRE**

**Debugging = Controllo qualità nella tua cucina HACCP!**

Ogni test verifica che una "stazione" dell'app funzioni correttamente. È come assaggiare ogni piatto prima di servirlo ai clienti.

**La tua formula magica:**
```
Problema Identificato + Comando Giusto + Test Verifica = Soluzione ✅
```

**🚀 Sei pronto a diventare il "chef digitale" più efficace che hai mai immaginato!**