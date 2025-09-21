import React, { ReactNode, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface CollapsibleCardProps {
  title: string
  icon?: React.ComponentType<{ className?: string }>
  children: ReactNode
  defaultExpanded?: boolean
  counter?: number
  actions?: ReactNode
  className?: string
  loading?: boolean
  error?: string | null
  emptyMessage?: string
  showEmpty?: boolean
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
}

export const CollapsibleCard = ({
  title,
  icon: Icon,
  children,
  defaultExpanded = true,
  counter,
  actions,
  className = '',
  loading = false,
  error = null,
  emptyMessage = 'Nessun elemento disponibile',
  showEmpty = false,
  isOpen,
  onToggle,
}: CollapsibleCardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const expanded = isOpen !== undefined ? isOpen : isExpanded

  const toggleExpanded = () => {
    const newState = !expanded
    if (onToggle) {
      onToggle(newState)
    } else {
      setIsExpanded(newState)
    }
  }

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={toggleExpanded}
      >
        <div className="flex items-center space-x-3">
          {Icon && <Icon className="h-5 w-5 text-gray-500" />}
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {counter !== undefined && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {counter}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {actions && (
            <div className="flex items-center space-x-2">{actions}</div>
          )}
          <button
            type="button"
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            onClick={e => {
              e.stopPropagation()
              toggleExpanded()
            }}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="border-t border-gray-200">
          {loading && (
            <div className="p-6 text-center">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Caricamento...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {showEmpty && (
                <div className="p-8 text-center text-gray-500">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    {Icon && <Icon className="h-6 w-6 text-gray-400" />}
                  </div>
                  <p className="text-sm">{emptyMessage}</p>
                </div>
              )}
              {!showEmpty && children}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// Predefined action buttons for common operations
export const CardActionButton = ({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
  disabled = false,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  variant?: 'default' | 'primary' | 'danger'
  disabled?: boolean
}) => {
  const baseClasses =
    'inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors'
  const variantClasses = {
    default: 'text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50',
    primary: 'text-blue-700 bg-blue-100 hover:bg-blue-200 disabled:opacity-50',
    danger: 'text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50',
  }

  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={e => {
        e.stopPropagation()
        onClick()
      }}
      disabled={disabled}
    >
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </button>
  )
}

export default CollapsibleCard