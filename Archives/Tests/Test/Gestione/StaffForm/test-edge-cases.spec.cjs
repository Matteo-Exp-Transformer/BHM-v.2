const { test, expect } = require('@playwright/test');

test.describe('StaffForm - Test Edge Cases', () => {
  
  test.beforeEach(async ({ page }) => {
    // Prima fare login
    await page.goto('http://localhost:3006/sign-in');
    await page.fill('input[name="email"]', 'matteo.cavallaro.work@gmail.com');
    await page.fill('input[name="password"]', 'cavallaro');
    await page.click('button[type="submit"]');
    
    // Aspettare redirect alla dashboard
    await expect(page).toHaveURL(/.*\/dashboard.*/, { timeout: 10000 });
    
    // Navigare alla pagina gestione
    await page.goto('http://localhost:3006/gestione');
    await expect(page.locator('h1').nth(1)).toContainText('Gestione');
    await page.click('button:has-text("Aggiungi Staff")');
    await expect(page.locator('text=Nuovo Dipendente')).toBeVisible();
  });

  test('Dovrebbe gestire stringhe molto lunghe', async ({ page }) => {
    const longString = 'a'.repeat(1000);
    
    // Test con stringhe molto lunghe
    await page.fill('input[name="name"]', longString);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="hire_date"]', '2024-01-01');
    await page.selectOption('select[name="role"]', 'dipendente');
    
    // Verificare che i valori siano accettati
    await expect(page.locator('input[name="name"]')).toHaveValue(longString);
    
    // Verificare che il form sia ancora funzionante
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('Dovrebbe gestire email con caratteri speciali', async ({ page }) => {
    // Test con email speciali
    const specialEmails = [
      'test+tag@example.com',
      'test.name@example.com',
      'user123@sub-domain.example.com',
      'test@domain-with-dash.com',
      'test@domain.co.uk'
    ];
    
    for (const email of specialEmails) {
      await page.fill('input[name="name"]', 'Mario Rossi');
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="hire_date"]', '2024-01-01');
      await page.selectOption('select[name="role"]', 'dipendente');
      
      // Verificare che il valore sia accettato
      await expect(page.locator('input[name="email"]')).toHaveValue(email);
      
      // Verificare che il form sia ancora funzionante
      await expect(page.locator('button[type="submit"]')).toBeEnabled();
    }
  });

  test('Dovrebbe gestire telefoni in vari formati', async ({ page }) => {
    // Test con telefoni in vari formati
    const phoneFormats = [
      '+39 123 456 7890',
      '123-456-7890',
      '(123) 456-7890',
      '+1-123-456-7890',
      '123.456.7890',
      '+44 20 7946 0958',
      '0039 123 456 7890'
    ];
    
    for (const phone of phoneFormats) {
      await page.fill('input[name="name"]', 'Mario Rossi');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="phone"]', phone);
      await page.fill('input[name="hire_date"]', '2024-01-01');
      await page.selectOption('select[name="role"]', 'dipendente');
      
      // Verificare che il valore sia accettato
      await expect(page.locator('input[name="phone"]')).toHaveValue(phone);
      
      // Verificare che il form sia ancora funzionante
      await expect(page.locator('button[type="submit"]')).toBeEnabled();
    }
  });

  test('Dovrebbe gestire date estreme', async ({ page }) => {
    // Test con date molto passate
    await page.fill('input[name="name"]', 'Mario Rossi');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="hire_date"]', '1900-01-01');
    await page.selectOption('select[name="role"]', 'dipendente');
    
    // Verificare che il valore sia accettato
    await expect(page.locator('input[name="hire_date"]')).toHaveValue('1900-01-01');
    
    // Test con date future
    await page.fill('input[name="hire_date"]', '2100-12-31');
    await expect(page.locator('input[name="hire_date"]')).toHaveValue('2100-12-31');
    
    // Verificare che il form sia ancora funzionante
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('Dovrebbe gestire certificazione HACCP con date estreme', async ({ page }) => {
    // Attivare certificazione HACCP
    await page.check('input[name="hasHaccpCert"]');
    
    // Test con data scadenza molto futura
    await page.fill('input[name="name"]', 'Mario Rossi');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="hire_date"]', '2024-01-01');
    await page.selectOption('select[name="role"]', 'dipendente');
    await page.fill('input[name="haccpCert.expiry_date"]', '2100-12-31');
    
    // Verificare che il valore sia accettato
    await expect(page.locator('input[name="haccpCert.expiry_date"]')).toHaveValue('2100-12-31');
    
    // Test con data scadenza molto passata
    await page.fill('input[name="haccpCert.expiry_date"]', '1900-01-01');
    await expect(page.locator('input[name="haccpCert.expiry_date"]')).toHaveValue('1900-01-01');
    
    // Verificare che il form sia ancora funzionante
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('Dovrebbe gestire note molto lunghe', async ({ page }) => {
    const longNotes = 'a'.repeat(5000);
    
    // Test con note molto lunghe
    await page.fill('input[name="name"]', 'Mario Rossi');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="hire_date"]', '2024-01-01');
    await page.selectOption('select[name="role"]', 'dipendente');
    await page.fill('textarea[name="notes"]', longNotes);
    
    // Verificare che il valore sia accettato
    await expect(page.locator('textarea[name="notes"]')).toHaveValue(longNotes);
    
    // Verificare che il form sia ancora funzionante
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('Dovrebbe gestire tentativi SQL injection', async ({ page }) => {
    const sqlInjection = "'; DROP TABLE staff; --";
    
    // Test SQL injection nel nome
    await page.fill('input[name="name"]', sqlInjection);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="hire_date"]', '2024-01-01');
    await page.selectOption('select[name="role"]', 'dipendente');
    
    // Verificare che il valore sia accettato come stringa normale
    await expect(page.locator('input[name="name"]')).toHaveValue(sqlInjection);
    
    // Test SQL injection nelle note
    await page.fill('textarea[name="notes"]', sqlInjection);
    await expect(page.locator('textarea[name="notes"]')).toHaveValue(sqlInjection);
    
    // Verificare che il form sia ancora funzionante
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('Dovrebbe gestire caratteri speciali e unicode', async ({ page }) => {
    const specialChars = '🚀🎉 αβγδε àèéìòù !@#$%^&*()';
    
    // Test con caratteri speciali
    await page.fill('input[name="name"]', specialChars);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="hire_date"]', '2024-01-01');
    await page.selectOption('select[name="role"]', 'dipendente');
    
    // Verificare che i caratteri speciali siano accettati
    await expect(page.locator('input[name="name"]')).toHaveValue(specialChars);
    
    // Verificare che il form sia ancora funzionante
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('Dovrebbe gestire click multipli rapidi su submit', async ({ page }) => {
    // Compilare form con dati validi
    await page.fill('input[name="name"]', 'Test Staff');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="hire_date"]', '2024-01-01');
    await page.selectOption('select[name="role"]', 'dipendente');
    
    // Intercettare la chiamata API per simulare delay
    await page.route('**/staff', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    // Click multipli rapidi su submit
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    await submitButton.click();
    await submitButton.click();
    
    // Verificare che il bottone sia disabilitato dopo il primo click
    await expect(submitButton).toBeDisabled();
  });

  test('Dovrebbe gestire valori null e undefined', async ({ page }) => {
    // Test con valori null/undefined (simulati con campi vuoti)
    await page.fill('input[name="name"]', '');
    await page.fill('input[name="email"]', '');
    await page.fill('input[name="hire_date"]', '');
    
    await page.click('button[type="submit"]');
    
    // Verificare errori di validazione
    await expect(page.locator('text=Il nome è obbligatorio')).toBeVisible();
    await expect(page.locator('text=L\'email è obbligatoria')).toBeVisible();
    await expect(page.locator('text=La data di assunzione è obbligatoria')).toBeVisible();
  });

  test('Dovrebbe gestire timeout della richiesta', async ({ page }) => {
    // Compilare form con dati validi
    await page.fill('input[name="name"]', 'Test Staff');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="hire_date"]', '2024-01-01');
    await page.selectOption('select[name="role"]', 'dipendente');
    
    // Intercettare la chiamata API per simulare timeout
    await page.route('**/staff', async route => {
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 secondi
      await route.continue();
    });
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Verificare che il bottone sia disabilitato durante il caricamento
    await expect(submitButton).toBeDisabled();
    
    // Verificare che il modal sia ancora aperto
    await expect(page.locator('text=Nuovo Dipendente')).toBeVisible();
  });

  test('Dovrebbe gestire errori di rete', async ({ page }) => {
    // Compilare form con dati validi
    await page.fill('input[name="name"]', 'Test Staff');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="hire_date"]', '2024-01-01');
    await page.selectOption('select[name="role"]', 'dipendente');
    
    // Intercettare la chiamata API per simulare errore di rete
    await page.route('**/staff', async route => {
      await route.abort('failed');
    });
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verificare che appaia un messaggio di errore
    await expect(page.locator('text=Errore di rete')).toBeVisible();
    
    // Verificare che il modal sia ancora aperto
    await expect(page.locator('text=Nuovo Dipendente')).toBeVisible();
  });

  test('Dovrebbe gestire browser autocomplete', async ({ page }) => {
    // Simulare autocomplete del browser
    await page.fill('input[name="name"]', 'Test Staff');
    
    // Simulare che il browser riempia automaticamente altri campi
    await page.evaluate(() => {
      const emailInput = document.querySelector('input[name="email"]');
      if (emailInput) {
        emailInput.value = 'autocomplete@example.com';
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    
    // Verificare che il valore autocompletato sia accettato
    await expect(page.locator('input[name="email"]')).toHaveValue('autocomplete@example.com');
    
    // Verificare che il form sia ancora funzionante
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });
});
