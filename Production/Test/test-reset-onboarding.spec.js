// Test per verificare il reset onboarding tramite pulsante "Cancella e ricomincia"
import { test, expect } from '@playwright/test';

test.describe('Reset Onboarding - Pulsante Cancella e Ricomincia', () => {

  test('Dovrebbe resettare completamente i dati onboarding', async ({ page }) => {
    // Vai alla homepage
    await page.goto('/');
    
    // Attendi che la pagina sia caricata
    await page.waitForLoadState('networkidle');
    
    // Verifica che il pulsante "Cancella e Ricomincia" sia visibile
    await expect(page.locator('button:has-text("Cancella e Ricomincia")')).toBeVisible();
    
    // Clicca sul pulsante "Cancella e Ricomincia"
    await page.click('button:has-text("Cancella e Ricomincia")');
    
    // Conferma il reset (il browser dovrebbe mostrare un dialog di conferma)
    await page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    // Attendi che il reset sia completato
    await page.waitForTimeout(3000);
    
    // Verifica che l'onboarding si apra automaticamente
    await expect(page.locator('h2:has-text("Informazioni Aziendali")')).toBeVisible();
    
    console.log('✅ Reset onboarding completato con successo');
  });

  test('Dovrebbe pulire tutte le chiavi localStorage dell\'onboarding', async ({ page }) => {
    // Vai alla homepage
    await page.goto('/');
    
    // Attendi che la pagina sia caricata
    await page.waitForLoadState('networkidle');
    
    // Esegui il reset
    await page.click('button:has-text("Cancella e Ricomincia")');
    
    // Conferma il reset
    await page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    // Attendi che il reset sia completato
    await page.waitForTimeout(3000);
    
    // Verifica che le chiavi localStorage siano state pulite
    const localStorageKeys = await page.evaluate(() => {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('onboarding') || key.includes('haccp') || key.includes('company-id'))) {
          keys.push(key);
        }
      }
      return keys;
    });
    
    console.log('🔍 Chiavi localStorage rimaste:', localStorageKeys);
    
    // Le chiavi di onboarding dovrebbero essere state pulite
    expect(localStorageKeys).not.toContain('onboarding-completed');
    expect(localStorageKeys).not.toContain('onboarding-completed-at');
    expect(localStorageKeys).not.toContain('onboarding-data');
    
    console.log('✅ Chiavi localStorage pulite correttamente');
  });
});
