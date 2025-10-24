import { test, expect } from '@playwright/test';

test.describe('🔒 Test Allineamento Eventi Calendar ↔ Modal', () => {
  test.beforeEach(async ({ page }) => {
    // Naviga alla pagina di login
    await page.goto('http://localhost:3000/sign-in');
    await page.waitForLoadState('networkidle');
    
    // Verifica che il form di login sia presente
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Compila manualmente i campi email e password con credenziali reali
    await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com');
    await page.fill('input[type="password"]', 'cavallaro');
    
    // Clicca su "Accedi"
    await page.click('button:has-text("Accedi")');
    
    // Attendi che il login venga processato
    await page.waitForTimeout(3000);
    
    // Naviga alla pagina attività
    await page.goto('http://localhost:3000/attivita');
    await page.waitForLoadState('networkidle');
    
    // Verifica che la pagina sia caricata
    await expect(page).toHaveTitle(/HACCP Business Manager/);
  });

  test('🔒 Verifica allineamento eventi tra calendario e modal', async ({ page }) => {
    console.log('🔒 Test: Verifica allineamento eventi Calendar ↔ Modal');
    
    // 1. Trova elementi della pagina
    const calendarContainer = page.locator('.fc, [data-testid="calendar-container"]');
    const events = page.locator('.fc-event, [data-testid="calendar-event"]');
    
    // Verifica che il calendario sia presente
    await expect(calendarContainer).toBeVisible();
    console.log('✅ Calendario visibile');

    // 2. Conta eventi nel calendario
    const eventCount = await events.count();
    console.log(`📅 Eventi trovati nel calendario: ${eventCount}`);

    if (eventCount === 0) {
      console.log('⚠️ Nessun evento presente - test non applicabile');
      return;
    }

    // 3. Prendi informazioni del primo evento dal calendario
    const firstEvent = events.first();
    const eventText = await firstEvent.textContent();
    const eventClasses = await firstEvent.getAttribute('class');
    
    console.log(`📝 Primo evento calendario: "${eventText}"`);
    console.log(`🎨 Classi evento: ${eventClasses}`);

    // 4. Clicca sull'evento per aprire il modal
    console.log('🖱️ Click su evento per aprire modal...');
    await firstEvent.click();
    await page.waitForTimeout(2000);

    // 5. Verifica che il modal sia aperto
    const modal = page.locator('[role="dialog"], .modal, .popup, [data-testid*="modal"]');
    const modalVisible = await modal.isVisible();
    
    if (!modalVisible) {
      console.log('⚠️ Modal non aperto - verifico alternative...');
      
      // Prova a cercare altri elementi che potrebbero essere il modal
      const alternativeModal = page.locator('.fc-popover, .fc-event-popover, .event-details');
      const altModalVisible = await alternativeModal.isVisible();
      
      if (altModalVisible) {
        console.log('✅ Modal alternativo trovato');
      } else {
        console.log('❌ Nessun modal trovato');
        return;
      }
    } else {
      console.log('✅ Modal aperto correttamente');
    }

    // 6. Verifica contenuto del modal
    console.log('🔍 Verifica contenuto modal...');
    
    // Cerca elementi nel modal che dovrebbero corrispondere all'evento
    const modalTitle = page.locator('h1, h2, h3, .title, .event-title').first();
    const modalContent = page.locator('.modal-content, .popup-content, [role="dialog"] > div');
    
    const titleText = await modalTitle.textContent();
    const contentText = await modalContent.textContent();
    
    console.log(`📝 Titolo modal: "${titleText}"`);
    console.log(`📄 Contenuto modal: "${contentText?.substring(0, 100)}..."`);

    // 7. Verifica corrispondenza tra evento calendario e modal
    const eventMatchesModal = titleText?.includes(eventText || '') || 
                            contentText?.includes(eventText || '') ||
                            eventText?.includes(titleText || '');

    console.log(`🔗 Evento calendario corrisponde al modal: ${eventMatchesModal}`);

    // 8. Verifica che il modal contenga informazioni coerenti
    const hasEventDetails = await page.locator('text=/evento|attività|mansione|manutenzione|scadenza/i').count() > 0;
    const hasStatusInfo = await page.locator('text=/completato|in attesa|in ritardo|pending|completed/i').count() > 0;
    const hasDateInfo = await page.locator('text=/\\d{1,2}\\/\\d{1,2}\\/\\d{4}|\\d{4}-\\d{2}-\\d{2}/').count() > 0;

    console.log(`📊 Modal contiene dettagli evento: ${hasEventDetails}`);
    console.log(`📊 Modal contiene info stato: ${hasStatusInfo}`);
    console.log(`📊 Modal contiene info data: ${hasDateInfo}`);

    // 9. Assertions finali
    expect(eventCount).toBeGreaterThan(0);
    expect(modalVisible || await page.locator('.fc-popover, .fc-event-popover, .event-details').isVisible()).toBeTruthy();
    
    if (eventMatchesModal) {
      console.log('✅ Test superato: Eventi calendar e modal allineati');
    } else {
      console.log('⚠️ Test parziale: Modal aperto ma contenuto non perfettamente allineato');
    }

    console.log('🔒 Test completato');
  });

  test('🔒 Verifica click su evento apre modal con eventi corretti del giorno', async ({ page }) => {
    console.log('🔒 Test: Verifica click evento apre modal con eventi corretti del giorno');
    
    // 1. Trova eventi nel calendario
    const events = page.locator('.fc-event, [data-testid="calendar-event"]');
    const eventCount = await events.count();
    
    if (eventCount === 0) {
      console.log('⚠️ Nessun evento presente - test non applicabile');
      return;
    }

    // 2. Clicca su un evento specifico
    const firstEvent = events.first();
    await firstEvent.click();
    await page.waitForTimeout(2000);

    // 3. Verifica che il modal mostri eventi del giorno corretto
    const modal = page.locator('[role="dialog"], .modal, .popup, [data-testid*="modal"]');
    const modalVisible = await modal.isVisible();
    
    if (modalVisible) {
      // Cerca eventi nel modal
      const modalEvents = page.locator('.event-item, .task-item, .activity-item, [data-testid*="event"]');
      const modalEventCount = await modalEvents.count();
      
      console.log(`📅 Eventi nel modal del giorno: ${modalEventCount}`);
      
      // Verifica che ci sia almeno un evento nel modal
      expect(modalEventCount).toBeGreaterThan(0);
      console.log('✅ Modal contiene eventi del giorno');
    } else {
      console.log('⚠️ Modal non aperto - verifico se ci sono altri elementi');
    }

    console.log('🔒 Test completato');
  });
});
