// Production/Test/Onboarding/BusinessInfoStep/test-edge-cases.spec.js
import { test, expect } from '@playwright/test';

test.describe('BusinessInfoStep - Edge Cases', () => {

  test.beforeEach(async ({ page }) => {
    // Vai alla homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Se non siamo loggati, fai il login
    const isLoggedIn = await page.locator('button:has-text("Onboarding")').isVisible().catch(() => false);
    
    if (!isLoggedIn) {
      console.log('🔐 Eseguendo login...');
      
      // Compila email
      await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com');
      
      // Compila password
      await page.fill('input[type="password"]', 'cavallaro');
      
      // Clicca su Accedi
      await page.click('button:has-text("Accedi")');
      
      // Attendi che il login sia completato
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      console.log('✅ Login completato');
    }
    
    // Clicca sul pulsante "Onboarding" per aprire l'onboarding
    await page.click('button:has-text("Onboarding")');
    
    // Attendi caricamento componente
    await page.waitForSelector('h2:has-text("Informazioni Aziendali")');
  });

  test('Dovrebbe gestire valori limite', async ({ page }) => {
    // Stringa vuota
    await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', '');
    await expect(page.locator('text=Il nome dell\'azienda è obbligatorio')).toBeVisible();
    
    // Stringa di 1 carattere
    await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', 'A');
    await expect(page.locator('text=Il nome deve essere di almeno 2 caratteri')).toBeVisible();
    
    // Stringa di 2 caratteri (minimo valido)
    await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', 'AB');
    await page.fill('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]', 'Via Test');
    await expect(page.locator('text=Il nome dell\'azienda è obbligatorio')).not.toBeVisible();
    await expect(page.locator('text=Il nome deve essere di almeno 2 caratteri')).not.toBeVisible();
    
    // Stringa molto lunga (>1000 caratteri)
    const longString = 'A'.repeat(1001);
    await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', longString);
    await page.fill('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]', 'Via Test');
    // Non dovrebbe esserci errore (nessun limite massimo definito)
    await expect(page.locator('text=Il nome dell\'azienda è obbligatorio')).not.toBeVisible();
  });

  test('Dovrebbe gestire input con spazi', async ({ page }) => {
    // Nome con solo spazi
    await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', '   ');
    await expect(page.locator('text=Il nome dell\'azienda è obbligatorio')).toBeVisible();
    
    // Nome con spazi iniziali e finali (dovrebbe essere trimmato)
    await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', '  Test Azienda  ');
    await page.fill('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]', 'Via Test');
    await expect(page.locator('text=Il nome dell\'azienda è obbligatorio')).not.toBeVisible();
  });

  test('Dovrebbe gestire date limite', async ({ page }) => {
    // Data molto passata
    await page.fill('input[type="date"]', '1900-01-01');
    await expect(page.locator('input[type="date"]')).toHaveValue('1900-01-01');
    
    // Data futura
    await page.fill('input[type="date"]', '2030-12-31');
    await expect(page.locator('input[type="date"]')).toHaveValue('2030-12-31');
    
    // Data odierna
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[type="date"]', today);
    await expect(page.locator('input[type="date"]')).toHaveValue(today);
  });

  test('Dovrebbe gestire tutti i tipi di business', async ({ page }) => {
    const businessTypes = [
      'ristorante', 'bar', 'pizzeria', 'trattoria', 
      'osteria', 'enoteca', 'birreria', 'altro'
    ];
    
    for (const type of businessTypes) {
      await page.selectOption('select', type);
      await expect(page.locator('select')).toHaveValue(type);
    }
  });

  test('Dovrebbe gestire input rapidi e multipli', async ({ page }) => {
    // Simula input rapido
    const nameInput = page.locator('input[placeholder="Inserisci il nome della tua azienda"]');
    
    // Input molto rapido
    await nameInput.type('Test', { delay: 10 });
    await nameInput.clear();
    await nameInput.type('Azienda', { delay: 10 });
    
    await expect(nameInput).toHaveValue('Azienda');
    
    // Test cambio rapido tra campi
    await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', 'Test');
    await page.fill('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]', 'Via Test');
    await page.fill('input[placeholder="+39 051 1234567"]', '+39 051 1234567');
    await page.fill('input[placeholder="info@azienda.it"]', 'test@test.it');
    
    // Verifica che tutti i valori siano stati mantenuti
    await expect(page.locator('input[placeholder="Inserisci il nome della tua azienda"]')).toHaveValue('Test');
    await expect(page.locator('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]')).toContainText('Via Test');
    await expect(page.locator('input[placeholder="+39 051 1234567"]')).toHaveValue('+39 051 1234567');
    await expect(page.locator('input[placeholder="info@azienda.it"]')).toHaveValue('test@test.it');
  });

  test('Dovrebbe gestire copy-paste', async ({ page }) => {
    // Test copia-incolla
    const nameInput = page.locator('input[placeholder="Inserisci il nome della tua azienda"]');
    
    // Simula paste
    await nameInput.fill('Azienda Copiata');
    await expect(nameInput).toHaveValue('Azienda Copiata');
    
    // Test paste con contenuto lungo
    const longText = 'Azienda con nome molto lungo che potrebbe causare problemi di layout o validazione';
    await nameInput.fill(longText);
    await expect(nameInput).toHaveValue(longText);
  });

  test('Dovrebbe gestire interruzioni utente', async ({ page }) => {
    // Test interruzione durante digitazione
    const nameInput = page.locator('input[placeholder="Inserisci il nome della tua azienda"]');
    
    // Inizia a digitare
    await nameInput.type('Tes', { delay: 100 });
    
    // Interrompi e cambia campo
    await page.fill('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]', 'Via Test');
    
    // Torna al nome e completa
    await nameInput.click();
    await nameInput.type('t Azienda');
    
    await expect(nameInput).toHaveValue('Test Azienda');
  });

  test('Dovrebbe gestire reset form', async ({ page }) => {
    // Compila form
    await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', 'Test Azienda');
    await page.fill('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]', 'Via Test 123');
    await page.fill('input[placeholder="+39 051 1234567"]', '+39 051 1234567');
    
    // Usa prefill (dovrebbe sovrascrivere)
    await page.click('button:has-text("🚀 Compila con dati di esempio")');
    
    // Verifica che i dati siano stati sovrascritti
    await expect(page.locator('input[value="Al Ritrovo SRL"]')).toBeVisible();
    await expect(page.locator('textarea')).toContainText('Via Roma 123, 40121 Bologna BO');
    await expect(page.locator('input[value="+39 051 1234567"]')).toBeVisible();
  });

  test('Dovrebbe gestire navigazione con tab', async ({ page }) => {
    // Test navigazione completa con Tab
    const fields = [
      'input[placeholder="Inserisci il nome della tua azienda"]',
      'select',
      'input[type="date"]',
      'textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]',
      'input[placeholder="+39 051 1234567"]',
      'input[placeholder="info@azienda.it"]',
      'input[placeholder="IT12345678901"]',
      'input[placeholder="RIS-2024-001"]'
    ];
    
    // Testa navigazione con Tab
    for (let i = 0; i < fields.length; i++) {
      await page.keyboard.press('Tab');
      await expect(page.locator(fields[i])).toBeFocused();
    }
  });

  test('Dovrebbe gestire escape e annullamento', async ({ page }) => {
    // Compila parzialmente
    await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', 'Test Parziale');
    
    // Premi Escape
    await page.keyboard.press('Escape');
    
    // Verifica che il valore sia ancora presente
    await expect(page.locator('input[placeholder="Inserisci il nome della tua azienda"]')).toHaveValue('Test Parziale');
  });

  test('Dovrebbe gestire input con caratteri speciali HTML', async ({ page }) => {
    const htmlChars = ['<div>', '</div>', '&lt;', '&gt;', '&amp;', '&quot;'];
    
    for (const char of htmlChars) {
      await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', char);
      await page.fill('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]', 'Via Test');
      
      // Verifica che non ci siano errori di validazione
      await expect(page.locator('text=Il nome dell\'azienda è obbligatorio')).not.toBeVisible();
      await expect(page.locator('text=L\'indirizzo è obbligatorio')).not.toBeVisible();
    }
  });
});

