const { test, expect } = require('@playwright/test');

test.describe('ConservationPointForm - Test Validazione Dati', () => {
  
  test.beforeEach(async ({ page }) => {
    // Prima fare login
    await page.goto('http://localhost:3006/sign-in');
    await page.fill('input[name="email"]', 'matti169cava@libero.it');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Aspettare redirect alla dashboard
    await expect(page).toHaveURL(/.*\/dashboard.*/, { timeout: 10000 });
    
    // Navigare alla pagina conservazione
    await page.goto('http://localhost:3006/conservazione');
    await expect(page.locator('h1').nth(1)).toContainText('Conservazione');
    await page.click('button:has-text("Aggiungi Punto")');
    await expect(page.locator('text=Nuovo Punto di Conservazione')).toBeVisible();
  });

  test('Dovrebbe accettare dati validi per punto conservazione', async ({ page }) => {
    // Compilare form con dati validi
    await page.fill('input[name="name"]', 'Frigorifero Cucina');
    await page.selectOption('select[name="type"]', 'fridge');
    await page.fill('input[name="setpoint_temp"]', '2');
    await page.selectOption('select[name="department_id"]', 'cucina');
    
    // Intercettare la chiamata API per simulare successo
    await page.route('**/conservation-points', async route => {
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
    await expect(page.locator('text=Seleziona un reparto')).not.toBeVisible();
  });

  test('Dovrebbe rifiutare nome vuoto', async ({ page }) => {
    // Tentare submit con nome vuoto
    await page.fill('input[name="name"]', '');
    await page.selectOption('select[name="type"]', 'fridge');
    await page.fill('input[name="setpoint_temp"]', '2');
    await page.selectOption('select[name="department_id"]', 'cucina');
    
    await page.click('button[type="submit"]');
    
    // Verificare errore
    await expect(page.locator('text=Il nome è obbligatorio')).toBeVisible();
  });

  test('Dovrebbe rifiutare nome con solo spazi', async ({ page }) => {
    // Tentare submit con nome con solo spazi
    await page.fill('input[name="name"]', '   ');
    await page.selectOption('select[name="type"]', 'fridge');
    await page.fill('input[name="setpoint_temp"]', '2');
    await page.selectOption('select[name="department_id"]', 'cucina');
    
    await page.click('button[type="submit"]');
    
    // Verificare errore
    await expect(page.locator('text=Il nome è obbligatorio')).toBeVisible();
  });

  test('Dovrebbe rifiutare temperatura ambient fuori range (15-25°C)', async ({ page }) => {
    // Test temperatura troppo bassa
    await page.fill('input[name="name"]', 'Test Ambient');
    await page.selectOption('select[name="type"]', 'ambient');
    await page.fill('input[name="setpoint_temp"]', '10');
    await page.selectOption('select[name="department_id"]', 'cucina');
    
    await page.click('button[type="submit"]');
    
    // Verificare errore
    await expect(page.locator('text=Temperatura ambient deve essere tra 15°C e 25°C')).toBeVisible();
    
    // Test temperatura troppo alta
    await page.fill('input[name="setpoint_temp"]', '30');
    await page.click('button[type="submit"]');
    
    // Verificare errore
    await expect(page.locator('text=Temperatura ambient deve essere tra 15°C e 25°C')).toBeVisible();
  });

  test('Dovrebbe rifiutare temperatura fridge fuori range (0-4°C)', async ({ page }) => {
    // Test temperatura troppo bassa
    await page.fill('input[name="name"]', 'Test Fridge');
    await page.selectOption('select[name="type"]', 'fridge');
    await page.fill('input[name="setpoint_temp"]', '-5');
    await page.selectOption('select[name="department_id"]', 'cucina');
    
    await page.click('button[type="submit"]');
    
    // Verificare errore
    await expect(page.locator('text=Temperatura fridge deve essere tra 0°C e 4°C')).toBeVisible();
    
    // Test temperatura troppo alta
    await page.fill('input[name="setpoint_temp"]', '10');
    await page.click('button[type="submit"]');
    
    // Verificare errore
    await expect(page.locator('text=Temperatura fridge deve essere tra 0°C e 4°C')).toBeVisible();
  });

  test('Dovrebbe rifiutare temperatura freezer diversa da -18°C', async ({ page }) => {
    // Test temperatura diversa da -18°C
    await page.fill('input[name="name"]', 'Test Freezer');
    await page.selectOption('select[name="type"]', 'freezer');
    await page.fill('input[name="setpoint_temp"]', '-10');
    await page.selectOption('select[name="department_id"]', 'cucina');
    
    await page.click('button[type="submit"]');
    
    // Verificare errore
    await expect(page.locator('text=Temperatura freezer deve essere -18°C')).toBeVisible();
  });

  test('Dovrebbe rifiutare temperatura blast diversa da -40°C', async ({ page }) => {
    // Test temperatura diversa da -40°C
    await page.fill('input[name="name"]', 'Test Blast');
    await page.selectOption('select[name="type"]', 'blast');
    await page.fill('input[name="setpoint_temp"]', '-30');
    await page.selectOption('select[name="department_id"]', 'cucina');
    
    await page.click('button[type="submit"]');
    
    // Verificare errore
    await expect(page.locator('text=Temperatura blast deve essere -40°C')).toBeVisible();
  });

  test('Dovrebbe rifiutare reparto non selezionato', async ({ page }) => {
    // Tentare submit senza selezionare reparto
    await page.fill('input[name="name"]', 'Test Reparto');
    await page.selectOption('select[name="type"]', 'fridge');
    await page.fill('input[name="setpoint_temp"]', '2');
    // Non selezionare reparto
    
    await page.click('button[type="submit"]');
    
    // Verificare errore
    await expect(page.locator('text=Seleziona un reparto')).toBeVisible();
  });

  test('Dovrebbe accettare temperature valide per ogni tipo', async ({ page }) => {
    // Test ambient valido
    await page.fill('input[name="name"]', 'Test Ambient');
    await page.selectOption('select[name="type"]', 'ambient');
    await page.fill('input[name="setpoint_temp"]', '20');
    await page.selectOption('select[name="department_id"]', 'cucina');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Temperatura ambient deve essere tra 15°C e 25°C')).not.toBeVisible();
    
    // Test fridge valido
    await page.selectOption('select[name="type"]', 'fridge');
    await page.fill('input[name="setpoint_temp"]', '2');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Temperatura fridge deve essere tra 0°C e 4°C')).not.toBeVisible();
    
    // Test freezer valido
    await page.selectOption('select[name="type"]', 'freezer');
    await page.fill('input[name="setpoint_temp"]', '-18');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Temperatura freezer deve essere -18°C')).not.toBeVisible();
    
    // Test blast valido
    await page.selectOption('select[name="type"]', 'blast');
    await page.fill('input[name="setpoint_temp"]', '-40');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Temperatura blast deve essere -40°C')).not.toBeVisible();
  });

  test('Dovrebbe validare task manutenzione obbligatori', async ({ page }) => {
    // Compilare form base
    await page.fill('input[name="name"]', 'Test Task');
    await page.selectOption('select[name="type"]', 'fridge');
    await page.fill('input[name="setpoint_temp"]', '2');
    await page.selectOption('select[name="department_id"]', 'cucina');
    
    // Aggiungere task manutenzione senza compilare tutti i campi
    await page.click('button:has-text("Aggiungi Task")');
    await page.selectOption('select[name="manutenzione"]', 'rilevamento_temperatura');
    // Non selezionare frequenza
    
    await page.click('button[type="submit"]');
    
    // Verificare errore
    await expect(page.locator('text=Seleziona una frequenza per il task')).toBeVisible();
  });

  test('Dovrebbe accettare task manutenzione completi', async ({ page }) => {
    // Compilare form base
    await page.fill('input[name="name"]', 'Test Task Completo');
    await page.selectOption('select[name="type"]', 'fridge');
    await page.fill('input[name="setpoint_temp"]', '2');
    await page.selectOption('select[name="department_id"]', 'cucina');
    
    // Aggiungere task manutenzione completo
    await page.click('button:has-text("Aggiungi Task")');
    await page.selectOption('select[name="manutenzione"]', 'rilevamento_temperatura');
    await page.selectOption('select[name="frequenza"]', 'giornaliera');
    await page.selectOption('select[name="assegnatoARuolo"]', 'dipendente');
    
    await page.click('button[type="submit"]');
    
    // Verificare che non ci siano errori
    await expect(page.locator('text=Seleziona una frequenza per il task')).not.toBeVisible();
  });
});
