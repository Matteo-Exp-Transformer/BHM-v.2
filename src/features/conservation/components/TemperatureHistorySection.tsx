import { useState, useMemo } from 'react'
import { ConservationPoint, TemperatureReading } from '@/types/conservation'
import { groupReadingsByDate } from '@/features/conservation/hooks/useTemperatureReadings'
import { isTemperatureCompliant } from '@/features/conservation/utils/correctiveActions'
import { TemperatureReadingsTable } from './TemperatureReadingsTable'
import { ChevronDown, ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react'

interface TemperatureHistorySectionProps {
  readings: TemperatureReading[]
  points: ConservationPoint[]
  onEditReading?: (reading: TemperatureReading) => void
  onDeleteReading?: (id: string) => void
}

const PERIOD_OPTIONS = [
  { value: 7, label: 'Ultima settimana' },
  { value: 14, label: 'Ultimi 14 giorni' },
  { value: 30, label: 'Ultimo mese' },
  { value: 60, label: 'Ultimi 2 mesi' },
  { value: 90, label: 'Ultimi 3 mesi' },
]

export function TemperatureHistorySection({
  readings,
  points,
  onEditReading,
  onDeleteReading,
}: TemperatureHistorySectionProps) {
  const [periodDays, setPeriodDays] = useState(30)
  const [selectedPointId, setSelectedPointId] = useState<string>('all')
  const [onlyAnomalies, setOnlyAnomalies] = useState(false)
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())

  // Create a map of point IDs to points for quick lookup
  const pointsMap = new Map(points.map((p) => [p.id, p]))

  // Filter readings
  const filteredReadings = useMemo(() => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - periodDays)

    return readings.filter((reading) => {
      // Filter by date
      const isInPeriod = new Date(reading.recorded_at) >= cutoffDate

      // Filter by point
      const isForPoint =
        selectedPointId === 'all' || reading.conservation_point_id === selectedPointId

      // Filter by anomalies
      let isAnomaly = true
      if (onlyAnomalies) {
        const point = pointsMap.get(reading.conservation_point_id)
        if (point) {
          isAnomaly = !isTemperatureCompliant(reading.temperature, point.setpoint_temp)
        }
      }

      return isInPeriod && isForPoint && isAnomaly
    })
  }, [periodDays, selectedPointId, onlyAnomalies, readings, pointsMap])

  // Group readings by date
  const groupedReadings = useMemo(() => {
    return groupReadingsByDate(filteredReadings)
  }, [filteredReadings])

  // Sort dates in descending order
  const sortedDates = useMemo(() => {
    return Array.from(groupedReadings.keys()).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime()
    })
  }, [groupedReadings])

  // Toggle date expansion
  const toggleDate = (dateKey: string) => {
    setExpandedDates((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(dateKey)) {
        newSet.delete(dateKey)
      } else {
        newSet.add(dateKey)
      }
      return newSet
    })
  }

  // Calculate stats for a day
  const getDayStats = (dateKey: string) => {
    const dayReadings = groupedReadings.get(dateKey) || []
    const anomalies = dayReadings.filter((reading) => {
      const point = pointsMap.get(reading.conservation_point_id)
      return point && !isTemperatureCompliant(reading.temperature, point.setpoint_temp)
    }).length

    return {
      total: dayReadings.length,
      anomalies,
      isOk: anomalies === 0,
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
        {/* Period Filter */}
        <div className="flex-1 min-w-[180px]">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Periodo:
          </label>
          <select
            value={periodDays}
            onChange={(e) => setPeriodDays(Number(e.target.value))}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Point Filter */}
        <div className="flex-1 min-w-[180px]">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Punto:
          </label>
          <select
            value={selectedPointId}
            onChange={(e) => setSelectedPointId(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tutti i punti</option>
            {points.map((point) => (
              <option key={point.id} value={point.id}>
                {point.name}
              </option>
            ))}
          </select>
        </div>

        {/* Anomalies Filter */}
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyAnomalies}
              onChange={(e) => setOnlyAnomalies(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Solo anomalie
            </span>
          </label>
        </div>
      </div>

      {/* Grouped readings by date */}
      <div className="space-y-2">
        {sortedDates.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-gray-500">Nessuna lettura trovata con i filtri selezionati</p>
          </div>
        ) : (
          sortedDates.map((dateKey) => {
            const dayReadings = groupedReadings.get(dateKey) || []
            const stats = getDayStats(dateKey)
            const isExpanded = expandedDates.has(dateKey)

            // Format date
            const date = new Date(dateKey)
            const dateString = date.toLocaleDateString('it-IT', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })
            const capitalizedDate =
              dateString.charAt(0).toUpperCase() + dateString.slice(1)

            return (
              <div key={dateKey} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                {/* Date Header */}
                <button
                  onClick={() => toggleDate(dateKey)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                    <h3 className="font-semibold text-gray-900">
                      {capitalizedDate}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {stats.total} {stats.total === 1 ? 'lettura' : 'letture'}
                    </span>
                    {stats.isOk ? (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>OK</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-sm text-red-600">
                        <span>{stats.anomalies}</span>
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </button>

                {/* Readings Table (Expanded) */}
                {isExpanded && (
                  <div className="border-t border-gray-200">
                    <TemperatureReadingsTable
                      readings={dayReadings}
                      points={points}
                      onEditReading={onEditReading}
                      onDeleteReading={onDeleteReading}
                    />
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
