const { test, expect } = require('@playwright/test');

test.describe('ConservationPointForm - Test Funzionali', () => {
  
  // Setup: login e navigare alla pagina inventario
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
    
    // Aspettare che la pagina si carichi
    await expect(page.locator('h1').nth(1)).toContainText('Conservazione');
    
    // Cliccare sul bottone per aggiungere punto conservazione
    await page.click('button:has-text("Aggiungi Punto")');
    
    // Verificare che il modal sia aperto
    await expect(page.locator('text=Nuovo Punto di Conservazione')).toBeVisible();
  });

  test('Dovrebbe mostrare tutti gli elementi del form', async ({ page }) => {
    // Verificare input fields principali
    await expect(page.locator('input[id="point-name"]')).toBeVisible();
    await expect(page.locator('input[id="point-temperature"]')).toBeVisible();
    await expect(page.locator('label:has-text("Nome")')).toBeVisible();
    await expect(page.locator('label:has-text("Reparto")')).toBeVisible();
    await expect(page.locator('label:has-text("Temperatura target")')).toBeVisible();
    
    // Verificare bottone submit
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Dovrebbe permettere inserimento in tutti i campi base', async ({ page }) => {
    // Test inserimento nome
    await page.fill('input[id="point-name"]', 'Frigorifero Cucina');
    await expect(page.locator('input[id="point-name"]')).toHaveValue('Frigorifero Cucina');
    
    // Test inserimento temperatura
    await page.fill('input[id="point-temperature"]', '2');
    await expect(page.locator('input[id="point-temperature"]')).toHaveValue('2');
    
    // Test selezione reparto (se disponibile)
    const departmentSelect = page.locator('[role="combobox"]').first();
    if (await departmentSelect.isVisible()) {
      await departmentSelect.click();
      await page.click('text=Seleziona un reparto');
    }
  });

  test('Dovrebbe aggiornare validazioni temperatura quando cambia tipo', async ({ page }) => {
    // Selezionare tipo ambient
    await page.selectOption('select[name="type"]', 'ambient');
    await page.fill('input[name="setpoint_temp"]', '20');
    
    // Verificare che temperatura sia valida per ambient (15-25°C)
    await expect(page.locator('input[name="setpoint_temp"]')).toHaveValue('20');
    
    // Cambiare a fridge
    await page.selectOption('select[name="type"]', 'fridge');
    await page.fill('input[name="setpoint_temp"]', '2');
    
    // Verificare che temperatura sia valida per fridge (0-4°C)
    await expect(page.locator('input[name="setpoint_temp"]')).toHaveValue('2');
    
    // Cambiare a freezer
    await page.selectOption('select[name="type"]', 'freezer');
    await page.fill('input[name="setpoint_temp"]', '-18');
    
    // Verificare che temperatura sia valida per freezer (-18°C)
    await expect(page.locator('input[name="setpoint_temp"]')).toHaveValue('-18');
  });

  test('Dovrebbe permettere selezione categorie prodotti', async ({ page }) => {
    // Verificare che ci siano checkbox per categorie
    const categoryCheckboxes = page.locator('input[type="checkbox"][name*="category"]');
    await expect(categoryCheckboxes.first()).toBeVisible();
    
    // Selezionare una categoria
    await categoryCheckboxes.first().check();
    await expect(categoryCheckboxes.first()).toBeChecked();
    
    // Deselezionare la categoria
    await categoryCheckboxes.first().uncheck();
    await expect(categoryCheckboxes.first()).not.toBeChecked();
  });

  test('Dovrebbe permettere aggiunta task manutenzione', async ({ page }) => {
    // Cliccare sul bottone per aggiungere task
    await page.click('button:has-text("Aggiungi Task")');
    
    // Verificare che appaia il form per il nuovo task
    await expect(page.locator('text=Task Manutenzione')).toBeVisible();
    
    // Compilare i campi del task
    await page.selectOption('select[name="manutenzione"]', 'rilevamento_temperatura');
    await page.selectOption('select[name="frequenza"]', 'giornaliera');
    await page.selectOption('select[name="assegnatoARuolo"]', 'dipendente');
    
    // Verificare che i valori siano stati impostati
    await expect(page.locator('select[name="manutenzione"]')).toHaveValue('rilevamento_temperatura');
    await expect(page.locator('select[name="frequenza"]')).toHaveValue('giornaliera');
    await expect(page.locator('select[name="assegnatoARuolo"]')).toHaveValue('dipendente');
  });

  test('Dovrebbe permettere rimozione task manutenzione', async ({ page }) => {
    // Aggiungere un task
    await page.click('button:has-text("Aggiungi Task")');
    await page.selectOption('select[name="manutenzione"]', 'sanificazione');
    
    // Verificare che il task sia presente
    await expect(page.locator('text=Sanificazione')).toBeVisible();
    
    // Cliccare sul bottone per rimuovere il task
    await page.click('button:has-text("Rimuovi")');
    
    // Verificare che il task sia stato rimosso
    await expect(page.locator('text=Sanificazione')).not.toBeVisible();
  });

  test('Dovrebbe mostrare loading state durante submit', async ({ page }) => {
    // Compilare form con dati validi
    await page.fill('input[name="name"]', 'Frigorifero Test');
    await page.selectOption('select[name="type"]', 'fridge');
    await page.fill('input[name="setpoint_temp"]', '2');
    await page.selectOption('select[name="department_id"]', 'cucina');
    
    // Intercettare la chiamata API per simulare delay
    await page.route('**/conservation-points', async route => {
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
    await page.fill('input[name="name"]', 'Frigorifero Test');
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
    
    // Verificare che il modal sia chiuso
    await expect(page.locator('text=Nuovo Punto Conservazione')).not.toBeVisible();
  });

  test('Dovrebbe mostrare errori di validazione', async ({ page }) => {
    // Tentare submit senza compilare campi obbligatori
    await page.click('button[type="submit"]');
    
    // Verificare errori di validazione
    await expect(page.locator('text=Il nome è obbligatorio')).toBeVisible();
    await expect(page.locator('text=Seleziona un reparto')).toBeVisible();
  });

  test('Dovrebbe avere placeholder corretti negli input', async ({ page }) => {
    // Verificare placeholder nome
    await expect(page.locator('input[name="name"]')).toHaveAttribute('placeholder', 'Es. Frigorifero Cucina');
    
    // Verificare placeholder temperatura
    await expect(page.locator('input[name="setpoint_temp"]')).toHaveAttribute('placeholder', 'Es. 2');
  });

  test('Dovrebbe avere opzioni corrette nei select', async ({ page }) => {
    // Verificare opzioni tipo conservazione
    const typeSelect = page.locator('select[name="type"]');
    await expect(typeSelect.locator('option[value="ambient"]')).toBeVisible();
    await expect(typeSelect.locator('option[value="fridge"]')).toBeVisible();
    await expect(typeSelect.locator('option[value="freezer"]')).toBeVisible();
    await expect(typeSelect.locator('option[value="blast"]')).toBeVisible();
    
    // Verificare opzioni frequenza manutenzione
    const frequencySelect = page.locator('select[name="frequenza"]');
    await expect(frequencySelect.locator('option[value="giornaliera"]')).toBeVisible();
    await expect(frequencySelect.locator('option[value="settimanale"]')).toBeVisible();
    await expect(frequencySelect.locator('option[value="mensile"]')).toBeVisible();
    await expect(frequencySelect.locator('option[value="annuale"]')).toBeVisible();
  });

  test('Dovrebbe permettere modifica punto conservazione esistente', async ({ page }) => {
    // Chiudere modal corrente
    await page.click('button:has-text("Annulla")');
    
    // Aprire modal per modifica (assumendo che ci sia un punto esistente)
    await page.click('button:has-text("Modifica")');
    
    // Verificare che il modal sia aperto in modalità modifica
    await expect(page.locator('text=Modifica Punto Conservazione')).toBeVisible();
    
    // Verificare che i campi siano precompilati
    await expect(page.locator('input[name="name"]')).not.toHaveValue('');
  });
});
