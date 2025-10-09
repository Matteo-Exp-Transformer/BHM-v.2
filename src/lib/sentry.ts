import * as Sentry from '@sentry/react'

export const initSentry = () => {
  // Only initialize if DSN is configured
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.warn('⚠️ Sentry DSN not configured - error tracking disabled')
    return
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    // Enable default PII collection
    sendDefaultPii: true,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
      // Console logging integration
      Sentry.consoleLoggingIntegration({
        levels: ['log', 'warn', 'error'],
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    // Control distributed tracing URLs
    tracePropagationTargets: [
      'localhost',
      /^https:\/\/.*\.supabase\.co\/.*$/,
      /^https:\/\/.*\.vercel\.app\/.*$/,
    ],
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of normal sessions
    replaysOnErrorSampleRate: 1.0, // 100% of error sessions
    // Enable logs
    enableLogs: true,
    beforeSend(event, _hint) {
      if (import.meta.env.MODE === 'development') {
        console.log('🔍 Sentry event:', event.exception || event.message)
      }
      return event
    },
  })

  console.log(`✅ Sentry initialized for ${import.meta.env.MODE} environment`)
}

// Export Sentry and logger for use throughout the app
export { Sentry }

// Export logger convenience function
export const { logger } = Sentry
