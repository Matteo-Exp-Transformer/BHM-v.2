const { test, expect } = require('@playwright/test');

test.describe('ForgotPasswordForm - Test Validazione Dati', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3006/forgot-password');
    await expect(page.locator('form')).toBeVisible();
  });

  test('Dovrebbe accettare email valida per reset password', async ({ page }) => {
    // Compilare form con email valida
    await page.fill('input[name="email"]', 'mario.rossi@example.com');
    
    // Intercettare la chiamata API per simulare successo
    await page.route('**/auth/v1/recover', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Password reset email sent' })
      });
    });
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Aspettare pagina di conferma
    await expect(page.locator('text=Email Inviata!')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=mario.rossi@example.com')).toBeVisible();
  });

  test('Dovrebbe rifiutare email invalide', async ({ page }) => {
    const invalidEmails = [
      'email-sbagliata',
      '@domain.com',
      'test@',
      'test.domain.com',
      'test@domain',
      'test..test@domain.com',
      'test@.domain.com'
    ];
    
    for (const email of invalidEmails) {
      // Compilare form con email invalida
      await page.fill('input[name="email"]', email);
      
      // Tentare submit
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Verificare che il form non si sottometta (validazione HTML5)
      const emailInput = page.locator('input[name="email"]');
      const validity = await emailInput.evaluate(el => el.validity.valid);
      expect(validity).toBe(false);
      
      // Verificare che non ci sia navigazione
      await expect(page).toHaveURL('http://localhost:3006/forgot-password');
    }
  });

  test('Dovrebbe rifiutare email vuota', async ({ page }) => {
    // Tentare submit con campo vuoto
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Verificare che il campo sia invalido
    const emailInput = page.locator('input[name="email"]');
    const validity = await emailInput.evaluate(el => el.validity.valid);
    expect(validity).toBe(false);
    
    // Verificare che non ci sia navigazione
    await expect(page).toHaveURL('http://localhost:3006/forgot-password');
  });

  test('Dovrebbe gestire email non registrata', async ({ page }) => {
    // Intercettare la chiamata API per simulare email non trovata
    await page.route('**/auth/v1/recover', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'user_not_found',
          error_description: 'User not found'
        })
      });
    });
    
    // Compilare form con email non esistente
    await page.fill('input[name="email"]', 'nonexistent@example.com');
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Aspettare toast di errore
    await expect(page.locator('.Toastify__toast--error')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.Toastify__toast--error')).toContainText('Errore durante l\'invio dell\'email. Riprova.');
  });

  test('Dovrebbe gestire errori generici di reset password', async ({ page }) => {
    // Intercettare la chiamata API per simulare errore generico
    await page.route('**/auth/v1/recover', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'server_error',
          error_description: 'Internal server error'
        })
      });
    });
    
    // Compilare form
    await page.fill('input[name="email"]', 'mario@example.com');
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Aspettare toast di errore
    await expect(page.locator('.Toastify__toast--error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.Toastify__toast--error')).toContainText('Errore durante l\'invio dell\'email. Riprova.');
  });

  test('Dovrebbe validare form prima del submit', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    
    // Tentare submit con form vuoto
    await submitButton.click();
    
    // Verificare che il campo email sia invalido
    const emailInput = page.locator('input[name="email"]');
    const validity = await emailInput.evaluate(el => el.validity.valid);
    expect(validity).toBe(false);
    
    // Verificare che non ci sia navigazione
    await expect(page).toHaveURL('http://localhost:3006/forgot-password');
  });

  test('Dovrebbe gestire spazi iniziali e finali nell\'email', async ({ page }) => {
    // Test con spazi iniziali e finali
    await page.fill('input[name="email"]', '  mario@example.com  ');
    
    // Verificare che i valori siano mantenuti
    await expect(page.locator('input[name="email"]')).toHaveValue('  mario@example.com  ');
    
    // Intercettare la chiamata API per simulare successo
    await page.route('**/auth/v1/recover', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Password reset email sent' })
      });
    });
    
    // Submit per vedere se Supabase gestisce il trimming
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Il test verificherà se il reset funziona nonostante gli spazi
    // (dipende dall'implementazione di Supabase)
    await expect(page.locator('text=Email Inviata!')).toBeVisible({ timeout: 10000 });
  });

  test('Dovrebbe gestire email con caratteri speciali', async ({ page }) => {
    const specialEmails = [
      'test+tag@example.com',
      'test.email@example.com',
      'test_email@example.com',
      'test-email@example.com',
      'test123@example.com',
      'test.email+tag@example.com'
    ];
    
    for (const email of specialEmails) {
      // Compilare form con email speciale
      await page.fill('input[name="email"]', email);
      
      // Intercettare la chiamata API per simulare successo
      await page.route('**/auth/v1/recover', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Password reset email sent' })
        });
      });
      
      // Submit form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Verificare che funzioni
      await expect(page.locator('text=Email Inviata!')).toBeVisible({ timeout: 10000 });
      
      // Tornare alla pagina per il prossimo test
      await page.goto('http://localhost:3006/forgot-password');
      await expect(page.locator('form')).toBeVisible();
    }
  });

  test('Dovrebbe gestire email case insensitive', async ({ page }) => {
    const emails = [
      'MARIO@EXAMPLE.COM',
      'Mario@Example.com',
      'mArIo@eXaMpLe.CoM'
    ];
    
    for (const email of emails) {
      // Compilare form con email in case diverso
      await page.fill('input[name="email"]', email);
      
      // Intercettare la chiamata API per simulare successo
      await page.route('**/auth/v1/recover', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Password reset email sent' })
        });
      });
      
      // Submit form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Verificare che funzioni
      await expect(page.locator('text=Email Inviata!')).toBeVisible({ timeout: 10000 });
      
      // Tornare alla pagina per il prossimo test
      await page.goto('http://localhost:3006/forgot-password');
      await expect(page.locator('form')).toBeVisible();
    }
  });

  test('Dovrebbe mostrare toast di successo dopo invio', async ({ page }) => {
    // Intercettare la chiamata API per simulare successo
    await page.route('**/auth/v1/recover', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Password reset email sent' })
      });
    });
    
    // Compilare form
    await page.fill('input[name="email"]', 'mario@example.com');
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Aspettare toast di successo
    await expect(page.locator('.Toastify__toast--success')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.Toastify__toast--success')).toContainText('Email inviata! Controlla la tua casella di posta.');
  });
});
