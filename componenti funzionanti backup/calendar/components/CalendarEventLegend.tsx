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
  
  // Unifica scadenze HACCP e alert HACCP in una sola categoria
  const totalHaccpAlerts = (sources.haccpExpiry || 0) + (sources.haccpDeadlines || 0)

  const legendItems = [
    {
      icon: '🔧',
      label: 'Manutenzioni',
      count: totalMaintenance,
      description: 'Incluye rilevamento temperature'
    },
    {
      icon: '📦',
      label: 'Scadenze Prodotti',
      count: sources.productExpiry || 0
    },
    {
      icon: '⏰',
      label: 'Alert HACCP',
      count: totalHaccpAlerts,
      description: 'Incluye scadenze certificazioni'
    },
    {
      icon: '📋',
      label: 'Attività Generiche',
      count: sources.genericTasks || 0
    }
  ]

  if (compact) {
    return (
      <div className="flex flex-wrap gap-4 text-sm">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-base">{item.icon}</span>
            <span className="text-gray-600 font-medium">{item.label}</span>
            <span className="text-gray-500 font-semibold">({item.count})</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
      {legendItems.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="text-xl">{item.icon}</span>
          <div>
            <div className="font-semibold text-gray-700">{item.label}</div>
            <div className="text-gray-500 font-medium">
              {item.count} {item.description ? `(${item.description})` : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CalendarEventLegend
