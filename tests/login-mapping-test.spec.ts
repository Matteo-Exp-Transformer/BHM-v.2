import { test, expect } from '@playwright/test'

test.describe('Login Page - Mappatura Campi', () => {
  test('Mappare tutti i campi della pagina di login', async ({ page }) => {
    // Naviga alla pagina di login
    await page.goto('/sign-in')
    await page.waitForLoadState('networkidle')
    
    console.log('=== MAPPATURA PAGINA LOGIN ===')
    
    // Verifica il titolo della pagina
    const title = await page.title()
    console.log('Titolo pagina:', title)
    
    // Verifica l'URL corrente
    console.log('URL corrente:', page.url())
    
    // Mappa tutti gli input
    const inputs = page.locator('input')
    const inputCount = await inputs.count()
    console.log(`\nTrovati ${inputCount} input:`)
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      const type = await input.getAttribute('type')
      const name = await input.getAttribute('name')
      const id = await input.getAttribute('id')
      const placeholder = await input.getAttribute('placeholder')
      const value = await input.inputValue()
      
      console.log(`  Input ${i + 1}:`)
      console.log(`    Type: ${type}`)
      console.log(`    Name: ${name}`)
      console.log(`    ID: ${id}`)
      console.log(`    Placeholder: ${placeholder}`)
      console.log(`    Value: ${value}`)
    }
    
    // Mappa tutti i button
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    console.log(`\nTrovati ${buttonCount} button:`)
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const text = await button.textContent()
      const type = await button.getAttribute('type')
      const className = await button.getAttribute('class')
      
      console.log(`  Button ${i + 1}:`)
      console.log(`    Text: "${text}"`)
      console.log(`    Type: ${type}`)
      console.log(`    Class: ${className}`)
    }
    
    // Mappa tutti i form
    const forms = page.locator('form')
    const formCount = await forms.count()
    console.log(`\nTrovati ${formCount} form:`)
    
    for (let i = 0; i < formCount; i++) {
      const form = forms.nth(i)
      const action = await form.getAttribute('action')
      const method = await form.getAttribute('method')
      const className = await form.getAttribute('class')
      
      console.log(`  Form ${i + 1}:`)
      console.log(`    Action: ${action}`)
      console.log(`    Method: ${method}`)
      console.log(`    Class: ${className}`)
    }
    
    // Mappa tutti i link
    const links = page.locator('a')
    const linkCount = await links.count()
    console.log(`\nTrovati ${linkCount} link:`)
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i)
      const text = await link.textContent()
      const href = await link.getAttribute('href')
      
      console.log(`  Link ${i + 1}:`)
      console.log(`    Text: "${text}"`)
      console.log(`    Href: ${href}`)
    }
    
    // Verifica se ci sono messaggi di errore
    const errorMessages = page.locator('[data-testid="error"], .error, .alert-error, [role="alert"]')
    const errorCount = await errorMessages.count()
    console.log(`\nTrovati ${errorCount} messaggi di errore:`)
    
    for (let i = 0; i < errorCount; i++) {
      const error = errorMessages.nth(i)
      const text = await error.textContent()
      console.log(`  Errore ${i + 1}: "${text}"`)
    }
    
    // Verifica se ci sono elementi di loading
    const loadingElements = page.locator('[data-testid="loading"], .loading, .spinner')
    const loadingCount = await loadingElements.count()
    console.log(`\nTrovati ${loadingCount} elementi di loading:`)
    
    for (let i = 0; i < loadingCount; i++) {
      const loading = loadingElements.nth(i)
      const text = await loading.textContent()
      console.log(`  Loading ${i + 1}: "${text}"`)
    }
    
    console.log('\n=== FINE MAPPATURA ===')
    
    // Verifica che almeno il form di login sia presente
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button')).toBeVisible()
  })
  
  test('Testare il login con i campi mappati', async ({ page }) => {
    // Naviga alla pagina di login
    await page.goto('/sign-in')
    await page.waitForLoadState('networkidle')
    
    console.log('=== TEST LOGIN CON CAMPI MAPPATI ===')
    
    // Trova l'input email
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()
    
    // Trova l'input password
    const passwordInput = page.locator('input[type="password"]')
    await expect(passwordInput).toBeVisible()
    
    // Trova il button di submit
    const submitButton = page.locator('button[type="submit"], button:has-text("Accedi")')
    await expect(submitButton).toBeVisible()
    
    // Verifica i valori precompilati
    const emailValue = await emailInput.inputValue()
    const passwordValue = await passwordInput.inputValue()
    
    console.log(`Email precompilata: "${emailValue}"`)
    console.log(`Password precompilata: "${passwordValue}"`)
    
    // Prova a fare il login
    console.log('Tentativo di login...')
    await submitButton.click()
    
    // Attendi e verifica il risultato
    await page.waitForTimeout(3000)
    
    const currentUrl = page.url()
    console.log(`URL dopo login: ${currentUrl}`)
    
    if (currentUrl.includes('/sign-in')) {
      console.log('❌ Login fallito - rimane sulla pagina di login')
      
      // Verifica se ci sono messaggi di errore
      const errorMessages = page.locator('[data-testid="error"], .error, .alert-error, [role="alert"]')
      const errorCount = await errorMessages.count()
      
      if (errorCount > 0) {
        console.log('Messaggi di errore trovati:')
        for (let i = 0; i < errorCount; i++) {
          const error = errorMessages.nth(i)
          const text = await error.textContent()
          console.log(`  - ${text}`)
        }
      } else {
        console.log('Nessun messaggio di errore visibile')
      }
    } else {
      console.log('✅ Login riuscito - reindirizzato a:', currentUrl)
    }
    
    console.log('=== FINE TEST LOGIN ===')
  })
})
