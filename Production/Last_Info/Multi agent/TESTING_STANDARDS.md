# 🧪 TESTING STANDARDS - Template, Checklist, Compliance

> **FILE ESSENZIALE**: Template test minimal, checklist blindatura, compliance DB
> **Tempo lettura**: 5-7 minuti

---

## 📝 TEMPLATE TEST MINIMAL

### Template 1: Test Funzionale Base
```javascript
// Production/Test/[Area]/[Componente]/test-funzionale.spec.js
import { test, expect } from '@playwright/test';

test.describe('[Componente] - Test Funzionali', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Setup iniziale se necessario
  });

  test('Dovrebbe renderizzare correttamente', async ({ page }) => {
    // 1. Trova elemento
    const element = page.locator('[data-testid="component"]');

    // 2. Verifica visibilità
    await expect(element).toBeVisible();

    // 3. Verifica contenuto
    await expect(element).toContainText('Expected text');
  });

  test('Dovrebbe gestire click correttamente', async ({ page }) => {
    // 1. Click elemento
    await page.click('[data-testid="button"]');

    // 2. Verifica risultato
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });

  test('Dovrebbe avere accessibilità corretta', async ({ page }) => {
    // 1. Verifica attributi ARIA
    const button = page.locator('button');
    await expect(button).toHaveAttribute('aria-label');

    // 2. Verifica keyboard navigation
    await button.press('Enter');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });
});
```

### Template 2: Test Validazione Dati
```javascript
// Production/Test/[Area]/[Componente]/test-validazione.spec.js
import { test, expect } from '@playwright/test';

test.describe('[Componente] - Test Validazione', () => {

  test('Dovrebbe accettare input validi', async ({ page }) => {
    await page.goto('/');

    // Test con dati VALIDI
    await page.fill('[data-testid="email"]', 'valid@example.com');
    await page.click('[data-testid="submit"]');

    // Verifica successo
    await expect(page.locator('[data-testid="success"]')).toBeVisible();
  });

  test('Dovrebbe rifiutare input invalidi', async ({ page }) => {
    await page.goto('/');

    // Test con dati INVALIDI
    await page.fill('[data-testid="email"]', 'invalid-email');
    await page.click('[data-testid="submit"]');

    // Verifica errore
    await expect(page.locator('[data-testid="error"]')).toBeVisible();
    await expect(page.locator('[data-testid="error"]')).toContainText('Email non valida');
  });

  test('Dovrebbe gestire caratteri speciali', async ({ page }) => {
    await page.goto('/');

    // Test con caratteri speciali
    const specialChars = ['<script>', "'; DROP TABLE--", '../../etc/passwd'];

    for (const char of specialChars) {
      await page.fill('[data-testid="input"]', char);
      await page.click('[data-testid="submit"]');

      // Verifica sanitizzazione
      await expect(page.locator('[data-testid="error"]')).toBeVisible();
    }
  });
});
```

### Template 3: Test Edge Cases
```javascript
// Production/Test/[Area]/[Componente]/test-edge-cases.spec.js
import { test, expect } from '@playwright/test';

test.describe('[Componente] - Edge Cases', () => {

  test('Dovrebbe gestire valori limite', async ({ page }) => {
    await page.goto('/');

    // Stringa vuota
    await page.fill('[data-testid="input"]', '');
    await expect(page.locator('[data-testid="error"]')).toContainText('Campo obbligatorio');

    // Stringa molto lunga (>1000 caratteri)
    const longString = 'a'.repeat(1001);
    await page.fill('[data-testid="input"]', longString);
    await expect(page.locator('[data-testid="error"]')).toContainText('Troppo lungo');

    // Unicode
    await page.fill('[data-testid="input"]', '🎉 Test 日本語');
    await page.click('[data-testid="submit"]');
    await expect(page.locator('[data-testid="success"]')).toBeVisible();
  });

  test('Dovrebbe gestire stato loading', async ({ page }) => {
    await page.goto('/');

    // Click che trigga loading
    await page.click('[data-testid="async-button"]');

    // Verifica spinner presente
    await expect(page.locator('[data-testid="loading"]')).toBeVisible();

    // Attendi completamento
    await expect(page.locator('[data-testid="result"]')).toBeVisible({ timeout: 10000 });

    // Verifica spinner sparito
    await expect(page.locator('[data-testid="loading"]')).not.toBeVisible();
  });

  test('Dovrebbe gestire errori di rete', async ({ page }) => {
    // Simula offline
    await page.context().setOffline(true);
    await page.goto('/');

    // Tentativo azione
    await page.click('[data-testid="submit"]');

    // Verifica errore rete
    await expect(page.locator('[data-testid="network-error"]')).toBeVisible();

    // Ripristina connessione
    await page.context().setOffline(false);
  });
});
```

---

## ✅ DATABASE COMPLIANCE CHECKLIST

### Pre-Test Checklist
```bash
✅ Connessione Supabase OK
✅ User autenticato
✅ Company disponibile (dev o onboarding)
✅ Schema DB aggiornato (10 tabelle critiche)
✅ Porte app disponibili
✅ Lock system operativo
✅ Dati Precompila intatti
```

### Durante Test
```bash
✅ Test usa baseURL da config (NO hardcoded URL)
✅ Test pulisce dopo sé stesso (afterEach cleanup)
✅ Test NON modifica dati Precompila
✅ Test usa dati temporanei identificabili
✅ Test verifica stato DB prima modifiche
```

### Post-Test Checklist
```bash
✅ Tutti i test passano (100%)
✅ Dati temporanei rimossi da DB
✅ Dati Precompila ancora presenti
✅ Lock rilasciati
✅ Sessioni Supabase chiuse
✅ File temporanei puliti
✅ App in stato clean
```

---

## 🔒 BLINDATURA CHECKLIST

### Checklist Componente (Prima del LOCK)

#### 1. Test Coverage 100%
```bash
✅ Test funzionali: tutti gli use case
✅ Test validazione: dati validi/invalidi
✅ Test edge cases: limiti, unicode, errori
✅ Test accessibility: ARIA, keyboard nav
✅ Test performance: loading states, timeout
```

#### 2. Funzionalità Verificata
```bash
✅ UI rendering corretto
✅ Interazioni utente funzionanti
✅ Validazioni input corrette
✅ Error handling appropriato
✅ Loading states gestiti
✅ Responsive design OK
```

#### 3. Database Compliance
```bash
✅ Nessun dato orfano lasciato
✅ Nessuna query lenta (>1s)
✅ Nessuna race condition
✅ Transazioni atomiche
✅ Foreign keys rispettati
```

#### 4. Nessun Side Effect
```bash
✅ Nessun impatto su altre componenti
✅ Nessuna modifica dati globali
✅ Nessun memory leak
✅ Nessun console error/warning
```

#### 5. Performance Accettabile
```bash
✅ First render < 100ms
✅ Interaction response < 50ms
✅ Bundle size ragionevole
✅ Nessun re-render inutile
```

#### 6. Code Quality
```bash
✅ Nessun TypeScript error
✅ Nessun ESLint warning
✅ Naming conventions rispettate
✅ Commenti dove necessario (minimal)
✅ Nessun codice duplicato
```

---

## 🧹 CLEANUP OBBLIGATORIO

### Cleanup Automatico (globalTeardown)
```javascript
// Eseguito automaticamente dopo ogni test run
// scripts/post-test-cleanup.cjs

1. Cleanup Database
   - Rimuove temperature_readings (test)
   - Rimuove maintenance_tasks (test)
   - Rimuove generic_tasks (test)
   - Rimuove events (test)
   - Rimuove products (test)
   - PRESERVA staff (Precompila)
   - PRESERVA departments (Precompila)
   - PRESERVA conservation_points (Precompila)

2. Release Lock
   - Rimuove file locks/*.lock
   - Cleanup lock stale >10min

3. Close Sessions
   - supabase.auth.signOut()
   - Cleanup cookies/localStorage

4. Cleanup Files
   - test-results/
   - playwright-report/
   - .cache/

5. Reset State
   - Nessun reset necessario (stateless)
```

### Cleanup Manuale (se necessario)
```bash
# Cleanup completo manuale
npm run cleanup:post-test

# Verifica stato DB dopo cleanup
node scripts/check-db-state.cjs

# Output atteso:
# ✅ Staff: 1 (Paolo Dettori)
# ✅ Departments: 4 (Cucina, Bancone, Sala, Magazzino)
# ✅ Conservation points: 2 (Frigo A, Freezer A)
# ✅ Temperature readings: 0 (tutti test rimossi)
# ✅ Products: 0 (tutti test rimossi)
# ✅ Events: 0 (tutti test rimossi)
```

---

## 📋 5 ESEMPI BASE

### Esempio 1: Test Button Component
```javascript
// Production/Test/UI-Base/Button/test-funzionale.spec.js
test('Button - Varianti e click', async ({ page }) => {
  await page.goto('/');

  // Trova button
  const button = page.locator('button.btn-primary');
  await expect(button).toBeVisible();

  // Click
  await button.click();

  // Verifica stato changed
  await expect(button).toHaveClass(/active/);
});
```

### Esempio 2: Test LoginForm con Auth
```javascript
// Production/Test/Autenticazione/LoginForm/test-funzionale.spec.js
test('LoginForm - Auth successo', async ({ page }) => {
  await page.goto('/login');

  // Fill form
  await page.fill('[data-testid="email"]', 'matteo.cavallaro.work@gmail.com');
  await page.fill('[data-testid="password"]', 'cavallaro');

  // Submit
  await page.click('[data-testid="submit"]');

  // Verifica redirect dashboard
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

### Esempio 3: Test Validazione Temperature
```javascript
// Production/Test/LogicheBusiness/TemperatureValidation/test-validazione.spec.js
test('Temperature - Range validi', async ({ page }) => {
  await page.goto('/conservazione');

  // Test temperatura valida (frigo: 0-4°C)
  await page.fill('[data-testid="temp"]', '2');
  await page.click('[data-testid="save"]');

  // Verifica successo
  await expect(page.locator('[data-testid="success"]')).toBeVisible();

  // Test temperatura invalida (>4°C)
  await page.fill('[data-testid="temp"]', '8');
  await page.click('[data-testid="save"]');

  // Verifica alert
  await expect(page.locator('[data-testid="alert"]')).toContainText('Temperatura fuori range');
});
```

### Esempio 4: Test Calendario Event Creation
```javascript
// Production/Test/Calendario/EventCreation/test-funzionale.spec.js
test('Calendario - Crea evento', async ({ page }) => {
  await page.goto('/calendario');

  // Click "Nuovo Evento"
  await page.click('[data-testid="new-event"]');

  // Fill modal
  await page.fill('[data-testid="event-title"]', 'Test Event');
  await page.fill('[data-testid="event-date"]', '2025-02-01');

  // Save
  await page.click('[data-testid="save"]');

  // Verifica evento nel calendario
  await expect(page.locator('.fc-event')).toContainText('Test Event');

  // CLEANUP: Rimuovi evento creato
  await page.click('.fc-event');
  await page.click('[data-testid="delete"]');
});
```

### Esempio 5: Test Navigazione Protected Route
```javascript
// Production/Test/Navigazione/ProtectedRoute/test-funzionale.spec.js
test('ProtectedRoute - Redirect se non auth', async ({ page }) => {
  // Assicurati NON autenticato
  await page.context().clearCookies();

  // Tentativo accesso route protetta
  await page.goto('/dashboard');

  // Verifica redirect a login
  await expect(page).toHaveURL('/login');
  await expect(page.locator('h1')).toContainText('Login');
});
```

---

## 🚨 ANTI-PATTERNS DA EVITARE

### ❌ URL Hardcoded
```javascript
// ❌ SBAGLIATO
await page.goto('http://localhost:3001/login');

// ✅ CORRETTO
await page.goto('/login');  // Usa baseURL da config
```

### ❌ Nessun Cleanup
```javascript
// ❌ SBAGLIATO
test('Crea prodotto', async ({ page }) => {
  await createProduct('Test Product');
  // Test finisce, prodotto rimane in DB
});

// ✅ CORRETTO
test('Crea prodotto', async ({ page }) => {
  const productId = await createProduct('Test Product');

  // Cleanup
  test.afterEach(async () => {
    await deleteProduct(productId);
  });
});
```

### ❌ Test Interdipendenti
```javascript
// ❌ SBAGLIATO
test('Test 1', async () => {
  globalVar = 'value';  // Modifica stato globale
});

test('Test 2', async () => {
  expect(globalVar).toBe('value');  // Dipende da Test 1
});

// ✅ CORRETTO
test('Test 1', async () => {
  const localVar = 'value';  // Stato locale
  expect(localVar).toBe('value');
});

test('Test 2', async () => {
  const localVar = 'value';  // Indipendente
  expect(localVar).toBe('value');
});
```

### ❌ Timeout Troppo Corti
```javascript
// ❌ SBAGLIATO
await expect(slowElement).toBeVisible({ timeout: 1000 });  // 1s potrebbe fallire

// ✅ CORRETTO
await expect(slowElement).toBeVisible({ timeout: 10000 });  // 10s più sicuro
```

### ❌ No Error Handling
```javascript
// ❌ SBAGLIATO
test('API call', async () => {
  const response = await fetch('/api/data');
  const data = await response.json();  // Può fallire
});

// ✅ CORRETTO
test('API call', async () => {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    expect(data).toBeDefined();
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
});
```

---

**Ultimo aggiornamento**: 2025-01-17
**Versione**: 2.0 (compliance + cleanup automatico)
**Manutenzione**: Questo file deve rimanere <150 righe
