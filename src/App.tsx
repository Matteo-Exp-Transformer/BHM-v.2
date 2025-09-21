import { Routes, Route } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Layout
import MainLayout from './components/layouts/MainLayout'

// Pages
import HomePage from './features/auth/HomePage'
import LoginPage from './features/auth/LoginPage'
import { Calendar } from './features/calendar/Calendar'
import { ConservationManager } from './features/conservation/ConservationManager'
import { OfflineConservationDemo } from './features/conservation/OfflineConservationDemo'

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <>
              <SignedIn>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route
                      path="/conservazione"
                      element={<OfflineConservationDemo />}
                    />
                    <Route
                      path="/attivita"
                      element={<Calendar />}
                    />
                    <Route
                      path="/inventario"
                      element={<div>Inventario - Coming Soon</div>}
                    />
                    <Route
                      path="/impostazioni"
                      element={<div>Impostazioni - Coming Soon</div>}
                    />
                    <Route
                      path="/gestione"
                      element={<div>Gestione - Coming Soon</div>}
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
