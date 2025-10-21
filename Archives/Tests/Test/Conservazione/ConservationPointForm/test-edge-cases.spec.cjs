const { test, expect } = require('@playwright/test');

test.describe('ConservationPointForm - Test Edge Cases', () => {
  
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

  test('Dovrebbe gestire stringhe molto lunghe', async ({ page }) => {
    const longString = 'a'.repeat(1000);
    
    // Test con stringhe molto lunghe
    await page.fill('input[name="name"]', longString);
    await page.selectOption('select[name="type"]', 'fridge');
    await page.fill('input[name="setpoint_temp"]', '2');
    await page.selectOption('select[name="department_id"]', 'cucina');
    
    // Verificare che i valori siano accettati
    await expect(page.locator('input[name="name"]')).toHaveValue(longString);
    
    // Verificare che il form sia ancora funzionante
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('Dovrebbe gestire temperature estreme', async ({ page }) => {
    // Test con temperature molto basse
    await page.fill('input[name="name"]', 'Test Estremo');
    await page.selectOption('select[name="type"]', 'freezer');
    await page.fill('input[name="setpoint_temp"]', '-100');
    await page.selectOption('select[name="department_id"]', 'cucina');
    
    await page.click('button[type="submit"]');
    
    // Verificare errore per temperatura troppo bassa
    await expect(page.locator('text=Temperatura freezer deve essere -18°C')).toBeVisible();
    
    // Test con temperature molto alte
    await page.selectOption('select[name="type"]', 'ambient');
    await page.fill('input[name="setpoint_temp"]', '100');
    
    await page.click('button[type="submit"]');
    
    // Verificare errore per temperatura troppo alta
    await expect(page.locator('text=Temperatura ambient deve essere tra 15°C e 25°C')).toBeVisible();
  });

  test('Dovrebbe gestire valori decimali nelle temperature', async ({ page }) => {
    // Test con valori decimali
    await page.fill('input[name="name"]', 'Test Decimale');
    await page.selectOption('select[name="type"]', 'fridge');
    await page.fill('input[name="setpoint_temp"]', '2.5');
    await page.selectOption('select[name="department_id"]', 'cucina');
    
    // Verificare che il valore decimale sia accettato
    await expect(page.locator('input[name="setpoint_temp"]')).toHaveValue('2.5');
    
    await page.click('button[type="submit"]');
    
    // Verificare che non ci siano errori (2.5 è nel range 0-4°C)
    await expect(page.locator('text=Temperatura fridge deve essere tra 0°C e 4°C')).not.toBeVisible();
  });

  test('Dovrebbe gestire task manutenzione multipli', async ({ page }) => {
    // Compilare form base
    await page.fill('input[name="name"]', 'Test Multipli Task');
    await page.selectOption('select[name="type"]', 'fridge');
    await page.fill('input[name="setpoint_temp"]', '2');
    await page.selectOption('select[name="department_id"]', 'cucina');
    
    // Aggiungere molti task manutenzione
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("Aggiungi Task")');
      
      // Compilare il task
      await page.selectOption('select[name="manutenzione"]', 'rilevamento_temperatura');
      await page.selectOption('select[name="frequenza"]', 'giornaliera');
      await page.selectOption('select[name="assegnatoARuolo"]', 'dipendente');
    }
    
    // Verificare che tutti i task siano presenti
    const taskElements = page.locator('text=Rilevamento Temperature');
    await expect(taskElements).toHaveCount(5);
    
    // Verificare che il form sia ancora funzionante
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('Dovrebbe gestire categorie prodotti multiple', async ({ page }) => {
    // Compilare form base
    await page.fill('input[name="name"]', 'Test Categorie Multiple');
    await page.selectOption('select[name="type"]', 'fridge');
    await page.fill('input[name="setpoint_temp"]', '2');
    await page.selectOption('select[name="department_id"]', 'cucina');
    
    // Selezionare tutte le categorie disponibili
    const categoryCheckboxes = page.locator('input[type="checkbox"][name*="category"]');
    const count = await categoryCheckboxes.count();
    
    for (let i = 0; i < count; i++) {
      await categoryCheckboxes.nth(i).check();
    }
    
    // Verificare che tutte le categorie siano selezionate
    for (let i = 0; i < count; i++) {
      await expect(categoryCheckboxes.nth(i)).toBeChecked();
    }
    
    // Verificare che il form sia ancora funzionante
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('Dovrebbe gestire tentativi SQL injection', async ({ page }) => {
    const sqlInjection = "'; DROP TABLE conservation_points; --";
    
    // Test SQL injection nel nome
    await page.fill('input[name="name"]', sqlInjection);
    await page.selectOption('select[name="type"]', 'fridge');
    await page.fill('input[name="setpoint_temp"]', '2');
    await page.selectOption('select[name="department_id"]', 'cucina');
    
    // Verificare che il valore sia accettato come stringa normale
    await expect(page.locator('input[name="name"]')).toHaveValue(sqlInjection);
    
    // Verificare che il form sia ancora funzionante
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('Dovrebbe gestire caratteri speciali e unicode', async ({ page }) => {
    const specialChars = '🚀🎉 αβγδε àèéìòù !@#$%^&*()';
    
    // Test con caratteri speciali
    await page.fill('input[name="name"]', specialChars);
    await page.selectOption('select[name="type"]', 'fridge');
    await page.fill('input[name="setpoint_temp"]', '2');
    await page.selectOption('select[name="department_id"]', 'cucina');
    
    // Verificare che i caratteri speciali siano accettati
    await expect(page.locator('input[name="name"]')).toHaveValue(specialChars);
    
    // Verificare che il form sia ancora funzionante
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('Dovrebbe gestire click multipli rapidi su submit', async ({ page }) => {
    // Compilare form con dati validi
    await page.fill('input[name="name"]', 'Test Click Multipli');
    await page.selectOption('select[name="type"]', 'fridge');
    await page.fill('input[name="setpoint_temp"]', '2');
    await page.selectOption('select[name="department_id"]', 'cucina');
    
    // Intercettare la chiamata API per simulare delay
    await page.route('**/conservation-points', async route => {
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
    await page.selectOption('select[name="type"]', '');
    await page.fill('input[name="setpoint_temp"]', '');
    await page.selectOption('select[name="department_id"]', '');
    
    await page.click('button[type="submit"]');
    
    // Verificare errori di validazione
    await expect(page.locator('text=Il nome è obbligatorio')).toBeVisible();
    await expect(page.locator('text=Seleziona un reparto')).toBeVisible();
  });

  test('Dovrebbe gestire timeout della richiesta', async ({ page }) => {
    // Compilare form con dati validi
    await page.fill('input[name="name"]', 'Test Timeout');
    await page.selectOption('select[name="type"]', 'fridge');
    await page.fill('input[name="setpoint_temp"]', '2');
    await page.selectOption('select[name="department_id"]', 'cucina');
    
    // Intercettare la chiamata API per simulare timeout
    await page.route('**/conservation-points', async route => {
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 secondi
      await route.continue();
    });
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Verificare che il bottone sia disabilitato durante il caricamento
    await expect(submitButton).toBeDisabled();
    
    // Verificare che il modal sia ancora aperto
    await expect(page.locator('text=Nuovo Punto di Conservazione')).toBeVisible();
  });

  test('Dovrebbe gestire errori di rete', async ({ page }) => {
    // Compilare form con dati validi
    await page.fill('input[name="name"]', 'Test Errore Rete');
    await page.selectOption('select[name="type"]', 'fridge');
    await page.fill('input[name="setpoint_temp"]', '2');
    await page.selectOption('select[name="department_id"]', 'cucina');
    
    // Intercettare la chiamata API per simulare errore di rete
    await page.route('**/conservation-points', async route => {
      await route.abort('failed');
    });
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verificare che appaia un messaggio di errore
    await expect(page.locator('text=Errore di rete')).toBeVisible();
    
    // Verificare che il modal sia ancora aperto
    await expect(page.locator('text=Nuovo Punto di Conservazione')).toBeVisible();
  });

  test('Dovrebbe gestire browser autocomplete', async ({ page }) => {
    // Simulare autocomplete del browser
    await page.fill('input[name="name"]', 'Test Autocomplete');
    
    // Simulare che il browser riempia automaticamente altri campi
    await page.evaluate(() => {
      const tempInput = document.querySelector('input[name="setpoint_temp"]');
      if (tempInput) {
        tempInput.value = '3';
        tempInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    
    // Verificare che il valore autocompletato sia accettato
    await expect(page.locator('input[name="setpoint_temp"]')).toHaveValue('3');
    
    // Verificare che il form sia ancora funzionante
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });
});
