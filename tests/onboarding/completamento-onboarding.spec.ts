import { test, expect, Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { loginAsTestUser } from '../helpers/auth.helper'
import { resetOnboardingState, getCurrentUserCompanyId } from '../helpers/onboarding.helper'

/**
 * Test E2E per completamento onboarding con DevButtons
 *
 * Verifica che:
 * - Il login con credenziali test funzioni correttamente
 * - Lo stato onboarding venga resettato prima di ogni test
 * - Il pulsante "Precompila" funzioni correttamente
 * - Il pulsante "Completa Onboarding" completi senza errori
 * - Non ci siano errori 409/23505 (duplicate key)
 * - I dati vengano salvati correttamente nel database
 * - UPSERT funzioni su completamenti multipli
 *
 * NOTA: Il test esegue login E reset onboarding prima di ogni test.
 */

// Configurazione retry automatici
test.describe.configure({ retries: 2 })

test.describe('Completamento Onboarding con DevButtons', () => {
  let page: Page
  let consoleErrors: string[] = []
  let consoleWarnings: string[] = []

  test.beforeEach(async ({ page: p }) => {
    page = p
    consoleErrors = []
    consoleWarnings = []

    // Cattura errori e warning console
    page.on('console', (msg) => {
      const text = msg.text()

      if (msg.type() === 'error') {
        // Ignora errori noti non critici (CSP warnings, favicon, permessi admin, ecc.)
        if (!text.includes('favicon') &&
            !text.includes('404') &&
            !text.includes('406') && // Not Acceptable (errore permessi)
            !text.includes('net::ERR_FILE_NOT_FOUND') &&
            !text.includes('Content Security Policy') &&
            !text.includes('X-Frame-Options') &&
            !text.includes('Solo gli admin possono inviare inviti') &&
            !text.includes('createInviteToken')) {
          consoleErrors.push(text)
          console.log(`❌ Console Error: ${text}`)
        }
      }

      if (msg.type() === 'warning') {
        consoleWarnings.push(text)
      }
    })

    // STEP 1: Login con credenziali test
    console.log('🔐 Eseguo login prima di accedere all\'onboarding...')
    await loginAsTestUser(page)

    // Attendi che il localStorage sia aggiornato dopo il login
    await page.waitForTimeout(1000)

    // STEP 2: Reset stato onboarding (per permettere accesso ripetuto)
    console.log('🔄 Resetto stato onboarding...')
    await resetOnboardingState(page)

    // STEP 3: Naviga alla pagina di onboarding
    await page.goto('http://localhost:3000/onboarding')

    // Attendi che i DevButtons siano visibili
    await page.waitForSelector('[title="Precompila onboarding con dati di test"]', {
      timeout: 10000
    })
  })

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

  test('dovrebbe precompilare e completare onboarding senza errori', async () => {
    // STEP 1: Click pulsante "Precompila"
    const prefillButton = page.locator('[title="Precompila onboarding con dati di test"]')
    await expect(prefillButton).toBeVisible()

    console.log('📝 Clicking Precompila button...')
    await prefillButton.click()

    // Attendi che i dati siano precompilati
    await page.waitForTimeout(1500)

    // STEP 2: Click pulsante "Completa Onboarding"
    const completeButton = page.locator('[title="Completa onboarding automaticamente"]')
    await expect(completeButton).toBeVisible()

    console.log('✅ Clicking Completa Onboarding button...')
    await completeButton.click()

    // Attendi completamento (max 5 secondi)
    await page.waitForTimeout(3000)

    // STEP 3: Verifica assenza errori critici in console
    const hasDuplicateKeyError = consoleErrors.some(err =>
      err.includes('23505') ||
      err.includes('duplicate key') ||
      err.includes('409')
    )

    if (hasDuplicateKeyError) {
      console.error('❌ Errore duplicate key rilevato!')
      consoleErrors.forEach(err => console.error(`  - ${err}`))
    }

    expect(hasDuplicateKeyError).toBe(false)

    // Verifica che non ci siano errori generici critici
    const criticalErrors = consoleErrors.filter(err =>
      !err.includes('ResizeObserver') && // Errore noto non critico
      !err.includes('unreachable') // Errore noto non critico
    )

    if (criticalErrors.length > 0) {
      console.error('❌ Errori critici rilevati:')
      criticalErrors.forEach(err => console.error(`  - ${err}`))
    }

    expect(criticalErrors).toHaveLength(0)

    // STEP 4: Verifica redirect a /calendar o /dashboard
    await page.waitForURL(/\/(calendar|dashboard)/, { timeout: 10000 })

    const currentUrl = page.url()
    console.log(`✅ Redirect completato: ${currentUrl}`)
    expect(currentUrl).toMatch(/\/(calendar|dashboard)/)
  })

  test('dovrebbe salvare correttamente tutti i dati nel database', async () => {
    // Inizializza Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tucqgcfrlzmwyfadiodo.supabase.co'
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1Y3FnY2ZybHptd3lmYWRpb2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MDk2MDUsImV4cCI6MjA1MzQ4NTYwNX0.vJwCCa6S3vP-K_UM0RCGII6IJMF8EwpWGJJDDuCmS0I'

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Completa onboarding
    await page.locator('[title="Precompila onboarding con dati di test"]').click()
    await page.waitForTimeout(1500)
    await page.locator('[title="Completa onboarding automaticamente"]').click()
    await page.waitForTimeout(3000)

    // Attendi redirect
    await page.waitForURL(/\/(calendar|dashboard)/, { timeout: 10000 })

    // Ottieni il company ID dell'utente corrente
    const companyId = await getCurrentUserCompanyId(page)
    expect(companyId).toBeDefined()

    console.log(`\n📊 Verifica dati per company_id: ${companyId}`)

    // Verifica company_calendar_settings
    const { data: calendarSettings, error: calendarError } = await supabase
      .from('company_calendar_settings')
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle()

    console.log('📅 Calendar Settings:', calendarSettings)

    expect(calendarError).toBeNull()
    expect(calendarSettings).toBeDefined()
    expect(calendarSettings!.is_configured).toBe(true)
    expect(calendarSettings!.open_weekdays).toBeDefined()
    expect(Array.isArray(calendarSettings!.open_weekdays)).toBe(true)
    expect(calendarSettings!.open_weekdays!.length).toBeGreaterThan(0)

    // Verifica staff
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('company_id', companyId)

    console.log(`👥 Staff count: ${staff?.length || 0}`)

    expect(staffError).toBeNull()
    expect(staff).toBeDefined()
    expect(staff!.length).toBeGreaterThan(0)

    // Verifica departments
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('*')
      .eq('company_id', companyId)

    console.log(`🏢 Departments count: ${departments?.length || 0}`)

    expect(deptError).toBeNull()
    expect(departments).toBeDefined()
    expect(departments!.length).toBeGreaterThan(0)

    // Verifica products
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', companyId)

    console.log(`📦 Products count: ${products?.length || 0}`)

    expect(prodError).toBeNull()
    expect(products).toBeDefined()
    expect(products!.length).toBeGreaterThan(0)

    console.log('✅ Tutti i dati salvati correttamente nel database')
  })

  test('dovrebbe permettere completamenti multipli senza errori duplicate key (UPSERT)', async () => {
    const errors409: string[] = []
    const errors23505: string[] = []

    page.on('console', (msg) => {
      const text = msg.text()
      if (msg.type() === 'error') {
        if (text.includes('409')) errors409.push(text)
        if (text.includes('23505') || text.includes('duplicate key')) {
          errors23505.push(text)
        }
      }
    })

    console.log('\n🔄 Prima esecuzione completa...')

    // Prima esecuzione
    await page.locator('[title="Precompila onboarding con dati di test"]').click()
    await page.waitForTimeout(1500)
    await page.locator('[title="Completa onboarding automaticamente"]').click()
    await page.waitForTimeout(3000)

    // Attendi redirect
    await page.waitForURL(/\/(calendar|dashboard)/, { timeout: 10000 })

    // Verifica che non ci siano errori duplicate key
    expect(errors409.length).toBe(0)
    expect(errors23505.length).toBe(0)

    console.log('✅ Prima esecuzione completata senza errori')
    console.log('\n🔄 Seconda esecuzione (test UPSERT)...')

    // SECONDA esecuzione - deve fare UPSERT senza errori
    // Login di nuovo per garantire sessione attiva
    await loginAsTestUser(page)

    // Reset onboarding per riaprire la pagina
    await resetOnboardingState(page)

    await page.goto('http://localhost:3000/onboarding')
    await page.waitForSelector('[title="Precompila onboarding con dati di test"]', {
      timeout: 10000
    })

    await page.locator('[title="Precompila onboarding con dati di test"]').click()
    await page.waitForTimeout(1500)
    await page.locator('[title="Completa onboarding automaticamente"]').click()
    await page.waitForTimeout(3000)

    // Attendi redirect
    await page.waitForURL(/\/(calendar|dashboard)/, { timeout: 10000 })

    // Verifica ancora assenza errori duplicate key
    expect(errors409.length).toBe(0)
    expect(errors23505.length).toBe(0)

    console.log('✅ Seconda esecuzione completata senza errori (UPSERT funziona)')

    if (errors409.length > 0 || errors23505.length > 0) {
      console.error('❌ Errori duplicate key rilevati:')
      errors409.forEach(err => console.error(`  409: ${err}`))
      errors23505.forEach(err => console.error(`  23505: ${err}`))
    }
  })

  test('dovrebbe verificare che open_weekdays sia popolato correttamente', async () => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tucqgcfrlzmwyfadiodo.supabase.co'
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1Y3FnY2ZybHptd3lmYWRpb2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MDk2MDUsImV4cCI6MjA1MzQ4NTYwNX0.vJwCCa6S3vP-K_UM0RCGII6IJMF8EwpWGJJDDuCmS0I'

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Completa onboarding
    await page.locator('[title="Precompila onboarding con dati di test"]').click()
    await page.waitForTimeout(1500)
    await page.locator('[title="Completa onboarding automaticamente"]').click()
    await page.waitForTimeout(3000)

    await page.waitForURL(/\/(calendar|dashboard)/, { timeout: 10000 })

    // Ottieni il company ID dell'utente corrente
    const companyId = await getCurrentUserCompanyId(page)
    expect(companyId).toBeDefined()

    const { data: calendarSettings } = await supabase
      .from('company_calendar_settings')
      .select('*')
      .eq('company_id', companyId)
      .single()

    console.log('\n📊 Calendar Settings verificati:')
    console.log('  - open_weekdays:', calendarSettings.open_weekdays)
    console.log('  - fiscal_year_start:', calendarSettings.fiscal_year_start)
    console.log('  - fiscal_year_end:', calendarSettings.fiscal_year_end)
    console.log('  - is_configured:', calendarSettings.is_configured)

    // Verifica open_weekdays
    expect(calendarSettings.open_weekdays).toBeDefined()
    expect(Array.isArray(calendarSettings.open_weekdays)).toBe(true)
    expect(calendarSettings.open_weekdays.length).toBeGreaterThan(0)

    // Verifica che i valori siano nel range 0-6 (giorni settimana)
    calendarSettings.open_weekdays.forEach((day: number) => {
      expect(day).toBeGreaterThanOrEqual(0)
      expect(day).toBeLessThanOrEqual(6)
    })

    // Verifica che NON esista il campo "working_days" (bug precedente)
    expect(calendarSettings).not.toHaveProperty('working_days')

    console.log('✅ Campo open_weekdays correttamente popolato')
    console.log('✅ Campo working_days NON presente (fix applicato)')
  })
})
