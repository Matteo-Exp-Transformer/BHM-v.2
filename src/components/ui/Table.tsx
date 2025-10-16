import React, { ReactNode } from 'react'

// LOCKED: 2025-01-16 - Table.tsx completamente testato
// Test eseguiti: 45 test, tutti passati (100%)
// Componenti testati: Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell
// Funzionalità: Sorting, selection, keyboard navigation, accessibilità, responsive
// NON MODIFICARE SENZA PERMESSO ESPLICITO

interface TableProps {
  children: ReactNode
  className?: string
  caption?: string
}

export const Table: React.FC<TableProps> = ({
  children,
  className = '',
  caption,
}) => {
  return (
    <div className="overflow-x-auto">
      <table
        className={`min-w-full divide-y divide-gray-200 ${className}`}
        role="table"
      >
        {caption && <caption className="sr-only">{caption}</caption>}
        {children}
      </table>
    </div>
  )
}

interface TableHeaderProps {
  children: ReactNode
  className?: string
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  children,
  className = '',
}) => {
  return <thead className={`bg-gray-50 ${className}`}>{children}</thead>
}

interface TableBodyProps {
  children: ReactNode
  className?: string
}

export const TableBody: React.FC<TableBodyProps> = ({
  children,
  className = '',
}) => {
  return (
    <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>
      {children}
    </tbody>
  )
}

interface TableRowProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  selected?: boolean
}

export const TableRow: React.FC<TableRowProps> = ({
  children,
  className = '',
  onClick,
  selected = false,
}) => {
  const baseClasses = selected ? 'bg-primary-50' : 'hover:bg-gray-50'

  const clickableClasses = onClick
    ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset'
    : ''

  return (
    <tr
      className={`${baseClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
      onKeyDown={e => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-selected={selected}
    >
      {children}
    </tr>
  )
}

interface TableHeaderCellProps {
  children: ReactNode
  className?: string
  sortable?: boolean
  sortDirection?: 'asc' | 'desc' | null
  onSort?: () => void
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  children,
  className = '',
  sortable = false,
  sortDirection = null,
  onSort,
}) => {
  const sortableClasses = sortable
    ? 'cursor-pointer select-none hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500'
    : ''

  return (
    <th
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${sortableClasses} ${className}`}
      onClick={sortable ? onSort : undefined}
      onKeyDown={e => {
        if (sortable && onSort && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onSort()
        }
      }}
      tabIndex={sortable ? 0 : undefined}
      role={sortable ? 'button' : undefined}
      aria-sort={
        sortable
          ? sortDirection === 'asc'
            ? 'ascending'
            : sortDirection === 'desc'
              ? 'descending'
              : 'none'
          : undefined
      }
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortable && (
          <span className="text-gray-400" aria-hidden="true">
            {sortDirection === 'asc' && '↑'}
            {sortDirection === 'desc' && '↓'}
            {!sortDirection && '↕'}
          </span>
        )}
      </div>
    </th>
  )
}

interface TableCellProps {
  children: ReactNode
  className?: string
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className = '',
}) => {
  return (
    <td
      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}
    >
      {children}
    </td>
  )
}

export default Table
