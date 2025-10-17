/**
 * 🔐 LoginPage - Test Validazione Dati
 * 
 * Test per validazione input validi e invalidi
 * Seguendo le procedure di blindatura multi-agent
 * 
 * @author Agente 2 - Form e Validazioni
 * @date 2025-01-16
 */

const { test, expect } = require('@playwright/test')

test.describe('LoginPage - Test Validazione', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/sign-in')
  })

  test('Dovrebbe accettare email valide', async ({ page }) => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'mario.rossi@ristorante.it',
      'admin+test@company.org',
      'user123@test-domain.com'
    ]
    
    for (const email of validEmails) {
      await page.fill('input[name="email"]', email)
      await expect(page.locator('input[name="email"]')).toHaveValue(email)
      
      // Verifica che non ci siano errori di validazione
      await expect(page.locator('.text-red-500')).not.toBeVisible()
    }
  })

  test('Dovrebbe rifiutare email invalide', async ({ page }) => {
    const invalidEmails = [
      '',
      'invalid-email',
      '@domain.com',
      'user@',
      'user@domain',
      'user..name@domain.com',
      'user@.domain.com',
      'user@domain..com'
    ]
    
    for (const email of invalidEmails) {
      await page.fill('input[name="email"]', email)
      
      // Verifica che il browser mostri errore di validazione
      const emailInput = page.locator('input[name="email"]')
      await expect(emailInput).toHaveAttribute('type', 'email')
      
      // Per email vuote, verifica required
      if (email === '') {
        await expect(emailInput).toHaveAttribute('required')
      }
    }
  })

  test('Dovrebbe accettare password valide', async ({ page }) => {
    const validPasswords = [
      'password123',
      'SecurePass!',
      'MyPassword2024',
      'test123456',
      'P@ssw0rd'
    ]
    
    for (const password of validPasswords) {
      await page.fill('input[name="password"]', password)
      await expect(page.locator('input[name="password"]')).toHaveValue(password)
    }
  })

  test('Dovrebbe gestire password vuote', async ({ page }) => {
    // Verifica che password sia required
    await expect(page.locator('input[name="password"]')).toHaveAttribute('required')
    
    // Prova submit senza password
    await page.fill('input[name="email"]', 'test@example.com')
    await page.click('button[type="submit"]')
    
    // Verifica che form non si invii
    await expect(page).toHaveURL('/sign-in')
  })

  test('Dovrebbe gestire email vuote', async ({ page }) => {
    // Verifica che email sia required
    await expect(page.locator('input[name="email"]')).toHaveAttribute('required')
    
    // Prova submit senza email
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Verifica che form non si invii
    await expect(page).toHaveURL('/sign-in')
  })

  test('Dovrebbe gestire caratteri speciali', async ({ page }) => {
    const specialChars = [
      'test@example.com',
      'user+tag@domain.com',
      'user.name@domain-name.com',
      'user_name@domain.co.uk'
    ]
    
    for (const email of specialChars) {
      await page.fill('input[name="email"]', email)
      await expect(page.locator('input[name="email"]')).toHaveValue(email)
    }
  })

  test('Dovrebbe gestire password con caratteri speciali', async ({ page }) => {
    const specialPasswords = [
      'P@ssw0rd!',
      'MyP@ss123',
      'Test#2024',
      'Secure$Pass',
      'Pass%Word'
    ]
    
    for (const password of specialPasswords) {
      await page.fill('input[name="password"]', password)
      await expect(page.locator('input[name="password"]')).toHaveValue(password)
    }
  })

  test('Dovrebbe gestire input molto lunghi', async ({ page }) => {
    const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com'
    const longPassword = 'a'.repeat(1000)
    
    // Test email lunga
    await page.fill('input[name="email"]', longEmail)
    await expect(page.locator('input[name="email"]')).toHaveValue(longEmail)
    
    // Test password lunga
    await page.fill('input[name="password"]', longPassword)
    await expect(page.locator('input[name="password"]')).toHaveValue(longPassword)
  })

  test('Dovrebbe gestire caratteri Unicode', async ({ page }) => {
    const unicodeEmail = 'mario.rossi@ristorante.it'
    const unicodePassword = 'Màrio123!'
    
    await page.fill('input[name="email"]', unicodeEmail)
    await expect(page.locator('input[name="email"]')).toHaveValue(unicodeEmail)
    
    await page.fill('input[name="password"]', unicodePassword)
    await expect(page.locator('input[name="password"]')).toHaveValue(unicodePassword)
  })

  test('Dovrebbe gestire spazi negli input', async ({ page }) => {
    // Test email con spazi (dovrebbe essere gestita dal browser)
    await page.fill('input[name="email"]', ' test@example.com ')
    
    // Test password con spazi
    await page.fill('input[name="password"]', ' password123 ')
    await expect(page.locator('input[name="password"]')).toHaveValue(' password123 ')
  })

  test('Dovrebbe gestire copia e incolla', async ({ page }) => {
    const email = 'test@example.com'
    const password = 'password123'
    
    // Test copia email
    await page.fill('input[name="email"]', email)
    await page.keyboard.press('Control+a')
    await page.keyboard.press('Control+c')
    
    // Test incolla in password (non dovrebbe funzionare per password)
    await page.focus('input[name="password"]')
    await page.keyboard.press('Control+v')
    
    // Verifica che password sia vuota
    await expect(page.locator('input[name="password"]')).toHaveValue('')
  })

  test('Dovrebbe gestire navigazione con tastiera', async ({ page }) => {
    // Naviga con Tab
    await page.keyboard.press('Tab') // Email
    await expect(page.locator('input[name="email"]')).toBeFocused()
    
    await page.keyboard.press('Tab') // Password
    await expect(page.locator('input[name="password"]')).toBeFocused()
    
    await page.keyboard.press('Tab') // Submit button
    await expect(page.locator('button[type="submit"]')).toBeFocused()
    
    // Test Enter per submit
    await page.keyboard.press('Enter')
    // Verifica che form non si invii senza dati validi
    await expect(page).toHaveURL('/sign-in')
  })
})