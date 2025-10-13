import React from 'react'

interface CalendarEventLegendProps {
  sources?: {
    maintenance?: number
    temperatureChecks?: number
    haccpExpiry?: number
    productExpiry?: number
    haccpDeadlines?: number
    genericTasks?: number
  }
  compact?: boolean
}

export const CalendarEventLegend: React.FC<CalendarEventLegendProps> = ({ 
  sources = {}, 
  compact = false 
}) => {
  // Unifica temperature checks in manutenzioni
  const totalMaintenance = (sources.maintenance || 0) + (sources.temperatureChecks || 0)

  const legendItems = [
    {
      icon: '🔧',
      label: 'Manutenzioni',
      count: totalMaintenance,
      description: 'Incluye rilevamento temperature'
    },
    {
      icon: '👥',
      label: 'Scadenze HACCP',
      count: sources.haccpExpiry || 0
    },
    {
      icon: '📦',
      label: 'Scadenze Prodotti',
      count: sources.productExpiry || 0
    },
    {
      icon: '⏰',
      label: 'Alert HACCP',
      count: sources.haccpDeadlines || 0
    },
    {
      icon: '📋',
      label: 'Attività Generiche',
      count: sources.genericTasks || 0
    }
  ]

  if (compact) {
    return (
      <div className="flex flex-wrap gap-3 text-xs">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            <span>{item.icon}</span>
            <span className="text-gray-600">{item.label}</span>
            <span className="text-gray-500">({item.count})</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
      {legendItems.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="text-lg">{item.icon}</span>
          <div>
            <div className="font-medium text-gray-700">{item.label}</div>
            <div className="text-gray-500">
              {item.count} {item.description ? `(${item.description})` : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CalendarEventLegend
