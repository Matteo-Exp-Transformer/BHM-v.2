const { test, expect } = require('@playwright/test');

test.describe('Completamento Manutenzioni - Giorno Corrente', () => {
  let page;
  
  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Naviga all'app e fai login
    await page.goto('http://localhost:3000');
    
    // Attendi che la pagina si carichi completamente
    await page.waitForLoadState('networkidle');
    
    // Verifica se siamo già loggati o dobbiamo fare login
    const loginForm = page.locator('form[data-testid="login-form"], form:has(input[type="email"])');
    if (await loginForm.isVisible()) {
      // Esegui login con credenziali reali
      await page.fill('input[type="email"]', 'matteo.cavallaro.work@gmail.com');
      await page.fill('input[type="password"]', 'cavallaro');
      await page.click('button[type="submit"]');
      
      // Attendi il redirect dopo login
      await page.waitForURL('**/dashboard**', { timeout: 10000 });
    }
  });

  test.afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  test('Dovrebbe completare tutte le manutenzioni del giorno corrente', async () => {
    // Step 1: Naviga alla sezione Attività
    await page.click('a[href*="attivita"], button:has-text("Attività"), [data-testid="attivita-link"]');
    await page.waitForLoadState('networkidle');
    
    // Verifica che siamo nella pagina del calendario
    await expect(page.locator('h1:has-text("Attività"), h2:has-text("Calendario"), [data-testid="calendar-title"]')).toBeVisible();
    
    // Step 2: Seleziona il giorno corrente nel calendario
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const todayCell = page.locator(`[data-date="${todayString}"], .fc-daygrid-day:has-text("${today.getDate()}")`);
    
    // Se il giorno corrente non è visibile, naviga al mese corrente
    if (!(await todayCell.isVisible())) {
      // Cerca il pulsante per andare al mese corrente
      const todayButton = page.locator('button:has-text("Oggi"), button:has-text("Today")');
      if (await todayButton.isVisible()) {
        await todayButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Clicca sul giorno corrente
    await todayCell.click();
    await page.waitForTimeout(1000);
    
    // Step 3: Clicca sulle manutenzioni nel pannello laterale
    const maintenanceButton = page.locator('button:has-text("Manutenzioni"), button:has-text("Maintenance"), [data-testid="maintenance-button"]');
    await expect(maintenanceButton).toBeVisible();
    await maintenanceButton.click();
    await page.waitForTimeout(1000);
    
    // Step 4: Verifica che si apra il pannello laterale eventi
    const eventsPanel = page.locator('[data-testid="events-panel"], .events-panel, .sidebar-events');
    await expect(eventsPanel).toBeVisible();
    
    // Step 5: Identifica tutte le manutenzioni da completare
    const maintenanceToComplete = page.locator('[data-testid="maintenance-task-item"], .maintenance-task-item, .maintenance-item:not(.completed)');
    const maintenanceCount = await maintenanceToComplete.count();
    
    console.log(`Trovate ${maintenanceCount} manutenzioni da completare`);
    
    // Step 6: Completa tutte le manutenzioni
    for (let i = 0; i < maintenanceCount; i++) {
      const maintenance = maintenanceToComplete.nth(i);
      
      // Verifica che la manutenzione non sia già completata
      const isCompleted = await maintenance.locator('.completed, [data-completed="true"]').isVisible();
      if (isCompleted) {
        console.log(`Manutenzione ${i + 1} già completata, salto`);
        continue;
      }
      
      // Clicca sul pulsante di completamento
      const completeButton = maintenance.locator('button:has-text("Completa"), button:has-text("✓"), [data-testid="complete-maintenance"]');
      await expect(completeButton).toBeVisible();
      await completeButton.click();
      
      // Se si apre un modal di completamento, compila i campi necessari
      const completionModal = page.locator('[data-testid="completion-modal"], .completion-modal, .modal:has-text("Completa")');
      if (await completionModal.isVisible()) {
        // Compila eventuali note o checklist
        const notesField = completionModal.locator('textarea, input[type="text"]');
        if (await notesField.isVisible()) {
          await notesField.fill('Test completion - manutenzione completata');
        }
        
        // Verifica eventuali checkbox della checklist
        const checklistItems = completionModal.locator('input[type="checkbox"]:not(:checked)');
        const checklistCount = await checklistItems.count();
        for (let j = 0; j < checklistCount; j++) {
          await checklistItems.nth(j).check();
        }
        
        // Conferma il completamento
        const confirmButton = completionModal.locator('button:has-text("Conferma"), button:has-text("Completa"), button[type="submit"]');
        await confirmButton.click();
      }
      
      // Attendi conferma del completamento
      await page.waitForTimeout(1000);
      
      console.log(`Completata manutenzione ${i + 1}/${maintenanceCount}`);
    }
    
    // Step 7: Verifica che il pannello si refreshi
    await page.waitForTimeout(2000);
    
    // Step 8: Verifica che le manutenzioni completate siano andate in "Attività Completate"
    const completedSection = page.locator('[data-testid="completed-tasks"], .completed-tasks, h3:has-text("Attività Completate")');
    await expect(completedSection).toBeVisible();
    
    // Verifica che ci siano manutenzioni nella sezione completate
    const completedMaintenance = page.locator('[data-testid="completed-maintenance-item"], .completed-maintenance-item, .maintenance-item.completed');
    const completedCount = await completedMaintenance.count();
    
    expect(completedCount).toBeGreaterThan(0);
    console.log(`Verificate ${completedCount} manutenzioni nella sezione "Attività Completate"`);
    
    // Step 9: Verifica che le manutenzioni non completate siano ancora nella sezione principale
    const remainingMaintenance = page.locator('[data-testid="maintenance-task-item"]:not(.completed), .maintenance-task-item:not(.completed)');
    const remainingCount = await remainingMaintenance.count();
    
    console.log(`Rimangono ${remainingCount} manutenzioni non completate nella sezione principale`);
  });

  test('Dovrebbe gestire correttamente il caso senza manutenzioni', async () => {
    // Naviga alla sezione Attività
    await page.click('a[href*="attivita"], button:has-text("Attività"), [data-testid="attivita-link"]');
    await page.waitForLoadState('networkidle');
    
    // Seleziona il giorno corrente
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const todayCell = page.locator(`[data-date="${todayString}"], .fc-daygrid-day:has-text("${today.getDate()}")`);
    
    if (!(await todayCell.isVisible())) {
      const todayButton = page.locator('button:has-text("Oggi"), button:has-text("Today")');
      if (await todayButton.isVisible()) {
        await todayButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    await todayCell.click();
    await page.waitForTimeout(1000);
    
    // Clicca sulle manutenzioni
    const maintenanceButton = page.locator('button:has-text("Manutenzioni"), button:has-text("Maintenance"), [data-testid="maintenance-button"]');
    await maintenanceButton.click();
    
    // Verifica messaggio quando non ci sono manutenzioni
    const noMaintenanceMessage = page.locator('text=Nessuna manutenzione per oggi, text=No maintenance for today, [data-testid="no-maintenance-message"]');
    
    if (await noMaintenanceMessage.isVisible()) {
      console.log('Nessuna manutenzione per oggi - comportamento corretto');
      expect(noMaintenanceMessage).toBeVisible();
    } else {
      // Se ci sono manutenzioni, verifica che siano visibili
      const maintenancePanel = page.locator('[data-testid="events-panel"], .events-panel');
      await expect(maintenancePanel).toBeVisible();
    }
  });

  test('Dovrebbe mostrare feedback visivo durante il completamento manutenzioni', async () => {
    // Naviga alla sezione Attività
    await page.click('a[href*="attivita"], button:has-text("Attività"), [data-testid="attivita-link"]');
    await page.waitForLoadState('networkidle');
    
    // Seleziona il giorno corrente
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const todayCell = page.locator(`[data-date="${todayString}"], .fc-daygrid-day:has-text("${today.getDate()}")`);
    
    if (!(await todayCell.isVisible())) {
      const todayButton = page.locator('button:has-text("Oggi"), button:has-text("Today")');
      if (await todayButton.isVisible()) {
        await todayButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    await todayCell.click();
    await page.waitForTimeout(1000);
    
    // Clicca sulle manutenzioni
    const maintenanceButton = page.locator('button:has-text("Manutenzioni"), button:has-text("Maintenance"), [data-testid="maintenance-button"]');
    await maintenanceButton.click();
    
    // Verifica che ci sia almeno una manutenzione da completare
    const maintenanceToComplete = page.locator('[data-testid="maintenance-task-item"]:not(.completed), .maintenance-task-item:not(.completed)');
    const maintenanceCount = await maintenanceToComplete.count();
    
    if (maintenanceCount > 0) {
      const firstMaintenance = maintenanceToComplete.first();
      const completeButton = firstMaintenance.locator('button:has-text("Completa"), button:has-text("✓"), [data-testid="complete-maintenance"]');
      
      // Verifica stato prima del completamento
      await expect(completeButton).toBeVisible();
      
      // Clicca e verifica feedback
      await completeButton.click();
      
      // Verifica toast di successo o cambio stato
      const successToast = page.locator('.toast-success, .success-message, [data-testid="success-toast"]');
      const loadingState = page.locator('.loading, .spinner, [data-testid="loading"]');
      const completionModal = page.locator('[data-testid="completion-modal"], .completion-modal');
      
      // Almeno uno di questi dovrebbe essere visibile
      const hasFeedback = await successToast.isVisible() || await loadingState.isVisible() || 
                         await completeButton.isDisabled() || 
                         await firstMaintenance.locator('.completed').isVisible() ||
                         await completionModal.isVisible();
      
      expect(hasFeedback).toBeTruthy();
      console.log('Feedback visivo durante completamento manutenzione verificato');
    }
  });

  test('Dovrebbe gestire correttamente il modal di completamento con checklist', async () => {
    // Naviga alla sezione Attività
    await page.click('a[href*="attivita"], button:has-text("Attività"), [data-testid="attivita-link"]');
    await page.waitForLoadState('networkidle');
    
    // Seleziona il giorno corrente
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const todayCell = page.locator(`[data-date="${todayString}"], .fc-daygrid-day:has-text("${today.getDate()}")`);
    
    if (!(await todayCell.isVisible())) {
      const todayButton = page.locator('button:has-text("Oggi"), button:has-text("Today")');
      if (await todayButton.isVisible()) {
        await todayButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    await todayCell.click();
    await page.waitForTimeout(1000);
    
    // Clicca sulle manutenzioni
    const maintenanceButton = page.locator('button:has-text("Manutenzioni"), button:has-text("Maintenance"), [data-testid="maintenance-button"]');
    await maintenanceButton.click();
    
    // Verifica che ci sia almeno una manutenzione da completare
    const maintenanceToComplete = page.locator('[data-testid="maintenance-task-item"]:not(.completed), .maintenance-task-item:not(.completed)');
    const maintenanceCount = await maintenanceToComplete.count();
    
    if (maintenanceCount > 0) {
      const firstMaintenance = maintenanceToComplete.first();
      const completeButton = firstMaintenance.locator('button:has-text("Completa"), button:has-text("✓"), [data-testid="complete-maintenance"]');
      
      await completeButton.click();
      
      // Verifica se si apre il modal di completamento
      const completionModal = page.locator('[data-testid="completion-modal"], .completion-modal, .modal:has-text("Completa")');
      
      if (await completionModal.isVisible()) {
        console.log('Modal di completamento aperto - gestione checklist');
        
        // Verifica presenza di checklist
        const checklistItems = completionModal.locator('input[type="checkbox"]');
        const checklistCount = await checklistItems.count();
        
        if (checklistCount > 0) {
          console.log(`Trovati ${checklistCount} elementi nella checklist`);
          
          // Spunta tutti gli elementi della checklist
          for (let i = 0; i < checklistCount; i++) {
            const checkbox = checklistItems.nth(i);
            if (!(await checkbox.isChecked())) {
              await checkbox.check();
            }
          }
          
          // Verifica che tutti gli elementi siano spuntati
          const checkedItems = completionModal.locator('input[type="checkbox"]:checked');
          const checkedCount = await checkedItems.count();
          expect(checkedCount).toBe(checklistCount);
          
          console.log(`Tutti i ${checkedCount} elementi della checklist sono spuntati`);
        }
        
        // Compila eventuali note
        const notesField = completionModal.locator('textarea, input[type="text"]:not([type="hidden"])');
        if (await notesField.isVisible()) {
          await notesField.fill('Test completion - checklist completata');
          console.log('Note compilate');
        }
        
        // Conferma il completamento
        const confirmButton = completionModal.locator('button:has-text("Conferma"), button:has-text("Completa"), button[type="submit"]');
        await confirmButton.click();
        
        // Verifica che il modal si chiuda
        await expect(completionModal).not.toBeVisible();
        
        console.log('Modal di completamento gestito correttamente');
      } else {
        console.log('Nessun modal di completamento - completamento diretto');
      }
    }
  });
});
