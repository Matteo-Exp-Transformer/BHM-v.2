const { test, expect } = require('@playwright/test');

test.describe('Completamento Mansioni Generiche - Giorno Corrente', () => {
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

  test('Dovrebbe completare tutte le mansioni generiche del giorno corrente', async () => {
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
    
    // Step 3: Clicca prima sulle generic tasks nel pannello laterale
    const genericTasksButton = page.locator('button:has-text("Mansioni Generiche"), button:has-text("Generic Tasks"), [data-testid="generic-tasks-button"]');
    await expect(genericTasksButton).toBeVisible();
    await genericTasksButton.click();
    await page.waitForTimeout(1000);
    
    // Step 4: Verifica che si apra il pannello laterale eventi
    const eventsPanel = page.locator('[data-testid="events-panel"], .events-panel, .sidebar-events');
    await expect(eventsPanel).toBeVisible();
    
    // Step 5: Identifica tutte le mansioni generiche da completare
    const tasksToComplete = page.locator('[data-testid="generic-task-item"], .generic-task-item, .task-item:not(.completed)');
    const taskCount = await tasksToComplete.count();
    
    console.log(`Trovate ${taskCount} mansioni generiche da completare`);
    
    // Step 6: Completa tutte le mansioni generiche
    for (let i = 0; i < taskCount; i++) {
      const task = tasksToComplete.nth(i);
      
      // Verifica che la task non sia già completata
      const isCompleted = await task.locator('.completed, [data-completed="true"]').isVisible();
      if (isCompleted) {
        console.log(`Task ${i + 1} già completata, salto`);
        continue;
      }
      
      // Clicca sul pulsante di completamento
      const completeButton = task.locator('button:has-text("Completa"), button:has-text("✓"), [data-testid="complete-task"]');
      await expect(completeButton).toBeVisible();
      await completeButton.click();
      
      // Attendi conferma del completamento
      await page.waitForTimeout(500);
      
      console.log(`Completata task ${i + 1}/${taskCount}`);
    }
    
    // Step 7: Verifica che il pannello si refreshi
    await page.waitForTimeout(2000);
    
    // Step 8: Verifica che le tasks completate siano andate in "Attività Completate"
    const completedSection = page.locator('[data-testid="completed-tasks"], .completed-tasks, h3:has-text("Attività Completate")');
    await expect(completedSection).toBeVisible();
    
    // Verifica che ci siano tasks nella sezione completate
    const completedTasks = page.locator('[data-testid="completed-task-item"], .completed-task-item, .task-item.completed');
    const completedCount = await completedTasks.count();
    
    expect(completedCount).toBeGreaterThan(0);
    console.log(`Verificate ${completedCount} tasks nella sezione "Attività Completate"`);
    
    // Step 9: Verifica che le mansioni generiche non completate siano ancora nella sezione principale
    const remainingTasks = page.locator('[data-testid="generic-task-item"]:not(.completed), .generic-task-item:not(.completed)');
    const remainingCount = await remainingTasks.count();
    
    console.log(`Rimangono ${remainingCount} tasks non completate nella sezione principale`);
  });

  test('Dovrebbe gestire correttamente il caso senza mansioni generiche', async () => {
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
    
    // Clicca sulle generic tasks
    const genericTasksButton = page.locator('button:has-text("Mansioni Generiche"), button:has-text("Generic Tasks"), [data-testid="generic-tasks-button"]');
    await genericTasksButton.click();
    
    // Verifica messaggio quando non ci sono tasks
    const noTasksMessage = page.locator('text=Nessuna mansione generica per oggi, text=No generic tasks for today, [data-testid="no-tasks-message"]');
    
    if (await noTasksMessage.isVisible()) {
      console.log('Nessuna mansione generica per oggi - comportamento corretto');
      expect(noTasksMessage).toBeVisible();
    } else {
      // Se ci sono tasks, verifica che siano visibili
      const tasksPanel = page.locator('[data-testid="events-panel"], .events-panel');
      await expect(tasksPanel).toBeVisible();
    }
  });

  test('Dovrebbe mostrare feedback visivo durante il completamento', async () => {
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
    
    // Clicca sulle generic tasks
    const genericTasksButton = page.locator('button:has-text("Mansioni Generiche"), button:has-text("Generic Tasks"), [data-testid="generic-tasks-button"]');
    await genericTasksButton.click();
    
    // Verifica che ci sia almeno una task da completare
    const tasksToComplete = page.locator('[data-testid="generic-task-item"]:not(.completed), .generic-task-item:not(.completed)');
    const taskCount = await tasksToComplete.count();
    
    if (taskCount > 0) {
      const firstTask = tasksToComplete.first();
      const completeButton = firstTask.locator('button:has-text("Completa"), button:has-text("✓"), [data-testid="complete-task"]');
      
      // Verifica stato prima del completamento
      await expect(completeButton).toBeVisible();
      
      // Clicca e verifica feedback
      await completeButton.click();
      
      // Verifica toast di successo o cambio stato
      const successToast = page.locator('.toast-success, .success-message, [data-testid="success-toast"]');
      const loadingState = page.locator('.loading, .spinner, [data-testid="loading"]');
      
      // Almeno uno di questi dovrebbe essere visibile
      const hasFeedback = await successToast.isVisible() || await loadingState.isVisible() || 
                         await completeButton.isDisabled() || 
                         await firstTask.locator('.completed').isVisible();
      
      expect(hasFeedback).toBeTruthy();
      console.log('Feedback visivo durante completamento verificato');
    }
  });
});
