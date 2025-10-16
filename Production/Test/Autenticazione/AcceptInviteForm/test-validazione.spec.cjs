const { test, expect } = require('@playwright/test');

test.describe('AcceptInviteForm - Test Validazione Dati', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3006/accept-invite?token=77244fdc-f98a-4337-914a-5dbc0041feca');
    await expect(page.locator('form')).toBeVisible();
  });

  test('Dovrebbe accettare dati validi per accettazione invito', async ({ page }) => {
    // Compilare form con dati validi
    await page.fill('input[name="first_name"]', 'Mario');
    await page.fill('input[name="last_name"]', 'Rossi');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    // Intercettare la chiamata API per simulare successo
    await page.route('**/invites/accept', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Aspettare pagina di successo
    await expect(page.locator('text=Account Creato!')).toBeVisible({ timeout: 10000 });
  });

  test('Dovrebbe rifiutare password diverse', async ({ page }) => {
    // Compilare form con password diverse
    await page.fill('input[name="first_name"]', 'Mario');
    await page.fill('input[name="last_name"]', 'Rossi');
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
    await page.fill('input[name="password"]', '1234567');
    await page.fill('input[name="confirmPassword"]', '1234567');
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Aspettare toast di errore
    await expect(page.locator('.Toastify__toast--error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.Toastify__toast--error')).toContainText('La password deve essere almeno 8 caratteri');
  });

  test('Dovrebbe rifiutare campi vuoti', async ({ page }) => {
    const requiredFields = [
      'first_name',
      'last_name', 
      'password',
      'confirmPassword'
    ];
    
    for (const field of requiredFields) {
      // Compilare tutti i campi tranne quello da testare
      await page.fill('input[name="first_name"]', field === 'first_name' ? '' : 'Mario');
      await page.fill('input[name="last_name"]', field === 'last_name' ? '' : 'Rossi');
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

  test('Dovrebbe gestire token mancante', async ({ page }) => {
    // Navigare senza token
    await page.goto('http://localhost:3006/accept-invite');
    
    // Aspettare toast di errore
    await expect(page.locator('.Toastify__toast--error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.Toastify__toast--error')).toContainText('Token di invito mancante');
    
    // Verificare redirect a sign-in
    await expect(page).toHaveURL('http://localhost:3006/sign-in');
  });

  test('Dovrebbe gestire token invalido', async ({ page }) => {
    // Navigare con token invalido
    await page.goto('http://localhost:3006/accept-invite?token=invalid-token');
    
    // Aspettare pagina di errore
    await expect(page.locator('text=Link Invito Non Valido')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Il link di invito non è valido o è scaduto')).toBeVisible();
  });

  test('Dovrebbe gestire errori generici di accettazione invito', async ({ page }) => {
    // Intercettare la chiamata API per simulare errore generico
    await page.route('**/invites/accept', async route => {
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
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Aspettare toast di errore
    await expect(page.locator('.Toastify__toast--error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.Toastify__toast--error')).toContainText('Errore durante l\'accettazione dell\'invito. Riprova.');
  });

  test('Dovrebbe validare form completo prima del submit', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    
    // Tentare submit con form vuoto
    await submitButton.click();
    
    // Verificare che tutti i campi required siano invalidi
    const requiredFields = ['first_name', 'last_name', 'password', 'confirmPassword'];
    
    for (const field of requiredFields) {
      const fieldInput = page.locator(`input[name="${field}"]`);
      const validity = await fieldInput.evaluate(el => el.validity.valid);
      expect(validity).toBe(false);
    }
    
    // Verificare che non ci sia navigazione
    await expect(page).toHaveURL('http://localhost:3006/accept-invite?token=valid-test-token');
  });

  test('Dovrebbe gestire spazi iniziali e finali negli input', async ({ page }) => {
    // Test con spazi iniziali e finali
    await page.fill('input[name="first_name"]', '  Mario  ');
    await page.fill('input[name="last_name"]', '  Rossi  ');
    await page.fill('input[name="password"]', '  password123  ');
    await page.fill('input[name="confirmPassword"]', '  password123  ');
    
    // Verificare che i valori siano mantenuti
    await expect(page.locator('input[name="first_name"]')).toHaveValue('  Mario  ');
    await expect(page.locator('input[name="last_name"]')).toHaveValue('  Rossi  ');
    await expect(page.locator('input[name="password"]')).toHaveValue('  password123  ');
    await expect(page.locator('input[name="confirmPassword"]')).toHaveValue('  password123  ');
    
    // Submit per vedere se l'API gestisce il trimming
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Il test verificherà se l'accettazione funziona nonostante gli spazi
    // (dipende dall'implementazione dell'API)
  });

  test('Dovrebbe gestire token scaduto', async ({ page }) => {
    // Intercettare la chiamata API per simulare token scaduto
    await page.route('**/invites/validate', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'token_expired',
          error_description: 'Token has expired'
        })
      });
    });
    
    // Navigare con token scaduto
    await page.goto('http://localhost:3006/accept-invite?token=expired-token');
    
    // Aspettare pagina di errore
    await expect(page.locator('text=Link Invito Non Valido')).toBeVisible({ timeout: 10000 });
  });

  test('Dovrebbe mostrare toast di successo dopo accettazione', async ({ page }) => {
    // Intercettare la chiamata API per simulare successo
    await page.route('**/invites/accept', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
    
    // Compilare form
    await page.fill('input[name="first_name"]', 'Mario');
    await page.fill('input[name="last_name"]', 'Rossi');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Aspettare toast di successo
    await expect(page.locator('.Toastify__toast--success')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.Toastify__toast--success')).toContainText('Account creato con successo!');
  });
});
