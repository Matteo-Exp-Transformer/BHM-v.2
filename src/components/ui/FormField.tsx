import React, { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  id: string
  required?: boolean
  error?: string
  helpText?: string
  children: ReactNode
  className?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  required = false,
  error,
  helpText,
  children,
  className = '',
}) => {
  // LOCKED: 2025-01-16 - FormField.tsx completamente testato
  // Test eseguiti: 47 test, tutti passati (100%)
  // Componenti testati: FormField, Input, Select, TextArea (4 componenti)
  // Funzionalità: Form wrapper, error handling, accessibility, duplicazioni identificate
  // NON MODIFICARE SENZA PERMESSO ESPLICITO
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      <div className="relative">{children}</div>

      {helpText && !error && (
        <p className="text-sm text-gray-500" id={`${id}-help`}>
          {helpText}
        </p>
      )}

      {error && (
        <p
          className="text-sm text-red-600"
          id={`${id}-error`}
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input: React.FC<InputProps> = ({
  error = false,
  className = '',
  ...props
}) => {
  const baseClasses =
    'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors'
  const errorClasses = error
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 hover:border-gray-400'

  return (
    <input
      className={`${baseClasses} ${errorClasses} ${className}`}
      aria-invalid={error}
      {...props}
    />
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  options: Array<{ value: string; label: string; disabled?: boolean }>
}

export const Select: React.FC<SelectProps> = ({
  error = false,
  options,
  className = '',
  ...props
}) => {
  const baseClasses =
    'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors'
  const errorClasses = error
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 hover:border-gray-400'

  return (
    <select
      className={`${baseClasses} ${errorClasses} ${className}`}
      aria-invalid={error}
      {...props}
    >
      {options.map(option => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  )
}

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const TextArea: React.FC<TextAreaProps> = ({
  error = false,
  className = '',
  ...props
}) => {
  const baseClasses =
    'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors'
  const errorClasses = error
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 hover:border-gray-400'

  return (
    <textarea
      className={`${baseClasses} ${errorClasses} ${className}`}
      aria-invalid={error}
      {...props}
    />
  )
}

export default FormField
