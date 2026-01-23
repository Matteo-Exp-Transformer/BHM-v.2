/**
 * Configurazione autenticazione per test E2E
 *
 * ATTENZIONE: Queste sono credenziali di test.
 * NON utilizzare credenziali di produzione.
 */

export const TEST_CREDENTIALS = {
  email: '0Cavuz0@gmail.com',
  password: 'Cavallaro1994'
} as const

export const TEST_USER = {
  email: TEST_CREDENTIALS.email,
  password: TEST_CREDENTIALS.password,
  // Aggiungi altri dati utente se necessario
  firstName: 'Test',
  lastName: 'User',
  role: 'admin'
} as const

/**
 * Selettori DOM per il form di login
 */
export const LOGIN_SELECTORS = {
  emailInput: 'input[type="email"], input[name="email"], input[placeholder*="email" i]',
  passwordInput: 'input[type="password"], input[name="password"], input[placeholder*="password" i]',
  submitButton: 'button[type="submit"]',
  loginForm: 'form',
  errorMessage: '[role="alert"], .error-message, .text-red-500'
} as const

/**
 * Timeout per operazioni di autenticazione
 */
export const AUTH_TIMEOUTS = {
  login: 10000,
  logout: 5000,
  sessionCheck: 3000,
  redirect: 8000
} as const
