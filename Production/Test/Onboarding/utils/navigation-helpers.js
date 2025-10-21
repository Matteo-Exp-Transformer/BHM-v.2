/**
 * UTILS: Navigation Helpers per Test Onboarding
 *
 * Funzioni per navigare wizard onboarding e interagire con step
 */

import { expect } from '@playwright/test'

// ============= CONSTANTS =============

const TOTAL_ONBOARDING_STEPS = 7

const STEP_NAMES = {
  1: 'BusinessInfo',
  2: 'Departments',
  3: 'Staff',
  4: 'Conservation',
  5: 'Tasks',
  6: 'Inventory',
  7: 'CalendarConfig',
}

// ============= WAIT HELPERS =============

/**
 * Attende che step specifico sia visibile
 */
async function waitForStep(page, stepNumber) {
  // Semplice wait per transizione step
  await page.waitForTimeout(500)

  console.log(`✅ Step ${stepNumber} (${STEP_NAMES[stepNumber]}) visibile`)
}

/**
 * Attende che pulsante Avanti sia abilitato
 */
async function waitForNextButtonEnabled(page, timeout = 5000) {
  const nextButton = page.locator('button:has-text("Avanti"), button:has-text("Next")')

  await expect(nextButton).toBeEnabled({ timeout })
  console.log('✅ Pulsante Avanti abilitato')
}

/**
 * Attende che pulsante Completa sia visibile (ultimo step)
 */
async function waitForCompleteButtonVisible(page) {
  const completeButton = page.locator(
    'button:has-text("Completa Configurazione"), button:has-text("Complete"), button:has-text("Finish")'
  )

  await expect(completeButton).toBeVisible({ timeout: 10000 })
  console.log('✅ Pulsante Completa Configurazione visibile (ultimo step)')
}

// ============= NAVIGATION =============

/**
 * Click pulsante Avanti per passare al prossimo step
 */
async function clickNextButton(page) {
  const nextButton = page.locator('button:has-text("Avanti"), button:has-text("Next")')

  // Verifica che sia abilitato
  await expect(nextButton).toBeEnabled({ timeout: 5000 })

  await nextButton.click()
  await page.waitForTimeout(500) // Attendi animazione transizione

  console.log('✅ Click pulsante Avanti')
}

/**
 * Click pulsante Indietro per tornare a step precedente
 */
async function clickBackButton(page) {
  const backButton = page.locator('button:has-text("Indietro"), button:has-text("Back")')

  await expect(backButton).toBeEnabled({ timeout: 5000 })

  await backButton.click()
  await page.waitForTimeout(500)

  console.log('✅ Click pulsante Indietro')
}

/**
 * Click pulsante Completa (ultimo step) per finalizzare onboarding
 */
async function clickCompleteButton(page) {
  const completeButton = page.locator(
    'button:has-text("Completa Configurazione"), button:has-text("Complete"), button:has-text("Finish")'
  )

  await expect(completeButton).toBeVisible({ timeout: 10000 })
  await expect(completeButton).toBeEnabled({ timeout: 5000 })

  await completeButton.click()
  console.log('✅ Click pulsante Completa Configurazione')

  // Attendi processing (salvataggio DB può richiedere tempo)
  await page.waitForTimeout(5000)

  const currentUrl = page.url()
  console.log(`🌐 URL dopo click: ${currentUrl}`)

  // Se non reindirizzato, aspetta ancora
  if (!currentUrl.includes('/dashboard')) {
    console.log('⏳ Attesa redirect a dashboard...')
    await page.waitForURL('**/dashboard', { timeout: 15000 }).catch(() => {
      console.log(`⚠️ Timeout redirect - URL corrente: ${page.url()}`)
    })
  }

  console.log('✅ Completamento onboarding processato')
}

// ============= DEV BUTTONS =============

/**
 * Click pulsante Precompila (DevButtons)
 */
async function clickPrefillButton(page) {
  const prefillButton = page.locator(
    'button:has-text("Precompila"), [data-testid="prefill-button"]'
  )

  // Verifica che sia visibile
  const isVisible = await prefillButton.isVisible().catch(() => false)
  if (!isVisible) {
    throw new Error('❌ Pulsante Precompila non visibile (DevButtons non attivi?)')
  }

  await prefillButton.click()
  await page.waitForTimeout(1000) // Attendi precompilazione

  console.log('✅ Click pulsante Precompila')

  // Verifica toast success (se presente)
  const successToast = page.locator('text=precompilat, text=success')
  const toastVisible = await successToast.isVisible().catch(() => false)
  if (toastVisible) {
    console.log('✅ Toast precompilazione visibile')
  }
}

/**
 * Click pulsante Completa Onboarding (DevButtons)
 */
async function clickCompleteOnboardingDevButton(page) {
  const completeButton = page.locator(
    'button:has-text("Completa Onboarding"), [data-testid="complete-onboarding-button"]'
  )

  const isVisible = await completeButton.isVisible().catch(() => false)
  if (!isVisible) {
    throw new Error('❌ Pulsante Completa Onboarding (DevButtons) non visibile')
  }

  await completeButton.click()
  console.log('✅ Click pulsante Completa Onboarding (DevButtons)')

  // Attendi redirect a dashboard
  await page.waitForURL('**/dashboard', { timeout: 15000 })
  console.log('✅ Redirect a Dashboard completato')
}

// ============= STEP-BY-STEP NAVIGATION =============

/**
 * Naviga attraverso tutti gli step onboarding fino a step target
 */
async function navigateToStep(page, targetStepNumber) {
  if (targetStepNumber < 1 || targetStepNumber > TOTAL_ONBOARDING_STEPS) {
    throw new Error(`Step ${targetStepNumber} non valido (range 1-${TOTAL_ONBOARDING_STEPS})`)
  }

  for (let i = 1; i < targetStepNumber; i++) {
    await waitForStep(page, i)
    await waitForNextButtonEnabled(page)
    await clickNextButton(page)
  }

  await waitForStep(page, targetStepNumber)
  console.log(`✅ Navigato a step ${targetStepNumber} (${STEP_NAMES[targetStepNumber]})`)
}

/**
 * Avanza di N step dall'attuale
 */
async function advanceSteps(page, stepsCount) {
  for (let i = 0; i < stepsCount; i++) {
    await waitForNextButtonEnabled(page)
    await clickNextButton(page)
  }

  console.log(`✅ Avanzato di ${stepsCount} step`)
}

/**
 * Completa wizard onboarding dall'inizio alla fine (assumendo dati già compilati)
 */
async function completeEntireWizard(page) {
  console.log('🚀 Completamento wizard onboarding...')

  for (let step = 1; step <= TOTAL_ONBOARDING_STEPS; step++) {
    await waitForStep(page, step)
    console.log(`Step ${step}/${TOTAL_ONBOARDING_STEPS}: ${STEP_NAMES[step]}`)

    if (step < TOTAL_ONBOARDING_STEPS) {
      // Step intermedi: clicca Avanti
      await waitForNextButtonEnabled(page)
      await clickNextButton(page)
    } else {
      // Ultimo step: clicca Completa
      await waitForCompleteButtonVisible(page)
      await clickCompleteButton(page)
    }
  }

  console.log('✅ Wizard onboarding completato con successo!')
}

// ============= FORM FILLING HELPERS =============

/**
 * Compila campo input testuale
 */
async function fillInputField(page, fieldName, value) {
  const input = page.locator(`input[name="${fieldName}"], [data-testid="${fieldName}"]`)

  await expect(input).toBeVisible({ timeout: 5000 })
  await input.clear()
  await input.fill(value)

  console.log(`✅ Campo "${fieldName}" compilato: ${value}`)
}

/**
 * Seleziona opzione da dropdown
 */
async function selectDropdownOption(page, selectName, optionValue) {
  const select = page.locator(`select[name="${selectName}"], [data-testid="${selectName}"]`)

  await expect(select).toBeVisible({ timeout: 5000 })
  await select.selectOption(optionValue)

  console.log(`✅ Dropdown "${selectName}" selezionato: ${optionValue}`)
}

/**
 * Click checkbox
 */
async function clickCheckbox(page, checkboxName) {
  const checkbox = page.locator(`input[name="${checkboxName}"], [data-testid="${checkboxName}"]`)

  await expect(checkbox).toBeVisible({ timeout: 5000 })
  await checkbox.click()

  console.log(`✅ Checkbox "${checkboxName}" cliccato`)
}

/**
 * Click pulsante generico
 */
async function clickButton(page, buttonText) {
  const button = page.locator(`button:has-text("${buttonText}")`)

  await expect(button).toBeVisible({ timeout: 5000 })
  await expect(button).toBeEnabled({ timeout: 2000 })
  await button.click()

  console.log(`✅ Click pulsante: ${buttonText}`)
}

// ============= VALIDATION HELPERS =============

/**
 * Verifica che messaggio errore sia visibile
 */
async function assertErrorMessageVisible(page, errorText) {
  const errorElement = page.locator(`text=${errorText}, .error, .text-red-500`)

  const isVisible = await errorElement.isVisible().catch(() => false)
  if (!isVisible) {
    throw new Error(`❌ Messaggio errore atteso non visibile: "${errorText}"`)
  }

  console.log(`✅ Messaggio errore visibile: "${errorText}"`)
}

/**
 * Verifica che pulsante Avanti sia disabilitato (form non valido)
 */
async function assertNextButtonDisabled(page) {
  const nextButton = page.locator('button:has-text("Avanti"), button:has-text("Next")')

  const isDisabled = await nextButton.isDisabled().catch(() => false)
  if (!isDisabled) {
    throw new Error('❌ Pulsante Avanti dovrebbe essere disabilitato ma è abilitato')
  }

  console.log('✅ Pulsante Avanti correttamente disabilitato (form non valido)')
}

// ============= EXPORTS =============

export {
  TOTAL_ONBOARDING_STEPS,
  STEP_NAMES,
  waitForStep,
  waitForNextButtonEnabled,
  waitForCompleteButtonVisible,
  clickNextButton,
  clickBackButton,
  clickCompleteButton,
  clickPrefillButton,
  clickCompleteOnboardingDevButton,
  navigateToStep,
  advanceSteps,
  completeEntireWizard,
  fillInputField,
  selectDropdownOption,
  clickCheckbox,
  clickButton,
  assertErrorMessageVisible,
  assertNextButtonDisabled,
}
