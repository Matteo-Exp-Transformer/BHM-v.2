# 🧪 Test Onboarding BHM v.2

> Sistema di test automatizzati per flusso onboarding completo

---

## 📁 Struttura

```
Production/Test/Onboarding/
├── 01-onboarding-precompila.spec.js    # TEST 1: Onboarding con pulsante Precompila
├── 02-onboarding-manuale-completo.spec.js  # TEST 2: Compilazione manuale (TODO)
│
├── Steps/                               # Test individuali per step (TODO)
│   ├── step-01-business-info.spec.js
│   ├── step-02-departments.spec.js
│   ├── step-03-staff.spec.js
│   └── step-04-conservation.spec.js
│
├── fixtures/                            # Dati test
│   ├── business-data.js                 # Dati business validi/invalidi
│   └── conservation-scenarios.js        # Scenari conservazione con validazioni
│
├── utils/                               # Utilities test
│   ├── supabase-assertions.js           # Assertions DB Supabase
│   ├── ui-assertions.js                 # Assertions UI
│   └── navigation-helpers.js            # Helpers navigazione wizard
│
└── README.md                            # Questa guida
```

---

## 🚀 Setup

### 1. Installa Dipendenze

```bash
npm install @playwright/test @supabase/supabase-js --save-dev
```

### 2. Configura Environment Variables

Modifica `.env.test`:

```env
# Test user credentials (Supabase Auth)
TEST_USER_EMAIL=tua-email@example.com
TEST_USER_PASSWORD=tua-password

# Supabase Service Key (per assertions DB)
SUPABASE_SERVICE_KEY=tuo-service-key-supabase

# Base URL
BASE_URL=http://localhost:3000
```

**⚠️ IMPORTANTE**:
- Usa un **utente test dedicato** (non produzione!)
- **SUPABASE_SERVICE_KEY** serve per bypass RLS nei test (trovalo in Supabase Dashboard → Settings → API)

### 3. Verifica App Running

```bash
# In un terminale separato
npm run dev
```

App deve essere accessibile su `http://localhost:3000`

---

## ▶️ Esecuzione Test

### TEST 1: Onboarding con Precompila

#### Modalità 1: Headless (MCP - default)

```bash
npx playwright test 01-onboarding-precompila --config=playwright-onboarding.config.ts --project=chromium-headless
```

#### Modalità 2: Headed Demo (visualizzazione)

```bash
npx playwright test 01-onboarding-precompila --config=playwright-onboarding.config.ts --project=chromium-headed-demo
```

Questo eseguirà il test con:
- Browser visibile (headed)
- Slow motion 500ms (per vedere azioni)
- Screenshot e video recording

#### Modalità 3: Debug Mode

```bash
npx playwright test 01-onboarding-precompila --config=playwright-onboarding.config.ts --debug
```

Apre Playwright Inspector per step-by-step debugging

---

## 📊 TEST 1: Descrizione

### Flusso Test

1. **Login** utente test
2. **Click pulsante "Precompila"** (una sola volta all'inizio)
3. **Navigazione wizard**: Attraversa tutti i 7 step con dati precompilati
4. **Completa onboarding**: Click "Completa Configurazione" ultimo step

### Assertions

#### ✅ A. Onboarding Completato
- Redirect a `/dashboard` verificato
- Dashboard renderizzata correttamente

#### ✅ B. Dati in Supabase DB
Verifica presenza dati in tabelle:
- `companies` - Business info
- `departments` - Reparti (8 expected)
- `staff` - Staff members (min 3)
- `conservation_points` - Punti conservazione (min 3)
- `tasks` - Tasks (min 10)
- `products` - Inventario prodotti (min 5)
- `company_calendar_settings` - Config calendario

#### ✅ C. Dati Visibili in UI
Naviga alle tab e verifica dati visibili:
- **Dashboard**: Business name, stats cards
- **Reparti**: Lista departments
- **Staff**: Lista staff members
- **Conservazione**: Lista punti conservazione
- **Inventario**: Prodotti
- **Tasks**: Tasks
- **Calendario**: Calendario accessibile

### Dati Attesi (Precompila)

Basato su `getPrefillData()` in `onboardingHelpers.ts`:

- **Business**: Al Ritrovo SRL, Oristano
- **Departments**: Cucina, Bancone, Sala, Magazzino, etc. (8 totali)
- **Staff**: Paolo Dettori (admin), Matteo Cavallaro, Luigi Mulas, etc.
- **Conservation**: Frigo Cucina A, Freezer A, Dispensa A, etc.
- **Tasks**: Vari tasks precompilati (~10+)
- **Products**: Prodotti inventario precompilati (~5+)

---

## 🐛 Troubleshooting

### Errore: "Company ID non trovato"

**Causa**: Utente test non ha company associata

**Soluzione**:
1. Assicurati che utente test sia registrato in Supabase Auth
2. Esegui onboarding manualmente una volta per creare company
3. Oppure usa script di seed per creare company test

### Errore: "Pulsante Precompila non visibile"

**Causa**: DevButtons non attivi (solo in dev mode)

**Soluzione**:
1. Verifica che app sia in modalità development (`npm run dev`)
2. Controlla che `import.meta.env.DEV` sia `true`
3. DevButtons sono visibili solo in dev mode

### Errore: "Cannot connect to Supabase"

**Causa**: Variabili ambiente Supabase mancanti

**Soluzione**:
1. Verifica `.env.test` con `VITE_SUPABASE_URL` e `SUPABASE_SERVICE_KEY`
2. Copia da `.env.local` se necessario
3. Verifica che Supabase project sia running

### Test Fallisce su Step Specifico

**Debug**:
1. Esegui in modalità `--headed` per vedere cosa succede
2. Controlla screenshot in `Production/Test/Onboarding/screenshots/`
3. Controlla video in `test-results/`
4. Usa `--debug` per step-by-step inspection

### Timeout su Assertions

**Causa**: Test troppo lento o app non risponde

**Soluzione**:
1. Aumenta timeout in `playwright-onboarding.config.ts`
2. Verifica che app dev server sia responsive
3. Usa network tab in browser per check API calls lente

---

## 📝 Note Importanti

### Cleanup Dati Test

⚠️ **Di default, test NON pulisce dati** per permettere ispezione manuale.

Per abilitare cleanup automatico, decommentare in `01-onboarding-precompila.spec.js`:

```javascript
test.afterEach(async ({ page }) => {
  if (companyId) {
    await cleanupTestData(companyId)
  }
})
```

### Idempotenza

Test è **idempotente** se cleanup abilitato. Altrimenti ogni run crea nuovi dati in DB.

Per re-testare senza cleanup:
1. Usa utente test diverso ogni volta
2. Oppure pulisci manualmente DB tra test
3. Oppure abilita cleanup automatico

### MCP Playwright Tool

Test è configurato per funzionare con **MCP Playwright tool** in Cursor:
- Headless execution (no UI)
- Screenshot on failure
- JSON report output

---

## 🎯 Prossimi Step

### TEST 2: Onboarding Manuale

Da creare in nuova conversazione:
- Compilazione manuale ogni step (NO precompila)
- Template per agenti che creeranno test individuali step

### Test Individuali Step 1-4

- `step-01-business-info.spec.js` - Validazione business info
- `step-02-departments.spec.js` - Validazione departments
- `step-03-staff.spec.js` - Validazione staff
- `step-04-conservation.spec.js` - Validazione conservazione (logica temperature)

---

## 📚 Risorse

- [Playwright Documentation](https://playwright.dev/)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- `Production/Prompt_Context/TEMPLATE_TEST_JS.md` - Template test Playwright
- `src/utils/onboardingHelpers.ts` - Logica precompila dati

---

**🎉 Test configurati e pronti all'uso!**
