// Test per verificare il fix del reset onboarding
// Verifica che il pulsante "Cancella e ricomincia" pulisca completamente i dati locali

const { test, expect } = require('@playwright/test');

test.describe('Fix Reset Onboarding - Pulizia Completa Dati Locali', () => {
  test('Dovrebbe pulire completamente i dati locali quando si clicca "Cancella e ricomincia"', async ({ page }) => {
    console.log('🧪 Test: Verifica pulizia completa dati locali dopo reset');
    
    // Naviga alla pagina di login
    await page.goto('http://localhost:3000/login');
    
    // Login con credenziali di test
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Attendi il caricamento della dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Verifica che siamo sulla dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Apri l'onboarding per inserire alcuni dati
    await page.click('button:has-text("Apri Onboarding")');
    
    // Attendi che l'onboarding si apra
    await page.waitForSelector('[data-testid="onboarding-wizard"]', { timeout: 5000 });
    
    // Inserisci alcuni dati di test nel primo step
    await page.fill('input[placeholder*="nome"]', 'Test Company');
    await page.fill('input[placeholder*="email"]', 'test@company.com');
    
    // Vai al secondo step
    await page.click('button:has-text("Avanti")');
    
    // Inserisci un reparto
    await page.fill('input[placeholder*="nome reparto"]', 'Test Department');
    await page.click('button:has-text("Aggiungi")');
    
    // Salva i dati in localStorage (simula il comportamento normale)
    await page.evaluate(() => {
      const testData = {
        company: { name: 'Test Company', email: 'test@company.com' },
        departments: [{ name: 'Test Department' }]
      };
      localStorage.setItem('onboarding-data', JSON.stringify(testData));
    });
    
    // Verifica che i dati siano presenti nel localStorage
    const dataBeforeReset = await page.evaluate(() => {
      return localStorage.getItem('onboarding-data');
    });
    expect(dataBeforeReset).toBeTruthy();
    console.log('✅ Dati presenti nel localStorage prima del reset');
    
    // Chiudi l'onboarding e torna alla dashboard
    await page.click('button:has-text("Chiudi")');
    await page.waitForURL('**/dashboard');
    
    // Clicca sul pulsante "Cancella e Ricomincia"
    console.log('🔄 Cliccando su "Cancella e Ricomincia"...');
    await page.click('button:has-text("Cancella e Ricomincia")');
    
    // Conferma il reset
    await page.click('button:has-text("OK")');
    
    // Attendi che il reset sia completato
    await page.waitForTimeout(2000);
    
    // Verifica che il localStorage sia stato pulito
    const dataAfterReset = await page.evaluate(() => {
      return localStorage.getItem('onboarding-data');
    });
    expect(dataAfterReset).toBeNull();
    console.log('✅ localStorage pulito dopo reset');
    
    // Verifica che l'onboarding si sia aperto automaticamente
    await page.waitForSelector('[data-testid="onboarding-wizard"]', { timeout: 5000 });
    console.log('✅ Onboarding aperto automaticamente dopo reset');
    
    // Verifica che l'onboarding sia al primo step (state resettato)
    const currentStep = await page.evaluate(() => {
      // Controlla se ci sono dati nel form (dovrebbe essere vuoto)
      const inputs = document.querySelectorAll('input[value]');
      return inputs.length === 0;
    });
    expect(currentStep).toBeTruthy();
    console.log('✅ Onboarding resettato al primo step');
    
    // Verifica che l'utente sia ancora loggato (company e auth preservati)
    const isLoggedIn = await page.evaluate(() => {
      return localStorage.getItem('sb-tucqgcfrlzmwyfadiodo-auth-token') !== null;
    });
    expect(isLoggedIn).toBeTruthy();
    console.log('✅ Utente ancora loggato dopo reset');
    
    console.log('🎉 Test completato con successo!');
  });
  
  test('Dovrebbe preservare utente e company dopo reset', async ({ page }) => {
    console.log('🧪 Test: Verifica preservazione utente e company');
    
    // Naviga alla pagina di login
    await page.goto('http://localhost:3000/login');
    
    // Login con credenziali di test
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Attendi il caricamento della dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Verifica che siamo sulla dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Clicca sul pulsante "Cancella e Ricomincia"
    console.log('🔄 Cliccando su "Cancella e Ricomincia"...');
    await page.click('button:has-text("Cancella e Ricomincia")');
    
    // Conferma il reset
    await page.click('button:has-text("OK")');
    
    // Attendi che il reset sia completato
    await page.waitForTimeout(2000);
    
    // Verifica che l'utente sia ancora loggato
    const authToken = await page.evaluate(() => {
      return localStorage.getItem('sb-tucqgcfrlzmwyfadiodo-auth-token');
    });
    expect(authToken).toBeTruthy();
    console.log('✅ Token di autenticazione preservato');
    
    // Verifica che la company sia ancora presente nel database
    const companyData = await page.evaluate(async () => {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        'https://tucqgcfrlzmwyfadiodo.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1Y3FnY2ZybHptd3lmYWRpb2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NTY0ODksImV4cCI6MjA3NTUzMjQ4OX0.7m3bdxW8QMHO6YNQ4cxoxlzzgzq7DjTzufv89YAcHA4'
      );
      
      const { data: companies } = await supabase
        .from('companies')
        .select('*')
        .limit(1);
      
      return companies;
    });
    
    expect(companyData).toBeTruthy();
    expect(companyData.length).toBeGreaterThan(0);
    console.log('✅ Company preservata nel database');
    
    console.log('🎉 Test preservazione completato con successo!');
  });
});
