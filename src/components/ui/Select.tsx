import React from 'react'
import { cn } from '@/lib/utils'

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  errorMessage?: string
  required?: boolean
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, children, error, errorMessage, required, id, ...props },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`
    const errorId = error && errorMessage ? `${selectId}-error` : undefined

    return (
      <>
        <select
          id={selectId}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          ref={ref}
          aria-invalid={error}
          aria-describedby={errorId}
          aria-required={required}
          {...props}
        >
          {children}
        </select>
        {error && errorMessage && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
            {errorMessage}
          </p>
        )}
      </>
    )
  }
)

Select.displayName = 'Select'

export { Select }
