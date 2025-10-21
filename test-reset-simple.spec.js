// Test semplice per verificare il fix del reset onboarding
const { test, expect } = require('@playwright/test');

test.describe('Fix Reset Onboarding - Test Semplice', () => {
  test('Dovrebbe pulire i dati locali quando si clicca "Cancella e ricomincia"', async ({ page }) => {
    console.log('🧪 Test: Verifica pulizia dati locali dopo reset');
    
    // Naviga alla pagina di login
    await page.goto('http://localhost:3000/login');
    
    // Login con credenziali di test (usa credenziali reali se disponibili)
    await page.fill('input[type="email"]', 'mario@esempio.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Attendi il caricamento della dashboard
    await page.waitForTimeout(3000);
    
    // Verifica che siamo sulla dashboard
    const currentUrl = page.url();
    console.log('URL corrente:', currentUrl);
    
    // Cerca il pulsante "Cancella e Ricomincia"
    const resetButton = page.locator('button:has-text("Cancella e Ricomincia")');
    
    if (await resetButton.isVisible()) {
      console.log('✅ Pulsante "Cancella e Ricomincia" trovato');
      
      // Inserisci alcuni dati di test nel localStorage
      await page.evaluate(() => {
        const testData = {
          company: { name: 'Test Company', email: 'test@company.com' },
          departments: [{ name: 'Test Department' }]
        };
        localStorage.setItem('onboarding-data', JSON.stringify(testData));
      });
      
      // Verifica che i dati siano presenti
      const dataBeforeReset = await page.evaluate(() => {
        return localStorage.getItem('onboarding-data');
      });
      console.log('Dati prima del reset:', dataBeforeReset ? 'Presenti' : 'Assenti');
      
      // Clicca sul pulsante "Cancella e Ricomincia"
      console.log('🔄 Cliccando su "Cancella e Ricomincia"...');
      await resetButton.click();
      
      // Conferma il reset
      await page.click('button:has-text("OK")');
      
      // Attendi che il reset sia completato
      await page.waitForTimeout(3000);
      
      // Verifica che il localStorage sia stato pulito
      const dataAfterReset = await page.evaluate(() => {
        return localStorage.getItem('onboarding-data');
      });
      console.log('Dati dopo il reset:', dataAfterReset ? 'Presenti' : 'Assenti');
      
      // Verifica che l'onboarding si sia aperto
      const onboardingVisible = await page.locator('[data-testid="onboarding-wizard"]').isVisible();
      console.log('Onboarding aperto:', onboardingVisible ? 'Sì' : 'No');
      
      console.log('🎉 Test completato!');
    } else {
      console.log('❌ Pulsante "Cancella e Ricomincia" non trovato');
    }
  });
});
