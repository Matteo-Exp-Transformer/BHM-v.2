import puppeteer from 'puppeteer'

class HACCPAppDebugger {
  constructor() {
    this.browser = null
    this.page = null
    this.errors = []
    this.warnings = []
  }

  async initialize() {
    console.log('🚀 Initializing HACCP App Debugger...')

    this.browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: [
        '--start-maximized',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
      ],
    })

    this.page = await this.browser.newPage()
    await this.page.setViewport({ width: 1920, height: 1080 })

    // Enhanced error and log monitoring
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
      } else if (type === 'warning') {
        this.warnings.push({
          type: 'console',
          message: text,
          timestamp: new Date(),
        })
        console.log('⚠️ CONSOLE WARNING:', text)
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
      this.errors.push({
        type: 'network',
        message: `Failed to load: ${request.url()}`,
        timestamp: new Date(),
      })
      console.log(
        '🌐 NETWORK ERROR:',
        request.url(),
        request.failure()?.errorText
      )
    })
  }

  async testAppLoad() {
    console.log('\n🔍 Testing app load...')
    await this.page.goto('http://localhost:3000', {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })

    const title = await this.page.title()
    console.log('✅ App loaded. Title:', title)

    // Check if authentication is working
    await new Promise(resolve => setTimeout(resolve, 3000))

    const isAuthPage = await this.page.evaluate(() => {
      return (
        document.body.innerText.includes('Sign in') ||
        document.body.innerText.includes('Login') ||
        document.querySelector('[data-testid="sign-in"]') !== null
      )
    })

    console.log(
      '🔐 Authentication status:',
      isAuthPage ? 'Login required' : 'Authenticated'
    )
    return !isAuthPage
  }

  async testNavigation() {
    console.log('\n🧭 Testing navigation...')
    const pages = [
      { path: '/conservazione', name: 'Conservazione' },
      { path: '/attivita', name: 'Attività' },
      { path: '/inventario', name: 'Inventario' },
      { path: '/gestione', name: 'Gestione' },
      { path: '/impostazioni', name: 'Impostazioni' },
    ]

    for (const testPage of pages) {
      try {
        console.log(`\n📄 Testing ${testPage.name} (${testPage.path})`)

        const startTime = Date.now()
        await this.page.goto(`http://localhost:3000${testPage.path}`, {
          waitUntil: 'networkidle0',
          timeout: 15000,
        })
        const loadTime = Date.now() - startTime

        await new Promise(resolve => setTimeout(resolve, 2000))

        // Check page content
        const pageInfo = await this.page.evaluate(pageName => {
          const body = document.body
          const hasContent = body.children.length > 0
          const hasError =
            body.innerText.includes('Error') || body.innerText.includes('404')
          const isEmpty = body.innerText.trim().length < 100

          return {
            hasContent,
            hasError,
            isEmpty,
            textLength: body.innerText.trim().length,
            title: document.title,
          }
        }, testPage.name)

        console.log(`  ⏱️ Load time: ${loadTime}ms`)
        console.log(`  📝 Content length: ${pageInfo.textLength} characters`)
        console.log(
          `  ✅ Status: ${pageInfo.hasError ? '❌ Error detected' : pageInfo.isEmpty ? '⚠️ Empty page' : '✅ OK'}`
        )

        if (pageInfo.hasError) {
          this.errors.push({
            type: 'page-content',
            message: `Error on ${testPage.path}`,
            timestamp: new Date(),
          })
        }
      } catch (error) {
        console.log(`  ❌ Failed: ${error.message}`)
        this.errors.push({
          type: 'navigation',
          message: `Failed to load ${testPage.path}: ${error.message}`,
          timestamp: new Date(),
        })
      }
    }
  }

  async testInteractivity() {
    console.log('\n🖱️ Testing interactivity...')

    // Go to home page
    await this.page.goto('http://localhost:3000', { waitUntil: 'networkidle0' })

    // Test button clicks and form interactions
    try {
      // Look for interactive elements
      const interactiveElements = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button')).length
        const links = Array.from(document.querySelectorAll('a')).length
        const inputs = Array.from(document.querySelectorAll('input')).length
        const selects = Array.from(document.querySelectorAll('select')).length

        return { buttons, links, inputs, selects }
      })

      console.log('🎯 Interactive elements found:')
      console.log(`  🔘 Buttons: ${interactiveElements.buttons}`)
      console.log(`  🔗 Links: ${interactiveElements.links}`)
      console.log(`  📝 Inputs: ${interactiveElements.inputs}`)
      console.log(`  📋 Selects: ${interactiveElements.selects}`)

      // Test first button click if available
      const firstButton = await this.page.$('button:not([disabled])')
      if (firstButton) {
        console.log('🖱️ Testing button click...')
        await firstButton.click()
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('✅ Button click successful')
      }
    } catch (error) {
      console.log('❌ Interactivity test failed:', error.message)
      this.errors.push({
        type: 'interactivity',
        message: error.message,
        timestamp: new Date(),
      })
    }
  }

  async testPerformance() {
    console.log('\n⚡ Testing performance...')

    const metrics = await this.page.metrics()
    console.log('📊 Performance metrics:')
    console.log(
      `  🧠 JS Heap: ${Math.round((metrics.JSHeapUsedSize / 1024 / 1024) * 100) / 100} MB`
    )
    console.log(`  📄 Documents: ${metrics.Documents}`)
    console.log(`  🖼️ Frames: ${metrics.Frames}`)
    console.log(`  🎯 Nodes: ${metrics.Nodes}`)
    console.log(`  👂 Event Listeners: ${metrics.JSEventListeners}`)
  }

  async testResponsiveness() {
    console.log('\n📱 Testing responsiveness...')

    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' },
    ]

    for (const viewport of viewports) {
      console.log(
        `📐 Testing ${viewport.name} (${viewport.width}x${viewport.height})`
      )
      await this.page.setViewport(viewport)
      await new Promise(resolve => setTimeout(resolve, 1000))

      const isResponsive = await this.page.evaluate(() => {
        const body = document.body
        const hasHorizontalScroll = body.scrollWidth > window.innerWidth
        return !hasHorizontalScroll
      })

      console.log(
        `  ${isResponsive ? '✅' : '❌'} Layout: ${isResponsive ? 'Responsive' : 'Horizontal scroll detected'}`
      )
    }

    // Reset to desktop
    await this.page.setViewport({ width: 1920, height: 1080 })
  }

  async generateReport() {
    console.log('\n📋 DEBUGGING REPORT')
    console.log('='.repeat(50))

    console.log(`\n📊 Summary:`)
    console.log(`  ❌ Errors: ${this.errors.length}`)
    console.log(`  ⚠️ Warnings: ${this.warnings.length}`)

    if (this.errors.length > 0) {
      console.log(`\n❌ ERRORS FOUND:`)
      this.errors.forEach((error, index) => {
        console.log(
          `  ${index + 1}. [${error.type.toUpperCase()}] ${error.message}`
        )
      })
    }

    if (this.warnings.length > 0 && this.warnings.length <= 5) {
      console.log(`\n⚠️ WARNINGS:`)
      this.warnings.slice(0, 5).forEach((warning, index) => {
        console.log(
          `  ${index + 1}. [${warning.type.toUpperCase()}] ${warning.message}`
        )
      })
    }

    console.log(`\n🎯 RECOMMENDATIONS:`)
    if (this.errors.length === 0) {
      console.log(`  ✅ No critical errors found - app is working well!`)
    } else {
      console.log(`  🔧 Fix the ${this.errors.length} error(s) found above`)
    }

    console.log(`\n🌐 Browser remains open for manual inspection.`)
    console.log(`Press Ctrl+C to close and exit.`)
  }

  async runFullDebug() {
    try {
      await this.initialize()

      const isAuthenticated = await this.testAppLoad()

      if (isAuthenticated) {
        await this.testNavigation()
        await this.testInteractivity()
        await this.testPerformance()
        await this.testResponsiveness()
      } else {
        console.log('⚠️ App requires authentication - skipping detailed tests')
      }

      await this.generateReport()

      // Keep browser open
      await new Promise(() => {})
    } catch (error) {
      console.error('💥 Debug session failed:', error)
    }
  }
}

// Run the debugger
const appDebugger = new HACCPAppDebugger()
appDebugger.runFullDebug().catch(console.error)
