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

interface MainLayoutProps {
  children: ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation()

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    {
      id: 'conservation',
      label: 'Conservazione',
      icon: Snowflake,
      path: '/conservazione',
    },
    { id: 'tasks', label: 'Attività', icon: CheckSquare, path: '/attivita' },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: Package,
      path: '/inventario',
    },
    {
      id: 'settings',
      label: 'Impostazioni',
      icon: Settings,
      path: '/impostazioni',
    },
    { id: 'management', label: 'Gestione', icon: Users, path: '/gestione' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 safe-area-top z-50">
        <div className="grid grid-cols-6 h-16">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = location.pathname === tab.path

            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={`flex flex-col items-center justify-center space-y-1 touch-manipulation ${
                  isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-screen">{children}</main>

      {/* Offline Sync Status Bar */}
      <SyncStatusBar position="bottom" />
    </div>
  )
}

export default MainLayout
