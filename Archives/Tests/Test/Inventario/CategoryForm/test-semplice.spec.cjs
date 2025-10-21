const { test, expect } = require('@playwright/test');

test.describe('CategoryForm - Test Semplice', () => {
  
  test('Dovrebbe aprire il modal e mostrare il form', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3006/sign-in');
    await page.fill('input[name="email"]', 'matteo.cavallaro.work@gmail.com');
    await page.fill('input[name="password"]', 'cavallaro');
    await page.click('button[type="submit"]');
    
    // Aspettare redirect alla dashboard
    await expect(page).toHaveURL(/.*\/dashboard.*/, { timeout: 10000 });
    
    // Navigare alla pagina inventario
    await page.goto('http://localhost:3006/inventario');
    
    // Verificare che siamo nella pagina inventario
    await expect(page.locator('h1').nth(1)).toContainText('Inventario');
    
    // Cliccare sul bottone per aggiungere categoria
    await page.click('button:has-text("Categoria")');
    
    // Verificare che il modal sia aperto
    await expect(page.locator('h2:has-text("Nuova Categoria")')).toBeVisible();
    
    // Verificare che ci sia il campo nome
    await expect(page.locator('input[placeholder="Es. Verdura Fresca"]')).toBeVisible();
    
    // Verificare che ci sia il campo descrizione
    await expect(page.locator('textarea')).toBeVisible();
    
    // Verificare che ci sia il bottone submit
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
