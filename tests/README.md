# 🧪 Guida Test E2E - BHM v.2

Guida completa per creare test E2E efficaci con Playwright per il progetto BHM v.2.

## 📋 Indice

1. [Quick Start](#quick-start)
2. [Struttura File](#struttura-file)
3. [Template Base](#template-base)
4. [Autenticazione](#autenticazione)
5. [Best Practices](#best-practices)
6. [Esempi Comuni](#esempi-comuni)
7. [Debugging](#debugging)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### 1. Crea un nuovo test

Copia il template base:

```bash
cp tests/template.spec.ts tests/mio-nuovo-test.spec.ts
```

### 2. Modifica il test

Apri `tests/mio-nuovo-test.spec.ts` e personalizza:

```typescript
import { test, expect } from '@playwright/test'
import { loginAsTestUser } from './helpers/auth.helper'

test.describe('Mio Nuovo Test', () => {
  test.beforeEach(async ({ page }) => {
    // Login automatico
    await loginAsTestUser(page)
  })

  test('dovrebbe fare qualcosa', async ({ page }) => {
    await page.goto('/calendar')
    // Il tuo test qui...
  })
})
```

### 3. Esegui il test

```bash
# Modalità headed (con browser visibile)
npx playwright test tests/mio-nuovo-test.spec.ts --headed

# Modalità headless (senza browser)
npx playwright test tests/mio-nuovo-test.spec.ts

# Con UI interattiva
npx playwright test tests/mio-nuovo-test.spec.ts --ui
```

---

## 📁 Struttura File

```
tests/
├── README.md                    # Questa guida
├── template.spec.ts             # Template base per nuovi test
├── auth.config.ts               # Credenziali e config autenticazione
├── helpers/
│   └── auth.helper.ts           # Helper per login/logout
├── onboarding/
│   └── completamento-onboarding.spec.ts
├── auth/
│   └── login/
│       └── LoginPage.spec.ts
└── [feature]/
    └── [test-name].spec.ts
```

### Convenzioni Naming

- **File test**: `kebab-case.spec.ts` (es: `gestione-staff.spec.ts`)
- **Test suite**: PascalCase (es: `'Gestione Staff'`)
- **Test case**: lowercase descrittivo (es: `'dovrebbe creare nuovo membro staff'`)

---

## 📄 Template Base

### Template Completo

Vedi file [`tests/template.spec.ts`](./template.spec.ts) per il template completo.

### Template Minimo

```typescript
import { test, expect } from '@playwright/test'
import { loginAsTestUser } from './helpers/auth.helper'

test.describe('Nome Feature', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  test('dovrebbe fare qualcosa', async ({ page }) => {
    await page.goto('/pagina')

    // Il tuo test qui
    const element = page.locator('[data-testid="elemento"]')
    await expect(element).toBeVisible()
  })
})
```

---

## 🔐 Autenticazione

### Credenziali Test

Le credenziali di test sono definite in [`tests/auth.config.ts`](./auth.config.ts):

```typescript
export const TEST_CREDENTIALS = {
  email: '0Cavuz0@gmail.com',
  password: 'Cavallaro1994'
}
```

⚠️ **IMPORTANTE**: Queste sono credenziali di test. NON utilizzare credenziali di produzione.

### Metodi di Autenticazione

#### 1. Login Automatico (Raccomandato)

Usa `loginAsTestUser()` nel `beforeEach`:

```typescript
test.beforeEach(async ({ page }) => {
  await loginAsTestUser(page)
})
```

#### 2. Login Manuale

```typescript
test('login manuale', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', TEST_CREDENTIALS.email)
  await page.fill('input[type="password"]', TEST_CREDENTIALS.password)
  await page.click('button[type="submit"]')

  await page.waitForURL(/\/(calendar|dashboard)/)
})
```

#### 3. Navigazione con Auto-Login

```typescript
import { navigateWithAuth } from './helpers/auth.helper'

test('naviga con auto-login', async ({ page }) => {
  // Se non sei loggato, fa login automaticamente
  await navigateWithAuth(page, '/calendar')
})
```

### Helper Disponibili

Vedi [`tests/helpers/auth.helper.ts`](./helpers/auth.helper.ts):

- `loginAsTestUser(page, credentials?)` - Esegue login
- `logout(page)` - Esegue logout
- `isAuthenticated(page)` - Verifica se l'utente è autenticato
- `navigateWithAuth(page, url)` - Naviga con auto-login
- `setupAuth(page)` - Setup rapido per beforeEach

---

## ✅ Best Practices

### 1. Usa Data Attributes per Selettori Stabili

❌ **Evita**:
```typescript
page.locator('div > button.btn-primary:nth-child(2)')
```

✅ **Preferisci**:
```typescript
page.locator('[data-testid="add-staff-button"]')
```

### 2. Usa Attese Esplicite

❌ **Evita**:
```typescript
await page.waitForTimeout(5000)  // Attesa fissa
```

✅ **Preferisci**:
```typescript
await page.waitForSelector('[data-testid="elemento"]')
await page.waitForLoadState('networkidle')
```

### 3. Gestisci Errori Console

```typescript
let consoleErrors: string[] = []

test.beforeEach(async ({ page }) => {
  consoleErrors = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      if (!text.includes('favicon') && !text.includes('404')) {
        consoleErrors.push(text)
      }
    }
  })
})

test('verifica assenza errori', async () => {
  // ... test code ...
  expect(consoleErrors).toHaveLength(0)
})
```

### 4. Usa Retry per Test Flaky

```typescript
test.describe.configure({ retries: 2 })

test.describe('Test con retry', () => {
  // Ogni test verrà ritentato max 2 volte se fallisce
})
```

### 5. Verifica Database quando Necessario

```typescript
import { createClient } from '@supabase/supabase-js'

test('verifica dati salvati', async () => {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)

  expect(error).toBeNull()
  expect(data).toBeDefined()
})
```

### 6. Pulisci Stato tra Test

```typescript
test.afterEach(async ({ page }) => {
  // Cleanup se necessario
  await page.evaluate(() => localStorage.clear())
})
```

---

## 🎯 Esempi Comuni

### Test Navigazione

```typescript
test('dovrebbe navigare al calendario', async ({ page }) => {
  await loginAsTestUser(page)
  await page.goto('/calendar')

  await expect(page).toHaveURL(/\/calendar/)
  await expect(page.locator('h1:has-text("Calendario")')).toBeVisible()
})
```

### Test Form Submit

```typescript
test('dovrebbe compilare e inviare form', async ({ page }) => {
  await loginAsTestUser(page)
  await page.goto('/staff/new')

  // Compila form
  await page.fill('[name="firstName"]', 'Mario')
  await page.fill('[name="lastName"]', 'Rossi')
  await page.selectOption('[name="role"]', 'cuoco')

  // Submit
  await page.click('button[type="submit"]')

  // Verifica success
  await expect(page.locator('.toast-success')).toBeVisible()
})
```

### Test Click Button

```typescript
test('dovrebbe cliccare pulsante e verificare azione', async ({ page }) => {
  await loginAsTestUser(page)
  await page.goto('/dashboard')

  const addButton = page.locator('[data-testid="add-item"]')
  await addButton.click()

  // Verifica modal aperto
  await expect(page.locator('[role="dialog"]')).toBeVisible()
})
```

### Test Dropdown/Select

```typescript
test('dovrebbe selezionare opzione dropdown', async ({ page }) => {
  await page.selectOption('select[name="department"]', 'cucina')

  // Verifica selezione
  const selectedValue = await page.locator('select[name="department"]').inputValue()
  expect(selectedValue).toBe('cucina')
})
```

### Test Upload File

```typescript
test('dovrebbe caricare file', async ({ page }) => {
  const fileInput = page.locator('input[type="file"]')

  await fileInput.setInputFiles({
    name: 'test.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('PDF content here')
  })

  await page.click('button:has-text("Upload")')
  await expect(page.locator('.upload-success')).toBeVisible()
})
```

### Test Modal/Dialog

```typescript
test('dovrebbe aprire e chiudere modal', async ({ page }) => {
  // Apri modal
  await page.click('[data-testid="open-modal"]')
  const modal = page.locator('[role="dialog"]')
  await expect(modal).toBeVisible()

  // Chiudi modal
  await page.click('[data-testid="close-modal"]')
  await expect(modal).not.toBeVisible()
})
```

### Test Tabella/Lista

```typescript
test('dovrebbe visualizzare lista elementi', async ({ page }) => {
  await page.goto('/staff')

  // Verifica presenza tabella
  const table = page.locator('table')
  await expect(table).toBeVisible()

  // Verifica righe
  const rows = table.locator('tbody tr')
  await expect(rows).toHaveCount(5)  // Esempio: 5 staff members

  // Verifica contenuto prima riga
  const firstRow = rows.first()
  await expect(firstRow.locator('td').first()).toContainText('Mario Rossi')
})
```

### Test Filtro/Ricerca

```typescript
test('dovrebbe filtrare risultati', async ({ page }) => {
  await page.goto('/products')

  // Input ricerca
  await page.fill('input[placeholder="Cerca..."]', 'pasta')

  // Attendi risultati filtrati
  await page.waitForTimeout(500)

  // Verifica risultati
  const results = page.locator('.product-item')
  const count = await results.count()

  expect(count).toBeGreaterThan(0)

  // Verifica che tutti contengano "pasta"
  for (let i = 0; i < count; i++) {
    const text = await results.nth(i).textContent()
    expect(text?.toLowerCase()).toContain('pasta')
  }
})
```

---

## 🐛 Debugging

### 1. Modalità Headed

Vedi il browser mentre esegue il test:

```bash
npx playwright test tests/mio-test.spec.ts --headed
```

### 2. Modalità Debug

Esegui test in debug mode:

```bash
npx playwright test tests/mio-test.spec.ts --debug
```

### 3. UI Mode

UI interattiva per debugging:

```bash
npx playwright test tests/mio-test.spec.ts --ui
```

### 4. Screenshot e Video

Cattura screenshot/video on failure:

```typescript
test.use({
  screenshot: 'only-on-failure',
  video: 'retain-on-failure'
})

test('con screenshot', async ({ page }) => {
  // ... test code ...

  // Screenshot manuale
  await page.screenshot({ path: 'debug-screenshot.png' })
})
```

### 5. Trace Viewer

```bash
# Abilita trace
npx playwright test --trace on

# Visualizza trace
npx playwright show-trace trace.zip
```

### 6. Console Logging

```typescript
test('con logging', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()))

  console.log('🔍 Inizio test...')

  await page.goto('/calendar')

  console.log('✅ Navigazione completata')
})
```

---

## 🔧 Troubleshooting

### Problema: Test non trovati

**Errore**: `Error: No tests found`

**Soluzione**: Verifica il pattern in `playwright.config.ts`:

```typescript
{
  name: 'Onboarding',
  testMatch: '**/*onboarding*.{spec,test}.{ts,js}'
}
```

### Problema: Timeout su login

**Errore**: `Timeout 30000ms exceeded`

**Soluzione**: Aumenta timeout:

```typescript
await loginAsTestUser(page)
await page.waitForURL(/\/calendar/, { timeout: 15000 })
```

### Problema: Selettore non trovato

**Errore**: `Selector "[data-testid="elemento"]" not found`

**Soluzione**:
1. Verifica che l'elemento esista nella pagina
2. Usa `waitForSelector` con timeout maggiore
3. Usa selettori alternativi:

```typescript
// Prova selettori multipli
const element = page.locator('[data-testid="elemento"], button:has-text("Testo"), .classe-css')
```

### Problema: Errori console ignorati

**Soluzione**: Filtra errori non critici:

```typescript
page.on('console', (msg) => {
  const text = msg.text()
  if (msg.type() === 'error' &&
      !text.includes('favicon') &&
      !text.includes('404')) {
    consoleErrors.push(text)
  }
})
```

### Problema: Test flaky (instabili)

**Soluzione**:
1. Usa `waitForLoadState('networkidle')`
2. Aggiungi retry: `test.describe.configure({ retries: 2 })`
3. Usa attese esplicite invece di `waitForTimeout`

---

## 📚 Risorse Utili

- [Playwright Docs](https://playwright.dev/)
- [Playwright API](https://playwright.dev/docs/api/class-playwright)
- [Selettori Playwright](https://playwright.dev/docs/selectors)
- [Best Practices Playwright](https://playwright.dev/docs/best-practices)

---

## 🎓 Checklist per Nuovo Test

Prima di creare un test, assicurati di:

- [ ] Copiare `template.spec.ts` come base
- [ ] Configurare login se necessario (`loginAsTestUser`)
- [ ] Usare selettori stabili (`data-testid` quando possibile)
- [ ] Gestire errori console
- [ ] Aggiungere retry se il test è potenzialmente flaky
- [ ] Verificare timeout appropriati
- [ ] Testare in modalità headed prima di commit
- [ ] Pulire stato tra test (localStorage, cookies)
- [ ] Documentare il test con commenti chiari
- [ ] Eseguire il test almeno 3 volte per verificare stabilità

---

## 🤖 Note per Agenti AI

Quando crei un nuovo test E2E:

1. **SEMPRE** parti da `tests/template.spec.ts`
2. **SEMPRE** usa `loginAsTestUser()` per autenticazione
3. **SEMPRE** gestisci errori console
4. **SEMPRE** usa `test.describe.configure({ retries: 2 })`
5. **MAI** usare `waitForTimeout` se evitabile (usa `waitForSelector`)
6. **MAI** usare selettori CSS fragili (usa `data-testid`)
7. **VERIFICA** che il test passi almeno 2 volte consecutive
8. **LOGGA** informazioni utili per debugging (`console.log`)

---

**Ultimo Aggiornamento**: 2026-01-07
**Maintainer**: BHM v.2 Team
