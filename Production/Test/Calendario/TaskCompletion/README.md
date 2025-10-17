# 🧪 Task Completion Tests - Istruzioni Esecuzione

> **Test per completamento mansioni generiche e manutenzioni del giorno corrente**

## 🚀 Avvio Rapido

### Prerequisiti
1. **Applicazione in esecuzione**: `npm run dev` su porta 3000
2. **Playwright installato**: `npm install @playwright/test`
3. **Browser installati**: `npx playwright install`

### Esecuzione Test

```bash
# Esegui tutti i test di completamento tasks
npx playwright test

# Esegui solo test mansioni generiche
npx playwright test test-generic-tasks-completion.spec.js

# Esegui solo test manutenzioni
npx playwright test test-maintenance-completion.spec.js

# Esegui con report HTML
npx playwright test --reporter=html

# Esegui in modalità debug
npx playwright test --debug
```

## 📋 Workflow Test

### 1. Test Mansioni Generiche
```
Login → Attività → Giorno Corrente → Mansioni Generiche → Completa Tutte → Verifica Refresh
```

### 2. Test Manutenzioni
```
Login → Attività → Giorno Corrente → Manutenzioni → Completa Tutte → Verifica Refresh
```

## 🔧 Configurazione

### Credenziali
- **Email**: `matteo.cavallaro.work@gmail.com`
- **Password**: `cavallaro`
- **Host**: `http://localhost:3000`

### Database
- **Supabase URL**: `https://tucqgcfrlzmwyfadiodo.supabase.co`
- **Project ID**: `tucqgcfrlzmwyfadiodo`

## 📊 Risultati Attesi

### Successo
- ✅ Tutte le mansioni generiche completate
- ✅ Tutte le manutenzioni completate  
- ✅ Pannello si refresha automaticamente
- ✅ Tasks completate spostate in "Attività Completate"
- ✅ Feedback visivo durante operazioni

### Edge Cases
- ✅ Caso senza tasks per il giorno
- ✅ Tasks già completate (skip)
- ✅ Modal completamento con checklist
- ✅ Feedback loading/success/error

## 🐛 Troubleshooting

### Errori Comuni

**1. Connessione fallita**
```bash
# Verifica che l'app sia in esecuzione
curl http://localhost:3000
```

**2. Login fallito**
```bash
# Verifica credenziali nel file di tracking
cat TaskCompletion-Tracking.md
```

**3. Test timeout**
```bash
# Aumenta timeout nel config
# Modifica playwright.config.js
```

**4. Browser non installato**
```bash
# Installa browser Playwright
npx playwright install
```

## 📁 Struttura File

```
TaskCompletion/
├── test-generic-tasks-completion.spec.js    # Test mansioni generiche
├── test-maintenance-completion.spec.js      # Test manutenzioni
├── playwright.config.js                     # Configurazione Playwright
├── global-setup.js                          # Setup globale
├── global-teardown.js                       # Teardown globale
├── TaskCompletion-Tracking.md               # Documentazione tracking
├── README.md                                # Questo file
└── test-results/                            # Risultati test (generato)
```

## 🎯 Compliance

### Verifiche Automatiche
- ✅ Configurazione MCP server playwright
- ✅ Credenziali reali integrate
- ✅ Database Supabase configurato
- ✅ Report compliance generati
- ✅ Cleanup automatico

### Report Generati
- `test-results/compliance-report.json`
- `test-results.html`
- `test-results.json`
- `test-results.xml`

## 🔄 Integrazione CI/CD

```yaml
# GitHub Actions esempio
- name: Run Task Completion Tests
  run: |
    npm run dev &
    npx playwright test --reporter=html
    npx playwright show-report
```

## 📝 Note Tecniche

### Selezione Elementi
I test utilizzano selettori multipli per robustezza:
- `data-testid` (preferito)
- `text content`
- `class names`
- `attributes`

### Timeout
- **Navigazione**: 30s
- **Azioni**: 10s
- **Attese**: 2s

### Browser Supportati
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari/WebKit

---

**🎯 Obiettivo**: Verificare il completamento completo del workflow di tasks nel calendario seguendo le regole di blindatura del sistema.
