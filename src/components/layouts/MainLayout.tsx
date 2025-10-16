// LOCKED: MainLayout.tsx - 34 test passati, tutte le funzionalità verificate
// Data: 2025-01-16
// Responsabile: Agente 5 - Navigazione e Routing
// Modifiche richiedono unlock manuale e re-test completo

import { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  Snowflake,
  CheckSquare,
  Package,
  Settings,
  Users,
} from 'lucide-react'
import { SyncStatusBar } from '@/components/offline/SyncStatusBar'
import { useAuth, UserRole } from '@/hooks/useAuth'
import HeaderButtons from '@/components/HeaderButtons'
import CompanySwitcher from '@/components/CompanySwitcher'
// Rimosso import resetApp - ora tutto gestito in HeaderButtons

interface MainLayoutProps {
  children: ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { hasRole, isLoading } = useAuth()

  // Funzione per aprire l'onboarding
  const handleOpenOnboarding = () => {
    navigate('/onboarding')
  }

  const allTabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/dashboard', requiresAuth: true },
    {
      id: 'conservation',
      label: 'Conservazione',
      icon: Snowflake,
      path: '/conservazione',
      requiresAuth: true,
    },
    {
      id: 'tasks',
      label: 'Attività',
      icon: CheckSquare,
      path: '/attivita',
      requiresAuth: true,
    },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: Package,
      path: '/inventario',
      requiresAuth: true,
    },
    {
      id: 'settings',
      label: 'Impostazioni',
      icon: Settings,
      path: '/impostazioni',
      requiresAuth: true,
      requiredRole: ['admin'] as UserRole[],
    },
    {
      id: 'management',
      label: 'Gestione',
      icon: Users,
      path: '/gestione',
      requiresAuth: true,
      requiredRole: ['admin', 'responsabile'] as UserRole[],
    },
  ]

  // Filter tabs based on user permissions
  const tabs = allTabs.filter(tab => {
    if (!tab.requiresAuth) return true
    if (isLoading) return true // Show all tabs while loading

    if (tab.requiredRole) {
      return hasRole(tab.requiredRole)
    }

    return true // Show tab if no specific role required
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Control Buttons */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 safe-area-top">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-gray-900">
              HACCP Manager
            </h1>
            
            {/* Company Switcher (solo se utente ha aziende) */}
            <CompanySwitcher />
          </div>
          
          <HeaderButtons
            onOpenOnboarding={handleOpenOnboarding}
            showDevButtons={import.meta.env.DEV}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 pt-0" role="main" aria-label="Main content">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-stretch gap-1 overflow-x-auto px-2 pb-1">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = location.pathname === tab.path

            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={`flex min-w-[80px] flex-1 flex-col items-center justify-center space-y-1 rounded-md touch-manipulation transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                aria-label={`Navigate to ${tab.label}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={20} aria-hidden="true" />
                <span className="text-[10px] font-medium sm:text-xs">
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Offline Sync Status Bar */}
      <SyncStatusBar position="bottom" />
    </div>
  )
}

export default MainLayout
