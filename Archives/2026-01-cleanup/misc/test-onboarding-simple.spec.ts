import { test, expect } from '@playwright/test';

test('Onboarding Demo - Test Semplice', async ({ page }) => {
  // Naviga alla pagina onboarding
  await page.goto('/onboarding');
  
  // Verifica che la pagina sia caricata
  await expect(page.locator('h1')).toContainText('Configurazione Iniziale HACCP');
  
  // Screenshot iniziale
  await page.screenshot({ path: 'test-onboarding-demo-iniziale.png' });
  
  console.log('✅ Pagina onboarding caricata correttamente!');
  console.log('📸 Screenshot salvato: test-onboarding-demo-iniziale.png');
  
  // Test del pulsante Precompila
  const prefillButton = page.locator('button:has-text("Precompila")');
  await expect(prefillButton).toBeVisible();
  
  console.log('✅ Pulsante Precompila trovato!');
  
  // Test del pulsante Completa Onboarding
  const completeButton = page.locator('button:has-text("Completa Onboarding")');
  await expect(completeButton).toBeVisible();
  
  console.log('✅ Pulsante Completa Onboarding trovato!');
  
  // Screenshot finale
  await page.screenshot({ path: 'test-onboarding-demo-finale.png' });
  
  console.log('📸 Screenshot finale salvato: test-onboarding-demo-finale.png');
  console.log('🎉 Test demo completato con successo!');
});









