/**
 * Professional Logging Utility for BHM v2
 * 
 * Provides controlled logging with categories and filtering
 * Designed for debugging and testing sessions
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
type LogCategory = 'auth' | 'db' | 'api' | 'ui' | 'onboarding' | 'calendar' | 'system' | 'supabase'

interface LogConfig {
  enabled: boolean
  categories: Record<LogCategory, boolean>
  levels: Record<LogLevel, boolean>
  suppressSupabaseVerbose: boolean
}

// Default configuration
const defaultConfig: LogConfig = {
  enabled: import.meta.env.DEV,
  categories: {
    auth: true,
    db: true,
    api: true,
    ui: false, // UI logs disabled by default
    onboarding: true,
    calendar: true,
    system: true,
    supabase: false, // Supabase verbose logs disabled
  },
  levels: {
    debug: true,
    info: true,
    warn: true,
    error: true,
  },
  suppressSupabaseVerbose: true, // Filter out Supabase internal logs
}

// Runtime configuration (can be modified via window object in dev mode)
let config: LogConfig = { ...defaultConfig }

// Expose configuration in development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).__BHM_LOGGER__ = {
    enable: (category?: LogCategory) => {
      if (category) {
        config.categories[category] = true
        console.log(`✅ Logger: Enabled category "${category}"`)
      } else {
        config.enabled = true
        console.log('✅ Logger: Enabled all logging')
      }
    },
    disable: (category?: LogCategory) => {
      if (category) {
        config.categories[category] = false
        console.log(`❌ Logger: Disabled category "${category}"`)
      } else {
        config.enabled = false
        console.log('❌ Logger: Disabled all logging')
      }
    },
    config: () => {
      console.table(config.categories)
      return config
    },
    reset: () => {
      config = { ...defaultConfig }
      console.log('🔄 Logger: Reset to default configuration')
    },
  }
}

/**
 * Main logging function
 */
function log(
  level: LogLevel,
  category: LogCategory,
  message: string,
  data?: any
): void {
  // Check if logging is enabled
  if (!config.enabled) return

  // Check if category is enabled
  if (!config.categories[category]) return

  // Check if level is enabled
  if (!config.levels[level]) return

  // Suppress Supabase verbose logs
  if (
    config.suppressSupabaseVerbose &&
    category === 'supabase' &&
    (message.includes('#_acquireLock') ||
      message.includes('#_useSession') ||
      message.includes('#_recoverAndRefresh') ||
      message.includes('#_autoRefreshTokenTick') ||
      message.includes('#_handleVisibilityChange') ||
      message.includes('#__loadSession') ||
      message.includes('INITIAL_SESSION callback'))
  ) {
    return // Silent suppress these verbose logs
  }

  // Format message with category prefix
  const prefix = getCategoryEmoji(category)
  const formattedMessage = `${prefix} [${category.toUpperCase()}] ${message}`

  // Choose console method based on level
  switch (level) {
    case 'debug':
      console.debug(formattedMessage, data || '')
      break
    case 'info':
      console.info(formattedMessage, data || '')
      break
    case 'warn':
      console.warn(formattedMessage, data || '')
      break
    case 'error':
      console.error(formattedMessage, data || '')
      break
  }
}

function getCategoryEmoji(category: LogCategory): string {
  const emojis: Record<LogCategory, string> = {
    auth: '🔐',
    db: '💾',
    api: '🌐',
    ui: '🎨',
    onboarding: '🚀',
    calendar: '📅',
    system: '⚙️',
    supabase: '🔷',
  }
  return emojis[category] || '📝'
}

/**
 * Public Logger API
 */
export const logger = {
  debug: (category: LogCategory, message: string, data?: any) =>
    log('debug', category, message, data),
  info: (category: LogCategory, message: string, data?: any) =>
    log('info', category, message, data),
  warn: (category: LogCategory, message: string, data?: any) =>
    log('warn', category, message, data),
  error: (category: LogCategory, message: string, data?: any) =>
    log('error', category, message, data),

  // Convenience methods for common categories
  auth: {
    debug: (message: string, data?: any) => log('debug', 'auth', message, data),
    info: (message: string, data?: any) => log('info', 'auth', message, data),
    warn: (message: string, data?: any) => log('warn', 'auth', message, data),
    error: (message: string, data?: any) => log('error', 'auth', message, data),
  },
  db: {
    debug: (message: string, data?: any) => log('debug', 'db', message, data),
    info: (message: string, data?: any) => log('info', 'db', message, data),
    warn: (message: string, data?: any) => log('warn', 'db', message, data),
    error: (message: string, data?: any) => log('error', 'db', message, data),
  },
  onboarding: {
    debug: (message: string, data?: any) =>
      log('debug', 'onboarding', message, data),
    info: (message: string, data?: any) =>
      log('info', 'onboarding', message, data),
    warn: (message: string, data?: any) =>
      log('warn', 'onboarding', message, data),
    error: (message: string, data?: any) =>
      log('error', 'onboarding', message, data),
  },
  calendar: {
    debug: (message: string, data?: any) =>
      log('debug', 'calendar', message, data),
    info: (message: string, data?: any) =>
      log('info', 'calendar', message, data),
    warn: (message: string, data?: any) =>
      log('warn', 'calendar', message, data),
    error: (message: string, data?: any) =>
      log('error', 'calendar', message, data),
  },
  system: {
    debug: (message: string, data?: any) =>
      log('debug', 'system', message, data),
    info: (message: string, data?: any) =>
      log('info', 'system', message, data),
    warn: (message: string, data?: any) =>
      log('warn', 'system', message, data),
    error: (message: string, data?: any) =>
      log('error', 'system', message, data),
  },
}

/**
 * Filter Supabase console output
 * This function intercepts console methods to filter out verbose Supabase logs
 */
export function setupSupabaseLogFilter(): void {
  if (!config.suppressSupabaseVerbose || typeof window === 'undefined') {
    return
  }

  const originalConsoleLog = console.log
  const originalConsoleDebug = console.debug
  const originalConsoleInfo = console.info

  // Patterns to filter out
  const verbosePatterns = [
    /#_acquireLock/,
    /#_useSession/,
    /#_recoverAndRefresh/,
    /#_autoRefreshTokenTick/,
    /#_handleVisibilityChange/,
    /#__loadSession/,
    /INITIAL_SESSION callback/,
    /GoTrueClient@\d+ \(\d+\.\d+\.\d+\)/,
    /lock acquired for storage key/,
    /lock released for storage key/,
    /lock not available/,
    /auto refresh token tick lock not available/,
  ]

  function shouldFilter(message: string): boolean {
    return verbosePatterns.some((pattern) => pattern.test(message))
  }

  // Override console.log
  console.log = function (...args: any[]) {
    const message = String(args[0] || '')
    if (!shouldFilter(message)) {
      originalConsoleLog.apply(console, args)
    }
  }

  // Override console.debug
  console.debug = function (...args: any[]) {
    const message = String(args[0] || '')
    if (!shouldFilter(message)) {
      originalConsoleDebug.apply(console, args)
    }
  }

  // Override console.info (but keep Supabase connection success messages)
  console.info = function (...args: any[]) {
    const message = String(args[0] || '')
    // Keep important Supabase messages like table existence checks
    if (
      message.includes('✅ Table') ||
      message.includes('✅ Available tables') ||
      message.includes('🎉 Supabase connection test')
    ) {
      originalConsoleInfo.apply(console, args)
      return
    }
    if (!shouldFilter(message)) {
      originalConsoleInfo.apply(console, args)
    }
  }

  // Log success message using original console to avoid circular dependency
  originalConsoleInfo('⚙️ [SYSTEM] Supabase verbose log filter enabled')
}
