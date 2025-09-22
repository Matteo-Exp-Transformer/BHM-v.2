import { Routes, Route } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { ToastContainer } from 'react-toastify'
import { Suspense, lazy } from 'react'
import 'react-toastify/dist/ReactToastify.css'

// Layout
import MainLayout from './components/layouts/MainLayout'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Lazy loaded pages for better performance
const HomePage = lazy(() => import('./features/auth/HomePage'))
const LoginPage = lazy(() => import('./features/auth/LoginPage'))
const RegisterPage = lazy(() => import('./features/auth/RegisterPage'))
const ManagementPage = lazy(() => import('./features/management/ManagementPage'))
const CalendarPage = lazy(() => import('./features/calendar/CalendarPage'))
const ConservationPage = lazy(() => import('./features/conservation/ConservationPage'))
const InventoryPage = lazy(() => import('./features/inventory/InventoryPage'))

function App() {
  return (
    <>
      <Routes>
        <Route 
          path="/login" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <LoginPage />
            </Suspense>
          } 
        />
        <Route 
          path="/sign-in" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <LoginPage />
            </Suspense>
          } 
        />
        <Route 
          path="/sign-up" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <RegisterPage />
            </Suspense>
          } 
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
                          <Suspense fallback={<LoadingSpinner />}>
                            <HomePage />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/conservazione"
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingSpinner />}>
                            <ConservationPage />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/attivita"
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingSpinner />}>
                            <CalendarPage />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/inventario"
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingSpinner />}>
                            <InventoryPage />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/impostazioni"
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <Suspense fallback={<LoadingSpinner />}>
                            <div>Impostazioni - Coming Soon (Solo Admin)</div>
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/gestione"
                      element={
                        <ProtectedRoute
                          requiredRole={['admin', 'responsabile']}
                        >
                          <Suspense fallback={<LoadingSpinner />}>
                            <ManagementPage />
                          </Suspense>
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
