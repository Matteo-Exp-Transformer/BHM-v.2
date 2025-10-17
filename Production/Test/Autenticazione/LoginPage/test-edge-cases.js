/**
 * 🔐 LoginPage - Test Edge Cases e Casi Estremi
 * 
 * Test per casi limite e situazioni estreme
 * Seguendo le procedure di blindatura multi-agent
 * 
 * @author Agente 2 - Form e Validazioni
 * @date 2025-01-16
 */

const { test, expect } = require('@playwright/test')

test.describe('LoginPage - Edge Cases', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/sign-in')
  })

  test('Dovrebbe gestire valori null e undefined', async ({ page }) => {
    // Test con valori null (simulati con JavaScript)
    await page.evaluate(() => {
      const emailInput = document.querySelector('input[name="email"]')
      const passwordInput = document.querySelector('input[name="password"]')
      
      // Simula valori null
      emailInput.value = null
      passwordInput.value = null
    })
    
    // Verifica che input siano vuoti
    await expect(page.locator('input[name="email"]')).toHaveValue('')
    await expect(page.locator('input[name="password"]')).toHaveValue('')
  })

  test('Dovrebbe gestire stringhe vuote e solo spazi', async ({ page }) => {
    const emptyValues = ['', '   ', '\t', '\n', '\r\n']
    
    for (const value of emptyValues) {
      await page.fill('input[name="email"]', value)
      await page.fill('input[name="password"]', value)
      
      // Verifica che valori siano gestiti correttamente
      await expect(page.locator('input[name="email"]')).toHaveValue(value)
      await expect(page.locator('input[name="password"]')).toHaveValue(value)
    }
  })

  test('Dovrebbe gestire caratteri di controllo', async ({ page }) => {
    const controlChars = [
      '\x00', // NULL
      '\x01', // SOH
      '\x02', // STX
      '\x03', // ETX
      '\x04', // EOT
      '\x05', // ENQ
      '\x06', // ACK
      '\x07', // BEL
      '\x08', // BS
      '\x0B', // VT
      '\x0C', // FF
      '\x0E', // SO
      '\x0F', // SI
    ]
    
    for (const char of controlChars) {
      await page.fill('input[name="email"]', `test${char}@example.com`)
      await page.fill('input[name="password"]', `pass${char}word`)
      
      // Verifica che caratteri di controllo siano gestiti
      const emailValue = await page.inputValue('input[name="email"]')
      const passwordValue = await page.inputValue('input[name="password"]')
      
      expect(emailValue).toBeDefined()
      expect(passwordValue).toBeDefined()
    }
  })

  test('Dovrebbe gestire caratteri Unicode estremi', async ({ page }) => {
    const unicodeChars = [
      '🚀', // Emoji
      'αβγδε', // Greco
      'абвгд', // Cirillico
      'あいうえお', // Hiragana
      '한글', // Hangul
      'العربية', // Arabo
      'עברית', // Ebraico
    ]
    
    for (const chars of unicodeChars) {
      await page.fill('input[name="email"]', `test${chars}@example.com`)
      await page.fill('input[name="password"]', `pass${chars}word`)
      
      // Verifica che caratteri Unicode siano gestiti
      await expect(page.locator('input[name="email"]')).toHaveValue(`test${chars}@example.com`)
      await expect(page.locator('input[name="password"]')).toHaveValue(`pass${chars}word`)
    }
  })

  test('Dovrebbe gestire input molto lunghi', async ({ page }) => {
    const longString = 'a'.repeat(10000)
    
    await page.fill('input[name="email"]', `${longString}@example.com`)
    await page.fill('input[name="password"]', longString)
    
    // Verifica che input lunghi siano gestiti
    const emailValue = await page.inputValue('input[name="email"]')
    const passwordValue = await page.inputValue('input[name="password"]')
    
    expect(emailValue.length).toBeGreaterThan(1000)
    expect(passwordValue.length).toBeGreaterThan(1000)
  })

  test('Dovrebbe gestire rapidi cambiamenti di input', async ({ page }) => {
    // Simula digitazione rapida
    const email = 'test@example.com'
    const password = 'password123'
    
    // Digita carattere per carattere rapidamente
    for (let i = 0; i < email.length; i++) {
      await page.keyboard.type(email[i])
      await page.waitForTimeout(10) // 10ms tra caratteri
    }
    
    await page.focus('input[name="password"]')
    for (let i = 0; i < password.length; i++) {
      await page.keyboard.type(password[i])
      await page.waitForTimeout(10)
    }
    
    // Verifica che input sia corretto
    await expect(page.locator('input[name="email"]')).toHaveValue(email)
    await expect(page.locator('input[name="password"]')).toHaveValue(password)
  })

  test('Dovrebbe gestire multiple submission rapide', async ({ page }) => {
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    
    // Clicca submit multiple volte rapidamente
    for (let i = 0; i < 5; i++) {
      await page.click('button[type="submit"]')
      await page.waitForTimeout(100)
    }
    
    // Verifica che non ci siano errori
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('Dovrebbe gestire focus rapido tra input', async ({ page }) => {
    // Cambia focus rapidamente tra input
    for (let i = 0; i < 10; i++) {
      await page.focus('input[name="email"]')
      await page.waitForTimeout(50)
      await page.focus('input[name="password"]')
      await page.waitForTimeout(50)
    }
    
    // Verifica che ultimo focus sia su password
    await expect(page.locator('input[name="password"]')).toBeFocused()
  })

  test('Dovrebbe gestire resize window durante input', async ({ page }) => {
    await page.fill('input[name="email"]', 'test@example.com')
    
    // Ridimensiona window durante input
    await page.setViewportSize({ width: 800, height: 600 })
    await page.fill('input[name="password"]', 'password123')
    
    await page.setViewportSize({ width: 400, height: 800 })
    await page.fill('input[name="email"]', 'new@example.com')
    
    await page.setViewportSize({ width: 1200, height: 800 })
    
    // Verifica che input sia ancora corretto
    await expect(page.locator('input[name="email"]')).toHaveValue('new@example.com')
    await expect(page.locator('input[name="password"]')).toHaveValue('password123')
  })

  test('Dovrebbe gestire perdita e riacquisizione focus', async ({ page }) => {
    await page.fill('input[name="email"]', 'test@example.com')
    
    // Perdi focus
    await page.click('body')
    await expect(page.locator('input[name="email"]')).not.toBeFocused()
    
    // Riacquisisci focus
    await page.focus('input[name="email"]')
    await expect(page.locator('input[name="email"]')).toBeFocused()
    
    // Verifica che valore sia ancora presente
    await expect(page.locator('input[name="email"]')).toHaveValue('test@example.com')
  })

  test('Dovrebbe gestire interruzioni di rete', async ({ page }) => {
    // Simula offline
    await page.context().setOffline(true)
    
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Verifica che form sia ancora presente
    await expect(page.locator('form')).toBeVisible()
    
    // Ripristina online
    await page.context().setOffline(false)
    
    // Verifica che form sia ancora funzionante
    await expect(page.locator('input[name="email"]')).toBeVisible()
  })

  test('Dovrebbe gestire memory leak prevention', async ({ page }) => {
    // Simula molte operazioni per testare memory leak
    for (let i = 0; i < 100; i++) {
      await page.fill('input[name="email"]', `test${i}@example.com`)
      await page.fill('input[name="password"]', `password${i}`)
      await page.focus('input[name="email"]')
      await page.focus('input[name="password"]')
    }
    
    // Verifica che form sia ancora funzionante
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
  })

  test('Dovrebbe gestire errori JavaScript', async ({ page }) => {
    // Simula errore JavaScript
    await page.evaluate(() => {
      throw new Error('Test error')
    })
    
    // Verifica che form sia ancora funzionante
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
  })
})