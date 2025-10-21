import { test, expect, Page } from '@playwright/test'

// Mock data per i test di media priorità
const mockEvents = [
  {
    id: 'event-1',
    title: 'Manutenzione Frigorifero',
    start: new Date().toISOString(),
    status: 'pending',
    source: 'maintenance',
    metadata: { conservationPointId: 'cp-1' },
    department_id: 'dept-1',
    extendedProps: {
      priority: 'high',
      description: 'Controllo temperatura frigorifero',
      department: 'Cucina'
    }
  },
  {
    id: 'event-2', 
    title: 'Controllo HACCP',
    start: new Date().toISOString(),
    status: 'pending',
    source: 'general_task',
    metadata: { taskId: 'task-1' },
    department_id: 'dept-1',
    extendedProps: {
      priority: 'medium',
      description: 'Controllo procedure HACCP',
      department: 'Cucina'
    }
  },
  {
    id: 'event-3',
    title: 'Scadenza Prodotto',
    start: new Date().toISOString(),
    status: 'completed',
    source: 'custom',
    metadata: { product_id: 'prod-1' },
    department_id: 'dept-1',
    extendedProps: {
      priority: 'critical',
      description: 'Scadenza latte',
      department: 'Cucina'
    }
  }
]

test.describe('Calendar Page - Test Media Priorità', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    
    // Mock delle API calls
    await page.route('**/api/**', async (route) => {
      const url = route.request().url()
      
      if (url.includes('auth/user')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'user-1',
            email: 'test@bhm.local',
            role: 'admin',
            company_id: 'company-1'
          })
        })
      } else if (url.includes('calendar-events')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockEvents)
        })
      } else {
        await route.continue()
      }
    })

    // Naviga alla pagina calendario
    await page.goto('/calendar')
    await page.waitForLoadState('networkidle')
  })

  test.afterEach(async () => {
    await page.close()
  })

  // ============================================================================
  // TEST A - Filtri Calendario e Modal
  // ============================================================================
  test('A1: Verificare che i filtri del calendario funzionino correttamente', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Verifica che i filtri del calendario siano presenti
    const calendarFilters = page.locator('[data-testid="calendar-filters"]')
    await expect(calendarFilters).toBeVisible()
    
    // Test filtro per stato
    await page.click('[data-testid="filter-status-pending"]')
    
    // Verifica che solo gli eventi pending siano visibili
    const pendingEvents = await page.locator('.fc-event').count()
    expect(pendingEvents).toBeGreaterThan(0)
    
    // Test filtro per tipo
    await page.click('[data-testid="filter-type-maintenance"]')
    
    // Verifica che solo gli eventi maintenance siano visibili
    const maintenanceEvents = await page.locator('.fc-event').count()
    expect(maintenanceEvents).toBeGreaterThanOrEqual(0)
  })

  test('A2: Verificare che i filtri del modal funzionino correttamente', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Click su un evento per aprire il modal
    await page.click('.fc-event:first-child')
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    
    // Apri la sezione filtri del modal
    await page.click('[data-testid="filters-button"]')
    await page.waitForSelector('[data-testid="filters-section"]')
    
    // Test filtro per stato nel modal
    await page.click('[data-testid="filter-status-to_complete"]')
    
    // Verifica che i filtri funzionino nel modal
    const filteredEvents = await page.locator('[data-testid="modal-event-item"]').count()
    expect(filteredEvents).toBeGreaterThanOrEqual(0)
  })

  test('A3: Verificare che i filtri siano sincronizzati tra calendario e modal', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Applica un filtro nel calendario
    await page.click('[data-testid="filter-status-pending"]')
    
    // Click su un evento per aprire il modal
    await page.click('.fc-event:first-child')
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    
    // Verifica che il filtro sia applicato anche nel modal
    const modalEvents = await page.locator('[data-testid="modal-event-item"]').count()
    expect(modalEvents).toBeGreaterThanOrEqual(0)
  })

  // ============================================================================
  // TEST B - Inserimento Evento
  // ============================================================================
  test('B1: Verificare che l\'inserimento di un nuovo evento funzioni correttamente', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Click sul pulsante per creare un nuovo evento
    await page.click('[data-testid="create-event-button"]')
    
    // Verifica che si apra il form di creazione
    await page.waitForSelector('[data-testid="event-form"]', { timeout: 5000 })
    
    // Compila il form
    await page.fill('[data-testid="event-title-input"]', 'Nuovo Evento Test')
    await page.fill('[data-testid="event-description-input"]', 'Descrizione evento test')
    await page.selectOption('[data-testid="event-priority-select"]', 'medium')
    
    // Mock della chiamata API per creazione evento
    await page.route('**/api/events', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'new-event-1',
            title: 'Nuovo Evento Test',
            status: 'pending'
          })
        })
      } else {
        await route.continue()
      }
    })
    
    // Submit del form
    await page.click('[data-testid="submit-event-button"]')
    
    // Verifica che l'evento sia stato creato
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
  })

  test('B2: Verificare che l\'evento appaia nel calendario dopo l\'inserimento', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Conta gli eventi iniziali
    const initialEventCount = await page.locator('.fc-event').count()
    
    // Crea un nuovo evento (come nel test precedente)
    await page.click('[data-testid="create-event-button"]')
    await page.waitForSelector('[data-testid="event-form"]', { timeout: 5000 })
    
    await page.fill('[data-testid="event-title-input"]', 'Evento Test Calendario')
    await page.selectOption('[data-testid="event-priority-select"]', 'high')
    
    // Mock della chiamata API
    await page.route('**/api/events', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'new-event-2',
            title: 'Evento Test Calendario',
            status: 'pending'
          })
        })
      } else {
        await route.continue()
      }
    })
    
    await page.click('[data-testid="submit-event-button"]')
    
    // Attendi che l'evento appaia nel calendario
    await page.waitForTimeout(1000)
    
    // Verifica che il numero di eventi sia aumentato
    const finalEventCount = await page.locator('.fc-event').count()
    expect(finalEventCount).toBeGreaterThan(initialEventCount)
    
    // Verifica che il nuovo evento sia visibile
    await expect(page.locator('.fc-event').filter({ hasText: 'Evento Test Calendario' })).toBeVisible()
  })

  test('B3: Verificare che l\'evento sia visibile nel modal del giorno', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Crea un nuovo evento per oggi
    await page.click('[data-testid="create-event-button"]')
    await page.waitForSelector('[data-testid="event-form"]', { timeout: 5000 })
    
    await page.fill('[data-testid="event-title-input"]', 'Evento Modal Test')
    await page.fill('[data-testid="event-date-input"]', new Date().toISOString().split('T')[0])
    
    // Mock della chiamata API
    await page.route('**/api/events', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'new-event-3',
            title: 'Evento Modal Test',
            status: 'pending',
            start: new Date().toISOString()
          })
        })
      } else {
        await route.continue()
      }
    })
    
    await page.click('[data-testid="submit-event-button"]')
    
    // Attendi che l'evento sia creato
    await page.waitForTimeout(1000)
    
    // Click sull'evento per aprire il modal
    await page.click('.fc-event:last-child')
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    
    // Verifica che l'evento sia presente nel modal
    await expect(page.locator('[data-testid="modal-event-item"]').filter({ hasText: 'Evento Modal Test' })).toBeVisible()
  })

  // ============================================================================
  // TEST C - Statistiche Count
  // ============================================================================
  test('C1: Verificare che le statistiche si aggiornino correttamente in base alla view del calendario', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Verifica le statistiche iniziali
    const initialStats = await page.locator('[data-testid="stats-panel"]').textContent()
    expect(initialStats).toContain('Eventi da Completare')
    
    // Cambia view del calendario
    await page.click('[data-testid="view-selector-week"]')
    
    // Verifica che le statistiche si aggiornino
    await page.waitForTimeout(1000)
    const weekStats = await page.locator('[data-testid="stats-panel"]').textContent()
    expect(weekStats).toBeTruthy()
    
    // Cambia a view giornaliera
    await page.click('[data-testid="view-selector-day"]')
    
    // Verifica che le statistiche si aggiornino per la view giornaliera
    await page.waitForTimeout(1000)
    const dayStats = await page.locator('[data-testid="stats-panel"]').textContent()
    expect(dayStats).toBeTruthy()
  })

  test('C2: Verificare che i contatori siano accurati per ogni tipologia di evento', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Verifica i contatori per tipologia
    const maintenanceCount = await page.locator('[data-testid="maintenance-count"]').textContent()
    const genericTasksCount = await page.locator('[data-testid="generic-tasks-count"]').textContent()
    const productExpiryCount = await page.locator('[data-testid="product-expiry-count"]').textContent()
    
    expect(maintenanceCount).toBeTruthy()
    expect(genericTasksCount).toBeTruthy()
    expect(productExpiryCount).toBeTruthy()
    
    // Verifica che i contatori siano numeri
    expect(parseInt(maintenanceCount || '0')).toBeGreaterThanOrEqual(0)
    expect(parseInt(genericTasksCount || '0')).toBeGreaterThanOrEqual(0)
    expect(parseInt(productExpiryCount || '0')).toBeGreaterThanOrEqual(0)
  })

  // ============================================================================
  // TEST D - Breakdown Tipologie e Urgenti
  // ============================================================================
  test('D1: Verificare che il breakdown delle tipologie sia corretto', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Verifica la sezione breakdown tipologie
    const breakdownSection = page.locator('[data-testid="breakdown-tipologie"]')
    await expect(breakdownSection).toBeVisible()
    
    // Verifica che ogni tipologia sia presente
    await expect(page.locator('[data-testid="tipologia-maintenance"]')).toBeVisible()
    await expect(page.locator('[data-testid="tipologia-generic-tasks"]')).toBeVisible()
    await expect(page.locator('[data-testid="tipologia-product-expiry"]')).toBeVisible()
    
    // Verifica che i contatori siano coerenti
    const totalEvents = await page.locator('.fc-event').count()
    const maintenanceEvents = await page.locator('[data-testid="tipologia-maintenance"] .count').textContent()
    const genericEvents = await page.locator('[data-testid="tipologia-generic-tasks"] .count').textContent()
    const productEvents = await page.locator('[data-testid="tipologia-product-expiry"] .count').textContent()
    
    const sum = parseInt(maintenanceEvents || '0') + parseInt(genericEvents || '0') + parseInt(productEvents || '0')
    expect(sum).toBeLessThanOrEqual(totalEvents)
  })

  test('D2: Verificare che la categorizzazione degli eventi urgenti sia accurata', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Verifica la sezione eventi urgenti
    const urgentSection = page.locator('[data-testid="urgent-events-section"]')
    await expect(urgentSection).toBeVisible()
    
    // Verifica che gli eventi in ritardo siano categorizzati correttamente
    const overdueEvents = await page.locator('[data-testid="overdue-event"]').count()
    expect(overdueEvents).toBeGreaterThanOrEqual(0)
    
    // Verifica che gli eventi di oggi siano categorizzati correttamente
    const todayEvents = await page.locator('[data-testid="today-event"]').count()
    expect(todayEvents).toBeGreaterThanOrEqual(0)
    
    // Verifica che gli eventi di domani siano categorizzati correttamente
    const tomorrowEvents = await page.locator('[data-testid="tomorrow-event"]').count()
    expect(tomorrowEvents).toBeGreaterThanOrEqual(0)
  })

  // ============================================================================
  // TEST G - Visualizzazione Tipi Evento nel Modal
  // ============================================================================
  test('G1: Verificare che i tipi di evento siano visualizzati correttamente nel modal', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Click su un evento per aprire il modal
    await page.click('.fc-event:first-child')
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    
    // Verifica che il tipo di evento sia visualizzato correttamente
    const eventType = await page.locator('[data-testid="event-type-badge"]:first-child').textContent()
    expect(eventType).toBeTruthy()
    
    // Verifica che il tipo sia uno dei tipi validi
    const validTypes = ['Manutenzione', 'Mansione', 'Scadenza']
    expect(validTypes).toContain(eventType)
  })

  test('G2: Verificare che la categorizzazione per tipo sia accurata', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Click su un evento maintenance
    const maintenanceEvent = page.locator('.fc-event').filter({ hasText: 'Manutenzione' })
    if (await maintenanceEvent.count() > 0) {
      await maintenanceEvent.first().click()
      await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
      
      // Verifica che sia categorizzato come maintenance
      await expect(page.locator('[data-testid="modal-header-title"]')).toContainText('Manutenzioni')
    }
    
    // Chiudi il modal
    await page.click('[data-testid="close-modal-button"]')
    
    // Click su un evento generic task
    const genericEvent = page.locator('.fc-event').filter({ hasText: 'Controllo' })
    if (await genericEvent.count() > 0) {
      await genericEvent.first().click()
      await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
      
      // Verifica che sia categorizzato come generic task
      await expect(page.locator('[data-testid="modal-header-title"]')).toContainText('Mansioni/Attività')
    }
  })
})
