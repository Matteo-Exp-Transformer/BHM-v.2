import { Page, expect } from '@playwright/test'
import { TEST_CREDENTIALS, LOGIN_SELECTORS, AUTH_TIMEOUTS } from '../auth.config'

/**
 * Helper per autenticazione nei test E2E
 *
 * Fornisce funzioni riutilizzabili per login, logout e verifica sessione
 */

/**
 * Esegue il login con le credenziali di test
 *
 * @param page - Istanza Page di Playwright
 * @param credentials - Credenziali opzionali (default: TEST_CREDENTIALS)
 * @returns Promise<void>
 *
 * @example
 * test('example', async ({ page }) => {
 *   await loginAsTestUser(page)
 *   // Test code...
 * })
 */
export async function loginAsTestUser(
  page: Page,
  credentials = TEST_CREDENTIALS
): Promise<void> {
  console.log('🔐 Eseguo login con credenziali test...')

  // Naviga alla pagina di login (sign-in)
  await page.goto('/sign-in')

  // Attendi che il form sia visibile
  await page.waitForSelector(LOGIN_SELECTORS.loginForm, {
    timeout: AUTH_TIMEOUTS.sessionCheck
  })

  // Compila email
  const emailInput = page.locator(LOGIN_SELECTORS.emailInput).first()
  await emailInput.waitFor({ state: 'visible', timeout: 5000 })
  await emailInput.clear()
  await emailInput.fill(credentials.email)

  // Compila password
  const passwordInput = page.locator(LOGIN_SELECTORS.passwordInput).first()
  await passwordInput.waitFor({ state: 'visible', timeout: 5000 })
  await passwordInput.clear()
  await passwordInput.fill(credentials.password)

  // Click sul pulsante di submit
  const submitButton = page.locator(LOGIN_SELECTORS.submitButton).first()
  await submitButton.click()

  // Attendi redirect dopo login (calendar, dashboard, o onboarding)
  await page.waitForURL(/\/(calendar|dashboard|onboarding)/, {
    timeout: AUTH_TIMEOUTS.redirect
  })

  console.log('✅ Login completato con successo')
}

/**
 * Esegue il logout
 *
 * @param page - Istanza Page di Playwright
 * @returns Promise<void>
 */
export async function logout(page: Page): Promise<void> {
  console.log('🚪 Eseguo logout...')

  // Cerca il pulsante di logout (può variare in base al design)
  const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Esci"), [data-testid="logout-button"]').first()

  if (await logoutButton.isVisible({ timeout: 2000 })) {
    await logoutButton.click()

    // Attendi redirect alla pagina di login (sign-in)
    await page.waitForURL(/\/sign-in/, {
      timeout: AUTH_TIMEOUTS.logout
    })

    console.log('✅ Logout completato')
  } else {
    console.warn('⚠️ Pulsante logout non trovato')
  }
}

/**
 * Verifica che l'utente sia autenticato
 *
 * @param page - Istanza Page di Playwright
 * @returns Promise<boolean>
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const currentUrl = page.url()

  // Se siamo su sign-in/register, l'utente NON è autenticato
  if (currentUrl.includes('/sign-in') || currentUrl.includes('/register')) {
    return false
  }

  // Se siamo su calendar/dashboard/onboarding, l'utente È autenticato
  if (currentUrl.match(/\/(calendar|dashboard|onboarding)/)) {
    return true
  }

  // Altrimenti verifica presenza elementi UI autenticati
  const isAuth = await page.locator('[data-authenticated="true"], .user-menu, .logged-in').isVisible({
    timeout: AUTH_TIMEOUTS.sessionCheck
  }).catch(() => false)

  return isAuth
}

/**
 * Naviga a una pagina protetta con auto-login se necessario
 *
 * @param page - Istanza Page di Playwright
 * @param url - URL della pagina protetta
 * @param credentials - Credenziali opzionali
 * @returns Promise<void>
 *
 * @example
 * await navigateWithAuth(page, '/calendar')
 */
export async function navigateWithAuth(
  page: Page,
  url: string,
  credentials = TEST_CREDENTIALS
): Promise<void> {
  await page.goto(url)

  // Se viene fatto redirect al login (sign-in), esegui login
  const currentUrl = page.url()
  if (currentUrl.includes('/sign-in')) {
    console.log('🔄 Redirect a sign-in rilevato, eseguo autenticazione...')
    await loginAsTestUser(page, credentials)

    // Naviga di nuovo alla pagina richiesta
    await page.goto(url)
  }
}

/**
 * Setup autenticazione per beforeEach
 *
 * Funzione helper per essere usata nei blocchi beforeEach
 *
 * @param page - Istanza Page di Playwright
 * @returns Promise<void>
 *
 * @example
 * test.beforeEach(async ({ page }) => {
 *   await setupAuth(page)
 * })
 */
export async function setupAuth(page: Page): Promise<void> {
  await loginAsTestUser(page)
}
