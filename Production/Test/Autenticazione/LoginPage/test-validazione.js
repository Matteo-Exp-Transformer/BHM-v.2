import { test, expect } from '@playwright/test';

test.describe('LoginPage - Test Validazione Dati', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    await expect(page.locator('h1:has-text("Business Haccp Manager")')).toBeVisible();
  });

  test('Dovrebbe accettare email valide', async ({ page }) => {
    const validEmails = [
      'test@example.com',
      'user@domain.it',
      'mario.rossi@azienda.com',
      'user+tag@example.org',
      'user123@test-domain.co.uk'
    ];
    
    for (const email of validEmails) {
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', 'password123');
      
      // Verificare che non ci siano errori di validazione HTML5
      const emailInput = page.locator('input[name="email"]');
      const validity = await emailInput.evaluate(el => el.validity);
      expect(validity.valid).toBe(true);
      
      // Pulisci il campo per il prossimo test
      await page.fill('input[name="email"]', '');
    }
  });

  test('Dovrebbe rifiutare email invalide', async ({ page }) => {
    const invalidEmails = [
      'email-sbagliata',
      '@domain.com',
      'test@',
      'test.com',
      'test@.com',
      'test..test@domain.com',
      'test@domain',
      ''
    ];
    
    for (const email of invalidEmails) {
      await page.fill('input[name="email"]', email);
      
      // Verificare che ci siano errori di validazione HTML5
      const emailInput = page.locator('input[name="email"]');
      const validity = await emailInput.evaluate(el => el.validity);
      expect(validity.valid).toBe(false);
      
      // Pulisci il campo per il prossimo test
      await page.fill('input[name="email"]', '');
    }
  });

  test('Dovrebbe rifiutare email vuota', async ({ page }) => {
    // ACT: Tentare submit con email vuota
    await page.fill('input[name="email"]', '');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // ASSERT: Verificare che il form non si invii
    await expect(page.locator('input[name="email"]')).toBeFocused();
    
    // Verificare validazione HTML5
    const emailInput = page.locator('input[name="email"]');
    const validity = await emailInput.evaluate(el => el.validity);
    expect(validity.valueMissing).toBe(true);
  });

  test('Dovrebbe rifiutare password vuota', async ({ page }) => {
    // ACT: Tentare submit con password vuota
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', '');
    await page.click('button[type="submit"]');
    
    // ASSERT: Verificare che il form non si invii
    await expect(page.locator('input[name="password"]')).toBeFocused();
    
    // Verificare validazione HTML5
    const passwordInput = page.locator('input[name="password"]');
    const validity = await passwordInput.evaluate(el => el.validity);
    expect(validity.valueMissing).toBe(true);
  });

  test('Dovrebbe mostrare errore per credenziali sbagliate', async ({ page }) => {
    // ACT: Tentare login con credenziali sbagliate
    await page.fill('input[name="email"]', 'wrong@email.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // ASSERT: Verificare che appaia messaggio di errore
    // Aspettare che il loading finisca
    await page.waitForTimeout(2000);
    
    // Verificare presenza toast di errore
    await expect(page.locator('[role="alert"]')).toBeVisible();
    await expect(page.locator('text=Email o password non corretti')).toBeVisible();
  });

  test('Dovrebbe mostrare errore specifico per email non confermata', async ({ page }) => {
    // Simulare errore email non confermata
    await page.route('**/auth/v1/token?grant_type=password', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'email_not_confirmed',
          error_description: 'Email not confirmed'
        })
      });
    });
    
    // ACT: Tentare login
    await page.fill('input[name="email"]', 'unconfirmed@email.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // ASSERT: Verificare messaggio specifico
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Verifica prima la tua email')).toBeVisible();
  });

  test('Dovrebbe mostrare errore generico per altri errori', async ({ page }) => {
    // Simulare errore generico
    await page.route('**/auth/v1/token?grant_type=password', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'server_error',
          error_description: 'Internal server error'
        })
      });
    });
    
    // ACT: Tentare login
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // ASSERT: Verificare messaggio generico
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Errore durante il login. Riprova.')).toBeVisible();
  });

  test('Dovrebbe accettare login con credenziali valide', async ({ page }) => {
    // ACT: Login con credenziali valide fornite dall'utente
    await page.fill('input[name="email"]', 'matteo.cavallaro.work@gmail.com');
    await page.fill('input[name="password"]', 'Cavallaro');
    await page.click('button[type="submit"]');
    
    // ASSERT: Verificare redirect a dashboard
    await page.waitForURL(/.*dashboard/);
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Verificare presenza toast di successo
    await expect(page.locator('text=Login effettuato con successo!')).toBeVisible();
  });

  test('Dovrebbe gestire spazi iniziali e finali negli input', async ({ page }) => {
    // ACT: Inserire dati con spazi
    await page.fill('input[name="email"]', '  test@example.com  ');
    await page.fill('input[name="password"]', '  password123  ');
    
    // ASSERT: Verificare che i valori includano gli spazi (comportamento standard)
    await expect(page.locator('input[name="email"]')).toHaveValue('  test@example.com  ');
    await expect(page.locator('input[name="password"]')).toHaveValue('  password123  ');
  });

  test('Dovrebbe gestire caratteri speciali negli input', async ({ page }) => {
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    // ACT: Inserire caratteri speciali
    await page.fill('input[name="email"]', `test${specialChars}@example.com`);
    await page.fill('input[name="password"]', `pass${specialChars}word`);
    
    // ASSERT: Verificare che i caratteri siano accettati
    await expect(page.locator('input[name="email"]')).toHaveValue(`test${specialChars}@example.com`);
    await expect(page.locator('input[name="password"]')).toHaveValue(`pass${specialChars}word`);
  });

  test('Dovrebbe gestire input case-insensitive per email', async ({ page }) => {
    // ACT: Inserire email con maiuscole
    await page.fill('input[name="email"]', 'TEST@EXAMPLE.COM');
    await page.fill('input[name="password"]', 'password123');
    
    // ASSERT: Verificare che l'input mantenga il case inserito
    await expect(page.locator('input[name="email"]')).toHaveValue('TEST@EXAMPLE.COM');
  });

  test('Dovrebbe disabilitare submit button durante loading', async ({ page }) => {
    // ACT: Iniziare submit
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // ASSERT: Verificare che il bottone sia disabilitato
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
    
    // Verificare che mostri loading state
    await expect(page.locator('text=Accesso in corso...')).toBeVisible();
  });

  test('Dovrebbe riabilitare submit button dopo errore', async ({ page }) => {
    // Simulare errore
    await page.route('**/auth/v1/token?grant_type=password', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'invalid_credentials',
          error_description: 'Invalid login credentials'
        })
      });
    });
    
    // ACT: Tentare login
    await page.fill('input[name="email"]', 'wrong@email.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // ASSERT: Aspettare che il loading finisca
    await page.waitForTimeout(2000);
    
    // Verificare che il bottone sia riabilitato
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
    await expect(page.locator('button[type="submit"]')).toHaveText('Accedi');
  });
});
