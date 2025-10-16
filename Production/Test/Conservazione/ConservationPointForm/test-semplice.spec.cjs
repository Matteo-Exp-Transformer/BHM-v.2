const { test, expect } = require('@playwright/test');

test.describe('ConservationPointForm - Test Semplice', () => {
  
  test('Dovrebbe aprire il modal e mostrare il form', async ({ page }) => {
    // Login
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
    
    // Verificare che ci sia il campo nome
    await expect(page.locator('input[id="point-name"]')).toBeVisible();
    
    // Verificare che ci sia il campo temperatura
    await expect(page.locator('input[id="point-temperature"]')).toBeVisible();
    
    // Verificare che ci sia il bottone submit
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
