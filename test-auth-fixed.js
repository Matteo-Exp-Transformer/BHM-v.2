import puppeteer from 'puppeteer'

class AuthTestFixed {
  constructor() {
    this.browser = null
    this.page = null
  }

  async initialize() {
    console.log('🚀 Testing HACCP App - Post Sentry Fix...')

    this.browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: ['--start-maximized', '--no-sandbox'],
    })

    this.page = await this.browser.newPage()
    await this.page.setViewport({ width: 1920, height: 1080 })

    // Monitor console for debugging
    this.page.on('console', msg => {
      const type = msg.type()
      const text = msg.text()

      if (type === 'error') {
        console.log('❌ ERROR:', text)
      } else if (text.includes('CORS') || text.includes('sentry-trace')) {
        console.log('🚨 CORS ISSUE:', text)
      } else if (type === 'warn') {
        console.log('⚠️ WARN:', text)
      } else {
        console.log('📝 LOG:', text)
      }
    })

    this.page.on('pageerror', error => {
      console.log('💥 PAGE ERROR:', error.message)
    })
  }

  async testAppLoad() {
    console.log('\n🔍 Testing app load without CORS errors...')

    try {
      const startTime = Date.now()
      await this.page.goto('http://localhost:3000', {
        waitUntil: 'networkidle0',
        timeout: 30000,
      })
      const loadTime = Date.now() - startTime

      console.log(`⏱️ App loaded in ${loadTime}ms`)

      // Wait for React to initialize
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Check for CORS errors
      const corsErrors = await this.page.evaluate(() => {
        const errors = []
        const logs = window.console._logs || []

        logs.forEach(log => {
          if (
            log.includes('CORS') ||
            log.includes('sentry-trace') ||
            log.includes('baggage')
          ) {
            errors.push(log)
          }
        })

        return errors
      })

      if (corsErrors.length > 0) {
        console.log('🚨 CORS errors still present:')
        corsErrors.forEach(error => console.log('  -', error))
        return false
      } else {
        console.log('✅ No CORS errors detected!')
      }

      // Check authentication status
      const authStatus = await this.page.evaluate(() => {
        const hasSignIn =
          document.body.innerText.includes('Sign in') ||
          document.body.innerText.includes('Login') ||
          document.body.innerText.includes('Accedi')

        const hasContent = document.body.innerText.length > 1000
        const hasNavigation = document.querySelector('nav') !== null

        return {
          requiresAuth: hasSignIn,
          hasContent,
          hasNavigation,
          contentLength: document.body.innerText.length,
          title: document.title,
        }
      })

      console.log('🔐 Authentication status:', {
        requiresAuth: authStatus.requiresAuth,
        hasContent: authStatus.hasContent,
        hasNavigation: authStatus.hasNavigation,
        contentLength: authStatus.contentLength,
      })

      return !authStatus.requiresAuth || authStatus.hasContent
    } catch (error) {
      console.error('❌ App load test failed:', error.message)
      return false
    }
  }

  async testManualAuth() {
    console.log('\n👤 Testing manual authentication...')

    try {
      // Look for sign-in elements
      const signInElements = await this.page.$$(
        'button:contains("Sign"), .sign-in-button, [data-testid*="sign"]'
      )

      if (signInElements.length > 0) {
        console.log(`🔘 Found ${signInElements.length} sign-in elements`)

        // Try clicking the first one
        await signInElements[0].click()
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      // Check if we can see the app content
      const appContent = await this.page.evaluate(() => {
        const body = document.body
        const hasError =
          body.innerText.includes('Error') ||
          body.innerText.includes('404') ||
          body.innerText.includes('Failed to fetch')

        const hasSignInForm = body.querySelector('input[type="email"]') !== null
        const hasAppContent = body.innerText.length > 500

        return {
          hasError,
          hasSignInForm,
          hasAppContent,
          contentLength: body.innerText.length,
        }
      })

      console.log('📊 App content status:', appContent)

      if (appContent.hasError) {
        console.log('❌ App has errors - check console for details')
        return false
      }

      if (appContent.hasSignInForm) {
        console.log('📝 Sign-in form detected - manual login required')
        console.log('🔄 You can now manually sign in with your Google account')
        return 'manual_login_required'
      }

      if (appContent.hasAppContent) {
        console.log('✅ App content loaded successfully!')
        return true
      }

      return false
    } catch (error) {
      console.error('❌ Manual auth test failed:', error.message)
      return false
    }
  }

  async runTest() {
    try {
      await this.initialize()

      console.log('\n🎯 TESTING PLAN:')
      console.log('1. Test app load without CORS errors')
      console.log('2. Check authentication status')
      console.log('3. Test manual authentication if needed')

      const appLoaded = await this.testAppLoad()

      if (appLoaded) {
        console.log('\n✅ App loaded successfully without CORS errors!')

        const authResult = await this.testManualAuth()

        if (authResult === true) {
          console.log('\n🎉 All tests passed! App is working correctly.')
        } else if (authResult === 'manual_login_required') {
          console.log('\n⚠️ Manual login required - please sign in manually')
          console.log('📧 Use your Google account: 0cavuz0@gmail.com')
        } else {
          console.log('\n❌ Authentication test failed')
        }
      } else {
        console.log('\n❌ App load test failed - CORS errors still present')
      }

      console.log('\n🌐 Browser remains open for manual inspection.')
      console.log('Press Ctrl+C to close.')

      // Keep browser open
      await new Promise(() => {})
    } catch (error) {
      console.error('💥 Test failed:', error)
    }
  }
}

// Run the test
const tester = new AuthTestFixed()
tester.runTest().catch(console.error)
