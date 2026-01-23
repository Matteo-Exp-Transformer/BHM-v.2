import React, { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface TimeInputProps {
  value: string // formato HH:MM (24 ore)
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
  id?: string
  'aria-label'?: string
  'aria-describedby'?: string
}

/**
 * Componente TimeInput che forza il formato 24 ore (00:00 - 23:59)
 * Usa select separati per ore e minuti per garantire sempre formato 24 ore
 */
export const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChange,
  className = '',
  disabled = false,
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  // Parse del valore iniziale (formato HH:MM)
  const parseTime = (timeStr: string) => {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})$/)
    if (match) {
      return {
        hours: parseInt(match[1], 10),
        minutes: parseInt(match[2], 10)
      }
    }
    return { hours: 0, minutes: 0 }
  }

  const initialTime = useMemo(() => parseTime(value || '00:00'), [value])
  const [hours, setHours] = useState(initialTime.hours)
  const [minutes, setMinutes] = useState(initialTime.minutes)

  // Sincronizza quando il valore cambia dall'esterno
  useEffect(() => {
    const parsed = parseTime(value || '00:00')
    setHours(parsed.hours)
    setMinutes(parsed.minutes)
  }, [value])

  // Genera array di opzioni per ore (00-23)
  const hourOptions = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
  }, [])

  // Genera array di opzioni per minuti (00-59, step 1)
  const minuteOptions = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))
  }, [])

  const handleHoursChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHours = parseInt(e.target.value, 10)
    setHours(newHours)
    const formattedTime = `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    onChange(formattedTime)
  }

  const handleMinutesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMinutes = parseInt(e.target.value, 10)
    setMinutes(newMinutes)
    const formattedTime = `${hours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
    onChange(formattedTime)
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <select
        id={id}
        value={hours.toString().padStart(2, '0')}
        onChange={handleHoursChange}
        disabled={disabled}
        aria-label={ariaLabel ? `${ariaLabel} - ore` : 'Ore'}
        aria-describedby={ariaDescribedBy}
        className={cn(
          'flex h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'cursor-pointer'
        )}
      >
        {hourOptions.map(hour => (
          <option key={hour} value={hour}>
            {hour}
          </option>
        ))}
      </select>
      <span className="text-gray-500 font-medium">:</span>
      <select
        value={minutes.toString().padStart(2, '0')}
        onChange={handleMinutesChange}
        disabled={disabled}
        aria-label={ariaLabel ? `${ariaLabel} - minuti` : 'Minuti'}
        className={cn(
          'flex h-10 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'cursor-pointer'
        )}
      >
        {minuteOptions.map(minute => (
          <option key={minute} value={minute}>
            {minute}
          </option>
        ))}
      </select>
    </div>
  )
}

