# 🎭 Playwright MCP - Guida Completa

**Progetto**: Business HACCP Manager v.2  
**Data**: 2026-01-07

---

## 🎯 Cos'è Playwright MCP?

Playwright MCP permette a Cursor di interagire con browser automatizzati per:
- 🌐 Navigare pagine web
- 📸 Fare screenshot
- 🧪 Testare applicazioni
- 🔍 Ispezionare elementi
- ⚡ Eseguire azioni automatizzate

---

## 🔧 Configurazione

### File: `.cursor/mcp.json`
```json
{
  "mcpServers": {
    "playwright": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@playwright/mcp@latest"],
      "env": {}
    }
  }
}
```

### Nessun Token Richiesto
Playwright MCP non richiede token di autenticazione! ✅

---

## 🚀 Installazione Browser

### Prima Volta
```powershell
# Installa browser Chromium
npx playwright install chromium

# Oppure tutti i browser
npx playwright install
```

### Verifica Installazione
```powershell
# Verifica Playwright disponibile
npx playwright --version
```

---

## 📝 Esempi di Utilizzo

### 1. Navigazione Base
```
User: "Apri localhost:3000 con Playwright"
Cursor: [Apre browser e naviga alla pagina]
```

### 2. Screenshot
```
User: "Fai uno screenshot della homepage"
Cursor: [Cattura screenshot e lo salva]
```

### 3. Testing Interattivo
```
User: "Clicca sul pulsante Login e verifica che appaia il form"
Cursor: [Esegue azione e verifica risultato]
```

### 4. Ispezione Elementi
```
User: "Trova tutti i link nella pagina"
Cursor: [Lista tutti gli elementi <a>]
```

### 5. Form Testing
```
User: "Compila il form di login con email test@example.com"
Cursor: [Inserisce dati nel form]
```

---

## 🧪 Test E2E con Playwright MCP

### Scenario: Test Login Flow
```
User: "Testa il flusso di login completo:
1. Apri /login
2. Inserisci email: admin@test.com
3. Inserisci password: Test123!
4. Clicca Login
5. Verifica redirect a /dashboard"

Cursor: [Esegue tutti gli step e riporta risultati]
```

### Scenario: Test Form Validation
```
User: "Testa la validazione del form prenotazioni:
1. Apri /prenota
2. Lascia campi vuoti
3. Clicca Invia
4. Verifica messaggi errore"

Cursor: [Esegue test e mostra errori trovati]
```

---

## 🎨 Integrazione con Progetto BHM

### Test Aree Applicazione

#### 1. Autenticazione
```
- Login page (/login)
- Register page (/register)
- Password recovery
- Invite system
```

#### 2. Dashboard
```
- KPI cards
- Charts rendering
- Navigation menu
- User profile
```

#### 3. Calendar
```
- Event creation
- Event editing
- Date selection
- Recurring events
```

#### 4. Forms
```
- Booking requests
- Menu selection
- Inventory management
- Settings forms
```

---

## 🔄 Workflow Consigliato

### 1. Sviluppo Feature
```
1. Sviluppa componente React
2. Avvia dev server (npm run dev)
3. Usa Playwright MCP per test manuale
4. Verifica comportamento
5. Crea test automatici
```

### 2. Debug Visuale
```
1. Identifica bug
2. Usa Playwright MCP per riprodurre
3. Fai screenshot dello stato errato
4. Ispeziona elementi problematici
5. Fix e verifica
```

### 3. Test Regressione
```
1. Dopo modifiche importanti
2. Usa Playwright MCP per test smoke
3. Verifica funzionalità critiche
4. Screenshot before/after
```

---

## 🎯 Comandi Playwright MCP

### Navigazione
- `goto(url)` - Naviga a URL
- `goBack()` - Torna indietro
- `goForward()` - Vai avanti
- `reload()` - Ricarica pagina

### Interazione
- `click(selector)` - Clicca elemento
- `fill(selector, text)` - Compila input
- `press(key)` - Premi tasto
- `hover(selector)` - Hover su elemento

### Verifica
- `isVisible(selector)` - Elemento visibile?
- `textContent(selector)` - Ottieni testo
- `getAttribute(selector, attr)` - Ottieni attributo
- `screenshot(path)` - Salva screenshot

### Attesa
- `waitForSelector(selector)` - Attendi elemento
- `waitForNavigation()` - Attendi navigazione
- `waitForTimeout(ms)` - Attendi tempo

---

## 🛠️ Configurazione Avanzata

### Headless vs Headed
```json
{
  "playwright": {
    "env": {
      "PLAYWRIGHT_HEADLESS": "false"  // Mostra browser
    }
  }
}
```

### Slow Motion (Debug)
```json
{
  "playwright": {
    "env": {
      "PLAYWRIGHT_SLOW_MO": "1000"  // 1 secondo tra azioni
    }
  }
}
```

### Browser Specifico
```json
{
  "playwright": {
    "env": {
      "PLAYWRIGHT_BROWSER": "chromium"  // chromium, firefox, webkit
    }
  }
}
```

---

## 🚨 Troubleshooting

### Browser non si apre
```powershell
# Reinstalla browser
npx playwright install chromium --force
```

### Timeout errori
```
User: "Aumenta timeout a 30 secondi per questa azione"
```

### Selettori non trovati
```
User: "Usa data-testid invece di class per trovare elemento"
```

### Screenshot non salvati
```powershell
# Verifica directory screenshots esiste
New-Item -ItemType Directory -Path screenshots -Force
```

---

## 📊 Best Practices

### ✅ DO
- Usa `data-testid` per selettori stabili
- Attendi elementi prima di interagire
- Fai screenshot per debug
- Testa su localhost prima di prod
- Usa headless per test automatici

### ❌ DON'T
- Non usare selettori CSS fragili
- Non fare azioni senza attese
- Non testare su prod direttamente
- Non ignorare timeout warnings
- Non dimenticare di chiudere browser

---

## 🔗 Integrazione con Test Suite

### Playwright Config Esistenti
Il progetto ha già configurazioni Playwright:
- `playwright.config.ts` - Config principale
- `config/playwright/playwright-agent*.config.ts` - Config per agenti

### Complementarietà
- **Playwright MCP**: Test manuali, debug, esplorazione
- **Playwright Scripts**: Test automatici, CI/CD, regressione

---

## 📚 Risorse

### Documentazione
- **Playwright Docs**: https://playwright.dev/
- **Playwright MCP**: https://github.com/microsoft/playwright-mcp
- **Selectors Guide**: https://playwright.dev/docs/selectors

### Progetto BHM
- **Test Directory**: `tests/`
- **Agent Configs**: `config/playwright/`
- **Test Scripts**: `Production/Test/`

---

## 🎓 Tutorial Rapido

### Esempio Completo: Test Login
```
User: "Testa il login con questi step:
1. Apri http://localhost:3000/login
2. Attendi che il form sia visibile
3. Compila email: admin@bhm.com
4. Compila password: Admin123!
5. Clicca sul bottone 'Accedi'
6. Attendi redirect
7. Verifica URL contenga /dashboard
8. Fai screenshot finale
9. Chiudi browser"

Cursor: [Esegue tutti gli step e riporta risultati]
```

---

## ✅ Checklist Setup

- [x] Playwright MCP configurato in `.cursor/mcp.json`
- [ ] Browser Chromium installato (`npx playwright install chromium`)
- [ ] Dev server in esecuzione (`npm run dev`)
- [ ] Test navigazione base funzionante
- [ ] Screenshot directory creata

---

**🎭 Playwright MCP pronto per l'uso!**

Per iniziare, prova: `"Apri localhost:3000 e fai uno screenshot"`





