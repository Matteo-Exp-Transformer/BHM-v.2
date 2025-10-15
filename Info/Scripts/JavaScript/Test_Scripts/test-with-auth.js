import puppeteer from 'puppeteer'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load testing environment
dotenv.config({ path: join(__dirname, '.env.testing') })

class AuthenticatedHACCPTester {
  constructor() {
    this.browser = null
    this.page = null
    this.errors = []
    this.testResults = {}
  }

  async initialize() {
    console.log('🚀 Starting Authenticated HACCP App Testing...')

    this.browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: [
        '--start-maximized',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--no-sandbox',
      ],
    })

    this.page = await this.browser.newPage()
    await this.page.setViewport({ width: 1920, height: 1080 })

    // Enhanced monitoring
    this.page.on('console', msg => {
      const type = msg.type()
      const text = msg.text()

      if (type === 'error') {
        this.errors.push({
          type: 'console',
          message: text,
          timestamp: new Date(),
        })
        console.log('❌ CONSOLE ERROR:', text)
      } else {
        console.log(`📝 ${type.toUpperCase()}:`, text)
      }
    })

    this.page.on('pageerror', error => {
      this.errors.push({
        type: 'page',
        message: error.message,
        timestamp: new Date(),
      })
      console.log('💥 PAGE ERROR:', error.message)
    })

    this.page.on('requestfailed', request => {
      const url = request.url()
      // Filter out common non-critical failures
      if (!url.includes('sign-in') && !url.includes('auth')) {
        this.errors.push({
          type: 'network',
          message: `Failed to load: ${url}`,
          timestamp: new Date(),
        })
        console.log('🌐 NETWORK ERROR:', url)
      }
    })
  }

  async bypassAuthentication() {
    console.log('\n🔓 Setting up authentication bypass...')

    // Inject mock authentication
    await this.page.evaluateOnNewDocument(() => {
      // Mock localStorage for Clerk
      const mockSession = {
        user: {
          id: 'test_user_123',
          firstName: 'Test',
          lastName: 'User',
          emailAddresses: [{ emailAddress: 'test@example.com' }],
          profileImageUrl: 'https://via.placeholder.com/150',
        },
        isSignedIn: true,
        isLoaded: true,
      }

      // Store mock session
      localStorage.setItem('__clerk_session_token', 'mock_session_token')
      localStorage.setItem('__clerk_user_data', JSON.stringify(mockSession))

      // Mock Clerk methods
      window.__CLERK_MOCK__ = mockSession
    })

    console.log('✅ Authentication bypass configured')
  }

  async testAppWithAuth() {
    console.log('\n🔍 Testing app with authentication...')

    try {
      await this.bypassAuthentication()

      const startTime = Date.now()
      await this.page.goto('http://localhost:3000', {
        waitUntil: 'networkidle0',
        timeout: 30000,
      })
      const loadTime = Date.now() - startTime

      console.log(`⏱️ App loaded in ${loadTime}ms`)

      // Wait for React to initialize
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Check if we're authenticated
      const authStatus = await this.page.evaluate(() => {
        // Check for auth indicators
        const hasSignIn =
          document.body.innerText.includes('Sign in') ||
          document.body.innerText.includes('Login')
        const hasUserButton =
          document.querySelector('[data-testid="user-button"]') !== null
        const hasUserMenu = document.querySelector('.user-menu') !== null

        return {
          requiresAuth: hasSignIn,
          hasUserButton,
          hasUserMenu,
          bodyText: document.body.innerText.substring(0, 500),
        }
      })

      console.log('🔐 Authentication status:', {
        requiresAuth: authStatus.requiresAuth,
        hasUserButton: authStatus.hasUserButton,
        hasUserMenu: authStatus.hasUserMenu,
      })

      this.testResults.authentication = {
        success: !authStatus.requiresAuth,
        loadTime,
        details: authStatus,
      }

      return !authStatus.requiresAuth
    } catch (error) {
      console.error('❌ Authentication test failed:', error.message)
      this.errors.push({
        type: 'auth',
        message: error.message,
        timestamp: new Date(),
      })
      return false
    }
  }

  async testAllPages() {
    console.log('\n🧭 Testing all pages with authentication...')

    const pages = [
      { path: '/', name: 'Home' },
      { path: '/conservazione', name: 'Conservazione' },
      { path: '/attivita', name: 'Attività' },
      { path: '/inventario', name: 'Inventario' },
      { path: '/gestione', name: 'Gestione' },
      { path: '/impostazioni', name: 'Impostazioni' },
    ]

    const pageResults = {}

    for (const testPage of pages) {
      try {
        console.log(`\n📄 Testing ${testPage.name} (${testPage.path})`)

        const startTime = Date.now()
        await this.page.goto(`http://localhost:3000${testPage.path}`, {
          waitUntil: 'networkidle0',
          timeout: 15000,
        })
        const loadTime = Date.now() - startTime

        // Wait for page to render
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Analyze page content
        const pageInfo = await this.page.evaluate(pageName => {
          const body = document.body
          const hasError =
            body.innerText.includes('Error') ||
            body.innerText.includes('404') ||
            body.innerText.includes('Something went wrong')
          const hasContent = body.children.length > 2
          const textLength = body.innerText.trim().length
          const hasLoading =
            body.innerText.includes('Loading') ||
            body.innerText.includes('Caricamento')

          // Check for interactive elements
          const buttons = document.querySelectorAll('button').length
          const inputs = document.querySelectorAll('input').length
          const forms = document.querySelectorAll('form').length
          const links = document.querySelectorAll('a').length

          return {
            hasContent,
            hasError,
            hasLoading,
            textLength,
            title: document.title,
            interactiveElements: { buttons, inputs, forms, links },
          }
        }, testPage.name)

        const status = pageInfo.hasError
          ? 'ERROR'
          : pageInfo.hasLoading
            ? 'LOADING'
            : pageInfo.textLength < 100
              ? 'EMPTY'
              : 'OK'

        console.log(`  ⏱️ Load time: ${loadTime}ms`)
        console.log(`  📝 Content: ${pageInfo.textLength} chars`)
        console.log(
          `  🎯 Interactive: ${pageInfo.interactiveElements.buttons} buttons, ${pageInfo.interactiveElements.inputs} inputs`
        )
        console.log(`  ✅ Status: ${status}`)

        pageResults[testPage.path] = {
          name: testPage.name,
          loadTime,
          status,
          ...pageInfo,
        }

        if (pageInfo.hasError) {
          this.errors.push({
            type: 'page-error',
            message: `Error on ${testPage.path}`,
            timestamp: new Date(),
          })
        }
      } catch (error) {
        console.log(`  ❌ Failed: ${error.message}`)
        pageResults[testPage.path] = {
          name: testPage.name,
          status: 'FAILED',
          error: error.message,
        }
        this.errors.push({
          type: 'navigation',
          message: `Failed to load ${testPage.path}: ${error.message}`,
          timestamp: new Date(),
        })
      }
    }

    this.testResults.pages = pageResults
    return pageResults
  }

  async testInteractivity() {
    console.log('\n🖱️ Testing interactivity...')

    try {
      // Go to home page
      await this.page.goto('http://localhost:3000', {
        waitUntil: 'networkidle0',
      })

      const interactionTests = []

      // Test 1: Click first available button
      try {
        const buttons = await this.page.$$('button:not([disabled])')
        if (buttons.length > 0) {
          console.log(`🔘 Found ${buttons.length} clickable buttons`)
          await buttons[0].click()
          await new Promise(resolve => setTimeout(resolve, 1000))
          interactionTests.push({ test: 'button-click', success: true })
          console.log('✅ Button click test passed')
        } else {
          interactionTests.push({
            test: 'button-click',
            success: false,
            reason: 'No buttons found',
          })
        }
      } catch (error) {
        interactionTests.push({
          test: 'button-click',
          success: false,
          reason: error.message,
        })
      }

      // Test 2: Form interactions
      try {
        const inputs = await this.page.$$('input:not([disabled])')
        if (inputs.length > 0) {
          console.log(`📝 Found ${inputs.length} input fields`)
          await inputs[0].type('test')
          await new Promise(resolve => setTimeout(resolve, 500))
          interactionTests.push({ test: 'input-type', success: true })
          console.log('✅ Input typing test passed')
        } else {
          interactionTests.push({
            test: 'input-type',
            success: false,
            reason: 'No inputs found',
          })
        }
      } catch (error) {
        interactionTests.push({
          test: 'input-type',
          success: false,
          reason: error.message,
        })
      }

      // Test 3: Navigation links
      try {
        const navLinks = await this.page.$$('nav a, .nav-link')
        if (navLinks.length > 0) {
          console.log(`🔗 Found ${navLinks.length} navigation links`)
          interactionTests.push({
            test: 'navigation',
            success: true,
            count: navLinks.length,
          })
          console.log('✅ Navigation test passed')
        } else {
          interactionTests.push({
            test: 'navigation',
            success: false,
            reason: 'No nav links found',
          })
        }
      } catch (error) {
        interactionTests.push({
          test: 'navigation',
          success: false,
          reason: error.message,
        })
      }

      this.testResults.interactivity = interactionTests
      return interactionTests
    } catch (error) {
      console.error('❌ Interactivity test failed:', error.message)
      this.errors.push({
        type: 'interactivity',
        message: error.message,
        timestamp: new Date(),
      })
      return []
    }
  }

  async generateComprehensiveReport() {
    console.log('\n' + '='.repeat(60))
    console.log('📋 COMPREHENSIVE TESTING REPORT')
    console.log('='.repeat(60))

    // Summary
    const totalErrors = this.errors.length
    const pagesTotal = Object.keys(this.testResults.pages || {}).length
    const pagesSuccess = Object.values(this.testResults.pages || {}).filter(
      page => page.status === 'OK'
    ).length

    console.log('\n📊 SUMMARY:')
    console.log(`  🔍 Total pages tested: ${pagesTotal}`)
    console.log(`  ✅ Successful pages: ${pagesSuccess}`)
    console.log(`  ❌ Failed pages: ${pagesTotal - pagesSuccess}`)
    console.log(`  🚨 Total errors: ${totalErrors}`)

    // Authentication Status
    if (this.testResults.authentication) {
      console.log('\n🔐 AUTHENTICATION:')
      console.log(
        `  Status: ${this.testResults.authentication.success ? '✅ Bypassed' : '❌ Required'}`
      )
      console.log(`  Load time: ${this.testResults.authentication.loadTime}ms`)
    }

    // Page Results
    if (this.testResults.pages) {
      console.log('\n📄 PAGE RESULTS:')
      Object.entries(this.testResults.pages).forEach(([path, result]) => {
        const statusIcon =
          result.status === 'OK'
            ? '✅'
            : result.status === 'ERROR'
              ? '❌'
              : result.status === 'LOADING'
                ? '⏳'
                : result.status === 'EMPTY'
                  ? '⚠️'
                  : '❓'
        console.log(`  ${statusIcon} ${result.name} (${path})`)
        console.log(
          `     Load: ${result.loadTime || 'N/A'}ms | Content: ${result.textLength || 0} chars`
        )
        if (result.interactiveElements) {
          console.log(
            `     Interactive: ${result.interactiveElements.buttons}B ${result.interactiveElements.inputs}I ${result.interactiveElements.forms}F`
          )
        }
      })
    }

    // Interactivity Results
    if (this.testResults.interactivity) {
      console.log('\n🖱️ INTERACTIVITY:')
      this.testResults.interactivity.forEach(test => {
        const icon = test.success ? '✅' : '❌'
        console.log(
          `  ${icon} ${test.test}: ${test.success ? 'PASSED' : `FAILED (${test.reason})`}`
        )
      })
    }

    // Errors
    if (totalErrors > 0) {
      console.log('\n🚨 ERRORS FOUND:')
      this.errors.slice(0, 10).forEach((error, index) => {
        console.log(
          `  ${index + 1}. [${error.type.toUpperCase()}] ${error.message}`
        )
      })
      if (this.errors.length > 10) {
        console.log(`  ... and ${this.errors.length - 10} more errors`)
      }
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:')
    if (totalErrors === 0) {
      console.log('  🎉 Excellent! No critical errors found')
    } else {
      if (this.errors.some(e => e.type === 'auth')) {
        console.log('  🔧 Fix authentication configuration issues')
      }
      if (this.errors.some(e => e.type === 'network')) {
        console.log('  🌐 Resolve network/API endpoint issues')
      }
      if (this.errors.some(e => e.type === 'page-error')) {
        console.log('  📄 Debug page rendering errors')
      }
    }

    console.log('\n🌐 Browser remains open for manual inspection.')
    console.log('Press Ctrl+C to close and exit.')
  }

  async runFullTest() {
    try {
      await this.initialize()

      const isAuthenticated = await this.testAppWithAuth()

      if (isAuthenticated) {
        console.log('✅ Proceeding with full test suite')
        await this.testAllPages()
        await this.testInteractivity()
      } else {
        console.log('⚠️ Authentication bypass failed - limited testing')
      }

      await this.generateComprehensiveReport()

      // Keep browser open for manual inspection
      await new Promise(() => {})
    } catch (error) {
      console.error('💥 Test session failed:', error)
    }
  }
}

// Install dotenv first if not available
try {
  await import('dotenv')
} catch (error) {
  console.log('Installing dotenv...')
  const { execSync } = await import('child_process')
  execSync('npm install dotenv', { stdio: 'inherit' })
}

// Run the comprehensive test
const tester = new AuthenticatedHACCPTester()
tester.runFullTest().catch(console.error)
