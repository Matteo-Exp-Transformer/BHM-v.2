/**
 * TEST 1: Onboarding Completo con Pulsante Precompila
 *
 * Flusso:
 * 1. Login utente test
 * 2. Click pulsante "Precompila" una sola volta all'inizio
 * 3. Avanza attraverso tutti i 7 step (dati già precompilati)
 * 4. Completa onboarding
 *
 * Assert:
 * A. Onboarding completato con successo (redirect a /dashboard)
 * B. Query Supabase: Verifica TUTTI i dati in DB
 * C. Navigate alle tab app: Verifica dati visibili in UI
 *
 * Execution: Headless (no Chromium window) per MCP
 * Demo mode: Configurato in playwright.config (headed + slowMo)
 */

import { test, expect } from '@playwright/test'

// Fixtures
import { prefillBusinessData } from './fixtures/business-data.js'

// Utils
import {
  assertOnboardingComplete,
  getCurrentCompanyId,
  cleanupTestData,
} from './utils/supabase-assertions.js'

import { assertAllTabsShowData } from './utils/ui-assertions.js'

import {
  waitForStep,
  clickPrefillButton,
  clickNextButton,
  clickCompleteButton,
  waitForNextButtonEnabled,
  waitForCompleteButtonVisible,
  TOTAL_ONBOARDING_STEPS,
  STEP_NAMES,
} from './utils/navigation-helpers.js'

// ============= TEST CONFIGURATION =============

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'matteo.cavallaro.work@gmail.com'
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'your-password-here'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// Dati attesi da Precompila (basato su getPrefillData in onboardingHelpers.ts)
const EXPECTED_PRECOMPILA_DATA = {
  business: {
    businessName: 'Al Ritrovo SRL',
    address: 'Via San Pietro 14, 09170 Oristano OR',
    email: 'info@alritrovo.it',
    phone: '338 123 4567',
  },
  departments: [
    { name: 'Cucina' },
    { name: 'Bancone' },
    { name: 'Sala' },
    { name: 'Magazzino' },
    { name: 'Magazzino B' },
    { name: 'Sala B' },
    { name: 'Deoor / Esterno' },
    { name: 'Plonge / Lavaggio Piatti' },
  ],
  staff: [
    // Primo membro sarà sostituito con dati utente corrente
    { name: 'Paolo', surname: 'Dettori', email: TEST_USER_EMAIL, role: 'admin' },
    { name: 'Matteo', surname: 'Cavallaro' },
    { name: 'Luigi', surname: 'Mulas' },
    // Altri staff precompilati...
  ],
  conservationPoints: [
    { name: 'Frigo Cucina A', pointType: 'fridge', targetTemperature: 4 },
    { name: 'Freezer Cucina A', pointType: 'freezer', targetTemperature: -18 },
    { name: 'Dispensa Cucina A', pointType: 'ambient', targetTemperature: null },
    // Altri punti precompilati...
  ],
  tasksCount: 10, // Minimo tasks attesi
  productsCount: 5, // Minimo products attesi
  checkCalendar: true,
  checkStatsCards: true,
}

// ============= TEST SUITE =============

test.describe('TEST 1: Onboarding con Precompila', () => {
  let companyId = null

  // ============= BEFORE EACH: LOGIN =============

  test.beforeEach(async ({ page }) => {
    console.log('🚀 Setup: Navigazione e login...')

    // Naviga a login page
    await page.goto(`${BASE_URL}/sign-in`)
    await page.waitForLoadState('networkidle')

    // Verifica che i campi di login siano visibili
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()

    // Compila form login (selectors come test funzionante)
    console.log('📝 Compilazione credenziali...')
    await page.fill('input[type="email"]', TEST_USER_EMAIL)
    await page.fill('input[type="password"]', TEST_USER_PASSWORD)

    // Submit login - Click pulsante "Accedi"
    console.log('🔐 Invio credenziali...')
    await page.click('button:has-text("Accedi")')

    // Attendi che il login venga processato
    await page.waitForTimeout(3000)

    const currentUrl = page.url()
    console.log(`🌐 URL dopo login: ${currentUrl}`)

    // Se ancora su sign-in, prova approccio alternativo
    if (currentUrl.includes('/sign-in')) {
      console.log('⚠️ Login non riuscito, provo approccio alternativo...')
      await page.goto(`${BASE_URL}/dashboard`)
      await page.waitForLoadState('networkidle')
    }

    console.log('✅ Login completato, URL attuale:', page.url())

    // Se già in dashboard, naviga manualmente a onboarding per re-testare
    if (currentUrl.includes('/dashboard')) {
      console.log('⚠️ Utente già con onboarding completo, navigazione forzata a /onboarding')
      await page.goto(`${BASE_URL}/onboarding`)
      await page.waitForLoadState('networkidle')
    }

    // Verifica di essere su onboarding page
    await expect(page).toHaveURL(/.*onboarding/, { timeout: 5000 })
    console.log('✅ Setup completato: su pagina onboarding')
  })

  // ============= AFTER EACH: CLEANUP (opzionale) =============

  test.afterEach(async ({ page }) => {
    // NOTE: Cleanup commentato per permettere ispezione manuale post-test
    // Decommentare se si vuole pulire DB dopo ogni test

    // if (companyId) {
    //   console.log('🧹 Cleanup: Rimozione dati test...')
    //   await cleanupTestData(companyId)
    //   console.log('✅ Cleanup completato')
    // }
  })

  // ============= TEST PRINCIPALE =============

  test('dovrebbe completare onboarding usando pulsante Precompila', async ({ page }) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🧪 TEST 1: Onboarding con Precompila')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // ============= STEP 0: PRECOMPILA (UNA VOLTA SOLA) =============

    console.log('\n📝 STEP 0: Click pulsante Precompila')

    // Attendi che step 1 sia visibile
    await waitForStep(page, 1)

    // Click pulsante Precompila (deve essere visibile se DevButtons attivi)
    await clickPrefillButton(page)

    // Attendi che dati siano precompilati (localStorage aggiornato)
    await page.waitForTimeout(1000)

    console.log('✅ Dati precompilati caricati')

    // ============= STEPS 1-7: NAVIGAZIONE WIZARD =============

    console.log('\n🔄 Navigazione attraverso wizard onboarding...')

    for (let step = 1; step <= TOTAL_ONBOARDING_STEPS; step++) {
      console.log(`\n━━━ STEP ${step}/${TOTAL_ONBOARDING_STEPS}: ${STEP_NAMES[step]} ━━━`)

      // Verifica step corrente visibile
      await waitForStep(page, step)

      // Screenshot step (opzionale, utile per debug)
      // await page.screenshot({
      //   path: `Production/Test/Onboarding/screenshots/step-${step}-${STEP_NAMES[step]}.png`,
      //   fullPage: true,
      // })

      if (step < TOTAL_ONBOARDING_STEPS) {
        // Step intermedi 1-6: Click Avanti
        console.log(`  → Attesa pulsante Avanti abilitato...`)
        await waitForNextButtonEnabled(page, 10000) // Timeout maggiore per step complessi

        console.log(`  → Click Avanti`)
        await clickNextButton(page)

        // Attendi transizione
        await page.waitForTimeout(500)
      } else {
        // Step 7 (ultimo): Click Completa
        console.log(`  → Attesa pulsante Completa visibile...`)
        await waitForCompleteButtonVisible(page)

        console.log(`  → Click Completa Onboarding`)
        await clickCompleteButton(page)
      }

      console.log(`✅ Step ${step} completato`)
    }

    // ============= ASSERT A: ONBOARDING COMPLETATO =============

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ ASSERT A: Onboarding completato con successo')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Verifica redirect a dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 })
    console.log('✅ A. Redirect a /dashboard verificato')

    // Verifica che dashboard sia renderizzata
    const dashboardHeader = page.locator('h1, h2, [data-testid="dashboard-header"]')
    await expect(dashboardHeader).toBeVisible({ timeout: 10000 })
    console.log('✅ A. Dashboard renderizzata correttamente')

    // ============= ASSERT B: DATI IN SUPABASE =============

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔍 ASSERT B: Verifica dati in Supabase DB')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Ottieni company_id dell'utente corrente
    companyId = await getCurrentCompanyId(TEST_USER_EMAIL)

    if (!companyId) {
      throw new Error('❌ Company ID non trovato per utente test')
    }

    console.log(`✅ Company ID ottenuto: ${companyId}`)

    // Verifica TUTTI i dati onboarding in DB
    const dbResults = await assertOnboardingComplete(companyId, EXPECTED_PRECOMPILA_DATA)

    console.log('\n✅ B. Verifica Supabase completata:')
    console.log(`  - Business Info: ✓`)
    console.log(`  - Departments: ${dbResults.departments.length} creati`)
    console.log(`  - Staff: ${dbResults.staff.length} membri creati`)
    console.log(`  - Conservation Points: ${dbResults.conservationPoints.length} punti creati`)
    console.log(`  - Tasks: ${dbResults.tasks.length} tasks creati`)
    console.log(`  - Products: ${dbResults.products.length} prodotti creati`)
    console.log(`  - Calendar Settings: ${dbResults.calendarSettings ? '✓' : 'N/A'}`)

    // ============= ASSERT C: DATI VISIBILI IN UI =============

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🖥️  ASSERT C: Verifica dati visibili nelle tab UI')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Verifica dati in tutte le tab principali
    await assertAllTabsShowData(page, {
      business: EXPECTED_PRECOMPILA_DATA.business,
      departments: EXPECTED_PRECOMPILA_DATA.departments,
      staff: EXPECTED_PRECOMPILA_DATA.staff.slice(0, 3), // Verifica primi 3 staff
      conservationPoints: EXPECTED_PRECOMPILA_DATA.conservationPoints.slice(0, 3), // Primi 3 punti
      productsCount: EXPECTED_PRECOMPILA_DATA.productsCount,
      tasksCount: EXPECTED_PRECOMPILA_DATA.tasksCount,
      checkCalendar: EXPECTED_PRECOMPILA_DATA.checkCalendar,
      checkStatsCards: EXPECTED_PRECOMPILA_DATA.checkStatsCards,
    })

    console.log('\n✅ C. Verifica UI completata - Dati visibili in tutte le tab!')

    // ============= TEST COMPLETATO =============

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 TEST 1 COMPLETATO CON SUCCESSO!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ A. Onboarding completato')
    console.log('✅ B. Dati presenti in Supabase')
    console.log('✅ C. Dati visibili in UI')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  })
})
