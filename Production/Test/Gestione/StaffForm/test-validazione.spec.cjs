const { test, expect } = require('@playwright/test');

test.describe('StaffForm - Test Validazione Dati', () => {
  
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

  test('Dovrebbe accettare dati validi per membro staff', async ({ page }) => {
    // Compilare form con dati validi
    await page.fill('input[id="name"]', 'Mario Rossi');
    await page.fill('input[id="email"]', 'mario.rossi@example.com');
    await page.fill('input[id="phone"]', '+39 123 456 7890');
    await page.fill('input[id="hire_date"]', '2024-01-15');
    await page.selectOption('select[name="role"]', 'dipendente');
    await page.selectOption('select[name="category"]', 'Cuoco');
    await page.selectOption('select[name="status"]', 'active');
    
    // Intercettare la chiamata API per simulare successo
    await page.route('**/staff', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, id: 'test-id' })
      });
    });
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verificare che non ci siano errori
    await expect(page.locator('text=Il nome è obbligatorio')).not.toBeVisible();
    await expect(page.locator('text=L\'email è obbligatoria')).not.toBeVisible();
    await expect(page.locator('text=La data di assunzione è obbligatoria')).not.toBeVisible();
  });

  test('Dovrebbe rifiutare nome vuoto', async ({ page }) => {
    // Tentare submit con nome vuoto
    await page.fill('input[name="name"]', '');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="hire_date"]', '2024-01-01');
    await page.selectOption('select[name="role"]', 'dipendente');
    
    await page.click('button[type="submit"]');
    
    // Verificare errore
    await expect(page.locator('text=Il nome è obbligatorio')).toBeVisible();
  });

  test('Dovrebbe rifiutare nome con solo spazi', async ({ page }) => {
    // Tentare submit con nome con solo spazi
    await page.fill('input[name="name"]', '   ');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="hire_date"]', '2024-01-01');
    await page.selectOption('select[name="role"]', 'dipendente');
    
    await page.click('button[type="submit"]');
    
    // Verificare errore
    await expect(page.locator('text=Il nome è obbligatorio')).toBeVisible();
  });

  test('Dovrebbe rifiutare email vuota', async ({ page }) => {
    // Tentare submit con email vuota
    await page.fill('input[name="name"]', 'Mario Rossi');
    await page.fill('input[name="email"]', '');
    await page.fill('input[name="hire_date"]', '2024-01-01');
    await page.selectOption('select[name="role"]', 'dipendente');
    
    await page.click('button[type="submit"]');
    
    // Verificare errore
    await expect(page.locator('text=L\'email è obbligatoria')).toBeVisible();
  });

  test('Dovrebbe rifiutare email con formato invalido', async ({ page }) => {
    // Test email invalida
    await page.fill('input[name="name"]', 'Mario Rossi');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="hire_date"]', '2024-01-01');
    await page.selectOption('select[name="role"]', 'dipendente');
    
    await page.click('button[type="submit"]');
    
    // Verificare errore
    await expect(page.locator('text=Formato email non valido')).toBeVisible();
    
    // Test email senza dominio
    await page.fill('input[name="email"]', 'test@');
    await page.click('button[type="submit"]');
    
    // Verificare errore
    await expect(page.locator('text=Formato email non valido')).toBeVisible();
    
    // Test email senza @
    await page.fill('input[name="email"]', 'testdomain.com');
    await page.click('button[type="submit"]');
    
    // Verificare errore
    await expect(page.locator('text=Formato email non valido')).toBeVisible();
  });

  test('Dovrebbe rifiutare data assunzione vuota', async ({ page }) => {
    // Tentare submit senza data assunzione
    await page.fill('input[name="name"]', 'Mario Rossi');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="hire_date"]', '');
    await page.selectOption('select[name="role"]', 'dipendente');
    
    await page.click('button[type="submit"]');
    
    // Verificare errore
    await expect(page.locator('text=La data di assunzione è obbligatoria')).toBeVisible();
  });

  test('Dovrebbe rifiutare data assunzione invalida', async ({ page }) => {
    // Test data invalida
    await page.fill('input[name="name"]', 'Mario Rossi');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="hire_date"]', 'invalid-date');
    await page.selectOption('select[name="role"]', 'dipendente');
    
    await page.click('button[type="submit"]');
    
    // Verificare errore
    await expect(page.locator('text=Data di assunzione non valida')).toBeVisible();
  });

  test('Dovrebbe accettare email con formato valido', async ({ page }) => {
    // Test email valide
    const validEmails = [
      'test@example.com',
      'test.name@example.com',
      'test+tag@example.com',
      'test@sub.example.com',
      'user123@domain.org'
    ];
    
    for (const email of validEmails) {
      await page.fill('input[name="name"]', 'Mario Rossi');
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="hire_date"]', '2024-01-01');
      await page.selectOption('select[name="role"]', 'dipendente');
      
      await page.click('button[type="submit"]');
      
      // Verificare che non ci sia errore email
      await expect(page.locator('text=Formato email non valido')).not.toBeVisible();
    }
  });

  test('Dovrebbe gestire certificazione HACCP per categorie che la richiedono', async ({ page }) => {
    // Selezionare categoria che richiede HACCP (es. Cuoco)
    await page.fill('input[name="name"]', 'Mario Rossi');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="hire_date"]', '2024-01-01');
    await page.selectOption('select[name="role"]', 'dipendente');
    await page.selectOption('select[name="category"]', 'Cuoco');
    
    // Non compilare certificazione HACCP
    await page.click('button[type="submit"]');
    
    // Verificare errore certificazione richiesta
    await expect(page.locator('text=Certificazione HACCP richiesta per questa categoria')).toBeVisible();
    
    // Attivare e compilare certificazione HACCP
    await page.check('input[name="hasHaccpCert"]');
    await page.selectOption('select[name="haccpCert.level"]', 'base');
    await page.fill('input[name="haccpCert.expiry_date"]', '2025-12-31');
    await page.fill('input[name="haccpCert.issuing_authority"]', 'ASL Roma');
    await page.fill('input[name="haccpCert.certificate_number"]', 'HACCP-2024-001');
    
    await page.click('button[type="submit"]');
    
    // Verificare che non ci sia errore certificazione
    await expect(page.locator('text=Certificazione HACCP richiesta per questa categoria')).not.toBeVisible();
  });

  test('Dovrebbe validare data scadenza certificazione HACCP', async ({ page }) => {
    // Attivare certificazione HACCP
    await page.check('input[name="hasHaccpCert"]');
    
    // Test data scadenza invalida
    await page.fill('input[name="haccpCert.expiry_date"]', 'invalid-date');
    await page.click('button[type="submit"]');
    
    // Verificare errore
    await expect(page.locator('text=Data scadenza certificazione non valida')).toBeVisible();
    
    // Test data scadenza passata
    await page.fill('input[name="haccpCert.expiry_date"]', '2020-01-01');
    await page.click('button[type="submit"]');
    
    // Verificare errore
    await expect(page.locator('text=La certificazione è scaduta')).toBeVisible();
  });

  test('Dovrebbe accettare telefono opzionale', async ({ page }) => {
    // Compilare form senza telefono
    await page.fill('input[name="name"]', 'Mario Rossi');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="hire_date"]', '2024-01-01');
    await page.selectOption('select[name="role"]', 'dipendente');
    // Non compilare telefono
    
    await page.click('button[type="submit"]');
    
    // Verificare che non ci sia errore telefono
    await expect(page.locator('text=Il telefono è obbligatorio')).not.toBeVisible();
  });

  test('Dovrebbe accettare note opzionali', async ({ page }) => {
    // Compilare form senza note
    await page.fill('input[name="name"]', 'Mario Rossi');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="hire_date"]', '2024-01-01');
    await page.selectOption('select[name="role"]', 'dipendente');
    // Non compilare note
    
    await page.click('button[type="submit"]');
    
    // Verificare che non ci sia errore note
    await expect(page.locator('text=Le note sono obbligatorie')).not.toBeVisible();
  });
});
