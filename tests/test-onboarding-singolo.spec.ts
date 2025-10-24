import { test, expect } from '@playwright/test';

test.describe('Test Onboarding Singolo', () => {
  test('Verifica caricamento pagina onboarding', async ({ page }) => {
    console.log('🚀 Inizio test: Navigazione a /onboarding');
    
    // Naviga alla pagina onboarding
    await page.goto('http://localhost:3006/onboarding');
    console.log('📍 Navigato a http://localhost:3006/onboarding');
    
    // Aspetta che la pagina si carichi
    await page.waitForTimeout(3000);
    console.log('⏳ Aspettato 3 secondi per caricamento');
    
    // Verifica che il wizard sia visibile
    await expect(page.locator('[data-testid="onboarding-wizard"]')).toBeVisible();
    console.log('✅ OnboardingWizard trovato e visibile');
    
    // Verifica header
    await expect(page.locator('h1')).toContainText('Configurazione Iniziale HACCP');
    console.log('✅ Header corretto trovato');
    
    // Verifica bottone skip
    await expect(page.locator('button:has-text("Salta")')).toBeVisible();
    console.log('✅ Bottone "Salta" trovato');
    
    console.log('🎉 Test completato con successo!');
  });
});








