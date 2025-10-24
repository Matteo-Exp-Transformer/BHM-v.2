import { defineConfig } from '@playwright/test';
import { execSync } from 'child_process';

/**
 * 🔧 PLAYWRIGHT AGENT 2B CONFIG
 * 
 * Configurazione Playwright per Agente 2B (Onboarding P0 + Test Nuovi)
 * Server: localhost:3001
 * Focus: OnboardingWizard, BusinessInfoStep, StaffStep, ConservationStep
 * 
 * Data: 2025-10-23
 * Agente: Agente 2B - Systems Blueprint Architect
 */

// Forziamo porta 3001 per Agente 2B
const APP_PORT = '3001';
const BASE_URL = `http://localhost:${APP_PORT}`;

console.log(`🎭 Playwright Agent 2B - Porta: ${APP_PORT}`);

export default defineConfig({
  testDir: './Production/Test',
  
  // Configurazione base
  use: {
    baseURL: BASE_URL,
    headless: false, // Modalità visibile per test manuali
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  
  // Timeout e retry
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  retries: process.env.CI ? 2 : 0,
  
  // Reporter
  reporter: [
    ['list'],
    ['html', { 
      outputFolder: 'test-results/agent2b-onboarding',
      open: 'never'
    }],
    ['json', { 
      outputFile: 'test-results/agent2b-results.json'
    }]
  ],
  
  // Web server disabilitato - usiamo server esistente
  webServer: undefined,
  
  // Configurazione progetti per Onboarding P0
  projects: [
    {
      name: 'Onboarding',
      testMatch: '**/Onboarding/**/*.spec.js',
      use: { 
        baseURL: BASE_URL,
        extraHTTPHeaders: {
          'X-Agent': 'agent-2b-onboarding'
        }
      }
    },
    {
      name: 'OnboardingWizard',
      testMatch: '**/Onboarding/OnboardingWizard/**/*.spec.js',
      use: { 
        baseURL: BASE_URL,
        extraHTTPHeaders: {
          'X-Agent': 'agent-2b-onboarding'
        }
      }
    },
    {
      name: 'BusinessInfoStep',
      testMatch: '**/Onboarding/BusinessInfoStep/**/*.spec.js',
      use: { 
        baseURL: BASE_URL,
        extraHTTPHeaders: {
          'X-Agent': 'agent-2b-onboarding'
        }
      }
    },
    {
      name: 'StaffStep',
      testMatch: '**/Onboarding/StaffStep/**/*.spec.js',
      use: { 
        baseURL: BASE_URL,
        extraHTTPHeaders: {
          'X-Agent': 'agent-2b-onboarding'
        }
      }
    },
    {
      name: 'ConservationStep',
      testMatch: '**/Onboarding/ConservationStep/**/*.spec.js',
      use: { 
        baseURL: BASE_URL,
        extraHTTPHeaders: {
          'X-Agent': 'agent-2b-onboarding'
        }
      }
    }
  ],
  
  // Configurazione output
  outputDir: 'test-results/agent2b',
  
  // Configurazione worker - Forziamo 1 worker per debug
  workers: 1,
  
  // Configurazione per CI
  fullyParallel: !process.env.CI,
  
  // Configurazione locale
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
});
