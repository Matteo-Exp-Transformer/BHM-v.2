/**
 * 🔧 Test Dynamic Import Fix
 * 
 * File temporaneo per testare il caricamento dinamico
 */

// Test se il problema è con il lazy loading
export const testDynamicImport = async () => {
  try {
    console.log('🧪 Testing dynamic import...')
    
    // Test import diretto
    const CalendarPage = await import('./features/calendar/CalendarPage')
    console.log('✅ CalendarPage imported successfully:', CalendarPage)
    
    return true
  } catch (error) {
    console.error('❌ Dynamic import failed:', error)
    return false
  }
}

// Test se il problema è con il routing
export const testRouteImport = async (routePath: string) => {
  try {
    console.log(`🧪 Testing route import: ${routePath}`)
    
    const module = await import(routePath)
    console.log(`✅ Route ${routePath} imported successfully:`, module)
    
    return true
  } catch (error) {
    console.error(`❌ Route ${routePath} import failed:`, error)
    return false
  }
}

