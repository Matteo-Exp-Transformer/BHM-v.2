import { test, expect } from '@playwright/test'
import { loginAsTestUser } from '../helpers/auth.helper'

/**
 * Test E2E - Filtro Categorie per Tipo Punto di Conservazione
 *
 * Verifica che il filtro delle categorie funzioni correttamente:
 * - Solo categorie compatibili con il tipo di punto selezionato sono visibili
 * - Verifica storage_type e sovrapposizione range temperatura
 * - Auto-deselect di categorie incompatibili quando si cambia tipo punto
 */

test.describe('Conservation Category Filtering - AddPointModal', () => {
  test.beforeEach(async ({ page }) => {
    // Login con credenziali di test
    await loginAsTestUser(page)

    // Attendere che il router sia stabilizzato dopo il login
    await page.waitForLoadState('networkidle')

    // Naviga alla pagina conservation
    await page.goto('/conservazione', { waitUntil: 'domcontentloaded' })
    await page.waitForURL(/\/conservazione/, { timeout: 10000 })

    // Attendi che la pagina sia caricata
    await expect(page.locator('text=Sistema di Conservazione').first()).toBeVisible({
      timeout: 10000
    })
  })

  test('Fridge: mostra solo categorie compatibili', async ({ page }) => {
    // Clicca "Nuovo Punto di Conservazione"
    const addButton = page.locator('button:has-text("Nuovo Punto")')
    await addButton.click()

    // Attendi che il modal si apra
    await expect(page.locator('text=Aggiungi Punto di Conservazione')).toBeVisible()

    // Seleziona tipo "Frigorifero"
    const fridgeButton = page.locator('button:has-text("Frigorifero")').first()
    await fridgeButton.click()

    // Attendi un momento per il rendering delle categorie
    await page.waitForTimeout(500)

    // Verifica che categorie fridge siano visibili
    // Note: questi nomi devono corrispondere alle categorie nel database di test
    // Almeno una categoria fridge dovrebbe essere visibile
    const fridgeCategories = await page.locator('button').filter({ hasText: /Carni|Latticini|Verdure|Pesce/ }).count()
    expect(fridgeCategories).toBeGreaterThan(0)

    // Verifica che categorie freezer NON siano visibili
    const congelatiButton = page.locator('button:has-text("Congelati")')
    await expect(congelatiButton).not.toBeVisible()
  })

  test('Freezer: mostra solo categorie freezer', async ({ page }) => {
    // Apri modal
    const addButton = page.locator('button:has-text("Nuovo Punto")')
    await addButton.click()
    await expect(page.locator('text=Aggiungi Punto di Conservazione')).toBeVisible()

    // Seleziona tipo "Congelatore"
    const freezerButton = page.locator('button:has-text("Congelatore")').first()
    await freezerButton.click()
    await page.waitForTimeout(500)

    // Verifica che categoria freezer sia visibile
    const congelatiButton = page.locator('button:has-text("Congelati")')
    await expect(congelatiButton).toBeVisible({ timeout: 5000 })

    // Verifica che categorie fridge NON siano visibili
    const carniFrescheButton = page.locator('button:has-text("Carni fresche")')
    await expect(carniFrescheButton).not.toBeVisible()
  })

  test('Ambient: mostra solo categorie ambient', async ({ page }) => {
    // Apri modal
    const addButton = page.locator('button:has-text("Nuovo Punto")')
    await addButton.click()
    await expect(page.locator('text=Aggiungi Punto di Conservazione')).toBeVisible()

    // Seleziona tipo "Ambiente (dispense)"
    const ambientButton = page.locator('button:has-text("Ambiente")').first()
    await ambientButton.click()
    await page.waitForTimeout(500)

    // Verifica che categoria ambient sia visibile
    const dispensaButton = page.locator('button:has-text("Dispensa")')
    await expect(dispensaButton).toBeVisible({ timeout: 5000 })

    // Verifica che categorie fridge NON siano visibili
    const carniFrescheButton = page.locator('button:has-text("Carni fresche")')
    await expect(carniFrescheButton).not.toBeVisible()

    // Verifica che categorie freezer NON siano visibili
    const congelatiButton = page.locator('button:has-text("Congelati")')
    await expect(congelatiButton).not.toBeVisible()
  })

  test('Cambio tipo punto: aggiorna categorie disponibili', async ({ page }) => {
    // Apri modal
    const addButton = page.locator('button:has-text("Nuovo Punto")')
    await addButton.click()
    await expect(page.locator('text=Aggiungi Punto di Conservazione')).toBeVisible()

    // Start with Fridge
    const fridgeButton = page.locator('button:has-text("Frigorifero")').first()
    await fridgeButton.click()
    await page.waitForTimeout(500)

    // Verifica categorie fridge
    const fridgeCategories = await page.locator('button').filter({ hasText: /Carni|Latticini/ }).count()
    expect(fridgeCategories).toBeGreaterThan(0)

    // Cambia a Freezer
    const freezerButton = page.locator('button:has-text("Congelatore")').first()
    await freezerButton.click()
    await page.waitForTimeout(500)

    // Verifica che categorie freezer siano ora visibili
    const congelatiButton = page.locator('button:has-text("Congelati")')
    await expect(congelatiButton).toBeVisible({ timeout: 5000 })

    // Verifica che categorie fridge non siano più visibili
    const carniFrescheButton = page.locator('button:has-text("Carni fresche")')
    await expect(carniFrescheButton).not.toBeVisible()
  })

  test('Categorie selezionate vengono deselezionate se incompatibili', async ({ page }) => {
    // Apri modal
    const addButton = page.locator('button:has-text("Nuovo Punto")')
    await addButton.click()
    await expect(page.locator('text=Aggiungi Punto di Conservazione')).toBeVisible()

    // Seleziona Fridge
    const fridgeButton = page.locator('button:has-text("Frigorifero")').first()
    await fridgeButton.click()
    await page.waitForTimeout(500)

    // Seleziona una categoria fridge (se disponibile)
    const carniFrescheButton = page.locator('button:has-text("Carni fresche")').first()
    const isCarniFrescheVisible = await carniFrescheButton.isVisible()

    if (isCarniFrescheVisible) {
      await carniFrescheButton.click()
      await page.waitForTimeout(300)

      // Cambia a Freezer
      const freezerButton = page.locator('button:has-text("Congelatore")').first()
      await freezerButton.click()
      await page.waitForTimeout(500)

      // Verifica che "Carni fresche" NON sia più selezionata
      // Il badge dovrebbe scomparire o il pulsante tornare non-selezionato
      const carniFrescheStillVisible = await carniFrescheButton.isVisible()
      expect(carniFrescheStillVisible).toBe(false)
    }
  })

  test('Blast chiller: mostra solo categorie blast', async ({ page }) => {
    // Apri modal
    const addButton = page.locator('button:has-text("Nuovo Punto")')
    await addButton.click()
    await expect(page.locator('text=Aggiungi Punto di Conservazione')).toBeVisible()

    // Seleziona tipo "Abbattitore"
    const blastButton = page.locator('button:has-text("Abbattitore")').first()
    await blastButton.click()
    await page.waitForTimeout(500)

    // Verifica che categorie fridge/freezer NON siano visibili
    const carniFrescheButton = page.locator('button:has-text("Carni fresche")')
    await expect(carniFrescheButton).not.toBeVisible()

    const congelatiButton = page.locator('button:has-text("Congelati")')
    await expect(congelatiButton).not.toBeVisible()
  })
})

test.describe('Conservation Category Filtering - Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    // Login con credenziali di test
    await loginAsTestUser(page)

    // Attendere che il router sia stabilizzato
    await page.waitForLoadState('networkidle')

    // Naviga direttamente allo step Conservation dell'onboarding (step 4)
    await page.goto('/onboarding?step=4', { waitUntil: 'domcontentloaded' })
    await page.waitForURL(/\/onboarding/, { timeout: 10000 })

    // Attendi che lo step sia caricato
    await expect(page.locator('text=Punti di Conservazione')).toBeVisible({
      timeout: 10000
    })
  })

  test('Onboarding: Fridge mostra solo categorie compatibili', async ({ page }) => {
    // Clicca "Aggiungi Punto" o equivalente nell'onboarding
    const addButton = page.locator('button:has-text("Aggiungi")').first()
    await addButton.click()
    await page.waitForTimeout(500)

    // Seleziona tipo Frigorifero
    const fridgeButton = page.locator('button:has-text("Frigorifero")').first()
    await fridgeButton.click()
    await page.waitForTimeout(500)

    // Verifica che categorie fridge siano visibili
    const fridgeCategories = await page.locator('button').filter({ hasText: /Carni|Latticini/ }).count()
    expect(fridgeCategories).toBeGreaterThan(0)

    // Verifica che categorie freezer NON siano visibili
    const congelatiButton = page.locator('button:has-text("Congelati")')
    await expect(congelatiButton).not.toBeVisible()
  })

  test('Onboarding: Cambio tipo punto aggiorna categorie', async ({ page }) => {
    // Aggiungi punto
    const addButton = page.locator('button:has-text("Aggiungi")').first()
    await addButton.click()
    await page.waitForTimeout(500)

    // Seleziona Fridge
    const fridgeButton = page.locator('button:has-text("Frigorifero")').first()
    await fridgeButton.click()
    await page.waitForTimeout(500)

    // Verifica categorie fridge
    const carniFrescheButton = page.locator('button:has-text("Carni fresche")').first()
    const isCarniFrescheVisible = await carniFrescheButton.isVisible()

    if (isCarniFrescheVisible) {
      // Cambia a Freezer
      const freezerButton = page.locator('button:has-text("Congelatore")').first()
      await freezerButton.click()
      await page.waitForTimeout(500)

      // Verifica che Congelati sia ora visibile
      const congelatiButton = page.locator('button:has-text("Congelati")')
      await expect(congelatiButton).toBeVisible({ timeout: 5000 })

      // Verifica che Carni fresche NON sia più visibile
      await expect(carniFrescheButton).not.toBeVisible()
    }
  })
})
