import { test, expect, Page } from '@playwright/test'
import { loginAsTestUser, navigateWithAuth } from './helpers/auth.helper'
import { TEST_CREDENTIALS } from './auth.config'

/**
 * TEMPLATE BASE PER TEST E2E
 *
 * Questo file è un template di riferimento per creare nuovi test.
 * Copia e modifica secondo le tue esigenze.
 *
 * STEP PER CREARE UN NUOVO TEST:
 * 1. Copia questo file e rinominalo (es: mio-feature.spec.ts)
 * 2. Modifica la descrizione del test suite
 * 3. Aggiungi i tuoi test specifici
 * 4. Usa gli helper di autenticazione quando necessario
 * 5. Esegui con: npx playwright test tests/mio-feature.spec.ts --headed
 */

// Configurazione retry automatici
test.describe.configure({ retries: 2 })

test.describe('Template Test Suite', () => {
  let page: Page
  let consoleErrors: string[] = []

  /**
   * Setup eseguito prima di ogni test
   */
  test.beforeEach(async ({ page: p }) => {
    page = p
    consoleErrors = []

    // Cattura errori console (opzionale, rimuovi se non necessario)
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text()
        // Ignora errori non critici
        if (!text.includes('favicon') && !text.includes('404')) {
          consoleErrors.push(text)
          console.log(`❌ Console Error: ${text}`)
        }
      }
    })

    // OPZIONE 1: Login automatico prima di ogni test
    await loginAsTestUser(page)

    // OPZIONE 2: Naviga a una pagina specifica con auto-login
    // await navigateWithAuth(page, '/calendar')
  })

  /**
   * Cleanup eseguito dopo ogni test
   */
  test.afterEach(async ({ }, testInfo) => {
    if (testInfo.status !== 'passed') {
      console.log(`\n❌ Test fallito: ${testInfo.title}`)
      console.log(`🔄 Retry ${testInfo.retry + 1} di ${testInfo.project.retries + 1}`)

      if (consoleErrors.length > 0) {
        console.log('\n📋 Errori Console:')
        consoleErrors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`))
      }
    }
  })

  /**
   * TEST 1: Esempio base con login già fatto
   */
  test('dovrebbe accedere alla pagina protetta', async () => {
    // Il login è già stato fatto in beforeEach
    // Verifica che siamo su una pagina autenticata
    const url = page.url()
    expect(url).toMatch(/\/(calendar|dashboard|onboarding)/)

    console.log('✅ Test completato con successo')
  })

  /**
   * TEST 2: Esempio con navigazione a pagina specifica
   */
  test('dovrebbe navigare al calendario', async () => {
    // Naviga al calendario
    await page.goto('/calendar')

    // Attendi che la pagina sia caricata
    await page.waitForLoadState('networkidle')

    // Verifica che il calendario sia visibile
    const calendarElement = page.locator('[data-testid="calendar"], .calendar-container, h1:has-text("Calendario")')
    await expect(calendarElement.first()).toBeVisible({ timeout: 5000 })

    console.log('✅ Calendario caricato correttamente')
  })

  /**
   * TEST 3: Esempio con verifica dati database
   */
  test('dovrebbe verificare dati nel database', async () => {
    const { createClient } = await import('@supabase/supabase-js')

    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tucqgcfrlzmwyfadiodo.supabase.co'
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1Y3FnY2ZybHptd3lmYWRpb2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MDk2MDUsImV4cCI6MjA1MzQ4NTYwNX0.vJwCCa6S3vP-K_UM0RCGII6IJMF8EwpWGJJDDuCmS0I'

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Esempio: Verifica companies
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .limit(1)

    expect(error).toBeNull()
    expect(data).toBeDefined()

    console.log(`✅ Database query eseguita: ${data?.length || 0} record trovati`)
  })

  /**
   * TEST 4: Esempio con interazione DOM
   */
  test('dovrebbe interagire con elementi della pagina', async () => {
    await page.goto('/calendar')

    // Esempio: Click su un pulsante
    const addButton = page.locator('button:has-text("Aggiungi"), button:has-text("Nuovo")')

    if (await addButton.isVisible({ timeout: 3000 })) {
      await addButton.first().click()
      await page.waitForTimeout(1000)

      console.log('✅ Pulsante cliccato con successo')
    } else {
      console.log('⚠️ Pulsante non trovato, skip interazione')
    }
  })

  /**
   * TEST 5: Esempio con verifica assenza errori console
   */
  test('dovrebbe completare operazione senza errori console', async () => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Attendi qualche secondo per catturare eventuali errori
    await page.waitForTimeout(2000)

    // Verifica assenza errori critici
    const criticalErrors = consoleErrors.filter(err =>
      !err.includes('ResizeObserver') &&
      !err.includes('unreachable')
    )

    if (criticalErrors.length > 0) {
      console.error('❌ Errori critici rilevati:')
      criticalErrors.forEach(err => console.error(`  - ${err}`))
    }

    expect(criticalErrors).toHaveLength(0)
  })
})

/**
 * TEST SUITE SENZA LOGIN AUTOMATICO
 *
 * Esempio di test suite dove il login NON è fatto automaticamente
 */
test.describe('Template - Test Pubblici', () => {
  test('dovrebbe accedere alla pagina pubblica', async ({ page }) => {
    await page.goto('/')

    // Verifica che la pagina sia caricata
    await page.waitForLoadState('networkidle')

    const url = page.url()
    expect(url).toContain('localhost')

    console.log('✅ Pagina pubblica accessibile')
  })

  test('dovrebbe eseguire login manualmente', async ({ page }) => {
    // Login manuale senza helper
    await page.goto('/sign-in')

    await page.fill('input[type="email"]', TEST_CREDENTIALS.email)
    await page.fill('input[type="password"]', TEST_CREDENTIALS.password)
    await page.click('button[type="submit"]')

    // Attendi redirect
    await page.waitForURL(/\/(calendar|dashboard|onboarding)/, { timeout: 10000 })

    console.log('✅ Login manuale completato')
  })
})
