/**
 * Wrapper script per eseguire test Playwright Onboarding
 * senza conflitti con Vitest globals
 */

// Disabilita Vitest prima di caricare Playwright
delete process.env.VITE_USER_NODE_ENV
delete global.expect

const { spawn } = require('child_process')
const path = require('path')

// Esegui Playwright direttamente
const playwright = spawn(
  'npx',
  [
    'playwright',
    'test',
    '--config=playwright-onboarding.config.ts',
    '--project=chromium-headless',
    ...process.argv.slice(2) // Pass through additional args
  ],
  {
    cwd: path.resolve(__dirname, '../../..'),
    stdio: 'inherit',
    shell: true
  }
)

playwright.on('close', (code) => {
  process.exit(code)
})
