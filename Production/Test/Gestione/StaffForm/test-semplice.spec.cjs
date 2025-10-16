const { test, expect } = require('@playwright/test');

test.describe('StaffForm - Test Semplice', () => {
  
  test('Dovrebbe aprire il modal e mostrare il form', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3006/sign-in');
    await page.fill('input[name="email"]', 'matteo.cavallaro.work@gmail.com');
    await page.fill('input[name="password"]', 'cavallaro');
    await page.click('button[type="submit"]');
    
    // Aspettare redirect alla dashboard
    await expect(page).toHaveURL(/.*\/dashboard.*/, { timeout: 10000 });
    
    // Navigare alla pagina gestione
    await page.goto('http://localhost:3006/gestione');
    
    // Aspettare che la pagina si carichi
    await expect(page.locator('h1').nth(1)).toContainText('Gestione');
    
    // Cliccare sul bottone per aggiungere staff
    await page.click('button:has-text("Aggiungi Staff")');
    
    // Verificare che il modal sia aperto
    await expect(page.locator('text=Nuovo Dipendente')).toBeVisible();
    
    // Verificare che ci sia il campo nome
    await expect(page.locator('input[id="name"]')).toBeVisible();
    
    // Verificare che ci sia il campo email
    await expect(page.locator('input[id="email"]')).toBeVisible();
    
    // Verificare che ci sia il bottone submit
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
