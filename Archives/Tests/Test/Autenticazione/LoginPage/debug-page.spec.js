import { test, expect } from '@playwright/test';

test.describe('Debug LoginPage', () => {
  test('Debug: Vedere cosa c\'è nella pagina', async ({ page }) => {
    await page.goto('/login');
    
    // Aspettare che la pagina si carichi
    await page.waitForLoadState('networkidle');
    
    // Prendere screenshot
    await page.screenshot({ path: 'debug-login-page.png' });
    
    // Stampare tutto il contenuto della pagina
    const pageContent = await page.content();
    console.log('Page content:', pageContent);
    
    // Cercare tutti gli h1
    const h1Elements = await page.locator('h1').all();
    console.log('H1 elements found:', h1Elements.length);
    
    for (let i = 0; i < h1Elements.length; i++) {
      const text = await h1Elements[i].textContent();
      console.log(`H1 ${i}:`, text);
    }
    
    // Cercare tutti gli elementi con testo che contiene "Business"
    const businessElements = await page.locator('text=/Business/').all();
    console.log('Elements with "Business":', businessElements.length);
    
    for (let i = 0; i < businessElements.length; i++) {
      const text = await businessElements[i].textContent();
      console.log(`Business element ${i}:`, text);
    }
    
    // Verificare che la pagina sia caricata
    await expect(page.locator('body')).toBeVisible();
  });
});
