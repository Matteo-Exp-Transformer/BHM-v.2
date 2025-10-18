// Production/Test/Onboarding/BusinessInfoStep/test-funzionale.spec.js
import { test, expect } from '@playwright/test';

test.describe('BusinessInfoStep - Test Funzionali', () => {

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
      await page.waitForTimeout(5000);
      
      console.log('✅ Login completato');
    }
    
    // Clicca sul pulsante "Onboarding" per aprire l'onboarding
    await page.click('button:has-text("Onboarding")');
    
    // Attendi caricamento componente
    await page.waitForSelector('h2:has-text("Informazioni Aziendali")');
  });

  test('Dovrebbe renderizzare correttamente tutti i campi', async ({ page }) => {
    console.log('🔍 Test: Verifica rendering campi BusinessInfoStep');
    
    // Pausa per vedere il componente
    await page.waitForTimeout(2000);
    
    // Verifica header
    await expect(page.locator('h2:has-text("Informazioni Aziendali")')).toBeVisible();
    
    // Verifica campi obbligatori
    await expect(page.locator('input[placeholder="Inserisci il nome della tua azienda"]')).toBeVisible();
    await expect(page.locator('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]')).toBeVisible();
    
    // Verifica campi opzionali
    await expect(page.locator('select')).toBeVisible(); // Tipo di attività
    await expect(page.locator('input[type="date"]')).toBeVisible(); // Data di apertura
    await expect(page.locator('input[placeholder="+39 051 1234567"]')).toBeVisible(); // Telefono
    await expect(page.locator('input[placeholder="info@azienda.it"]')).toBeVisible(); // Email
    await expect(page.locator('input[placeholder="IT12345678901"]')).toBeVisible(); // Partita IVA
    await expect(page.locator('input[placeholder="RIS-2024-001"]')).toBeVisible(); // Numero Licenza
    
    // Verifica pulsante prefill
    await expect(page.locator('button:has-text("🚀 Compila con dati di esempio")')).toBeVisible();
  });

  test('Dovrebbe gestire il pulsante prefill correttamente', async ({ page }) => {
    console.log('🚀 Test: Verifica pulsante prefill BusinessInfoStep');
    
    // Pausa per vedere il componente
    await page.waitForTimeout(2000);
    
    // Click pulsante prefill
    console.log('🚀 Cliccando pulsante prefill...');
    await page.click('button:has-text("🚀 Compila con dati di esempio")');
    
    // Pausa per vedere il risultato
    await page.waitForTimeout(3000);
    
    // Verifica che i campi siano stati compilati
    await expect(page.locator('input[value="Al Ritrovo SRL"]')).toBeVisible();
    await expect(page.locator('textarea')).toContainText('Via Roma 123, 40121 Bologna BO');
    await expect(page.locator('input[value="+39 051 1234567"]')).toBeVisible();
    await expect(page.locator('input[value="info@alritrovo.it"]')).toBeVisible();
    await expect(page.locator('input[value="IT01234567890"]')).toBeVisible();
    await expect(page.locator('select')).toHaveValue('ristorante');
    await expect(page.locator('input[value="2020-01-15"]')).toBeVisible();
    await expect(page.locator('input[value="RIS-2020-001"]')).toBeVisible();
  });

  test('Dovrebbe gestire input utente correttamente', async ({ page }) => {
    console.log('✏️ Test: Verifica input utente BusinessInfoStep');
    
    // Pausa per vedere il componente
    await page.waitForTimeout(3000);
    
    // Compila campo nome
    console.log('📝 Compilando nome azienda...');
    await page.fill('input[placeholder="Inserisci il nome della tua azienda"]', 'Test Azienda');
    await page.waitForTimeout(1500);
    await expect(page.locator('input[placeholder="Inserisci il nome della tua azienda"]')).toHaveValue('Test Azienda');
    
    // Compila campo indirizzo
    console.log('🏠 Compilando indirizzo...');
    await page.fill('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]', 'Via Test 123, Milano');
    await page.waitForTimeout(1500);
    await expect(page.locator('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]')).toContainText('Via Test 123, Milano');
    
    // Seleziona tipo di attività
    console.log('🍕 Selezionando tipo di attività...');
    await page.selectOption('select', 'pizzeria');
    await page.waitForTimeout(1000);
    await expect(page.locator('select')).toHaveValue('pizzeria');
    
    // Compila data
    console.log('📅 Compilando data...');
    await page.fill('input[type="date"]', '2023-01-01');
    await page.waitForTimeout(1000);
    await expect(page.locator('input[type="date"]')).toHaveValue('2023-01-01');
  });

  test('Dovrebbe mostrare informazioni HACCP', async ({ page }) => {
    // Verifica sezione HACCP
    await expect(page.locator('text=Conformità HACCP')).toBeVisible();
    await expect(page.locator('text=Le informazioni inserite verranno utilizzate per configurare il sistema HACCP')).toBeVisible();
  });

  test('Dovrebbe avere accessibilità corretta', async ({ page }) => {
    // Verifica label associati agli input
    const nameInput = page.locator('input[placeholder="Inserisci il nome della tua azienda"]');
    const addressTextarea = page.locator('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]');
    
    // Verifica che i campi abbiano label appropriati
    await expect(page.locator('label:has-text("Nome Azienda *")')).toBeVisible();
    await expect(page.locator('label:has-text("Indirizzo *")')).toBeVisible();
    
    // Verifica keyboard navigation
    await nameInput.press('Tab');
    await expect(addressTextarea).toBeFocused();
  });

  test('Dovrebbe gestire cambio focus tra campi', async ({ page }) => {
    const nameInput = page.locator('input[placeholder="Inserisci il nome della tua azienda"]');
    const addressTextarea = page.locator('textarea[placeholder="Inserisci l\'indirizzo completo dell\'azienda"]');
    const phoneInput = page.locator('input[placeholder="+39 051 1234567"]');
    
    // Focus su nome
    await nameInput.click();
    await expect(nameInput).toBeFocused();
    
    // Tab per passare al campo successivo
    await nameInput.press('Tab');
    await expect(addressTextarea).toBeFocused();
    
    // Tab per passare al telefono
    await addressTextarea.press('Tab');
    await expect(phoneInput).toBeFocused();
  });
});

