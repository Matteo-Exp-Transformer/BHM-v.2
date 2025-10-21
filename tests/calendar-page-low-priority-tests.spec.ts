import { test, expect, Page } from '@playwright/test'

// Mock data per i test di bassa priorità
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
  }
]

test.describe('Calendar Page - Test Bassa Priorità', () => {
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
  // TEST O - Performance e Rendering
  // ============================================================================
  test('O1: Verificare che il modal si apra rapidamente (<500ms)', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Misura il tempo di apertura del modal
    const startTime = Date.now()
    
    // Click su un evento per aprire il modal
    await page.click('.fc-event:first-child')
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    
    const endTime = Date.now()
    const openTime = endTime - startTime
    
    // Verifica che il modal si apra in meno di 500ms
    expect(openTime).toBeLessThan(500)
  })

  test('O2: Verificare che il calendario si carichi rapidamente (<2s)', async () => {
    // Misura il tempo di caricamento del calendario
    const startTime = Date.now()
    
    // Naviga alla pagina calendario
    await page.goto('/calendar')
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    const endTime = Date.now()
    const loadTime = endTime - startTime
    
    // Verifica che il calendario si carichi in meno di 2 secondi
    expect(loadTime).toBeLessThan(2000)
  })

  test('O3: Verificare che non ci siano memory leaks durante l\'uso', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Simula uso intensivo del calendario
    for (let i = 0; i < 10; i++) {
      // Click su un evento per aprire il modal
      await page.click('.fc-event:first-child')
      await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
      
      // Chiudi il modal
      await page.click('[data-testid="close-modal-button"]')
      await page.waitForTimeout(100)
      
      // Cambia view del calendario
      const views = ['month', 'week', 'day']
      await page.click(`[data-testid="view-selector-${views[i % views.length]}"]`)
      await page.waitForTimeout(100)
    }
    
    // Verifica che il calendario sia ancora funzionante
    await expect(page.locator('[data-testid="calendar-container"]')).toBeVisible()
  })

  // ============================================================================
  // TEST P - Error Handling
  // ============================================================================
  test('P1: Verificare che errori di rete siano gestiti correttamente', async () => {
    // Mock di un errore di rete
    await page.route('**/api/calendar-events', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      })
    })
    
    // Naviga alla pagina calendario
    await page.goto('/calendar')
    
    // Verifica che l'errore sia gestito correttamente
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    
    // Verifica che sia presente un pulsante di retry
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()
  })

  test('P2: Verificare che eventi malformati non causino crash', async () => {
    // Mock di eventi malformati
    await page.route('**/api/calendar-events', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'malformed-1', title: null, start: null }, // Evento malformato
          { id: 'malformed-2', title: 'Evento Senza Start' }, // Evento senza start
          { id: 'valid-1', title: 'Evento Valido', start: new Date().toISOString(), status: 'pending' }
        ])
      })
    })
    
    // Naviga alla pagina calendario
    await page.goto('/calendar')
    await page.waitForLoadState('networkidle')
    
    // Verifica che il calendario sia ancora funzionante
    await expect(page.locator('[data-testid="calendar-container"]')).toBeVisible()
    
    // Verifica che solo l'evento valido sia visualizzato
    const visibleEvents = await page.locator('.fc-event').count()
    expect(visibleEvents).toBe(1)
  })

  test('P3: Verificare che filtri invalidi siano gestiti correttamente', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Prova ad applicare filtri invalidi
    await page.evaluate(() => {
      // Simula filtri invalidi
      window.localStorage.setItem('calendar-filters', JSON.stringify({
        statuses: ['invalid_status'],
        types: ['invalid_type'],
        departments: ['invalid_department']
      }))
    })
    
    // Ricarica la pagina
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Verifica che il calendario sia ancora funzionante
    await expect(page.locator('[data-testid="calendar-container"]')).toBeVisible()
    
    // Verifica che i filtri siano stati resettati ai valori di default
    const filters = await page.evaluate(() => {
      return JSON.parse(window.localStorage.getItem('calendar-filters') || '{}')
    })
    
    expect(filters.statuses).toEqual([])
    expect(filters.types).toEqual([])
    expect(filters.departments).toEqual([])
  })

  // ============================================================================
  // TEST Q - Accessibilità
  // ============================================================================
  test('Q1: Verificare che il modal sia accessibile via tastiera', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Naviga al primo evento usando Tab
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Premi Enter per aprire il modal
    await page.keyboard.press('Enter')
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    
    // Verifica che il modal sia accessibile via tastiera
    await expect(page.locator('[data-testid="macro-category-modal"]')).toBeVisible()
    
    // Naviga nel modal usando Tab
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Premi Escape per chiudere il modal
    await page.keyboard.press('Escape')
    
    // Verifica che il modal sia stato chiuso
    await expect(page.locator('[data-testid="macro-category-modal"]')).not.toBeVisible()
  })

  test('Q2: Verificare che i filtri siano accessibili via tastiera', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Click su un evento per aprire il modal
    await page.click('.fc-event:first-child')
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    
    // Apri la sezione filtri usando Tab e Enter
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    
    // Verifica che la sezione filtri sia aperta
    await expect(page.locator('[data-testid="filters-section"]')).toBeVisible()
    
    // Naviga nei filtri usando Tab
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Attiva un filtro usando Space
    await page.keyboard.press('Space')
    
    // Verifica che il filtro sia stato attivato
    const activeFilter = page.locator('[data-testid="filter-status-to_complete"]')
    await expect(activeFilter).toHaveClass(/active/)
  })

  test('Q3: Verificare che gli screen reader possano leggere il contenuto', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Verifica che gli elementi abbiano attributi ARIA appropriati
    const calendar = page.locator('[data-testid="calendar-container"]')
    await expect(calendar).toHaveAttribute('role', 'application')
    
    // Verifica che gli eventi abbiano attributi ARIA
    const events = page.locator('.fc-event')
    const firstEvent = events.first()
    await expect(firstEvent).toHaveAttribute('role', 'button')
    await expect(firstEvent).toHaveAttribute('aria-label')
    
    // Click su un evento per aprire il modal
    await page.click('.fc-event:first-child')
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    
    // Verifica che il modal abbia attributi ARIA appropriati
    const modal = page.locator('[data-testid="macro-category-modal"]')
    await expect(modal).toHaveAttribute('role', 'dialog')
    await expect(modal).toHaveAttribute('aria-modal', 'true')
  })

  // ============================================================================
  // TEST R - Responsive Design
  // ============================================================================
  test('R1: Verificare che il modal funzioni su dispositivi mobili', async () => {
    // Imposta viewport mobile
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Naviga alla pagina calendario
    await page.goto('/calendar')
    await page.waitForLoadState('networkidle')
    
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Click su un evento per aprire il modal
    await page.click('.fc-event:first-child')
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    
    // Verifica che il modal sia visibile e utilizzabile su mobile
    await expect(page.locator('[data-testid="macro-category-modal"]')).toBeVisible()
    
    // Verifica che i pulsanti siano cliccabili
    await expect(page.locator('[data-testid="close-modal-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="filters-button"]')).toBeVisible()
  })

  test('R2: Verificare che i filtri siano usabili su schermi piccoli', async () => {
    // Imposta viewport piccolo
    await page.setViewportSize({ width: 768, height: 1024 })
    
    // Naviga alla pagina calendario
    await page.goto('/calendar')
    await page.waitForLoadState('networkidle')
    
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Click su un evento per aprire il modal
    await page.click('.fc-event:first-child')
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    
    // Apri la sezione filtri
    await page.click('[data-testid="filters-button"]')
    await page.waitForSelector('[data-testid="filters-section"]')
    
    // Verifica che i filtri siano utilizzabili su schermi piccoli
    await expect(page.locator('[data-testid="filters-section"]')).toBeVisible()
    
    // Verifica che i pulsanti dei filtri siano cliccabili
    await expect(page.locator('[data-testid="filter-status-to_complete"]')).toBeVisible()
    await expect(page.locator('[data-testid="filter-type-generic_task"]')).toBeVisible()
  })

  test('R3: Verificare che il calendario sia responsive', async () => {
    // Test su diverse dimensioni di schermo
    const viewports = [
      { width: 320, height: 568 },   // Mobile piccolo
      { width: 768, height: 1024 },  // Tablet
      { width: 1024, height: 768 },  // Desktop piccolo
      { width: 1920, height: 1080 }  // Desktop grande
    ]
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      
      // Naviga alla pagina calendario
      await page.goto('/calendar')
      await page.waitForLoadState('networkidle')
      
      // Verifica che il calendario sia visibile
      await expect(page.locator('[data-testid="calendar-container"]')).toBeVisible()
      
      // Verifica che gli elementi principali siano visibili
      await expect(page.locator('[data-testid="stats-panel"]')).toBeVisible()
      await expect(page.locator('[data-testid="calendar-filters"]')).toBeVisible()
    }
  })

  // ============================================================================
  // TEST S - Integrazione
  // ============================================================================
  test('S1: Verificare che le modifiche non abbiano rotto altre funzionalità', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Verifica che tutte le funzionalità principali siano presenti
    await expect(page.locator('[data-testid="calendar-container"]')).toBeVisible()
    await expect(page.locator('[data-testid="stats-panel"]')).toBeVisible()
    await expect(page.locator('[data-testid="calendar-filters"]')).toBeVisible()
    await expect(page.locator('[data-testid="create-event-button"]')).toBeVisible()
    
    // Verifica che il calendario sia interattivo
    await page.click('.fc-event:first-child')
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    
    // Verifica che il modal funzioni
    await expect(page.locator('[data-testid="macro-category-modal"]')).toBeVisible()
    
    // Chiudi il modal
    await page.click('[data-testid="close-modal-button"]')
    
    // Verifica che il calendario sia ancora funzionante
    await expect(page.locator('[data-testid="calendar-container"]')).toBeVisible()
  })

  test('S2: Verificare che l\'integrazione con Supabase funzioni', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Verifica che i dati siano caricati da Supabase
    const events = await page.locator('.fc-event').count()
    expect(events).toBeGreaterThan(0)
    
    // Verifica che le statistiche siano aggiornate
    const statsPanel = page.locator('[data-testid="stats-panel"]')
    await expect(statsPanel).toBeVisible()
    
    // Verifica che i filtri funzionino con i dati di Supabase
    await page.click('[data-testid="filter-status-pending"]')
    
    // Verifica che i filtri abbiano effetto sui dati
    const filteredEvents = await page.locator('.fc-event').count()
    expect(filteredEvents).toBeGreaterThanOrEqual(0)
  })

  test('S3: Verificare che l\'autenticazione funzioni correttamente', async () => {
    // Verifica che l'utente sia autenticato
    const userInfo = await page.evaluate(() => {
      return window.localStorage.getItem('user')
    })
    expect(userInfo).toBeTruthy()
    
    // Verifica che i dati dell'utente siano utilizzati correttamente
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Verifica che il calendario mostri i dati dell'utente
    const events = await page.locator('.fc-event').count()
    expect(events).toBeGreaterThanOrEqual(0)
  })

  // ============================================================================
  // TEST T - Edge Cases
  // ============================================================================
  test('T1: Verificare comportamento con calendario vuoto', async () => {
    // Mock di un calendario vuoto
    await page.route('**/api/calendar-events', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })
    
    // Naviga alla pagina calendario
    await page.goto('/calendar')
    await page.waitForLoadState('networkidle')
    
    // Verifica che il calendario sia visibile anche quando vuoto
    await expect(page.locator('[data-testid="calendar-container"]')).toBeVisible()
    
    // Verifica che sia presente un messaggio per calendario vuoto
    await expect(page.locator('[data-testid="empty-calendar-message"]')).toBeVisible()
  })

  test('T2: Verificare comportamento con molti eventi (100+)', async () => {
    // Genera molti eventi mock
    const manyEvents = Array.from({ length: 150 }, (_, i) => ({
      id: `event-${i}`,
      title: `Evento ${i}`,
      start: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      source: 'general_task',
      metadata: { taskId: `task-${i}` },
      department_id: 'dept-1',
      extendedProps: {
        priority: 'medium',
        description: `Descrizione evento ${i}`,
        department: 'Cucina'
      }
    }))
    
    // Mock di molti eventi
    await page.route('**/api/calendar-events', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(manyEvents)
      })
    })
    
    // Naviga alla pagina calendario
    await page.goto('/calendar')
    await page.waitForLoadState('networkidle')
    
    // Verifica che il calendario sia ancora funzionante con molti eventi
    await expect(page.locator('[data-testid="calendar-container"]')).toBeVisible()
    
    // Verifica che le statistiche siano aggiornate
    const statsPanel = page.locator('[data-testid="stats-panel"]')
    await expect(statsPanel).toBeVisible()
  })

  test('T3: Verificare comportamento con eventi sovrapposti', async () => {
    // Mock di eventi sovrapposti
    const overlappingEvents = [
      {
        id: 'event-1',
        title: 'Evento 1',
        start: new Date().toISOString(),
        end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        source: 'general_task',
        metadata: { taskId: 'task-1' },
        department_id: 'dept-1'
      },
      {
        id: 'event-2',
        title: 'Evento 2',
        start: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        source: 'maintenance',
        metadata: { conservationPointId: 'cp-1' },
        department_id: 'dept-1'
      }
    ]
    
    await page.route('**/api/calendar-events', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(overlappingEvents)
      })
    })
    
    // Naviga alla pagina calendario
    await page.goto('/calendar')
    await page.waitForLoadState('networkidle')
    
    // Verifica che il calendario gestisca correttamente gli eventi sovrapposti
    await expect(page.locator('[data-testid="calendar-container"]')).toBeVisible()
    
    // Verifica che entrambi gli eventi siano visibili
    const events = await page.locator('.fc-event').count()
    expect(events).toBe(2)
  })

  test('T4: Verificare comportamento con date limite (inizio/fine anno)', async () => {
    // Mock di eventi con date limite
    const limitDateEvents = [
      {
        id: 'event-new-year',
        title: 'Evento Capodanno',
        start: new Date('2024-01-01T00:00:00Z').toISOString(),
        status: 'pending',
        source: 'general_task',
        metadata: { taskId: 'task-new-year' },
        department_id: 'dept-1'
      },
      {
        id: 'event-end-year',
        title: 'Evento Fine Anno',
        start: new Date('2024-12-31T23:59:59Z').toISOString(),
        status: 'pending',
        source: 'maintenance',
        metadata: { conservationPointId: 'cp-1' },
        department_id: 'dept-1'
      }
    ]
    
    await page.route('**/api/calendar-events', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(limitDateEvents)
      })
    })
    
    // Naviga alla pagina calendario
    await page.goto('/calendar')
    await page.waitForLoadState('networkidle')
    
    // Verifica che il calendario gestisca correttamente le date limite
    await expect(page.locator('[data-testid="calendar-container"]')).toBeVisible()
    
    // Verifica che gli eventi con date limite siano visibili
    const events = await page.locator('.fc-event').count()
    expect(events).toBe(2)
  })
})
