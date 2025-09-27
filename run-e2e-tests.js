/**
 * E2E Test Runner for HACCP Business Manager
 */

import TestSuite from './e2e/complete-test-suite.js'

async function runTests() {
  console.log('🚀 Starting HACCP Business Manager E2E Tests...')
  console.log('⏰ Timestamp:', new Date().toISOString())
  console.log('🌐 Target URL: http://localhost:3001')

  // Set environment variables for screenshots
  process.env.SCREENSHOT = 'true'
  process.env.BASE_URL = 'http://localhost:3001'

  try {
    const testSuite = new TestSuite()
    const report = await testSuite.run()

    console.log('\n🎯 FINAL TEST RESULTS')
    console.log('====================')
    console.log(`✅ Tests Passed: ${report.passed}`)
    console.log(`❌ Tests Failed: ${report.failed}`)
    console.log(`⏭️ Tests Skipped: ${report.skipped}`)

    const total = report.passed + report.failed + report.skipped
    const successRate =
      total > 0
        ? ((report.passed / (report.passed + report.failed)) * 100).toFixed(1)
        : 0
    console.log(`📊 Success Rate: ${successRate}%`)

    if (report.errors && report.errors.length > 0) {
      console.log('\n🔍 ERRORS ENCOUNTERED:')
      report.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.test}: ${error.error}`)
      })
    }

    if (report.performance) {
      console.log('\n⚡ PERFORMANCE METRICS:')
      Object.keys(report.performance).forEach(page => {
        if (report.performance[page].timing) {
          const timing = report.performance[page].timing
          console.log(`📄 ${page}:`)
          if (timing.firstContentfulPaint) {
            console.log(
              `   First Contentful Paint: ${timing.firstContentfulPaint.toFixed(2)}ms`
            )
          }
          if (timing.domContentLoaded) {
            console.log(
              `   DOM Content Loaded: ${timing.domContentLoaded.toFixed(2)}ms`
            )
          }
        }
      })
    }

    console.log('\n🎉 Test suite completed successfully!')

    // Exit with appropriate code
    process.exit(report.failed > 0 ? 1 : 0)
  } catch (error) {
    console.error('💥 Test suite crashed:', error)
    console.error(error.stack)
    process.exit(1)
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
})

// Run the tests
runTests()
