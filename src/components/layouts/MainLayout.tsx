import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
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

interface MainLayoutProps {
  children: ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation()
  const { hasRole, isLoading } = useAuth()

  const allTabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/', requiresAuth: true },
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
      {/* Main Content */}
      <main
        className="pb-20 safe-area-top"
        role="main"
        aria-label="Main content"
        id="main-content"
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50"
        role="navigation"
        aria-label="Main navigation"
        aria-describedby="main-content"
      >
        <div
          className={`grid h-16 ${
            tabs.length === 4
              ? 'grid-cols-4'
              : tabs.length === 5
                ? 'grid-cols-5'
                : tabs.length === 6
                  ? 'grid-cols-6'
                  : `grid-cols-${tabs.length}`
          }`}
        >
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = location.pathname === tab.path

            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={`flex flex-col items-center justify-center space-y-1 touch-manipulation transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                aria-label={`Navigate to ${tab.label}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={20} aria-hidden="true" />
                <span className="text-xs font-medium">{tab.label}</span>
                {isActive && <span className="sr-only">(pagina corrente)</span>}
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
