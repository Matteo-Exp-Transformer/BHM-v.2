// Production/Test/Navigazione/ConservationStep/test-edge-cases.spec.js
import { test, expect } from '@playwright/test';

test.describe('ConservationStep - Edge Cases', () => {

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

  test('Dovrebbe gestire stato loading durante operazioni', async ({ page }) => {
    await page.click('button:has-text("Carica punti predefiniti")');
    
    // Verifica che ci sia un indicatore di loading (se presente)
    const loadingIndicator = page.locator('[data-testid="loading"], .loading, .spinner');
    if (await loadingIndicator.count() > 0) {
      await expect(loadingIndicator).toBeVisible();
    }
    
    // Attendi completamento
    await page.waitForTimeout(3000);
    await expect(page.locator('text=Frigo A')).toBeVisible();
  });

  test('Dovrebbe gestire errori di rete', async ({ page }) => {
    // Simula offline
    await page.context().setOffline(true);
    
    await page.click('button:has-text("Carica punti predefiniti")');
    
    // Verifica gestione errore rete
    await expect(page.locator('text=Errore di connessione')).toBeVisible();
    
    // Ripristina connessione
    await page.context().setOffline(false);
  });

  test('Dovrebbe gestire molti punti di conservazione', async ({ page }) => {
    // Aggiungi molti punti per testare performance
    for (let i = 1; i <= 10; i++) {
      await page.click('button:has-text("Aggiungi punto")');
      await page.waitForTimeout(500);
      
      await page.fill('input[id="point-name"]', `Frigo Test ${i}`);
      await page.selectOption('select', '1');
      await page.click('button:has-text("Frigorifero")');
      await page.fill('input[id="point-temperature"]', '4');
      await page.click('button:has-text("Carne fresca")');
      
      await page.click('button:has-text("Aggiungi punto")');
      await page.waitForTimeout(1000);
    }
    
    // Verifica che tutti i punti siano visibili
    await expect(page.locator('text=Frigo Test 10')).toBeVisible();
    
    // Verifica che il form sia nascosto dopo aver raggiunto il limite
    await expect(page.locator('form')).not.toBeVisible();
  });

  test('Dovrebbe gestire cancellazione rapida di punti', async ({ page }) => {
    // Carica punti predefiniti
    await page.click('button:has-text("Carica punti predefiniti")');
    await page.waitForTimeout(2000);
    
    // Elimina rapidamente tutti i punti
    const deleteButtons = page.locator('button[title="Elimina punto"]');
    const count = await deleteButtons.count();
    
    for (let i = 0; i < count; i++) {
      await deleteButtons.first().click();
      await page.waitForTimeout(200);
    }
    
    // Verifica che non ci siano più punti
    await expect(page.locator('text=Nessun punto di conservazione configurato')).toBeVisible();
  });

  test('Dovrebbe gestire modifica simultanea di più punti', async ({ page }) => {
    // Carica punti predefiniti
    await page.click('button:has-text("Carica punti predefiniti")');
    await page.waitForTimeout(2000);
    
    // Prova a modificare il primo punto
    await page.click('button[title="Modifica punto"]');
    await page.waitForTimeout(1000);
    
    // Verifica che solo un form sia aperto
    const forms = page.locator('form');
    await expect(forms).toHaveCount(1);
    
    // Modifica il nome
    await page.fill('input[id="point-name"]', 'Frigo Modificato');
    await page.click('button:has-text("Salva modifiche")');
    await page.waitForTimeout(1000);
    
    // Verifica che il nome sia stato aggiornato
    await expect(page.locator('text=Frigo Modificato')).toBeVisible();
  });

  test('Dovrebbe gestire valori estremi temperatura', async ({ page }) => {
    await page.click('button:has-text("Aggiungi punto")');
    await page.waitForTimeout(1000);
    
    await page.fill('input[id="point-name"]', 'Test Estremo');
    await page.selectOption('select', '1');
    await page.click('button:has-text("Congelatore")');
    
    // Test valori estremi
    const extremeValues = ['-99', '30', '-100', '31', '0.1', '-0.1'];
    
    for (const value of extremeValues) {
      await page.fill('input[id="point-temperature"]', value);
      await page.waitForTimeout(500);
      
      const numValue = parseFloat(value);
      if (numValue < -99 || numValue > 30) {
        await expect(page.locator('text=Temperatura fuori range')).toBeVisible();
      } else {
        await expect(page.locator('text=Temperatura fuori range')).not.toBeVisible();
      }
    }
  });

  test('Dovrebbe gestire cambio tipo durante modifica', async ({ page }) => {
    await page.click('button:has-text("Aggiungi punto")');
    await page.waitForTimeout(1000);
    
    await page.fill('input[id="point-name"]', 'Test Cambio Tipo');
    await page.selectOption('select', '1');
    await page.click('button:has-text("Frigorifero")');
    await page.fill('input[id="point-temperature"]', '4');
    await page.click('button:has-text("Carne fresca")');
    await page.click('button:has-text("Aggiungi punto")');
    await page.waitForTimeout(1000);
    
    // Modifica il punto
    await page.click('button[title="Modifica punto"]');
    await page.waitForTimeout(1000);
    
    // Cambia tipo da Frigorifero a Congelatore
    await page.click('button:has-text("Congelatore")');
    
    // Verifica che la temperatura sia resettata o validata
    await expect(page.locator('input[id="point-temperature"]')).toBeVisible();
    
    // Imposta temperatura per congelatore
    await page.fill('input[id="point-temperature"]', '-18');
    await page.click('button:has-text("Salva modifiche")');
    await page.waitForTimeout(1000);
    
    // Verifica che il tipo sia stato aggiornato
    await expect(page.locator('text=Congelatore')).toBeVisible();
  });

  test('Dovrebbe gestire refresh della pagina durante modifica', async ({ page }) => {
    await page.click('button:has-text("Aggiungi punto")');
    await page.waitForTimeout(1000);
    
    await page.fill('input[id="point-name"]', 'Test Refresh');
    await page.selectOption('select', '1');
    await page.click('button:has-text("Frigorifero")');
    await page.fill('input[id="point-temperature"]', '4');
    
    // Refresh durante la compilazione
    await page.reload();
    await page.waitForTimeout(2000);
    
    await page.click('text=Punti di conservazione');
    await page.waitForTimeout(1000);
    
    // Verifica che il form sia stato resettato
    await expect(page.locator('input[id="point-name"]')).toHaveValue('');
  });

  test('Dovrebbe gestire navigazione tra step durante modifica', async ({ page }) => {
    await page.click('button:has-text("Aggiungi punto")');
    await page.waitForTimeout(1000);
    
    await page.fill('input[id="point-name"]', 'Test Navigazione');
    await page.selectOption('select', '1');
    await page.click('button:has-text("Frigorifero")');
    await page.fill('input[id="point-temperature"]', '4');
    
    // Naviga a un altro step
    await page.click('text=Gestione Inventario');
    await page.waitForTimeout(1000);
    
    // Torna allo step conservazione
    await page.click('text=Punti di conservazione');
    await page.waitForTimeout(1000);
    
    // Verifica che il form sia stato chiuso
    await expect(page.locator('form')).not.toBeVisible();
  });

  test('Dovrebbe gestire validazione in tempo reale', async ({ page }) => {
    await page.click('button:has-text("Aggiungi punto")');
    await page.waitForTimeout(1000);
    
    await page.fill('input[id="point-name"]', 'Test Real-time');
    await page.selectOption('select', '1');
    await page.click('button:has-text("Frigorifero")');
    
    // Test validazione temperatura in tempo reale
    await page.fill('input[id="point-temperature"]', '10');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Temperatura fuori range')).toBeVisible();
    
    // Correggi la temperatura
    await page.fill('input[id="point-temperature"]', '4');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Temperatura fuori range')).not.toBeVisible();
    
    // Seleziona categoria
    await page.click('button:has-text("Carne fresca")');
    
    // Salva
    await page.click('button:has-text("Aggiungi punto")');
    await page.waitForTimeout(1000);
    
    await expect(page.locator('text=Test Real-time')).toBeVisible();
  });
});
