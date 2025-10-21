// Production/Test/Liste-Spesa/ShoppingListCard/test-navigation.spec.js
import { test, expect } from '@playwright/test';

test.describe('ShoppingListCard - Test Navigazione', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Setup Mock Auth se necessario
    const roleSelector = page.locator('text=Mock Auth System');
    if (await roleSelector.isVisible()) {
      await page.click('text=Amministratore');
      await page.click('button:has-text("Conferma Ruolo")');
      await page.waitForTimeout(2000);
    }
  });

  test('Dovrebbe navigare alla pagina inventario', async ({ page }) => {
    // Verifica che siamo sulla home
    await expect(page.locator('h1')).toContainText('HACCP Manager');
    
    // Cerca il link per l'inventario nella navigazione
    const inventoryLink = page.locator('a[href="/inventario"]');
    
    if (await inventoryLink.isVisible()) {
      await inventoryLink.click();
      await page.waitForTimeout(2000);
      
      // Verifica che siamo sulla pagina inventario
      await expect(page.locator('h1')).toContainText('Inventario');
    } else {
      // Prova a navigare direttamente
      await page.goto('/inventario');
      await page.waitForTimeout(2000);
      
      // Verifica che siamo sulla pagina inventario
      await expect(page.locator('h1')).toContainText('Inventario');
    }
  });

  test('Dovrebbe mostrare il componente ShoppingListCard nella pagina inventario', async ({ page }) => {
    // Naviga direttamente alla pagina inventario
    await page.goto('/inventario');
    await page.waitForTimeout(2000);
    
    // Verifica che siamo sulla pagina inventario
    await expect(page.locator('h1')).toContainText('Inventario');
    
    // Scroll down per visualizzare tutta la pagina
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // Verifica che ci sia il componente ShoppingListCard
    const shoppingListCard = page.locator('text=Lista della Spesa');
    await expect(shoppingListCard).toBeVisible();
  });

  test('Dovrebbe poter interagire con il componente ShoppingListCard', async ({ page }) => {
    // Naviga direttamente alla pagina inventario
    await page.goto('/inventario');
    await page.waitForTimeout(2000);
    
    // Verifica che siamo sulla pagina inventario
    await expect(page.locator('h1')).toContainText('Inventario');
    
    // Scroll down per visualizzare tutta la pagina
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // Trova il componente ShoppingListCard
    const shoppingListCard = page.locator('text=Lista della Spesa');
    await expect(shoppingListCard).toBeVisible();
    
    // Click per aprire il collapse
    await shoppingListCard.click();
    await page.waitForTimeout(1000);
    
    // Verifica che il contenuto sia visibile
    await expect(page.locator('text=Seleziona i prodotti da aggiungere alla lista della spesa')).toBeVisible();
  });
});


