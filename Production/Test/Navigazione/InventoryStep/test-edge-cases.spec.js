// Production/Test/Navigazione/InventoryStep/test-edge-cases.spec.js
import { test, expect } from '@playwright/test';

test.describe('InventoryStep - Edge Cases', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding');
    await page.evaluate(() => window.setMockRole('admin'));
    await page.reload();
    await page.waitForTimeout(2000);
    
    await page.click('text=Gestione Inventario');
    await page.waitForTimeout(1000);
  });

  test('Dovrebbe gestire stato loading durante operazioni', async ({ page }) => {
    await page.click('button:has-text("Nuova categoria")');
    
    // Verifica che ci sia un indicatore di loading (se presente)
    const loadingIndicator = page.locator('[data-testid="loading"], .loading, .spinner');
    if (await loadingIndicator.count() > 0) {
      await expect(loadingIndicator).toBeVisible();
    }
    
    // Compila e salva
    await page.fill('input[type="text"]', 'Categoria Loading');
    await page.fill('input[type="color"]', '#ff0000');
    await page.fill('input[type="number"]', '0');
    await page.fill('input[type="number"]', '4');
    await page.click('button:has-text("Salva categoria")');
    
    // Attendi completamento
    await page.waitForTimeout(2000);
    await expect(page.locator('text=Categoria Loading')).toBeVisible();
  });

  test('Dovrebbe gestire errori di rete', async ({ page }) => {
    // Simula offline
    await page.context().setOffline(true);
    
    await page.click('button:has-text("Nuova categoria")');
    await page.fill('input[type="text"]', 'Categoria Offline');
    await page.fill('input[type="color"]', '#ff0000');
    await page.fill('input[type="number"]', '0');
    await page.fill('input[type="number"]', '4');
    await page.click('button:has-text("Salva categoria")');
    
    // Verifica gestione errore rete
    await expect(page.locator('text=Errore di connessione')).toBeVisible();
    
    // Ripristina connessione
    await page.context().setOffline(false);
  });

  test('Dovrebbe gestire molte categorie e prodotti', async ({ page }) => {
    // Crea molte categorie
    for (let i = 1; i <= 5; i++) {
      await page.click('button:has-text("Nuova categoria")');
      await page.waitForTimeout(500);
      
      await page.fill('input[type="text"]', `Categoria ${i}`);
      await page.fill('input[type="color"]', '#ff0000');
      await page.fill('input[type="number"]', '0');
      await page.fill('input[type="number"]', '4');
      await page.click('button:has-text("Salva categoria")');
      await page.waitForTimeout(1000);
    }
    
    // Vai a Prodotti
    await page.click('button:has-text("Prodotti")');
    await page.waitForTimeout(500);
    
    // Crea molti prodotti
    for (let i = 1; i <= 10; i++) {
      await page.click('button:has-text("Nuovo prodotto")');
      await page.waitForTimeout(500);
      
      await page.fill('input[placeholder="Es: Pollo, Pane, Latte..."]', `Prodotto ${i}`);
      await page.selectOption('select', '1');
      await page.selectOption('select', '1');
      await page.selectOption('select', '1');
      await page.fill('input[type="date"]', '2025-01-17');
      await page.fill('input[type="date"]', '2025-01-20');
      await page.fill('input[type="number"]', i);
      
      await page.click('button:has-text("Salva prodotto")');
      await page.waitForTimeout(1000);
    }
    
    // Verifica che tutti i prodotti siano visibili
    await expect(page.locator('text=Prodotto 10')).toBeVisible();
  });

  test('Dovrebbe gestire eliminazione rapida di categorie e prodotti', async ({ page }) => {
    // Crea categoria e prodotto
    await page.click('button:has-text("Nuova categoria")');
    await page.waitForTimeout(500);
    
    await page.fill('input[type="text"]', 'Categoria da Eliminare');
    await page.fill('input[type="color"]', '#ff0000');
    await page.fill('input[type="number"]', '0');
    await page.fill('input[type="number"]', '4');
    await page.click('button:has-text("Salva categoria")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Prodotti")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Nuovo prodotto")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pollo, Pane, Latte..."]', 'Prodotto da Eliminare');
    await page.selectOption('select', '1');
    await page.selectOption('select', '1');
    await page.selectOption('select', '1');
    await page.fill('input[type="date"]', '2025-01-17');
    await page.fill('input[type="date"]', '2025-01-20');
    await page.fill('input[type="number"]', '1');
    await page.click('button:has-text("Salva prodotto")');
    await page.waitForTimeout(1000);
    
    // Elimina rapidamente
    await page.click('button[title="Elimina prodotto"]');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Categorie Prodotti")');
    await page.waitForTimeout(500);
    
    await page.click('button[title="Elimina categoria"]');
    await page.waitForTimeout(500);
    
    // Verifica eliminazione
    await expect(page.locator('text=Prodotto da Eliminare')).not.toBeVisible();
    await expect(page.locator('text=Categoria da Eliminare')).not.toBeVisible();
  });

  test('Dovrebbe gestire modifica simultanea di categorie e prodotti', async ({ page }) => {
    // Crea categoria
    await page.click('button:has-text("Nuova categoria")');
    await page.waitForTimeout(500);
    
    await page.fill('input[type="text"]', 'Categoria Simultanea');
    await page.fill('input[type="color"]', '#ff0000');
    await page.fill('input[type="number"]', '0');
    await page.fill('input[type="number"]', '4');
    await page.click('button:has-text("Salva categoria")');
    await page.waitForTimeout(1000);
    
    // Vai a Prodotti
    await page.click('button:has-text("Prodotti")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Nuovo prodotto")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pollo, Pane, Latte..."]', 'Prodotto Simultaneo');
    await page.selectOption('select', '1');
    await page.selectOption('select', '1');
    await page.selectOption('select', '1');
    await page.fill('input[type="date"]', '2025-01-17');
    await page.fill('input[type="date"]', '2025-01-20');
    await page.fill('input[type="number"]', '1');
    await page.click('button:has-text("Salva prodotto")');
    await page.waitForTimeout(1000);
    
    // Prova a modificare categoria mentre prodotto è in modifica
    await page.click('button[title="Modifica prodotto"]');
    await page.waitForTimeout(500);
    
    // Vai a categorie
    await page.click('button:has-text("Categorie Prodotti")');
    await page.waitForTimeout(500);
    
    // Verifica che solo un form sia aperto
    const forms = page.locator('form');
    await expect(forms).toHaveCount(1);
  });

  test('Dovrebbe gestire valori estremi per temperature', async ({ page }) => {
    await page.click('button:has-text("Nuova categoria")');
    await page.waitForTimeout(500);
    
    await page.fill('input[type="text"]', 'Categoria Estrema');
    await page.fill('input[type="color"]', '#ff0000');
    
    // Test valori estremi
    const extremeValues = [
      { min: '-99', max: '30', valid: true },
      { min: '-100', max: '30', valid: false },
      { min: '-99', max: '31', valid: false },
      { min: '0.1', max: '0.2', valid: true },
      { min: '0', max: '0', valid: true }
    ];
    
    for (const testCase of extremeValues) {
      await page.fill('input[type="number"]', testCase.min);
      await page.fill('input[type="number"]', testCase.max);
      await page.click('button:has-text("Salva categoria")');
      
      if (testCase.valid) {
        await expect(page.locator('text=Temperatura non valida')).not.toBeVisible();
        await expect(page.locator('text=Categoria Estrema')).toBeVisible();
        
        // Elimina per test successivo
        await page.click('button[title="Elimina categoria"]');
        await page.waitForTimeout(500);
        await page.click('button:has-text("Nuova categoria")');
        await page.waitForTimeout(500);
        await page.fill('input[type="text"]', 'Categoria Estrema');
        await page.fill('input[type="color"]', '#ff0000');
      } else {
        await expect(page.locator('text=Temperatura non valida')).toBeVisible();
      }
    }
  });

  test('Dovrebbe gestire cambio tab durante modifica', async ({ page }) => {
    // Crea categoria
    await page.click('button:has-text("Nuova categoria")');
    await page.waitForTimeout(500);
    
    await page.fill('input[type="text"]', 'Categoria Tab');
    await page.fill('input[type="color"]', '#ff0000');
    await page.fill('input[type="number"]', '0');
    await page.fill('input[type="number"]', '4');
    await page.click('button:has-text("Salva categoria")');
    await page.waitForTimeout(1000);
    
    // Vai a Prodotti
    await page.click('button:has-text("Prodotti")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Nuovo prodotto")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pollo, Pane, Latte..."]', 'Prodotto Tab');
    await page.selectOption('select', '1');
    await page.selectOption('select', '1');
    await page.selectOption('select', '1');
    await page.fill('input[type="date"]', '2025-01-17');
    await page.fill('input[type="date"]', '2025-01-20');
    await page.fill('input[type="number"]', '1');
    await page.click('button:has-text("Salva prodotto")');
    await page.waitForTimeout(1000);
    
    // Modifica prodotto
    await page.click('button[title="Modifica prodotto"]');
    await page.waitForTimeout(500);
    
    // Cambia tab durante modifica
    await page.click('button:has-text("Categorie Prodotti")');
    await page.waitForTimeout(500);
    
    // Torna a Prodotti
    await page.click('button:has-text("Prodotti")');
    await page.waitForTimeout(500);
    
    // Verifica che il form sia stato chiuso
    await expect(page.locator('form')).not.toBeVisible();
  });

  test('Dovrebbe gestire refresh della pagina durante modifica', async ({ page }) => {
    await page.click('button:has-text("Nuova categoria")');
    await page.waitForTimeout(500);
    
    await page.fill('input[type="text"]', 'Categoria Refresh');
    await page.fill('input[type="color"]', '#ff0000');
    await page.fill('input[type="number"]', '0');
    await page.fill('input[type="number"]', '4');
    
    // Refresh durante la compilazione
    await page.reload();
    await page.waitForTimeout(2000);
    
    await page.click('text=Gestione Inventario');
    await page.waitForTimeout(1000);
    
    // Verifica che il form sia stato resettato
    await expect(page.locator('input[type="text"]')).toHaveValue('');
  });

  test('Dovrebbe gestire validazione compliance in tempo reale', async ({ page }) => {
    // Crea categoria
    await page.click('button:has-text("Nuova categoria")');
    await page.waitForTimeout(500);
    
    await page.fill('input[type="text"]', 'Categoria Compliance');
    await page.fill('input[type="color"]', '#ff0000');
    await page.fill('input[type="number"]', '0');
    await page.fill('input[type="number"]', '4');
    await page.click('button:has-text("Salva categoria")');
    await page.waitForTimeout(1000);
    
    // Vai a Prodotti
    await page.click('button:has-text("Prodotti")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Nuovo prodotto")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pollo, Pane, Latte..."]', 'Prodotto Compliance');
    await page.selectOption('select', '1');
    await page.selectOption('select', '1');
    await page.selectOption('select', '1');
    await page.fill('input[type="date"]', '2025-01-17');
    await page.fill('input[type="date"]', '2025-01-20');
    await page.fill('input[type="number"]', '1');
    
    // Verifica che la compliance sia mostrata in tempo reale
    await expect(page.locator('text=Compliant')).toBeVisible();
    
    await page.click('button:has-text("Salva prodotto")');
    await page.waitForTimeout(1000);
    
    // Verifica che il prodotto mostri lo stato di compliance
    await expect(page.locator('text=Prodotto Compliance')).toBeVisible();
    await expect(page.locator('text=Compliant')).toBeVisible();
  });

  test('Dovrebbe gestire selezione allergeni multipli', async ({ page }) => {
    // Crea categoria prima
    await page.click('button:has-text("Nuova categoria")');
    await page.waitForTimeout(500);
    
    await page.fill('input[type="text"]', 'Categoria Allergeni');
    await page.fill('input[type="color"]', '#ff0000');
    await page.fill('input[type="number"]', '0');
    await page.fill('input[type="number"]', '4');
    await page.click('button:has-text("Salva categoria")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Prodotti")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Nuovo prodotto")');
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder="Es: Pollo, Pane, Latte..."]', 'Prodotto Multi Allergeni');
    await page.selectOption('select', '1');
    await page.selectOption('select', '1');
    await page.selectOption('select', '1');
    await page.fill('input[type="date"]', '2025-01-17');
    await page.fill('input[type="date"]', '2025-01-20');
    await page.fill('input[type="number"]', '1');
    
    // Seleziona multipli allergeni
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      await checkboxes.nth(i).check();
    }
    
    await page.click('button:has-text("Salva prodotto")');
    await page.waitForTimeout(1000);
    
    await expect(page.locator('text=Prodotto Multi Allergeni')).toBeVisible();
    await expect(page.locator('text=Allergeni:')).toBeVisible();
  });
});
