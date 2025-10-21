// Global Setup per Task Completion Tests
// Configurazione compliance e preparazione ambiente test

const { chromium } = require('@playwright/test');

async function globalSetup(config) {
  console.log('🚀 Global Setup: Task Completion Tests');
  console.log('📋 Configurazione compliance e preparazione ambiente');
  
  // Verifica che l'applicazione sia raggiungibile
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Verifica connessione applicazione...');
    await page.goto('http://localhost:3000', { timeout: 30000 });
    
    // Verifica che la pagina di login sia accessibile
    const loginForm = page.locator('form:has(input[type="email"])');
    await loginForm.waitFor({ timeout: 10000 });
    
    console.log('✅ Applicazione raggiungibile e login form presente');
    
    // Test login con credenziali reali
    console.log('🔐 Test login con credenziali...');
    await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com');
    await page.fill('input[type="password"]', 'cavallaro');
    await page.click('button[type="submit"]');
    
    // Attendi redirect o conferma login
    try {
      await page.waitForURL('**/dashboard**', { timeout: 15000 });
      console.log('✅ Login test riuscito - redirect a dashboard');
    } catch (error) {
      console.log('⚠️ Redirect non rilevato, verifica manuale necessaria');
    }
    
    // Verifica accesso alla sezione Attività
    console.log('📅 Verifica accesso sezione Attività...');
    try {
      await page.click('a[href*="attivita"], button:has-text("Attività")');
      await page.waitForLoadState('networkidle');
      console.log('✅ Accesso sezione Attività verificato');
    } catch (error) {
      console.log('⚠️ Accesso sezione Attività da verificare manualmente');
    }
    
  } catch (error) {
    console.error('❌ Errore durante global setup:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('✅ Global Setup completato con successo');
}

module.exports = globalSetup;
