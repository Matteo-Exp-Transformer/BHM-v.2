// Production/Test/Liste-Spesa/ShoppingListCard/test-base.spec.js
import { test, expect } from '@playwright/test';

test.describe('ShoppingListCard - Test Base', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Setup Mock Auth se necessario
    const roleSelector = page.locator('text=Mock Auth System');
    if (await roleSelector.isVisible()) {
      await page.click('text=Amministratore');
      await page.click('button:has-text("Conferma Ruolo")');
      await page.waitForTimeout(2000);
    }
    
    // Naviga alla pagina inventario dove si trova ShoppingListCard
    await page.goto('/inventario');
    await page.waitForTimeout(2000);
  });

  test('Dovrebbe caricare la pagina inventario correttamente', async ({ page }) => {
    // Verifica che la pagina si sia caricata
    await expect(page.locator('h1')).toContainText('Inventario');
    
    // Verifica che ci siano le statistiche
    await expect(page.locator('text=Totale Prodotti')).toBeVisible();
    
    // Scroll down per visualizzare tutta la pagina
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // Verifica che ci sia il componente ShoppingListCard
    const shoppingListCard = page.locator('text=Lista della Spesa');
    await expect(shoppingListCard).toBeVisible();
  });

  test('Dovrebbe mostrare il componente ShoppingListCard', async ({ page }) => {
    // Scroll down per trovare il componente
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // Verifica che il componente sia presente
    const shoppingListCard = page.locator('text=Lista della Spesa');
    await expect(shoppingListCard).toBeVisible();
    
    // Verifica che ci sia la descrizione
    await expect(page.locator('text=Seleziona i prodotti da aggiungere alla lista della spesa')).toBeVisible();
  });

  test('Dovrebbe poter aprire il collapse del ShoppingListCard', async ({ page }) => {
    // Scroll down per trovare il componente
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // Trova il componente ShoppingListCard
    const shoppingListCard = page.locator('text=Lista della Spesa').locator('..').locator('..');
    
    // Click per aprire il collapse
    await shoppingListCard.click();
    await page.waitForTimeout(1000);
    
    // Verifica che il contenuto sia visibile
    await expect(page.locator('text=Seleziona i prodotti da aggiungere alla lista della spesa')).toBeVisible();
  });
});


