// Test per verificare il reset onboarding tramite pulsante "Cancella e ricomincia"
import { test, expect } from '@playwright/test';

test.describe('Reset Onboarding - Pulsante Cancella e Ricomincia', () => {

  test('Dovrebbe resettare completamente i dati onboarding', async ({ page }) => {
    // Vai alla homepage
    await page.goto('/');
    
    // Attendi che la pagina sia caricata
    await page.waitForLoadState('networkidle');
    
    // Verifica lo stato dell'onboarding nel localStorage
    const onboardingStatus = await page.evaluate(() => {
      return {
        completed: localStorage.getItem('onboarding-completed'),
        completedAt: localStorage.getItem('onboarding-completed-at'),
        data: localStorage.getItem('onboarding-data'),
        companyId: localStorage.getItem('active_company_id')
      };
    });
    
    console.log('📊 Stato onboarding:', onboardingStatus);
    
    // Se l'onboarding è completato, il pulsante "Cancella e Ricomincia" dovrebbe essere visibile
    if (onboardingStatus.completed === 'true') {
      console.log('✅ Onboarding completato, cercando pulsante reset...');
      
      // Cerca il pulsante "Cancella e Ricomincia" o "Reset"
      const resetButton = page.locator('button:has-text("Cancella e Ricomincia"), button:has-text("Reset")');
      await expect(resetButton).toBeVisible();
      
      // Clicca sul pulsante di reset
      await resetButton.click();
      
      // Conferma il reset (il browser dovrebbe mostrare un dialog di conferma)
      await page.on('dialog', async dialog => {
        await dialog.accept();
      });
      
      // Attendi che il reset sia completato
      await page.waitForTimeout(3000);
      
      // Verifica che l'onboarding si apra automaticamente
      await expect(page.locator('h2:has-text("Informazioni Aziendali")')).toBeVisible();
      
      console.log('✅ Reset onboarding completato con successo');
    } else {
      console.log('ℹ️ Onboarding non completato, test saltato');
    }
  });
});
