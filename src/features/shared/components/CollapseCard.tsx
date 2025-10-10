import { ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface CollapseCardProps {
  title: string
  children: ReactNode
  isOpen: boolean
  onToggle: () => void
  badge?: string
  headerAction?: ReactNode
  className?: string
}

export function CollapseCard({
  title,
  children,
  isOpen,
  onToggle,
  badge,
  headerAction,
  className = '',
}: CollapseCardProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {badge && (
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {headerAction && (
            <div onClick={(e) => e.stopPropagation()}>{headerAction}</div>
          )}
          <button
            className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label={isOpen ? 'Collapse' : 'Expand'}
          >
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-200">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  )
}
