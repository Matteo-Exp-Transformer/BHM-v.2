const { test, expect } = require('@playwright/test');

test.describe('LoginForm - Test Validazione Dati', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3005/login');
    await expect(page.locator('form')).toBeVisible();
  });

  test('Dovrebbe accettare email valide', async ({ page }) => {
    const validEmails = [
      'test@example.com',
      'user@domain.it',
      'admin@company.co.uk',
      'matteo.cavallaro.work@gmail.com',
      'user+tag@example.org',
      'firstname.lastname@company.com'
    ];
    
    const emailInput = page.locator('input[name="email"]');
    
    for (const email of validEmails) {
      await emailInput.clear();
      await emailInput.fill(email);
      await emailInput.blur(); // Trigger validation
      
      // Verificare che il campo accetti l'email
      await expect(emailInput).toHaveValue(email);
      
      // Verificare che non ci siano errori di validazione HTML5
      const validity = await emailInput.evaluate(el => el.validity.valid);
      expect(validity).toBe(true);
    }
  });

  test('Dovrebbe rifiutare email invalide', async ({ page }) => {
    const invalidEmails = [
      'email-sbagliata',
      '@domain.com',
      'test@',
      'test.domain.com',
      'test@domain',
      'test..test@domain.com',
      'test@domain..com',
      'test@.domain.com',
      '.test@domain.com'
    ];
    
    const emailInput = page.locator('input[name="email"]');
    
    for (const email of invalidEmails) {
      await emailInput.clear();
      await emailInput.fill(email);
      await emailInput.blur(); // Trigger validation
      
      // Verificare che il campo mantenga il valore ma sia invalido
      await expect(emailInput).toHaveValue(email);
      
      // Verificare che ci sia errore di validazione HTML5
      const validity = await emailInput.evaluate(el => el.validity.valid);
      expect(validity).toBe(false);
      
      // Verificare tipo di errore
      const validityMessage = await emailInput.evaluate(el => el.validationMessage);
      expect(validityMessage).toContain('email');
    }
  });

  test('Dovrebbe rifiutare email vuota', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Tentare submit con email vuota
    await emailInput.clear();
    await submitButton.click();
    
    // Verificare che il form non si sottometta (required attribute)
    const validity = await emailInput.evaluate(el => el.validity.valid);
    expect(validity).toBe(false);
    
    // Verificare messaggio di validazione
    const validityMessage = await emailInput.evaluate(el => el.validationMessage);
    expect(validityMessage).toBeTruthy();
  });

  test('Dovrebbe rifiutare password vuota', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Compilare solo email
    await page.fill('input[name="email"]', 'test@example.com');
    
    // Tentare submit con password vuota
    await passwordInput.clear();
    await submitButton.click();
    
    // Verificare che il form non si sottometta (required attribute)
    const validity = await passwordInput.evaluate(el => el.validity.valid);
    expect(validity).toBe(false);
    
    // Verificare messaggio di validazione
    const validityMessage = await passwordInput.evaluate(el => el.validationMessage);
    expect(validityMessage).toBeTruthy();
  });

  test('Dovrebbe gestire credenziali sbagliate', async ({ page }) => {
    // Compilare form con credenziali non esistenti
    await page.fill('input[name="email"]', 'nonexistent@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Aspettare che appaia il toast di errore
    await expect(page.locator('.Toastify__toast--error')).toBeVisible({ timeout: 10000 });
    
    // Verificare messaggio di errore
    await expect(page.locator('.Toastify__toast--error')).toContainText('Email o password non corretti');
    
    // Verificare che rimanga sulla pagina di login
    await expect(page).toHaveURL('http://localhost:3005/login');
  });

  test('Dovrebbe gestire email non confermata', async ({ page }) => {
    // Questo test richiede un utente non confermato nel database
    // Per ora simuliamo il comportamento
    
    // Compilare form
    await page.fill('input[name="email"]', 'unconfirmed@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Intercettare la chiamata API per simulare errore email non confermata
    await page.route('**/auth/v1/token', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'email_not_confirmed',
          error_description: 'Email not confirmed'
        })
      });
    });
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Aspettare che appaia il toast di errore
    await expect(page.locator('.Toastify__toast--error')).toBeVisible({ timeout: 10000 });
    
    // Verificare messaggio di errore specifico
    await expect(page.locator('.Toastify__toast--error')).toContainText('Verifica prima la tua email');
  });

  test('Dovrebbe gestire errori generici di login', async ({ page }) => {
    // Compilare form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Intercettare la chiamata API per simulare errore generico
    await page.route('**/auth/v1/token', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'server_error',
          error_description: 'Internal server error'
        })
      });
    });
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Aspettare che appaia il toast di errore
    await expect(page.locator('.Toastify__toast--error')).toBeVisible({ timeout: 10000 });
    
    // Verificare messaggio di errore generico
    await expect(page.locator('.Toastify__toast--error')).toContainText('Errore durante il login. Riprova.');
  });

  test('Dovrebbe accettare login con credenziali corrette', async ({ page }) => {
    // Compilare form con credenziali corrette
    await page.fill('input[name="email"]', 'matteo.cavallaro.work@gmail.com');
    await page.fill('input[name="password"]', 'Cavallaro');
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Aspettare navigazione verso dashboard
    await expect(page).toHaveURL('http://localhost:3005/dashboard', { timeout: 10000 });
    
    // Verificare toast di successo
    await expect(page.locator('.Toastify__toast--success')).toBeVisible();
    await expect(page.locator('.Toastify__toast--success')).toContainText('Login effettuato con successo!');
  });

  test('Dovrebbe validare form completo prima del submit', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Tentare submit con form vuoto
    await emailInput.clear();
    await passwordInput.clear();
    await submitButton.click();
    
    // Verificare che entrambi i campi siano invalidi
    const emailValidity = await emailInput.evaluate(el => el.validity.valid);
    const passwordValidity = await passwordInput.evaluate(el => el.validity.valid);
    
    expect(emailValidity).toBe(false);
    expect(passwordValidity).toBe(false);
    
    // Verificare che non ci sia navigazione
    await expect(page).toHaveURL('http://localhost:3005/login');
  });

  test('Dovrebbe gestire spazi iniziali e finali negli input', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    
    // Test con spazi iniziali e finali
    await emailInput.fill('  test@example.com  ');
    await passwordInput.fill('  password123  ');
    
    // Verificare che i valori siano mantenuti (non trimmed automaticamente)
    await expect(emailInput).toHaveValue('  test@example.com  ');
    await expect(passwordInput).toHaveValue('  password123  ');
    
    // Submit per vedere se Supabase gestisce il trimming
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Il test verificherà se l'autenticazione funziona nonostante gli spazi
    // (dipende dall'implementazione di Supabase)
  });
});
