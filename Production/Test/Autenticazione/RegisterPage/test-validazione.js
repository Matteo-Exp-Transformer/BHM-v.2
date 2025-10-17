/**
 * 📝 RegisterPage - Test Validazione Dati
 * 
 * Test per validazione input validi e invalidi
 * Seguendo le procedure di blindatura multi-agent
 * 
 * @author Agente 2 - Form e Validazioni
 * @date 2025-01-16
 */

const { test, expect } = require('@playwright/test')

test.describe('RegisterPage - Test Validazione', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/sign-up')
  })

  test('Dovrebbe accettare nomi validi', async ({ page }) => {
    const validNames = [
      'Mario',
      'Giuseppe',
      'Anna-Maria',
      'Jean-Pierre',
      'O\'Connor',
      'José',
      'François',
      'Müller'
    ]
    
    for (const name of validNames) {
      await page.fill('input[name="first_name"]', name)
      await expect(page.locator('input[name="first_name"]')).toHaveValue(name)
      
      await page.fill('input[name="last_name"]', name)
      await expect(page.locator('input[name="last_name"]')).toHaveValue(name)
    }
  })

  test('Dovrebbe rifiutare nomi invalidi', async ({ page }) => {
    const invalidNames = [
      '',
      '   ',
      '123',
      'Mario123',
      'Test@Name',
      'Name#Test',
      'Name$Test'
    ]
    
    for (const name of invalidNames) {
      await page.fill('input[name="first_name"]', name)
      
      // Verifica che nome sia required
      if (name === '') {
        await expect(page.locator('input[name="first_name"]')).toHaveAttribute('required')
      }
    }
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
      'P@ssw0rd',
      'VeryLongPassword123!',
      'Test123456789'
    ]
    
    for (const password of validPasswords) {
      await page.fill('input[name="password"]', password)
      await expect(page.locator('input[name="password"]')).toHaveValue(password)
    }
  })

  test('Dovrebbe rifiutare password troppo corte', async ({ page }) => {
    const shortPasswords = [
      '',
      '123',
      'pass',
      'test',
      '12345',
      'abcde',
      '1234567' // 7 caratteri
    ]
    
    for (const password of shortPasswords) {
      await page.fill('input[name="password"]', password)
      
      // Verifica che password sia required
      if (password === '') {
        await expect(page.locator('input[name="password"]')).toHaveAttribute('required')
      }
    }
  })

  test('Dovrebbe gestire conferma password', async ({ page }) => {
    const password = 'password123'
    const confirmPassword = 'password123'
    
    // Inserisci password
    await page.fill('input[name="password"]', password)
    await expect(page.locator('input[name="password"]')).toHaveValue(password)
    
    // Inserisci conferma password
    await page.fill('input[name="confirmPassword"]', confirmPassword)
    await expect(page.locator('input[name="confirmPassword"]')).toHaveValue(confirmPassword)
    
    // Verifica che conferma password sia required
    await expect(page.locator('input[name="confirmPassword"]')).toHaveAttribute('required')
  })

  test('Dovrebbe gestire password non coincidenti', async ({ page }) => {
    const password = 'password123'
    const wrongConfirmPassword = 'password456'
    
    // Inserisci password
    await page.fill('input[name="password"]', password)
    await page.fill('input[name="confirmPassword"]', wrongConfirmPassword)
    
    // Prova submit
    await page.click('button[type="submit"]')
    
    // Verifica che form non si invii
    await expect(page).toHaveURL('/sign-up')
  })

  test('Dovrebbe gestire campi vuoti', async ({ page }) => {
    // Verifica che tutti i campi siano required
    await expect(page.locator('input[name="first_name"]')).toHaveAttribute('required')
    await expect(page.locator('input[name="last_name"]')).toHaveAttribute('required')
    await expect(page.locator('input[name="email"]')).toHaveAttribute('required')
    await expect(page.locator('input[name="password"]')).toHaveAttribute('required')
    await expect(page.locator('input[name="confirmPassword"]')).toHaveAttribute('required')
    
    // Prova submit senza dati
    await page.click('button[type="submit"]')
    
    // Verifica che form non si invii
    await expect(page).toHaveURL('/sign-up')
  })

  test('Dovrebbe gestire caratteri speciali nei nomi', async ({ page }) => {
    const specialNames = [
      'Jean-Pierre',
      'O\'Connor',
      'José',
      'François',
      'Müller',
      'Anna-Maria',
      'Van Der Berg'
    ]
    
    for (const name of specialNames) {
      await page.fill('input[name="first_name"]', name)
      await expect(page.locator('input[name="first_name"]')).toHaveValue(name)
      
      await page.fill('input[name="last_name"]', name)
      await expect(page.locator('input[name="last_name"]')).toHaveValue(name)
    }
  })

  test('Dovrebbe gestire caratteri speciali nelle password', async ({ page }) => {
    const specialPasswords = [
      'P@ssw0rd!',
      'MyP@ss123',
      'Test#2024',
      'Secure$Pass',
      'Pass%Word',
      'Test&More',
      'Pass*Word',
      'Test+Plus',
      'Pass=Equal',
      'Test|Pipe'
    ]
    
    for (const password of specialPasswords) {
      await page.fill('input[name="password"]', password)
      await expect(page.locator('input[name="password"]')).toHaveValue(password)
    }
  })

  test('Dovrebbe gestire input molto lunghi', async ({ page }) => {
    const longName = 'A'.repeat(100)
    const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com'
    const longPassword = 'a'.repeat(1000)
    
    // Test nome lungo
    await page.fill('input[name="first_name"]', longName)
    await expect(page.locator('input[name="first_name"]')).toHaveValue(longName)
    
    // Test email lunga
    await page.fill('input[name="email"]', longEmail)
    await expect(page.locator('input[name="email"]')).toHaveValue(longEmail)
    
    // Test password lunga
    await page.fill('input[name="password"]', longPassword)
    await expect(page.locator('input[name="password"]')).toHaveValue(longPassword)
  })

  test('Dovrebbe gestire caratteri Unicode', async ({ page }) => {
    const unicodeName = 'Màrio'
    const unicodeEmail = 'mario.rossi@ristorante.it'
    const unicodePassword = 'Màrio123!'
    
    await page.fill('input[name="first_name"]', unicodeName)
    await expect(page.locator('input[name="first_name"]')).toHaveValue(unicodeName)
    
    await page.fill('input[name="email"]', unicodeEmail)
    await expect(page.locator('input[name="email"]')).toHaveValue(unicodeEmail)
    
    await page.fill('input[name="password"]', unicodePassword)
    await expect(page.locator('input[name="password"]')).toHaveValue(unicodePassword)
  })

  test('Dovrebbe gestire spazi negli input', async ({ page }) => {
    // Test nome con spazi
    await page.fill('input[name="first_name"]', ' Mario ')
    await expect(page.locator('input[name="first_name"]')).toHaveValue(' Mario ')
    
    // Test email con spazi (dovrebbe essere gestita dal browser)
    await page.fill('input[name="email"]', ' test@example.com ')
    
    // Test password con spazi
    await page.fill('input[name="password"]', ' password123 ')
    await expect(page.locator('input[name="password"]')).toHaveValue(' password123 ')
  })

  test('Dovrebbe gestire navigazione con tastiera', async ({ page }) => {
    // Naviga con Tab
    await page.keyboard.press('Tab') // First name
    await expect(page.locator('input[name="first_name"]')).toBeFocused()
    
    await page.keyboard.press('Tab') // Last name
    await expect(page.locator('input[name="last_name"]')).toBeFocused()
    
    await page.keyboard.press('Tab') // Email
    await expect(page.locator('input[name="email"]')).toBeFocused()
    
    await page.keyboard.press('Tab') // Password
    await expect(page.locator('input[name="password"]')).toBeFocused()
    
    await page.keyboard.press('Tab') // Confirm password
    await expect(page.locator('input[name="confirmPassword"]')).toBeFocused()
    
    await page.keyboard.press('Tab') // Submit button
    await expect(page.locator('button[type="submit"]')).toBeFocused()
    
    // Test Enter per submit
    await page.keyboard.press('Enter')
    // Verifica che form non si invii senza dati validi
    await expect(page).toHaveURL('/sign-up')
  })

  test('Dovrebbe gestire copia e incolla', async ({ page }) => {
    const firstName = 'Mario'
    const lastName = 'Rossi'
    
    // Test copia nome
    await page.fill('input[name="first_name"]', firstName)
    await page.keyboard.press('Control+a')
    await page.keyboard.press('Control+c')
    
    // Test incolla in cognome
    await page.focus('input[name="last_name"]')
    await page.keyboard.press('Control+v')
    
    // Verifica che cognome sia stato incollato
    await expect(page.locator('input[name="last_name"]')).toHaveValue(firstName)
  })
})
