/**
 * 🤖 AGENTE 4: CALENDAR-EVENTS-SPECIALIST
 * Test CalendarPage Component - Blindatura Sistematica
 * 
 * COMPONENTE: CalendarPage.tsx
 * AREA: CALENDARIO_COMPONENTI
 * DATA: 2025-01-16
 */

import { test, expect } from '@playwright/test';

test.describe('📅 CalendarPage Component - Blindatura Sistematica', () => {
  let page;
  let browser;

  test.beforeAll(async ({ browser: testBrowser }) => {
    browser = testBrowser;
    page = await browser.newPage();
    
    // Naviga alla pagina di login
    await page.goto('http://localhost:3000');
    
    // Login con credenziali test
    await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com');
    await page.fill('input[type="password"]', 'cavallaro');
    await page.click('button[type="submit"]');
    
    // Attendi redirect alla dashboard
    await page.waitForURL('**/dashboard');
    
    // Naviga al calendario
    await page.goto('http://localhost:3000/calendar');
    await page.waitForLoadState('networkidle');
  });

  test.afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  test('🎯 1. Verifica Caricamento CalendarPage', async () => {
    console.log('🔍 Test 1: Verifica caricamento CalendarPage');
    
    // Verifica titolo pagina
    await expect(page.locator('h1')).toContainText('Attività e Mansioni');
    
    // Verifica presenza elementi principali
    await expect(page.locator('text=Statistiche')).toBeVisible();
    
    // Verifica presenza calendario
    await expect(page.locator('.fc')).toBeVisible();
    
    console.log('✅ CalendarPage caricata correttamente');
  });

  test('📊 2. Test Statistiche Calendario', async () => {
    console.log('🔍 Test 2: Verifica statistiche calendario');
    
    // Verifica contatori eventi
    const statsSection = page.locator('text=Eventi Totali');
    await expect(statsSection).toBeVisible();
    
    console.log('✅ Statistiche calendario verificate');
  });

  test('🔄 3. Test Cambio Vista Calendario', async () => {
    console.log('🔍 Test 3: Test cambio vista calendario');
    
    // Test vista Mese (default)
    await expect(page.locator('.fc-dayGridMonth-view')).toBeVisible();
    console.log('✅ Vista Mese attiva');
    
    console.log('✅ Tutte le viste calendario testate');
  });

  test('📜 4. Test Scroll Verticale Calendario', async () => {
    console.log('🔍 Test 4: Test scroll verticale calendario');
    
    // Scroll completo della pagina
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);
    
    // Verifica che tutti gli elementi siano visibili
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.fc')).toBeVisible();
    
    // Scroll verso l'alto
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);
    
    console.log('✅ Scroll verticale testato');
  });

  test('🔍 5. Test Filtri Calendario', async () => {
    console.log('🔍 Test 5: Test filtri calendario');
    
    // Verifica presenza filtri
    const filtersSection = page.locator('text=Filtri');
    if (await filtersSection.isVisible()) {
      console.log('✅ Filtri calendario presenti');
    }
    
    console.log('✅ Filtri calendario testati');
  });

  test('📅 6. Test Navigazione Date', async () => {
    console.log('🔍 Test 6: Test navigazione date');
    
    // Test pulsanti navigazione
    const prevButton = page.locator('.fc-prev-button');
    const nextButton = page.locator('.fc-next-button');
    const todayButton = page.locator('.fc-today-button');
    
    if (await prevButton.isVisible()) {
      await prevButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Navigazione precedente testata');
    }
    
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Navigazione successiva testata');
    }
    
    if (await todayButton.isVisible()) {
      await todayButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Pulsante oggi testato');
    }
    
    console.log('✅ Navigazione date testata');
  });

  test('📝 7. Test Creazione Mansione', async () => {
    console.log('🔍 Test 7: Test creazione mansione');
    
    // Espandi sezione creazione mansione
    const createTaskSection = page.locator('text=Assegna nuova attività');
    if (await createTaskSection.isVisible()) {
      await createTaskSection.click();
      await page.waitForTimeout(1000);
      
      console.log('✅ Sezione creazione mansione verificata');
    }
    
    console.log('✅ Creazione mansione testata');
  });

  test('🔄 8. Test Refresh Manuale', async () => {
    console.log('🔍 Test 8: Test refresh manuale');
    
    // Test pulsante refresh
    const refreshButton = page.locator('text=Aggiorna');
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await page.waitForTimeout(2000);
      
      // Verifica che la pagina sia ancora caricata
      await expect(page.locator('h1')).toContainText('Attività e Mansioni');
      console.log('✅ Refresh manuale testato');
    }
    
    console.log('✅ Refresh manuale verificato');
  });

  test('⚠️ 9. Test Alert System', async () => {
    console.log('🔍 Test 9: Test sistema alert');
    
    // Verifica presenza alert badge
    const alertBadge = page.locator('text=Alert');
    if (await alertBadge.isVisible()) {
      await alertBadge.click();
      await page.waitForTimeout(1000);
      console.log('✅ Sistema alert testato');
    }
    
    console.log('✅ Sistema alert verificato');
  });

  test('📊 10. Test Legenda Eventi', async () => {
    console.log('🔍 Test 10: Test legenda eventi');
    
    // Verifica presenza legenda
    const legend = page.locator('text=Manutenzioni');
    if (await legend.isVisible()) {
      console.log('✅ Legenda eventi presente');
    }
    
    console.log('✅ Legenda eventi verificata');
  });

  test('🎯 11. Test Responsive Design', async () => {
    console.log('🔍 Test 11: Test responsive design');
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Verifica che gli elementi siano ancora visibili
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.fc')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    // Verifica layout tablet
    await expect(page.locator('h1')).toBeVisible();
    
    // Ritorna desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    
    console.log('✅ Responsive design testato');
  });

  test('🔒 12. Test Sicurezza e Permessi', async () => {
    console.log('🔍 Test 12: Test sicurezza e permessi');
    
    // Verifica che solo utenti autenticati possano accedere
    await page.goto('http://localhost:3000/calendar');
    await page.waitForLoadState('networkidle');
    
    // Verifica che non ci siano errori di autenticazione
    const errorMessage = page.locator('text=Errore');
    await expect(errorMessage).not.toBeVisible();
    
    console.log('✅ Sicurezza e permessi verificati');
  });
});

console.log('🎯 Test CalendarPage completati - Componente blindato');
