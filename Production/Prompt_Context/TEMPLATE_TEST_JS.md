# 🧪 TEMPLATE TEST JAVASCRIPT

> **Template per creare test Playwright per le componenti**

---

## 📋 Struttura File Test

### File: `test-funzionale.js`
```javascript
const { test, expect } = require('@playwright/test');

test.describe('[NOME COMPONENTE] - Test Funzionali', () => {
  
  // Setup: navigare alla pagina prima di ogni test
  test.beforeEach(async ({ page }) => {
    await page.goto('/[route-della-componente]');
    // Aspettare che la componente sia caricata
    await expect(page.locator('[selector-componente-principale]')).toBeVisible();
  });

  test('Dovrebbe [descrizione comportamento atteso]', async ({ page }) => {
    // ARRANGE: Setup del test
    const [elemento] = page.locator('[selector-elemento]');
    
    // ACT: Eseguire l'azione
    await elemento.click();
    
    // ASSERT: Verificare il risultato
    await expect(page.locator('[selector-risultato]')).toBeVisible();
  });

  test('Dovrebbe [altra descrizione comportamento]', async ({ page }) => {
    // Test per altra funzionalità
    await page.fill('[selector-input]', 'valore di test');
    await page.click('[selector-bottone]');
    
    await expect(page.locator('[selector-successo]')).toBeVisible();
  });

  // Aggiungere altri test funzionali...
});
```

### File: `test-validazione.js`
```javascript
const { test, expect } = require('@playwright/test');

test.describe('[NOME COMPONENTE] - Test Validazione Dati', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/[route-della-componente]');
    await expect(page.locator('[selector-componente-principale]')).toBeVisible();
  });

  test('Dovrebbe accettare input validi', async ({ page }) => {
    // Test con dati corretti
    await page.fill('[selector-input-email]', 'test@example.com');
    await page.fill('[selector-input-password]', 'password123');
    await page.click('[selector-bottone-submit]');
    
    // Verificare successo
    await expect(page.locator('[selector-successo]')).toBeVisible();
    await expect(page.locator('[selector-errore]')).not.toBeVisible();
  });

  test('Dovrebbe rifiutare email invalida', async ({ page }) => {
    await page.fill('[selector-input-email]', 'email-sbagliata');
    await page.fill('[selector-input-password]', 'password123');
    await page.click('[selector-bottone-submit]');
    
    // Verificare errore
    await expect(page.locator('[selector-errore]')).toBeVisible();
    await expect(page.locator('[selector-errore]')).toContainText('Email non valida');
  });

  test('Dovrebbe rifiutare password vuota', async ({ page }) => {
    await page.fill('[selector-input-email]', 'test@example.com');
    // Non riempire password
    await page.click('[selector-bottone-submit]');
    
    await expect(page.locator('[selector-errore]')).toBeVisible();
    await expect(page.locator('[selector-errore]')).toContainText('Password richiesta');
  });

  // Aggiungere altri test di validazione...
});
```

### File: `test-edge-cases.js`
```javascript
const { test, expect } = require('@playwright/test');

test.describe('[NOME COMPONENTE] - Test Edge Cases', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/[route-della-componente]');
    await expect(page.locator('[selector-componente-principale]')).toBeVisible();
  });

  test('Dovrebbe gestire stringa vuota', async ({ page }) => {
    await page.fill('[selector-input]', '');
    await page.click('[selector-bottone-submit]');
    
    // Verificare gestione corretta
    await expect(page.locator('[selector-errore]')).toBeVisible();
  });

  test('Dovrebbe gestire stringa molto lunga', async ({ page }) => {
    const stringaLunga = 'a'.repeat(1000);
    await page.fill('[selector-input]', stringaLunga);
    await page.click('[selector-bottone-submit]');
    
    // Verificare che non craschi e gestisca correttamente
    await expect(page.locator('[selector-componente]')).toBeVisible();
  });

  test('Dovrebbe gestire caratteri speciali', async ({ page }) => {
    const caratteriSpeciali = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    await page.fill('[selector-input]', caratteriSpeciali);
    await page.click('[selector-bottone-submit]');
    
    // Verificare gestione corretta
    await expect(page.locator('[selector-componente]')).toBeVisible();
  });

  test('Dovrebbe gestire numeri negativi', async ({ page }) => {
    await page.fill('[selector-input-numero]', '-100');
    await page.click('[selector-bottone-submit]');
    
    // Verificare gestione corretta (accettare o rifiutare)
    await expect(page.locator('[selector-risultato]')).toBeVisible();
  });

  test('Dovrebbe gestire valori null/undefined', async ({ page }) => {
    // Simulare valori null tramite JavaScript
    await page.evaluate(() => {
      // Simulare comportamento con valori null
      const input = document.querySelector('[selector-input]');
      if (input) input.value = null;
    });
    
    await page.click('[selector-bottone-submit]');
    await expect(page.locator('[selector-componente]')).toBeVisible();
  });

  // Aggiungere altri edge cases...
});
```

## 🎯 Linee Guida per i Test

### 1. Nomenclatura Test
```javascript
// ✅ BUONO: Descrittivo e chiaro
test('Dovrebbe mostrare errore quando email è vuota', async ({ page }) => {

// ❌ CATTIVO: Vago e non descrittivo
test('Test email', async ({ page }) => {
```

### 2. Struttura AAA (Arrange, Act, Assert)
```javascript
test('Dovrebbe [comportamento atteso]', async ({ page }) => {
  // ARRANGE: Setup del test
  await page.goto('/login');
  const emailInput = page.locator('[data-testid="email-input"]');
  
  // ACT: Eseguire l'azione
  await emailInput.fill('test@example.com');
  await page.click('[data-testid="submit-button"]');
  
  // ASSERT: Verificare il risultato
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

### 3. Selector Best Practices
```javascript
// ✅ PREFERIRE: Data testid
await page.locator('[data-testid="login-button"]').click();

// ✅ ACCETTABILE: Selector specifici
await page.locator('button[type="submit"]').click();

// ❌ EVITARE: Selector fragili
await page.locator('.btn-primary').click();
```

### 4. Attese e Timeout
```javascript
// ✅ BUONO: Aspettare elementi specifici
await expect(page.locator('[data-testid="loading"]')).toBeHidden();
await expect(page.locator('[data-testid="result"]')).toBeVisible();

// ✅ BUONO: Timeout personalizzati se necessario
await expect(page.locator('[data-testid="slow-element"]')).toBeVisible({ timeout: 10000 });
```

### 5. Gestione Errori
```javascript
test('Dovrebbe gestire errore API', async ({ page }) => {
  // Simulare errore API
  await page.route('**/api/login', route => route.fulfill({
    status: 500,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'Server Error' })
  }));
  
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('[data-testid="submit"]');
  
  await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
});
```

## 📁 Organizzazione File

### Struttura Cartelle
```
Production/Test/[Area]/[Componente]/
├── test-funzionale.js      # Test UI e interazioni
├── test-validazione.js     # Test dati validi/invalidi
└── test-edge-cases.js      # Test casi limite
```

### Nomenclatura Cartelle
- **Area**: Terminologia non tecnica (es: "Autenticazione", "Calendario")
- **Componente**: Descrittivo (es: "Login-Form", "Crea-Evento")
- **File**: Sempre con prefisso "test-" e suffisso descrittivo

## 🚀 Esecuzione Test

### Comando Base
```bash
# Eseguire tutti i test di una componente
npx playwright test Production/Test/[Area]/[Componente]/

# Eseguire test specifico
npx playwright test Production/Test/[Area]/[Componente]/test-funzionale.js

# Eseguire con UI mode (debugging)
npx playwright test --ui Production/Test/[Area]/[Componente]/

# Eseguire con browser visibile
npx playwright test --headed Production/Test/[Area]/[Componente]/
```

### Configurazione Playwright
```javascript
// playwright.config.js
module.exports = {
  testDir: './Production/Test',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  use: {
    baseURL: 'http://localhost:3000', // URL della tua app
    headless: true,
    viewport: { width: 1280, height: 720 }
  }
};
```

---

**RICORDA**: Ogni test deve essere piccolo, specifico e verificare una sola cosa. Meglio 10 test piccoli che 1 test gigante! 🧪


