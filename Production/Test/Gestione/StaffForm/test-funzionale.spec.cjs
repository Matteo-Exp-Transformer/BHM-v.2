const { test, expect } = require('@playwright/test');

test.describe('StaffForm - Test Funzionali', () => {
  
  // Setup: login e navigare alla pagina gestione
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
    
    // Aspettare che la pagina si carichi
    await expect(page.locator('h1').nth(1)).toContainText('Gestione');
    
    // Cliccare sul bottone per aggiungere staff
    await page.click('button:has-text("Aggiungi Staff")');
    
    // Verificare che il modal sia aperto
    await expect(page.locator('text=Nuovo Dipendente')).toBeVisible();
  });

  test('Dovrebbe mostrare tutti gli elementi del form', async ({ page }) => {
    // Verificare input fields principali
    await expect(page.locator('input[id="name"]')).toBeVisible();
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="phone"]')).toBeVisible();
    await expect(page.locator('input[id="hire_date"]')).toBeVisible();
    
    // Verificare select fields
    await expect(page.locator('select[name="role"]')).toBeVisible();
    await expect(page.locator('select[name="category"]')).toBeVisible();
    await expect(page.locator('select[name="status"]')).toBeVisible();
    
    // Verificare textarea
    await expect(page.locator('textarea[name="notes"]')).toBeVisible();
    
    // Verificare bottone submit
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Dovrebbe permettere inserimento in tutti i campi base', async ({ page }) => {
    // Test inserimento nome
    await page.fill('input[name="name"]', 'Mario Rossi');
    await expect(page.locator('input[name="name"]')).toHaveValue('Mario Rossi');
    
    // Test inserimento email
    await page.fill('input[name="email"]', 'mario.rossi@example.com');
    await expect(page.locator('input[name="email"]')).toHaveValue('mario.rossi@example.com');
    
    // Test inserimento telefono
    await page.fill('input[name="phone"]', '+39 123 456 7890');
    await expect(page.locator('input[name="phone"]')).toHaveValue('+39 123 456 7890');
    
    // Test inserimento data assunzione
    await page.fill('input[name="hire_date"]', '2024-01-15');
    await expect(page.locator('input[name="hire_date"]')).toHaveValue('2024-01-15');
    
    // Test inserimento note
    await page.fill('textarea[name="notes"]', 'Note aggiuntive per Mario');
    await expect(page.locator('textarea[name="notes"]')).toHaveValue('Note aggiuntive per Mario');
  });

  test('Dovrebbe permettere selezione ruolo', async ({ page }) => {
    // Test selezione ruolo
    await page.selectOption('select[name="role"]', 'dipendente');
    await expect(page.locator('select[name="role"]')).toHaveValue('dipendente');
    
    // Test cambio ruolo
    await page.selectOption('select[name="role"]', 'responsabile');
    await expect(page.locator('select[name="role"]')).toHaveValue('responsabile');
    
    // Test ruolo admin
    await page.selectOption('select[name="role"]', 'admin');
    await expect(page.locator('select[name="role"]')).toHaveValue('admin');
  });

  test('Dovrebbe permettere selezione categoria staff', async ({ page }) => {
    // Test selezione categoria
    await page.selectOption('select[name="category"]', 'Cuoco');
    await expect(page.locator('select[name="category"]')).toHaveValue('Cuoco');
    
    // Test cambio categoria
    await page.selectOption('select[name="category"]', 'Cameriere');
    await expect(page.locator('select[name="category"]')).toHaveValue('Cameriere');
    
    // Test categoria Altro
    await page.selectOption('select[name="category"]', 'Altro');
    await expect(page.locator('select[name="category"]')).toHaveValue('Altro');
  });

  test('Dovrebbe permettere selezione status', async ({ page }) => {
    // Test selezione status attivo
    await page.selectOption('select[name="status"]', 'active');
    await expect(page.locator('select[name="status"]')).toHaveValue('active');
    
    // Test cambio status
    await page.selectOption('select[name="status"]', 'inactive');
    await expect(page.locator('select[name="status"]')).toHaveValue('inactive');
  });

  test('Dovrebbe permettere assegnazione reparti', async ({ page }) => {
    // Verificare che ci siano checkbox per reparti
    const departmentCheckboxes = page.locator('input[type="checkbox"][name*="department"]');
    const count = await departmentCheckboxes.count();
    
    if (count > 0) {
      // Selezionare primo reparto
      await departmentCheckboxes.first().check();
      await expect(departmentCheckboxes.first()).toBeChecked();
      
      // Deselezionare primo reparto
      await departmentCheckboxes.first().uncheck();
      await expect(departmentCheckboxes.first()).not.toBeChecked();
    }
  });

  test('Dovrebbe gestire certificazione HACCP', async ({ page }) => {
    // Verificare checkbox certificazione HACCP
    const haccpCheckbox = page.locator('input[type="checkbox"][name="hasHaccpCert"]');
    await expect(haccpCheckbox).toBeVisible();
    
    // Attivare certificazione HACCP
    await haccpCheckbox.check();
    await expect(haccpCheckbox).toBeChecked();
    
    // Verificare che appaiano i campi certificazione
    await expect(page.locator('input[name="haccpCert.level"]')).toBeVisible();
    await expect(page.locator('input[name="haccpCert.expiry_date"]')).toBeVisible();
    await expect(page.locator('input[name="haccpCert.issuing_authority"]')).toBeVisible();
    await expect(page.locator('input[name="haccpCert.certificate_number"]')).toBeVisible();
    
    // Compilare certificazione
    await page.selectOption('select[name="haccpCert.level"]', 'base');
    await page.fill('input[name="haccpCert.expiry_date"]', '2025-12-31');
    await page.fill('input[name="haccpCert.issuing_authority"]', 'ASL Roma');
    await page.fill('input[name="haccpCert.certificate_number"]', 'HACCP-2024-001');
    
    // Verificare valori
    await expect(page.locator('select[name="haccpCert.level"]')).toHaveValue('base');
    await expect(page.locator('input[name="haccpCert.expiry_date"]')).toHaveValue('2025-12-31');
    await expect(page.locator('input[name="haccpCert.issuing_authority"]')).toHaveValue('ASL Roma');
    await expect(page.locator('input[name="haccpCert.certificate_number"]')).toHaveValue('HACCP-2024-001');
  });

  test('Dovrebbe mostrare loading state durante submit', async ({ page }) => {
    // Compilare form con dati validi
    await page.fill('input[name="name"]', 'Test Staff');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="hire_date"]', '2024-01-01');
    await page.selectOption('select[name="role"]', 'dipendente');
    
    // Intercettare la chiamata API per simulare delay
    await page.route('**/staff', async route => {
      // Simulare delay di 2 secondi
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Verificare loading state
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toContainText('Salvando...');
    
    // Verificare presenza spinner
    await expect(page.locator('svg.animate-spin')).toBeVisible();
  });

  test('Dovrebbe chiudere modal dopo submit riuscito', async ({ page }) => {
    // Compilare form con dati validi
    await page.fill('input[name="name"]', 'Test Staff');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="hire_date"]', '2024-01-01');
    await page.selectOption('select[name="role"]', 'dipendente');
    
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
    
    // Verificare che il modal sia chiuso
    await expect(page.locator('text=Nuovo Membro Staff')).not.toBeVisible();
  });

  test('Dovrebbe mostrare errori di validazione', async ({ page }) => {
    // Tentare submit senza compilare campi obbligatori
    await page.click('button[type="submit"]');
    
    // Verificare errori di validazione
    await expect(page.locator('text=Il nome è obbligatorio')).toBeVisible();
    await expect(page.locator('text=L\'email è obbligatoria')).toBeVisible();
    await expect(page.locator('text=La data di assunzione è obbligatoria')).toBeVisible();
  });

  test('Dovrebbe avere placeholder corretti negli input', async ({ page }) => {
    // Verificare placeholder nome
    await expect(page.locator('input[name="name"]')).toHaveAttribute('placeholder', 'Es. Mario Rossi');
    
    // Verificare placeholder email
    await expect(page.locator('input[name="email"]')).toHaveAttribute('placeholder', 'mario.rossi@example.com');
    
    // Verificare placeholder telefono
    await expect(page.locator('input[name="phone"]')).toHaveAttribute('placeholder', '+39 123 456 7890');
  });

  test('Dovrebbe avere opzioni corrette nei select', async ({ page }) => {
    // Verificare opzioni ruolo
    const roleSelect = page.locator('select[name="role"]');
    await expect(roleSelect.locator('option[value="admin"]')).toBeVisible();
    await expect(roleSelect.locator('option[value="responsabile"]')).toBeVisible();
    await expect(roleSelect.locator('option[value="dipendente"]')).toBeVisible();
    await expect(roleSelect.locator('option[value="collaboratore"]')).toBeVisible();
    
    // Verificare opzioni categoria
    const categorySelect = page.locator('select[name="category"]');
    await expect(categorySelect.locator('option[value="Cuoco"]')).toBeVisible();
    await expect(categorySelect.locator('option[value="Cameriere"]')).toBeVisible();
    await expect(categorySelect.locator('option[value="Altro"]')).toBeVisible();
    
    // Verificare opzioni status
    const statusSelect = page.locator('select[name="status"]');
    await expect(statusSelect.locator('option[value="active"]')).toBeVisible();
    await expect(statusSelect.locator('option[value="inactive"]')).toBeVisible();
  });

  test('Dovrebbe permettere modifica membro staff esistente', async ({ page }) => {
    // Chiudere modal corrente
    await page.click('button:has-text("Annulla")');
    
    // Aprire modal per modifica (assumendo che ci sia uno staff esistente)
    await page.click('button:has-text("Modifica")');
    
    // Verificare che il modal sia aperto in modalità modifica
    await expect(page.locator('text=Modifica Membro Staff')).toBeVisible();
    
    // Verificare che i campi siano precompilati
    await expect(page.locator('input[name="name"]')).not.toHaveValue('');
  });
});
