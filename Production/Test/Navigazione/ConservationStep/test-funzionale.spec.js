// Production/Test/Navigazione/ConservationStep/test-funzionale.spec.js
import { test, expect } from '@playwright/test';

test.describe('ConservationStep - Test Funzionali', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Setup Mock Auth tramite Role Selector
    const roleSelector = page.locator('text=Mock Auth System');
    if (await roleSelector.isVisible()) {
      await page.locator('text=Amministratore').click();
      await page.locator('button:has-text("Conferma Ruolo")').click();
      await page.waitForTimeout(2000);
    }
    
    // Naviga all'onboarding
    await page.goto('/onboarding');
    await page.waitForTimeout(1000);
  });

  test('Dovrebbe renderizzare correttamente il componente', async ({ page }) => {
    // Naviga allo step conservazione (step 4)
    await page.click('text=Punti di conservazione');
    await page.waitForTimeout(1000);

    // Verifica elementi principali
    await expect(page.locator('h2:has-text("Punti di conservazione")')).toBeVisible();
    await expect(page.locator('text=Configura frigoriferi, congelatori e abbattitori')).toBeVisible();
    
    // Verifica bottoni principali
    await expect(page.locator('button:has-text("Carica punti predefiniti")')).toBeVisible();
    await expect(page.locator('button:has-text("Aggiungi punto")')).toBeVisible();
  });

  test('Dovrebbe gestire il caricamento punti predefiniti', async ({ page }) => {
    await page.click('text=Punti di conservazione');
    await page.waitForTimeout(1000);

    // Click su "Carica punti predefiniti"
    await page.click('button:has-text("Carica punti predefiniti")');
    await page.waitForTimeout(2000);

    // Verifica che siano stati caricati i punti predefiniti
    await expect(page.locator('text=Frigo A')).toBeVisible();
    await expect(page.locator('text=Freezer A')).toBeVisible();
    await expect(page.locator('text=Abbattitore')).toBeVisible();
    
    // Verifica che il form sia nascosto dopo il caricamento
    await expect(page.locator('form')).not.toBeVisible();
  });

  test('Dovrebbe aprire il form per aggiungere nuovo punto', async ({ page }) => {
    await page.click('text=Punti di conservazione');
    await page.waitForTimeout(1000);

    // Click su "Aggiungi punto"
    await page.click('button:has-text("Aggiungi punto")');
    await page.waitForTimeout(1000);

    // Verifica che il form sia visibile
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('h3:has-text("Aggiungi nuovo punto di conservazione")')).toBeVisible();
    
    // Verifica campi del form
    await expect(page.locator('input[id="point-name"]')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
    await expect(page.locator('input[id="point-temperature"]')).toBeVisible();
  });

  test('Dovrebbe gestire la selezione del tipo di punto', async ({ page }) => {
    await page.click('text=Punti di conservazione');
    await page.waitForTimeout(1000);

    await page.click('button:has-text("Aggiungi punto")');
    await page.waitForTimeout(1000);

    // Test selezione tipo Frigorifero
    await page.click('button:has-text("Frigorifero")');
    await expect(page.locator('input[id="point-temperature"]')).not.toBeDisabled();
    
    // Test selezione tipo Congelatore
    await page.click('button:has-text("Congelatore")');
    await expect(page.locator('input[id="point-temperature"]')).not.toBeDisabled();
    
    // Test selezione tipo Ambiente
    await page.click('button:has-text("Ambiente")');
    await expect(page.locator('input[id="point-temperature"]')).toBeDisabled();
  });

  test('Dovrebbe validare i campi obbligatori', async ({ page }) => {
    await page.click('text=Punti di conservazione');
    await page.waitForTimeout(1000);

    await page.click('button:has-text("Aggiungi punto")');
    await page.waitForTimeout(1000);

    // Prova a salvare senza compilare i campi
    await page.click('button:has-text("Aggiungi punto")');
    
    // Verifica errori di validazione
    await expect(page.locator('text=Nome obbligatorio')).toBeVisible();
    await expect(page.locator('text=Reparto obbligatorio')).toBeVisible();
  });

  test('Dovrebbe gestire la modifica di un punto esistente', async ({ page }) => {
    await page.click('text=Punti di conservazione');
    await page.waitForTimeout(1000);

    // Carica punti predefiniti
    await page.click('button:has-text("Carica punti predefiniti")');
    await page.waitForTimeout(2000);

    // Click su modifica del primo punto
    await page.click('button[title="Modifica punto"]');
    await page.waitForTimeout(1000);

    // Verifica che il form sia aperto in modalità modifica
    await expect(page.locator('h3:has-text("Modifica punto di conservazione")')).toBeVisible();
    
    // Modifica il nome
    await page.fill('input[id="point-name"]', 'Frigo Modificato');
    
    // Salva le modifiche
    await page.click('button:has-text("Salva modifiche")');
    await page.waitForTimeout(1000);

    // Verifica che il nome sia stato aggiornato
    await expect(page.locator('text=Frigo Modificato')).toBeVisible();
  });

  test('Dovrebbe gestire l\'eliminazione di un punto', async ({ page }) => {
    await page.click('text=Punti di conservazione');
    await page.waitForTimeout(1000);

    // Carica punti predefiniti
    await page.click('button:has-text("Carica punti predefiniti")');
    await page.waitForTimeout(2000);

    // Conta i punti iniziali
    const initialPoints = await page.locator('article').count();
    
    // Click su elimina del primo punto
    await page.click('button[title="Elimina punto"]');
    await page.waitForTimeout(1000);

    // Verifica che il punto sia stato eliminato
    const finalPoints = await page.locator('article').count();
    expect(finalPoints).toBe(initialPoints - 1);
  });

  test('Dovrebbe gestire la validazione temperatura', async ({ page }) => {
    await page.click('text=Punti di conservazione');
    await page.waitForTimeout(1000);

    await page.click('button:has-text("Aggiungi punto")');
    await page.waitForTimeout(1000);

    // Seleziona tipo Frigorifero
    await page.click('button:has-text("Frigorifero")');
    
    // Test temperatura valida (2°C)
    await page.fill('input[id="point-temperature"]', '2');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Temperatura non valida')).not.toBeVisible();
    
    // Test temperatura non valida (10°C per frigorifero)
    await page.fill('input[id="point-temperature"]', '10');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Temperatura fuori range')).toBeVisible();
  });

  test('Dovrebbe gestire la selezione categorie prodotti', async ({ page }) => {
    await page.click('text=Punti di conservazione');
    await page.waitForTimeout(1000);

    await page.click('button:has-text("Aggiungi punto")');
    await page.waitForTimeout(1000);

    // Compila campi base
    await page.fill('input[id="point-name"]', 'Test Frigo');
    await page.selectOption('select', '1'); // Seleziona primo reparto
    
    // Seleziona tipo e temperatura
    await page.click('button:has-text("Frigorifero")');
    await page.fill('input[id="point-temperature"]', '4');
    await page.waitForTimeout(500);

    // Verifica che le categorie compatibili siano visibili
    await expect(page.locator('button:has-text("Carne fresca")')).toBeVisible();
    await expect(page.locator('button:has-text("Latticini freschi")')).toBeVisible();
    
    // Seleziona una categoria
    await page.click('button:has-text("Carne fresca")');
    await expect(page.locator('button:has-text("Carne fresca")')).toHaveClass(/border-blue-400/);
  });

  test('Dovrebbe gestire l\'accessibilità corretta', async ({ page }) => {
    await page.click('text=Punti di conservazione');
    await page.waitForTimeout(1000);

    // Verifica attributi ARIA
    const nameInput = page.locator('input[id="point-name"]');
    await expect(nameInput).toHaveAttribute('aria-invalid', 'false');
    
    // Verifica keyboard navigation
    await page.press('body', 'Tab');
    await page.press('body', 'Tab');
    await page.press('body', 'Enter');
    
    // Verifica che il form si apra con keyboard navigation
    await expect(page.locator('form')).toBeVisible();
  });
});
