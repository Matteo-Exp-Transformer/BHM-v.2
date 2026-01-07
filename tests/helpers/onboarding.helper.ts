import { Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

/**
 * Helper per gestire lo stato dell'onboarding nei test E2E
 */

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tucqgcfrlzmwyfadiodo.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1Y3FnY2ZybHptd3lmYWRpb2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MDk2MDUsImV4cCI6MjA1MzQ4NTYwNX0.vJwCCa6S3vP-K_UM0RCGII6IJMF8EwpWGJJDDuCmS0I'

/**
 * Resetta lo stato dell'onboarding per l'utente corrente
 *
 * Questo permette di accedere nuovamente alla pagina /onboarding
 * anche se l'utente aveva già completato il processo.
 *
 * @param page - Istanza Page di Playwright
 * @returns Promise<void>
 */
export async function resetOnboardingState(page: Page): Promise<void> {
  console.log('🔄 Resetto stato onboarding...')

  // Usa il pulsante "Reset Tot+Users" se disponibile
  const resetButton = page.locator('button:has-text("Reset Tot+Users")')

  if (await resetButton.isVisible({ timeout: 2000 })) {
    console.log('✅ Trovato pulsante Reset, lo uso...')
    await resetButton.click()
    await page.waitForTimeout(2000)
    console.log('✅ Onboarding resettato con pulsante Reset')
    return
  }

  // Altrimenti usa approccio database diretto
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Ottieni l'utente corrente dal localStorage
  const storageState = await page.evaluate(() => {
    const authStorage = localStorage.getItem('sb-tucqgcfrlzmwyfadiodo-auth-token')
    return authStorage ? JSON.parse(authStorage) : null
  })

  if (!storageState || !storageState.user) {
    console.warn('⚠️ Nessun utente autenticato trovato')
    return
  }

  const userId = storageState.user.id

  // Trova la company dell'utente
  const { data: memberData } = await supabase
    .from('company_members')
    .select('company_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (!memberData) {
    console.log('✅ Nessuna company trovata, onboarding già resettato')
    return
  }

  const companyId = memberData.company_id

  // Elimina i dati dell'onboarding
  console.log(`🗑️ Elimino dati onboarding per company: ${companyId}`)

  // Elimina calendar settings
  await supabase
    .from('company_calendar_settings')
    .delete()
    .eq('company_id', companyId)

  // Elimina staff
  await supabase
    .from('staff')
    .delete()
    .eq('company_id', companyId)

  // Elimina departments
  await supabase
    .from('departments')
    .delete()
    .eq('company_id', companyId)

  // Elimina products
  await supabase
    .from('products')
    .delete()
    .eq('company_id', companyId)

  // Marca la company come non configurata
  await supabase
    .from('companies')
    .update({ is_onboarding_completed: false })
    .eq('id', companyId)

  console.log('✅ Onboarding resettato con successo (database)')
}

/**
 * Verifica se l'onboarding è stato completato
 *
 * @param page - Istanza Page di Playwright
 * @returns Promise<boolean>
 */
export async function isOnboardingCompleted(page: Page): Promise<boolean> {
  // Se siamo reindirizzati al dashboard quando proviamo ad accedere a /onboarding,
  // significa che l'onboarding è già completato
  await page.goto('/onboarding', { waitUntil: 'networkidle' })

  const currentUrl = page.url()

  return currentUrl.includes('/dashboard') || currentUrl.includes('/calendar')
}

/**
 * Ottiene il company_id dell'utente corrente
 *
 * @param page - Istanza Page di Playwright
 * @returns Promise<string | null>
 */
export async function getCurrentUserCompanyId(page: Page): Promise<string | null> {
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Cerca in tutte le chiavi localStorage possibili
  const storageState = await page.evaluate(() => {
    // Cerca la chiave auth di Supabase (potrebbe avere diversi formati)
    for (const key of Object.keys(localStorage)) {
      if (key.includes('auth') && key.includes('token')) {
        const value = localStorage.getItem(key)
        if (value) {
          try {
            const parsed = JSON.parse(value)
            if (parsed.user && parsed.user.id) {
              return parsed
            }
          } catch (e) {
            // Ignora errori di parsing
          }
        }
      }
    }
    return null
  })

  if (!storageState || !storageState.user) {
    console.warn('⚠️ Nessun utente autenticato trovato in localStorage')
    return null
  }

  const userId = storageState.user.id

  // Trova la company dell'utente
  const { data: memberData } = await supabase
    .from('company_members')
    .select('company_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (!memberData) {
    console.warn(`⚠️ Nessuna company trovata per user: ${userId}`)
    return null
  }

  return memberData.company_id
}
