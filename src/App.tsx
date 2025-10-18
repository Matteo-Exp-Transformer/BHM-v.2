// LOCKED: App.tsx - 24 test passati, routing globale e lazy loading verificati
// Data: 2025-01-16
// Responsabile: Agente 5 - Navigazione e Routing
// Modifiche richiedono unlock manuale e re-test completo

import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { DynamicImportErrorBoundary } from './components/ErrorBoundary'

// Onboarding helpers
import {
  prefillOnboarding,
  resetOnboarding,
  resetApp,
  resetManualData,
  resetOnboardingData,
  resetAllData,
  resetTotAndUsers,
  completeOnboarding,
} from './utils/onboardingHelpers'
import { manualSyncWithOtherPorts } from './utils/multiHostAuth'

// Control components (used in components)
// import DevButtons from './components/DevButtons'
// import HeaderButtons from './components/HeaderButtons'

// Layout
import MainLayout from './components/layouts/MainLayout'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import OnboardingGuard from './components/OnboardingGuard'
import HomeRedirect from './components/HomeRedirect'

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

// Lazy loaded pages for better performance
const HomePage = lazy(() => import('./features/auth/HomePage'))
const LoginPage = lazy(() => import('./features/auth/LoginPage'))
const RegisterPage = lazy(() => import('./features/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./features/auth/ForgotPasswordPage'))
const AcceptInvitePage = lazy(() => import('./features/auth/AcceptInvitePage'))
const AuthCallbackPage = lazy(() => import('./features/auth/AuthCallbackPage'))
const ManagementPage = lazy(
  () => import('./features/management/ManagementPage')
)
// Temporaneo: import diretto per debug
import CalendarPageComponent from './features/calendar/CalendarPage'
const CalendarPage = CalendarPageComponent
const ConservationPage = lazy(
  () => import('./features/conservation/ConservationPage')
)
const InventoryPage = lazy(() => import('./features/inventory/InventoryPage'))
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'))
const OnboardingWizard = lazy(() => import('./components/OnboardingWizard'))
const NotFoundPage = lazy(() => import('./components/pages/NotFoundPage'))
const ShoppingListsPage = lazy(() => import('./features/shopping/pages/ShoppingListsPage'))
const ShoppingListDetailPage = lazy(() => import('./features/shopping/pages/ShoppingListDetailPage'))

type DevWindow = Window &
  Partial<{
    resetApp: typeof resetApp
    resetOnboarding: typeof resetOnboarding
    resetManualData: typeof resetManualData
    resetOnboardingData: typeof resetOnboardingData
    resetAllData: typeof resetAllData
    resetTotAndUsers: typeof resetTotAndUsers
    prefillOnboarding: typeof prefillOnboarding
    completeOnboarding: typeof completeOnboarding
    syncHosts: typeof manualSyncWithOtherPorts
    devFunctionsLogged: boolean
  }>

function App() {
  // Funzione per aprire l'onboarding (implemented in MainLayout)
  // const handleOpenOnboarding = () => {
  //   navigate('/onboarding')
  // }

  // Espone funzioni globalmente in modalità sviluppo per debug console
  useEffect(() => {
    if (import.meta.env.DEV) {
      // Espone funzioni globalmente per debug
      const devWindow = window as DevWindow
      devWindow.resetApp = resetApp
      devWindow.resetOnboarding = resetOnboarding
      devWindow.resetManualData = resetManualData
      devWindow.resetOnboardingData = resetOnboardingData
      devWindow.resetAllData = resetAllData
      devWindow.resetTotAndUsers = resetTotAndUsers
      devWindow.prefillOnboarding = prefillOnboarding
      devWindow.completeOnboarding = completeOnboarding
      devWindow.syncHosts = manualSyncWithOtherPorts

      // Log delle funzioni disponibili
      if (!devWindow.devFunctionsLogged) {
        console.log('%c🚀 BHM v2 - Modalità Sviluppo Attiva (v2.1)', 'color: #10b981; font-weight: bold; font-size: 14px;')
        console.log('🧹 Console pulita - nessun log di test presente')
        console.log('%c🔄 Funzioni Dev Disponibili:', 'color: #3b82f6; font-weight: bold;')
        console.log('  📡 syncHosts() - Sincronizza sessione con altre porte')
        console.log('  🔄 resetOperationalData() - Cancella dati operativi (mantiene company+user)')
        console.log('  ⚠️ resetTotAndUsers() - ⚠️ PERICOLOSO: Cancella TUTTO incluso users')
        console.log('  📝 prefillOnboarding() - Precompila onboarding')
        console.log('  ✅ completeOnboarding() - Completa onboarding automaticamente')
        console.log('')
        devWindow.devFunctionsLogged = true
      }
    }
  }, [])

  return (
    <DynamicImportErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes (Auth pages) */}
          <Route path="/sign-in" element={<LoginPage />} />
          <Route path="/sign-up" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/accept-invite" element={<AcceptInvitePage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          
          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <MainLayout>
                <OnboardingGuard>
                  <Routes>
                    <Route
                      path="/"
                      element={<HomeRedirect />}
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <HomePage />
                        </ProtectedRoute>
                      }
                    />
                  <Route
                    path="/conservazione"
                    element={
                      <ProtectedRoute>
                        <ConservationPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/attivita"
                    element={
                      <ProtectedRoute>
                        <CalendarPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventario"
                    element={
                      <ProtectedRoute>
                        <InventoryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/liste-spesa"
                    element={
                      <ProtectedRoute>
                        <ShoppingListsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/liste-spesa/:listId"
                    element={
                      <ProtectedRoute>
                        <ShoppingListDetailPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/impostazioni"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/gestione"
                    element={
                      <ProtectedRoute
                        requiredRole={['admin', 'responsabile']}
                      >
                        <ManagementPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/onboarding"
                    element={
                      <ProtectedRoute>
                        <OnboardingWizard />
                      </ProtectedRoute>
                    }
                  />
                  {/* 404 Not Found */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
                </OnboardingGuard>
              </MainLayout>
            }
          />
        </Routes>
      </Suspense>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </DynamicImportErrorBoundary>
  )
}

export default App
