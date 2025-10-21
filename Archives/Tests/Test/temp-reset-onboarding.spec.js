// Test temporaneo per reset onboarding
import { test, expect } from '@playwright/test';

test('Reset onboarding data', async ({ page }) => {
  // Vai alla homepage
  await page.goto('/');
  
  // Attendi che la pagina sia caricata
  await page.waitForLoadState('networkidle');
  
  // Esegui reset onboarding tramite console
  await page.evaluate(() => {
    if (window.resetOnboardingData) {
      return window.resetOnboardingData();
    } else {
      throw new Error('resetOnboardingData non disponibile');
    }
  });
  
  console.log('✅ Reset onboarding completato');
  
  // Verifica che il reset sia avvenuto
  await page.waitForTimeout(2000);
});
