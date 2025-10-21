import { test, expect } from '@playwright/test';

test.describe('Test Singolo Onboarding - Lento', () => {
  test('Test base: Verifica che onboarding si carichi correttamente', async ({ page }) => {
    console.log('🚀 Inizio test: Navigazione a /onboarding');
    
    // Naviga alla pagina onboarding
    await page.goto('/onboarding');
    console.log('📍 Navigato a /onboarding');
    
    // Aspetta che la pagina si carichi completamente
    await page.waitForTimeout(2000);
    console.log('⏳ Aspettato 2 secondi per caricamento');
    
    // Verifica che il wizard sia visibile
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toBeVisible();
    console.log('✅ OnboardingWizard trovato e visibile');
    
    // Verifica header
    await expect(page.locator('h1')).toContainText('Configurazione Iniziale HACCP');
    console.log('✅ Header corretto trovato');
    
    // Verifica bottone skip
    await expect(page.locator('button:has-text("Salta")')).toBeVisible();
    console.log('✅ Bottone "Salta" trovato');
    
    // Verifica step navigator
    const stepButtons = page.locator('[data-testid="step-navigator"] button');
    await expect(stepButtons).toHaveCount(7);
    console.log('✅ Step navigator con 7 step trovato');
    
    // Verifica progress bar
    await expect(page.locator('text=Step 1 di 7')).toBeVisible();
    console.log('✅ Progress bar corretta trovata');
    
    // Verifica bottoni dev (se presenti)
    const prefillButton = page.locator('button:has-text("Precompila")');
    if (await prefillButton.isVisible()) {
      console.log('✅ Bottone "Precompila" trovato');
    } else {
      console.log('⚠️ Bottone "Precompila" non trovato (normale in produzione)');
    }
    
    console.log('🎉 Test completato con successo!');
  });
});
