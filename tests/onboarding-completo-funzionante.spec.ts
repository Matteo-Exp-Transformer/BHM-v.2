import { test, expect } from '@playwright/test';

/**
 * 🧪 TEST COMPLETO ONBOARDING BHM-v.2
 * 
 * Test end-to-end completo del flusso onboarding
 * Simula un utente che completa tutti i 7 step
 * 
 * REQUISITI:
 * - App deve essere in esecuzione su porta 3000
 * - Utente non autenticato (companyId = null)
 * - Dati di test realistici per ogni step
 */

test.describe('Onboarding Completo - Test E2E', () => {
  
  test('Completa tutto il flusso onboarding da Step 0 a Step 6', async ({ page }) => {
    
    console.log('🚀 Inizio test onboarding completo...');
    
    // 1. Naviga alla pagina onboarding
    await page.goto('/onboarding');
    
    // Verifica caricamento pagina
    await expect(page.locator('h1')).toContainText('Configurazione Iniziale HACCP');
    console.log('✅ Pagina onboarding caricata');
    
    // Screenshot iniziale
    await page.screenshot({ path: 'test-onboarding-step-0-iniziale.png' });
    
    // 2. STEP 0: Test pulsante Precompila
    const prefillButton = page.locator('button:has-text("Precompila")');
    await expect(prefillButton).toBeVisible();
    
    // Clicca Precompila per caricare dati di esempio
    await prefillButton.click();
    await page.waitForTimeout(2000); // Attendi caricamento dati
    
    console.log('✅ Dati precompilati caricati');
    await page.screenshot({ path: 'test-onboarding-dopo-precompila.png' });
    
    // 3. STEP 1: Informazioni Business
    await page.fill('input[name="businessName"]', 'Ristorante Test Demo');
    await page.fill('input[name="businessType"]', 'Ristorante');
    await page.fill('input[name="address"]', 'Via Roma 123, Milano');
    await page.fill('input[name="phone"]', '+39 02 1234567');
    await page.fill('input[name="email"]', 'test@ristorante-demo.com');
    
    console.log('✅ Step 1 - Informazioni business completate');
    
    // Avanza al prossimo step
    const nextButton = page.locator('button:has-text("Avanti")');
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'test-onboarding-step-1-completato.png' });
    
    // 4. STEP 2: Reparti
    // Aggiungi alcuni reparti
    await page.fill('input[placeholder*="Nome reparto"]', 'Cucina');
    await page.locator('button:has-text("Aggiungi Reparto")').click();
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder*="Nome reparto"]', 'Sala');
    await page.locator('button:has-text("Aggiungi Reparto")').click();
    await page.waitForTimeout(500);
    
    console.log('✅ Step 2 - Reparti completati');
    
    // Avanza al prossimo step
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'test-onboarding-step-2-completato.png' });
    
    // 5. STEP 3: Personale
    // Aggiungi alcuni membri del personale
    await page.fill('input[placeholder*="Nome"]', 'Mario Rossi');
    await page.selectOption('select[name="role"]', 'Chef');
    await page.locator('button:has-text("Aggiungi Persona")').click();
    await page.waitForTimeout(500);
    
    await page.fill('input[placeholder*="Nome"]', 'Giulia Bianchi');
    await page.selectOption('select[name="role"]', 'Cameriere');
    await page.locator('button:has-text("Aggiungi Persona")').click();
    await page.waitForTimeout(500);
    
    console.log('✅ Step 3 - Personale completato');
    
    // Avanza al prossimo step
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'test-onboarding-step-3-completato.png' });
    
    // 6. STEP 4: Conservazione
    await page.fill('input[name="temperature"]', '4');
    await page.fill('input[name="humidity"]', '60');
    await page.check('input[name="hasColdStorage"]');
    
    console.log('✅ Step 4 - Conservazione completato');
    
    // Avanza al prossimo step
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'test-onboarding-step-4-completato.png' });
    
    // 7. STEP 5: Attività e Task
    await page.fill('input[name="taskName"]', 'Pulizia giornaliera');
    await page.selectOption('select[name="frequency"]', 'daily');
    await page.locator('button:has-text("Aggiungi Task")').click();
    await page.waitForTimeout(500);
    
    await page.fill('input[name="taskName"]', 'Controllo temperature');
    await page.selectOption('select[name="frequency"]', 'weekly');
    await page.locator('button:has-text("Aggiungi Task")').click();
    await page.waitForTimeout(500);
    
    console.log('✅ Step 5 - Attività completato');
    
    // Avanza al prossimo step
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'test-onboarding-step-5-completato.png' });
    
    // 8. STEP 6: Inventario
    await page.fill('input[name="itemName"]', 'Pomodori');
    await page.fill('input[name="quantity"]', '50');
    await page.selectOption('select[name="unit"]', 'kg');
    await page.locator('button:has-text("Aggiungi Prodotto")').click();
    await page.waitForTimeout(500);
    
    await page.fill('input[name="itemName"]', 'Pasta');
    await page.fill('input[name="quantity"]', '20');
    await page.selectOption('select[name="unit"]', 'kg');
    await page.locator('button:has-text("Aggiungi Prodotto")').click();
    await page.waitForTimeout(500);
    
    console.log('✅ Step 6 - Inventario completato');
    
    // Avanza al prossimo step (ultimo)
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'test-onboarding-step-6-completato.png' });
    
    // 9. STEP 7: Calendario e Completamento
    // Verifica che siamo nell'ultimo step
    await expect(page.locator('h2')).toContainText('Calendario');
    
    // Verifica presenza pulsante di completamento
    const completeButton = page.locator('button:has-text("Completa Configurazione")');
    await expect(completeButton).toBeVisible();
    
    console.log('✅ Step 7 - Calendario raggiunto');
    
    // 10. COMPLETAMENTO ONBOARDING
    console.log('🎯 Inizio completamento onboarding...');
    
    // Clicca il pulsante di completamento
    await completeButton.click();
    
    // Attendi il redirect al dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    console.log('✅ Redirect al dashboard completato');
    
    // Verifica che siamo nel dashboard
    await expect(page.url()).toContain('/dashboard');
    
    // Screenshot finale
    await page.screenshot({ path: 'test-onboarding-completato-finale.png' });
    
    // 11. VERIFICHE FINALI
    console.log('🔍 Verifica risultati finali...');
    
    // Verifica localStorage (simulazione)
    const onboardingCompleted = await page.evaluate(() => {
      return localStorage.getItem('onboarding-completed');
    });
    
    const onboardingCompletedAt = await page.evaluate(() => {
      return localStorage.getItem('onboarding-completed-at');
    });
    
    console.log('✅ Onboarding completed flag:', onboardingCompleted);
    console.log('✅ Onboarding completed at:', onboardingCompletedAt);
    
    // Verifica che la pagina dashboard sia caricata correttamente
    await expect(page.locator('body')).toBeVisible();
    
    console.log('🎉 TEST ONBOARDING COMPLETO TERMINATO CON SUCCESSO!');
    console.log('📸 Screenshot salvati per ogni step del processo');
    
  });
  
});
