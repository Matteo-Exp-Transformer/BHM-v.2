const { test, expect } = require('@playwright/test');

test.describe('RegisterForm - Test Validazione Dati', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3006/sign-up');
    await expect(page.locator('form')).toBeVisible();
  });

  test('Dovrebbe accettare dati validi per registrazione', async ({ page }) => {
    // Compilare form con dati validi
    await page.fill('input[name="first_name"]', 'Mario');
    await page.fill('input[name="last_name"]', 'Rossi');
    await page.fill('input[name="email"]', 'mario.rossi@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Aspettare navigazione verso sign-in o toast di successo
    await expect(page.locator('.Toastify__toast--success')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.Toastify__toast--success')).toContainText('Registrazione completata!');
  });

  test('Dovrebbe rifiutare password diverse', async ({ page }) => {
    // Compilare form con password diverse
    await page.fill('input[name="first_name"]', 'Mario');
    await page.fill('input[name="last_name"]', 'Rossi');
    await page.fill('input[name="email"]', 'mario@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password456');
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Aspettare toast di errore
    await expect(page.locator('.Toastify__toast--error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.Toastify__toast--error')).toContainText('Le password non coincidono');
  });

  test('Dovrebbe rifiutare password troppo corte', async ({ page }) => {
    // Compilare form con password corta
    await page.fill('input[name="first_name"]', 'Mario');
    await page.fill('input[name="last_name"]', 'Rossi');
    await page.fill('input[name="email"]', 'mario@example.com');
    await page.fill('input[name="password"]', '1234567');
    await page.fill('input[name="confirmPassword"]', '1234567');
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Aspettare toast di errore
    await expect(page.locator('.Toastify__toast--error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.Toastify__toast--error')).toContainText('La password deve essere almeno 8 caratteri');
  });

  test('Dovrebbe rifiutare email invalide', async ({ page }) => {
    const invalidEmails = [
      'email-sbagliata',
      '@domain.com',
      'test@',
      'test.domain.com',
      'test@domain'
    ];
    
    for (const email of invalidEmails) {
      // Compilare form con email invalida
      await page.fill('input[name="first_name"]', 'Mario');
      await page.fill('input[name="last_name"]', 'Rossi');
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', 'password123');
      await page.fill('input[name="confirmPassword"]', 'password123');
      
      // Tentare submit
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Verificare che il form non si sottometta (validazione HTML5)
      const emailInput = page.locator('input[name="email"]');
      const validity = await emailInput.evaluate(el => el.validity.valid);
      expect(validity).toBe(false);
    }
  });

  test('Dovrebbe rifiutare campi vuoti', async ({ page }) => {
    const requiredFields = [
      'first_name',
      'last_name', 
      'email',
      'password',
      'confirmPassword'
    ];
    
    for (const field of requiredFields) {
      // Compilare tutti i campi tranne quello da testare
      await page.fill('input[name="first_name"]', field === 'first_name' ? '' : 'Mario');
      await page.fill('input[name="last_name"]', field === 'last_name' ? '' : 'Rossi');
      await page.fill('input[name="email"]', field === 'email' ? '' : 'mario@example.com');
      await page.fill('input[name="password"]', field === 'password' ? '' : 'password123');
      await page.fill('input[name="confirmPassword"]', field === 'confirmPassword' ? '' : 'password123');
      
      // Tentare submit
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Verificare che il campo sia invalido
      const fieldInput = page.locator(`input[name="${field}"]`);
      const validity = await fieldInput.evaluate(el => el.validity.valid);
      expect(validity).toBe(false);
    }
  });

  test('Dovrebbe gestire email già registrata', async ({ page }) => {
    // Compilare form con email già esistente
    await page.fill('input[name="first_name"]', 'Test');
    await page.fill('input[name="last_name"]', 'User');
    await page.fill('input[name="email"]', 'matteo.cavallaro.work@gmail.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Aspettare toast di errore
    await expect(page.locator('.Toastify__toast--error')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.Toastify__toast--error')).toContainText('Questa email è già registrata');
  });

  test('Dovrebbe gestire password debole', async ({ page }) => {
    // Intercettare la chiamata API per simulare errore password debole
    await page.route('**/auth/v1/signup', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'weak_password',
          error_description: 'Password too weak'
        })
      });
    });
    
    // Compilare form
    await page.fill('input[name="first_name"]', 'Mario');
    await page.fill('input[name="last_name"]', 'Rossi');
    await page.fill('input[name="email"]', 'mario@example.com');
    await page.fill('input[name="password"]', '12345678');
    await page.fill('input[name="confirmPassword"]', '12345678');
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Aspettare toast di errore
    await expect(page.locator('.Toastify__toast--error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.Toastify__toast--error')).toContainText('Password troppo debole');
  });

  test('Dovrebbe gestire errori generici di registrazione', async ({ page }) => {
    // Intercettare la chiamata API per simulare errore generico
    await page.route('**/auth/v1/signup', async route => {
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
    await page.fill('input[name="first_name"]', 'Mario');
    await page.fill('input[name="last_name"]', 'Rossi');
    await page.fill('input[name="email"]', 'mario@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Aspettare toast di errore
    await expect(page.locator('.Toastify__toast--error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.Toastify__toast--error')).toContainText('Errore durante la registrazione. Riprova.');
  });

  test('Dovrebbe validare form completo prima del submit', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    
    // Tentare submit con form vuoto
    await submitButton.click();
    
    // Verificare che tutti i campi required siano invalidi
    const requiredFields = ['first_name', 'last_name', 'email', 'password', 'confirmPassword'];
    
    for (const field of requiredFields) {
      const fieldInput = page.locator(`input[name="${field}"]`);
      const validity = await fieldInput.evaluate(el => el.validity.valid);
      expect(validity).toBe(false);
    }
    
    // Verificare che non ci sia navigazione
    await expect(page).toHaveURL('http://localhost:3006/sign-up');
  });

  test('Dovrebbe gestire spazi iniziali e finali negli input', async ({ page }) => {
    // Test con spazi iniziali e finali
    await page.fill('input[name="first_name"]', '  Mario  ');
    await page.fill('input[name="last_name"]', '  Rossi  ');
    await page.fill('input[name="email"]', '  mario@example.com  ');
    await page.fill('input[name="password"]', '  password123  ');
    await page.fill('input[name="confirmPassword"]', '  password123  ');
    
    // Verificare che i valori siano mantenuti
    await expect(page.locator('input[name="first_name"]')).toHaveValue('  Mario  ');
    await expect(page.locator('input[name="last_name"]')).toHaveValue('  Rossi  ');
    await expect(page.locator('input[name="email"]')).toHaveValue('  mario@example.com  ');
    await expect(page.locator('input[name="password"]')).toHaveValue('  password123  ');
    await expect(page.locator('input[name="confirmPassword"]')).toHaveValue('  password123  ');
    
    // Submit per vedere se Supabase gestisce il trimming
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Il test verificherà se la registrazione funziona nonostante gli spazi
    // (dipende dall'implementazione di Supabase)
  });
});
