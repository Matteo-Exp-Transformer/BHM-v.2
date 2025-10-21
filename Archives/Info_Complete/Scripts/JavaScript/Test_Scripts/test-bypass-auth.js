import puppeteer from 'puppeteer'

class AuthBypassTester {
  constructor() {
    this.browser = null
    this.page = null
  }

  async initialize() {
    console.log('🚀 Starting Auth Bypass Testing...')

    this.browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: ['--start-maximized', '--no-sandbox'],
    })

    this.page = await this.browser.newPage()
    await this.page.setViewport({ width: 1920, height: 1080 })

    // Monitor console for debugging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ ERROR:', msg.text())
      } else if (msg.type() === 'warn') {
        console.log('⚠️ WARN:', msg.text())
      } else {
        console.log('📝 LOG:', msg.text())
      }
    })
  }

  async testAuthBypass() {
    console.log('\n🔓 Testing authentication bypass methods...')

    // Method 1: Intercept and modify responses
    await this.page.setRequestInterception(true)

    this.page.on('request', request => {
      const url = request.url()

      // Allow all requests to continue
      if (url.includes('sign-in') || url.includes('auth')) {
        console.log('🚫 Blocking auth request:', url)
        request.abort()
      } else {
        request.continue()
      }
    })

    // Method 2: Inject authentication bypass script
    await this.page.evaluateOnNewDocument(() => {
      // Override Clerk's authentication state
      Object.defineProperty(window, '__clerk_frontend_api', {
        get: () => 'mock_api',
        set: () => {},
      })

      // Mock authentication state
      window.__CLERK_MOCK_STATE__ = {
        isSignedIn: true,
        isLoaded: true,
        user: {
          id: 'test_user_123',
          firstName: 'Test',
          lastName: 'User',
          emailAddresses: [{ emailAddress: 'test@haccp.com' }],
        },
      }

      // Override React component rendering for auth
      const originalCreateElement = React?.createElement
      if (originalCreateElement) {
        React.createElement = function (type, props, ...children) {
          // Bypass SignedOut component
          if (type?.displayName === 'SignedOut' || type?.name === 'SignedOut') {
            return null
          }

          // Always render SignedIn component
          if (type?.displayName === 'SignedIn' || type?.name === 'SignedIn') {
            return originalCreateElement('div', {}, ...children)
          }

          return originalCreateElement.apply(this, arguments)
        }
      }

      console.log('🔧 Authentication bypass injected')
    })

    // Method 3: Load page and then modify DOM
    await this.page.goto('http://localhost:3000', {
      waitUntil: 'domcontentloaded',
    })

    // Wait a moment for React to render
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Method 4: Direct DOM manipulation
    await this.page.evaluate(() => {
      // Remove sign-in requirements
      const signInElements = document.querySelectorAll(
        '[data-testid*="sign"], [class*="sign-in"], .clerk-sign-in'
      )
      signInElements.forEach(el => el.remove())

      // Show any hidden content
      const hiddenElements = document.querySelectorAll(
        '[style*="display: none"], .hidden'
      )
      hiddenElements.forEach(el => {
        el.style.display = 'block'
        el.classList.remove('hidden')
      })

      console.log('🎭 DOM manipulation complete')
    })

    // Check if bypass was successful
    const authStatus = await this.page.evaluate(() => {
      const hasSignIn =
        document.body.innerText.includes('Sign in') ||
        document.body.innerText.includes('Login') ||
        document.body.innerText.includes('Accedi')

      const hasContent = document.body.innerText.length > 1000
      const hasNavigation = document.querySelector('nav') !== null
      const hasButtons = document.querySelectorAll('button').length > 2

      return {
        requiresAuth: hasSignIn,
        hasContent,
        hasNavigation,
        hasButtons,
        contentLength: document.body.innerText.length,
        title: document.title,
      }
    })

    console.log('\n📊 Bypass Results:')
    console.log(
      `  Auth Required: ${authStatus.requiresAuth ? '❌ Yes' : '✅ No'}`
    )
    console.log(`  Has Content: ${authStatus.hasContent ? '✅ Yes' : '❌ No'}`)
    console.log(
      `  Has Navigation: ${authStatus.hasNavigation ? '✅ Yes' : '❌ No'}`
    )
    console.log(`  Has Buttons: ${authStatus.hasButtons ? '✅ Yes' : '❌ No'}`)
    console.log(`  Content Length: ${authStatus.contentLength} chars`)

    return !authStatus.requiresAuth && authStatus.hasContent
  }

  async testManualAuth() {
    console.log('\n👤 Testing manual authentication...')

    try {
      // Look for sign-in button
      const signInButton = await this.page.$(
        'button[data-testid="sign-in"], .sign-in-button, button:contains("Sign")'
      )

      if (signInButton) {
        console.log('🔘 Found sign-in button, clicking...')
        await signInButton.click()
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      // Check if sign-in form appeared
      const hasSignInForm = await this.page.evaluate(() => {
        return (
          document.querySelector(
            'input[type="email"], input[type="password"]'
          ) !== null
        )
      })

      console.log(
        `Sign-in form: ${hasSignInForm ? '✅ Found' : '❌ Not found'}`
      )

      if (hasSignInForm) {
        console.log('📝 You can now manually sign in to test the application')
        console.log('🔄 Script will wait for authentication...')

        // Wait for authentication to complete
        let authCompleted = false
        let attempts = 0
        const maxAttempts = 60 // 2 minutes

        while (!authCompleted && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000))

          authCompleted = await this.page.evaluate(() => {
            return (
              !document.body.innerText.includes('Sign in') &&
              !document.body.innerText.includes('Login') &&
              document.body.innerText.length > 1000
            )
          })

          attempts++
          if (attempts % 5 === 0) {
            console.log(`⏳ Waiting for authentication... (${attempts * 2}s)`)
          }
        }

        if (authCompleted) {
          console.log('✅ Authentication completed successfully!')
          return true
        } else {
          console.log('⏰ Authentication timeout')
          return false
        }
      }
    } catch (error) {
      console.error('❌ Manual auth test failed:', error.message)
      return false
    }
  }

  async testAppAfterAuth() {
    console.log('\n🧪 Testing app functionality...')

    const pages = [
      { path: '/', name: 'Home' },
      { path: '/conservazione', name: 'Conservazione' },
      { path: '/attivita', name: 'Attività' },
      { path: '/inventario', name: 'Inventario' },
      { path: '/gestione', name: 'Gestione' },
      { path: '/impostazioni', name: 'Impostazioni' },
    ]

    for (const testPage of pages) {
      try {
        console.log(`\n📄 Testing ${testPage.name}...`)

        const startTime = Date.now()
        await this.page.goto(`http://localhost:3000${testPage.path}`, {
          waitUntil: 'networkidle0',
          timeout: 10000,
        })
        const loadTime = Date.now() - startTime

        const pageInfo = await this.page.evaluate(() => {
          const hasError =
            document.body.innerText.includes('Error') ||
            document.body.innerText.includes('404')
          const contentLength = document.body.innerText.trim().length
          const buttons = document.querySelectorAll('button').length
          const inputs = document.querySelectorAll('input').length

          return { hasError, contentLength, buttons, inputs }
        })

        const status = pageInfo.hasError
          ? '❌ ERROR'
          : pageInfo.contentLength < 100
            ? '⚠️ EMPTY'
            : '✅ OK'

        console.log(
          `  ${status} | ${loadTime}ms | ${pageInfo.contentLength} chars | ${pageInfo.buttons}B ${pageInfo.inputs}I`
        )
      } catch (error) {
        console.log(`  ❌ FAILED: ${error.message}`)
      }
    }
  }

  async runTest() {
    try {
      await this.initialize()

      console.log('\n🎯 TESTING STRATEGY:')
      console.log('1. Try automated authentication bypass')
      console.log('2. If that fails, enable manual authentication')
      console.log('3. Test all app functionality')

      // Try automated bypass first
      const bypassSuccess = await this.testAuthBypass()

      if (bypassSuccess) {
        console.log('\n✅ Automated bypass successful!')
        await this.testAppAfterAuth()
      } else {
        console.log(
          '\n⚠️ Automated bypass failed, trying manual authentication...'
        )
        const manualAuthSuccess = await this.testManualAuth()

        if (manualAuthSuccess) {
          await this.testAppAfterAuth()
        } else {
          console.log('\n❌ Authentication required - please sign in manually')
        }
      }

      console.log(
        '\n🎉 Testing complete! Browser remains open for manual inspection.'
      )
      console.log('Press Ctrl+C to close.')

      // Keep browser open
      await new Promise(() => {})
    } catch (error) {
      console.error('💥 Test failed:', error)
    }
  }
}

// Run the test
const tester = new AuthBypassTester()
tester.runTest().catch(console.error)
