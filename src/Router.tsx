import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'

// Layout components
import MainLayout from './components/layouts/MainLayout'

// Lazy load feature components
const HomePage = lazy(() => import('./features/auth/HomePage'))
const LoginPage = lazy(() => import('./features/auth/LoginPage'))
const ConservationPage = lazy(
  () => import('./features/conservation/ConservationPage')
)
const InventoryPage = lazy(() => import('./features/inventory/InventoryPage'))
const CalendarPage = lazy(() => import('./features/calendar/CalendarPage'))
const ManagementPage = lazy(
  () => import('./features/management/ManagementPage')
)
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'))
const BrowserCompatibility = lazy(
  () => import('./components/testing/BrowserCompatibility')
)
const PWAValidator = lazy(() => import('./components/testing/PWAValidator'))

// Loading component
const PageLoading: React.FC = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <Suspense fallback={<PageLoading />}>
            <LoginPage />
          </Suspense>
        }
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Suspense fallback={<PageLoading />}>
                <HomePage />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/conservazione"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Suspense fallback={<PageLoading />}>
                <ConservationPage />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventario"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Suspense fallback={<PageLoading />}>
                <InventoryPage />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/attivita"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Suspense fallback={<PageLoading />}>
                <CalendarPage />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/gestione"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Suspense fallback={<PageLoading />}>
                <ManagementPage />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/impostazioni"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Suspense fallback={<PageLoading />}>
                <SettingsPage />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/test-browser"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Suspense fallback={<PageLoading />}>
                <BrowserCompatibility />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/test-pwa"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Suspense fallback={<PageLoading />}>
                <PWAValidator />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
