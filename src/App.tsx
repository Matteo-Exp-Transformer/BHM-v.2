import { Routes, Route } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Layout
import MainLayout from './components/layouts/MainLayout'

// Components
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import HomePage from './features/auth/HomePage'
import LoginPage from './features/auth/LoginPage'
import RegisterPage from './features/auth/RegisterPage'
import ManagementPage from './features/management/ManagementPage'
import CalendarPage from './features/calendar/CalendarPage'
import ConservationPage from './features/conservation/ConservationPage'
import InventoryPage from './features/inventory/InventoryPage'
import SettingsPage from './features/settings/SettingsPage'

function App() {
  return (
    <>
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
