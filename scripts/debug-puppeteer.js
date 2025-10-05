import puppeteer from 'puppeteer'

async function debugApp() {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: ['--start-maximized'],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 1080 })

  // Listen to console logs
  page.on('console', msg => console.log('PAGE LOG:', msg.text()))
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message))

  // Navigate to the app
  console.log('Navigating to http://localhost:3000...')
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' })

  console.log('App loaded successfully')
  console.log('Page title:', await page.title())

  // Test navigation to different pages
  const pages = [
    '/conservazione',
    '/attivita',
    '/inventario',
    '/gestione',
    '/impostazioni',
  ]

  for (const testPage of pages) {
    try {
      console.log(`\nTesting page: ${testPage}`)
      await page.goto(`http://localhost:3000${testPage}`, {
        waitUntil: 'networkidle0',
      })

      // Wait a bit for the page to render
      await page.waitForTimeout(2000)

      const title = await page.title()
      console.log(`✓ ${testPage} - Title: ${title}`)

      // Check for any errors in the console
      const errors = await page.evaluate(() => {
        return window.console._errors || []
      })

      if (errors.length > 0) {
        console.log(`⚠️ Errors found on ${testPage}:`, errors)
      }
    } catch (error) {
      console.error(`❌ Failed to load ${testPage}:`, error.message)
    }
  }

  // Return to home
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' })

  console.log('\n🎯 Debug complete. Browser remains open for manual testing.')
  console.log('Press Ctrl+C to close browser and exit.')

  // Keep browser open for manual debugging
  await new Promise(() => {})
}

debugApp().catch(console.error)
