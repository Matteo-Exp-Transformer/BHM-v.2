import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Onboarding helpers
import { prefillOnboarding, resetOnboarding, resetApp, completeOnboarding } from './utils/onboardingHelpers'

// Control components (used in components)
// import DevButtons from './components/DevButtons'
// import HeaderButtons from './components/HeaderButtons'

// Layout
import MainLayout from './components/layouts/MainLayout'

// Components
import ProtectedRoute from './components/ProtectedRoute'

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
const ManagementPage = lazy(
  () => import('./features/management/ManagementPage')
)
const CalendarPage = lazy(() => import('./features/calendar/CalendarPage'))
const ConservationPage = lazy(
  () => import('./features/conservation/ConservationPage')
)
const InventoryPage = lazy(() => import('./features/inventory/InventoryPage'))
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'))
const OnboardingWizard = lazy(() => import('./components/OnboardingWizard'))
const NotFoundPage = lazy(() => import('./components/pages/NotFoundPage'))

function App() {
  // const navigate = useNavigate() // Available for navigation functions

  // Funzione per aprire l'onboarding (implemented in MainLayout)
  // const handleOpenOnboarding = () => {
  //   navigate('/onboarding')
  // }

  // Espone funzioni globalmente in modalità sviluppo per debug console
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Espone funzioni globalmente per debug
      ;(window as any).resetApp = resetApp
      ;(window as any).resetOnboarding = resetOnboarding
      ;(window as any).prefillOnboarding = prefillOnboarding
      ;(window as any).completeOnboarding = completeOnboarding

      // Log delle funzioni disponibili
      if (!(window as any).devFunctionsLogged) {
        console.log('🔄 Funzioni dev disponibili:')
        console.log('  - resetApp() - Reset completo app')
        console.log('  - resetOnboarding() - Reset onboarding e app')
        console.log('  - prefillOnboarding() - Precompila onboarding')
        console.log('  - completeOnboarding() - Completa onboarding automaticamente')
        ;(window as any).devFunctionsLogged = true
      }
    }
  }, [])

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-in" element={<LoginPage />} />
          <Route path="/sign-up" element={<RegisterPage />} />
          <Route
            path="/*"
            element={
              <>
                <SignedIn>
                  <MainLayout>
                    <Routes>
                      <Route
                        path="/"
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
                      {/* 404 Not Found - catch all route for authenticated users */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </MainLayout>
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
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
    </>
  )
}

export default App
