import { Routes, Route, Suspense, lazy } from 'react'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

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
const ManagementPage = lazy(() => import('./features/management/ManagementPage'))
const CalendarPage = lazy(() => import('./features/calendar/CalendarPage'))
const ConservationPage = lazy(() => import('./features/conservation/ConservationPage'))
const InventoryPage = lazy(() => import('./features/inventory/InventoryPage'))
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'))

function App() {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path="/login"
            element={<LoginPage />}
          />
          <Route
            path="/sign-in"
            element={<LoginPage />}
          />
          <Route
            path="/sign-up"
            element={<RegisterPage />}
          />
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