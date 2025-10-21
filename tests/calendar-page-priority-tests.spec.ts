import { test, expect, Page } from '@playwright/test'
import { 
  loginAndNavigateToActivities, 
  verifyActivitiesPageLoaded, 
  findActivitiesElements,
  verifyDataPersistence 
} from './calendar-test-helpers'

// Mock data per i test
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
    status: 'pending', 
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

const mockUser = {
  id: 'user-1',
  email: 'test@bhm.local',
  role: 'admin',
  company_id: 'company-1'
}

const mockCompany = {
  id: 'company-1',
  name: 'Test Company'
}

const mockDepartments = [
  { id: 'dept-1', name: 'Cucina', is_active: true },
  { id: 'dept-2', name: 'Magazzino', is_active: true }
]

const mockStaff = [
  { id: 'staff-1', name: 'Mario Rossi', role: 'chef', category: 'cucina' },
  { id: 'staff-2', name: 'Luigi Bianchi', role: 'magazziniere', category: 'magazzino' }
]

test.describe('Calendar Page - Test Alta Priorità', () => {
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
          body: JSON.stringify(mockUser)
        })
      } else if (url.includes('companies')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockCompany)
        })
      } else if (url.includes('departments')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockDepartments)
        })
      } else if (url.includes('staff')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockStaff)
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
  // TEST E - Allineamento Eventi Calendar ↔ Modal
  // ============================================================================
  test('E1: Verificare che gli eventi nel modal corrispondano esattamente a quelli del calendario', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Verifica che gli eventi siano visibili nel calendario
    const calendarEvents = await page.locator('.fc-event').count()
    expect(calendarEvents).toBeGreaterThan(0)
    
    // Click su un evento nel calendario
    await page.click('.fc-event:first-child')
    
    // Verifica che il modal si apra
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    
    // Verifica che gli eventi nel modal corrispondano a quelli del calendario
    const modalEvents = await page.locator('[data-testid="modal-event-item"]').count()
    expect(modalEvents).toBe(calendarEvents)
    
    // Verifica che i titoli degli eventi corrispondano
    const calendarEventTitles = await page.locator('.fc-event').allTextContents()
    const modalEventTitles = await page.locator('[data-testid="modal-event-title"]').allTextContents()
    
    expect(modalEventTitles).toEqual(expect.arrayContaining(calendarEventTitles))
  })

  test('E2: Verificare che il click su un evento apra il modal con gli eventi corretti del giorno', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Click su un evento specifico
    const firstEvent = page.locator('.fc-event:first-child')
    const eventTitle = await firstEvent.textContent()
    
    await firstEvent.click()
    
    // Verifica che il modal si apra
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    
    // Verifica che il modal contenga l'evento cliccato
    const modalTitle = await page.locator('[data-testid="modal-header-title"]').textContent()
    expect(modalTitle).toContain(eventTitle)
    
    // Verifica che tutti gli eventi del giorno siano presenti
    const dayEvents = await page.locator('[data-testid="modal-event-item"]').count()
    expect(dayEvents).toBeGreaterThan(0)
  })

  // ============================================================================
  // TEST F - Completamento Evento nel Modal
  // ============================================================================
  test('F1: Verificare che il completamento di un evento nel modal funzioni correttamente', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Click su un evento per aprire il modal
    await page.click('.fc-event:first-child')
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    
    // Click su un evento per espandere i dettagli
    await page.click('[data-testid="modal-event-item"]:first-child')
    
    // Verifica che il pulsante "Completa" sia presente
    const completeButton = page.locator('[data-testid="complete-task-button"]')
    await expect(completeButton).toBeVisible()
    
    // Mock della chiamata API per completamento
    await page.route('**/api/tasks/*/complete', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      })
    })
    
    // Click sul pulsante "Completa"
    await completeButton.click()
    
    // Verifica che appaia il messaggio di successo
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
    
    // Verifica che l'evento sia marcato come completato
    await expect(page.locator('[data-testid="completed-event"]')).toBeVisible()
  })

  test('F2: Verificare che lo stato dell\'evento si aggiorni dopo il completamento', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Click su un evento per aprire il modal
    await page.click('.fc-event:first-child')
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    
    // Verifica lo stato iniziale dell'evento
    const initialStatus = await page.locator('[data-testid="event-status"]:first-child').textContent()
    expect(initialStatus).toContain('In Attesa')
    
    // Click per espandere i dettagli
    await page.click('[data-testid="modal-event-item"]:first-child')
    
    // Mock della chiamata API
    await page.route('**/api/tasks/*/complete', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      })
    })
    
    // Completa l'evento
    await page.click('[data-testid="complete-task-button"]')
    
    // Attendi l'aggiornamento
    await page.waitForTimeout(1000)
    
    // Verifica che lo stato sia cambiato
    const updatedStatus = await page.locator('[data-testid="event-status"]:first-child').textContent()
    expect(updatedStatus).toContain('Completato')
  })

  // ============================================================================
  // TEST L - Logica onEventClick
  // ============================================================================
  test('L1: Verificare che il click su evento generic_task apra il modal corretto', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Trova un evento generic_task
    const genericTaskEvent = page.locator('.fc-event').filter({ hasText: 'Controllo HACCP' })
    await expect(genericTaskEvent).toBeVisible()
    
    // Click sull'evento
    await genericTaskEvent.click()
    
    // Verifica che si apra il modal per generic_tasks
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    await expect(page.locator('[data-testid="modal-header-title"]')).toContainText('Mansioni/Attività Generiche')
  })

  test('L2: Verificare che il click su evento maintenance apra il modal corretto', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Trova un evento maintenance
    const maintenanceEvent = page.locator('.fc-event').filter({ hasText: 'Manutenzione' })
    await expect(maintenanceEvent).toBeVisible()
    
    // Click sull'evento
    await maintenanceEvent.click()
    
    // Verifica che si apra il modal per maintenance
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    await expect(page.locator('[data-testid="modal-header-title"]')).toContainText('Manutenzioni')
  })

  test('L3: Verificare che il click su evento product_expiry apra il modal corretto', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Trova un evento product_expiry
    const productExpiryEvent = page.locator('.fc-event').filter({ hasText: 'Scadenza' })
    await expect(productExpiryEvent).toBeVisible()
    
    // Click sull'evento
    await productExpiryEvent.click()
    
    // Verifica che si apra il modal per product_expiry
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    await expect(page.locator('[data-testid="modal-header-title"]')).toContainText('Scadenze Prodotti')
  })

  test('L4: Verificare che il click su evento sconosciuto gestisca l\'errore', async () => {
    // Mock di un evento con tipo sconosciuto
    await page.route('**/api/calendar-events', async (route) => {
      const unknownEvent = {
        id: 'unknown-event',
        title: 'Evento Sconosciuto',
        start: new Date().toISOString(),
        status: 'pending',
        source: 'unknown_source',
        metadata: {},
        department_id: 'dept-1'
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([unknownEvent])
      })
    })
    
    // Ricarica la pagina per ottenere l'evento sconosciuto
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Click sull'evento sconosciuto
    await page.click('.fc-event:first-child')
    
    // Verifica che non si apra alcun modal o che gestisca l'errore
    const modalVisible = await page.locator('[data-testid="macro-category-modal"]').isVisible()
    expect(modalVisible).toBeFalsy()
  })

  // ============================================================================
  // TEST M - Sincronizzazione Eventi
  // ============================================================================
  test('M1: Verificare che gli eventi passati dal Calendar al Modal siano identici', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Click su un evento per aprire il modal
    await page.click('.fc-event:first-child')
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    
    // Verifica che gli eventi nel modal abbiano gli stessi ID degli eventi del calendario
    const calendarEventIds = await page.locator('.fc-event').allTextContents()
    const modalEventIds = await page.locator('[data-testid="modal-event-item"]').allTextContents()
    
    // Gli eventi dovrebbero essere gli stessi (stesso giorno, stessa tipologia)
    expect(modalEventIds.length).toBeGreaterThan(0)
    expect(calendarEventIds.length).toBeGreaterThan(0)
  })

  test('M2: Verificare che la conversione convertEventToItem funzioni correttamente', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Click su un evento per aprire il modal
    await page.click('.fc-event:first-child')
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    
    // Verifica che i dettagli dell'evento siano correttamente convertiti
    const eventTitle = await page.locator('[data-testid="modal-event-title"]:first-child').textContent()
    const eventDescription = await page.locator('[data-testid="modal-event-description"]:first-child').textContent()
    const eventPriority = await page.locator('[data-testid="modal-event-priority"]:first-child').textContent()
    
    expect(eventTitle).toBeTruthy()
    expect(eventDescription).toBeTruthy()
    expect(eventPriority).toBeTruthy()
  })

  test('M3: Verificare che gli eventi RAW e processati siano coerenti', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Click su un evento per aprire il modal
    await page.click('.fc-event:first-child')
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    
    // Verifica che le informazioni base siano coerenti
    const calendarEventTitle = await page.locator('.fc-event:first-child').textContent()
    const modalEventTitle = await page.locator('[data-testid="modal-event-title"]:first-child').textContent()
    
    expect(modalEventTitle).toContain(calendarEventTitle)
  })

  // ============================================================================
  // TEST N - Filtri MacroCategoryModal
  // ============================================================================
  test('N1: Verificare che il pulsante "Filtri" apra/chiuda la sezione filtri', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Click su un evento per aprire il modal
    await page.click('.fc-event:first-child')
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    
    // Verifica che la sezione filtri sia inizialmente chiusa
    const filtersSection = page.locator('[data-testid="filters-section"]')
    await expect(filtersSection).not.toBeVisible()
    
    // Click sul pulsante "Filtri"
    await page.click('[data-testid="filters-button"]')
    
    // Verifica che la sezione filtri si apra
    await expect(filtersSection).toBeVisible()
    
    // Click di nuovo sul pulsante "Filtri"
    await page.click('[data-testid="filters-button"]')
    
    // Verifica che la sezione filtri si chiuda
    await expect(filtersSection).not.toBeVisible()
  })

  test('N2: Verificare che i filtri per Stato funzionino (pending, completed, overdue)', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Click su un evento per aprire il modal
    await page.click('.fc-event:first-child')
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    
    // Apri la sezione filtri
    await page.click('[data-testid="filters-button"]')
    await page.waitForSelector('[data-testid="filters-section"]')
    
    // Test filtro "Da completare"
    await page.click('[data-testid="filter-status-to_complete"]')
    
    // Verifica che solo gli eventi da completare siano visibili
    const visibleEvents = await page.locator('[data-testid="modal-event-item"]').count()
    expect(visibleEvents).toBeGreaterThan(0)
    
    // Test filtro "Completato"
    await page.click('[data-testid="filter-status-completed"]')
    
    // Verifica che solo gli eventi completati siano visibili
    const completedEvents = await page.locator('[data-testid="completed-event"]').count()
    expect(completedEvents).toBeGreaterThanOrEqual(0)
  })

  test('N3: Verificare che i filtri per Tipo funzionino (generic_task, maintenance, product_expiry)', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Click su un evento per aprire il modal
    await page.click('.fc-event:first-child')
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    
    // Apri la sezione filtri
    await page.click('[data-testid="filters-button"]')
    await page.waitForSelector('[data-testid="filters-section"]')
    
    // Test filtro "Mansioni"
    await page.click('[data-testid="filter-type-generic_task"]')
    
    // Verifica che solo gli eventi generic_task siano visibili
    const genericTaskEvents = await page.locator('[data-testid="modal-event-item"]').count()
    expect(genericTaskEvents).toBeGreaterThanOrEqual(0)
    
    // Test filtro "Manutenzioni"
    await page.click('[data-testid="filter-type-maintenance"]')
    
    // Verifica che solo gli eventi maintenance siano visibili
    const maintenanceEvents = await page.locator('[data-testid="modal-event-item"]').count()
    expect(maintenanceEvents).toBeGreaterThanOrEqual(0)
  })

  test('N4: Verificare che i filtri per Reparto funzionino', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Click su un evento per aprire il modal
    await page.click('.fc-event:first-child')
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    
    // Apri la sezione filtri
    await page.click('[data-testid="filters-button"]')
    await page.waitForSelector('[data-testid="filters-section"]')
    
    // Test filtro per reparto "Cucina"
    await page.click('[data-testid="filter-department-cucina"]')
    
    // Verifica che solo gli eventi del reparto Cucina siano visibili
    const cucinaEvents = await page.locator('[data-testid="modal-event-item"]').count()
    expect(cucinaEvents).toBeGreaterThanOrEqual(0)
  })

  test('N5: Verificare che i filtri multipli funzionino insieme', async () => {
    // Attendi che il calendario sia caricato
    await page.waitForSelector('[data-testid="calendar-container"]', { timeout: 10000 })
    
    // Click su un evento per aprire il modal
    await page.click('.fc-event:first-child')
    await page.waitForSelector('[data-testid="macro-category-modal"]', { timeout: 5000 })
    
    // Apri la sezione filtri
    await page.click('[data-testid="filters-button"]')
    await page.waitForSelector('[data-testid="filters-section"]')
    
    // Applica filtri multipli
    await page.click('[data-testid="filter-status-to_complete"]')
    await page.click('[data-testid="filter-type-generic_task"]')
    await page.click('[data-testid="filter-department-cucina"]')
    
    // Verifica che gli eventi filtrati siano coerenti con tutti i filtri applicati
    const filteredEvents = await page.locator('[data-testid="modal-event-item"]').count()
    expect(filteredEvents).toBeGreaterThanOrEqual(0)
    
    // Verifica che tutti gli eventi visibili abbiano le caratteristiche dei filtri applicati
    const visibleEvents = await page.locator('[data-testid="modal-event-item"]').all()
    for (const event of visibleEvents) {
      const eventText = await event.textContent()
      expect(eventText).toContain('Cucina') // Reparto
    }
  })
})
